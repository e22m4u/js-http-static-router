import path from 'path';
import mimeTypes from 'mime-types';
import fs, {createReadStream} from 'fs';
import {escapeRegexp, normalizePath} from './utils/index.js';
import {DebuggableService} from '@e22m4u/js-service';
import {InvalidArgumentError} from '@e22m4u/js-format';

/**
 * Http static router.
 */
export class HttpStaticRouter extends DebuggableService {
  /**
   * Routes.
   *
   * @protected
   */
  _routes = [];

  /**
   * Constructor.
   *
   * @param {import('@e22m4u/js-service').ServiceContainer} container
   */
  constructor(container) {
    super(container, {
      noEnvironmentNamespace: true,
      namespace: 'jsHttpStaticRouter',
    });
  }

  /**
   * Add route.
   *
   * @param {string} remotePath
   * @param {string} resourcePath
   * @returns {object}
   */
  addRoute(remotePath, resourcePath) {
    const debug = this.getDebuggerFor(this.addRoute);
    resourcePath = path.resolve(resourcePath);
    debug('Adding a new route.');
    debug('Resource path is %v.', resourcePath);
    debug('Remote path is %v.', remotePath);
    let stats;
    try {
      stats = fs.statSync(resourcePath);
    } catch (error) {
      // если ресурс не существует в момент старта,
      // это может быть ошибкой конфигурации
      console.error(error);
      throw new InvalidArgumentError(
        'Static resource path does not exist %v.',
        resourcePath,
      );
    }
    const isFile = stats.isFile();
    debug('Resource type is %s.', isFile ? 'File' : 'Folder');
    const normalizedRemotePath = normalizePath(remotePath);
    const escapedRemotePath = escapeRegexp(normalizedRemotePath);
    const regexp = isFile
      ? new RegExp(`^${escapedRemotePath}$`)
      : new RegExp(`^${escapedRemotePath}(?:$|\\/)`);
    const route = {remotePath, resourcePath, regexp, isFile};
    this._routes.push(route);
    // самые длинные пути проверяются первыми,
    // чтобы избежать коллизий при поиске маршрута
    this._routes.sort((a, b) => b.remotePath.length - a.remotePath.length);
    return this;
  }

  /**
   * Match route.
   *
   * @param {import('http').IncomingMessage} req
   * @returns {object|undefined}
   */
  matchRoute(req) {
    const debug = this.getDebuggerFor(this.matchRoute);
    debug('Matching routes with incoming request.');
    const url = (req.url || '/').replace(/\?.*$/, '');
    debug('Incoming request is %s %v.', req.method, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      debug('Method not allowed.');
      return;
    }
    debug('Walking through %v routes.', this._routes.length);
    const route = this._routes.find(route => {
      const res = route.regexp.test(url);
      const phrase = res ? 'matched' : 'not matched';
      debug('Resource %v %s.', route.resourcePath, phrase);
      return res;
    });
    route
      ? debug('Resource %v matched.', route.resourcePath)
      : debug('No route matched.');
    return route;
  }

  /**
   * Send file by route.
   *
   * @param {object} route
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  sendFileByRoute(route, req, res) {
    const reqUrl = req.url || '/';
    const reqPath = reqUrl.replace(/\?.*$/, '');
    // если ресурс ссылается на папку, то из адреса запроса
    // извлекается дополнительная часть (если присутствует),
    // и добавляется к адресу ресурса
    let targetPath = route.resourcePath;
    if (!route.isFile) {
      // извлечение относительного пути в дополнение к адресу
      // ресурса путем удаления из адреса запроса той части,
      // которая была указана при объявлении маршрута
      const relativePath = reqPath.replace(route.regexp, '');
      // объединение адреса ресурса
      // с дополнительной частью
      targetPath = path.join(route.resourcePath, relativePath);
    }
    // если обнаружена попытка выхода за пределы
    // корневой директории, то выбрасывается ошибка
    targetPath = path.resolve(targetPath);
    const resourceRoot = path.resolve(route.resourcePath);
    if (!targetPath.startsWith(resourceRoot)) {
      res.writeHead(403, {'content-type': 'text/plain'});
      res.end('403 Forbidden');
      return;
    }
    // подстановка индекс-файла (для папок),
    // установка заголовков и отправка потока
    fs.stat(targetPath, (statsError, stats) => {
      if (statsError) {
        return _handleFsError(statsError, res);
      }
      if (stats.isDirectory()) {
        // так как в html обычно используются относительные пути,
        // то адрес директории статических ресурсов должен завершаться
        // косой чертой, чтобы файлы стилей и изображений загружались
        // именно из нее, а не обращались на уровень выше
        if (/[^/]$/.test(reqPath)) {
          const searchMatch = reqUrl.match(/\?.*$/);
          const search = searchMatch ? searchMatch[0] : '';
          const normalizedPath = reqUrl.replace(/\/{2,}/g, '/');
          res.writeHead(302, {location: `${normalizedPath}/${search}`});
          res.end();
          return;
        }
        // если адрес запроса содержит дублирующие слеши,
        // то адрес нормализуется и выполняется редирект
        if (/\/{2,}/.test(reqUrl)) {
          const normalizedUrl = reqUrl.replace(/\/{2,}/g, '/');
          res.writeHead(302, {location: normalizedUrl});
          res.end();
          return;
        }
        // если целевой путь указывает на папку,
        // то подставляется index.html
        targetPath = path.join(targetPath, 'index.html');
      }
      // формирование заголовка "content-type"
      // в зависимости от расширения файла
      const extname = path.extname(targetPath);
      const contentType =
        mimeTypes.contentType(extname) || 'application/octet-stream';
      // файл читается и отправляется частями,
      // что значительно снижает использование памяти
      const fileStream = createReadStream(targetPath);
      fileStream.on('error', error => {
        _handleFsError(error, res);
      });
      // отправка заголовка 200, только после
      // этого начинается отдача файла
      fileStream.on('open', () => {
        res.writeHead(200, {'content-type': contentType});
        // для HEAD запроса отправляются
        // только заголовки (без тела)
        if (req.method === 'HEAD') {
          res.end();
          return;
        }
        fileStream.pipe(res);
      });
    });
  }
}

/**
 * Handle filesystem error.
 *
 * @param {object} error
 * @param {object} res
 * @returns {undefined}
 */
function _handleFsError(error, res) {
  if (res.headersSent) {
    return;
  }
  if ('code' in error && error.code === 'ENOENT') {
    res.writeHead(404, {'content-type': 'text/plain'});
    res.write('404 Not Found');
    res.end();
  } else {
    res.writeHead(500, {'content-type': 'text/plain'});
    res.write('500 Internal Server Error');
    res.end();
  }
}
