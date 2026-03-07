import path from 'path';
import mimeTypes from 'mime-types';
import {IncomingMessage} from 'http';
import fs, {createReadStream} from 'fs';
import {StaticRoute} from './static-route.js';
import {getPathnameFromUrl} from './utils/index.js';
import {InvalidArgumentError} from '@e22m4u/js-format';
import {DebuggableService, isServiceContainer} from '@e22m4u/js-service';

/**
 * @typedef {object} FileInfo
 * @property {string} path
 * @property {number} size
 */

/**
 * Http static router.
 */
export class HttpStaticRouter extends DebuggableService {
  /**
   * Routes.
   *
   * @protected
   * @type {StaticRoute[]}
   */
  _routes = [];

  /**
   * Options.
   *
   * @type {import('./http-static-router.js').HttpStaticRouterOptions}
   * @protected
   */
  _options = {};

  /**
   * Constructor.
   *
   * @param {import('@e22m4u/js-service').ServiceContainer|import('./http-static-router.js').HttpStaticRouterOptions} containerOrOptions
   * @param {import('./http-static-router.js').HttpStaticRouterOptions} options
   */
  constructor(containerOrOptions, options) {
    const debugOptions = {
      noEnvironmentNamespace: true,
      namespace: 'jsHttpStaticRouter',
    };
    if (isServiceContainer(containerOrOptions)) {
      super(containerOrOptions, debugOptions);
    } else if (containerOrOptions !== undefined) {
      if (
        !containerOrOptions ||
        typeof containerOrOptions !== 'object' ||
        Array.isArray(containerOrOptions)
      ) {
        throw new InvalidArgumentError(
          'First parameter must be an Object or an instance ' +
            'of ServiceContainer, but %v was given.',
          containerOrOptions,
        );
      }
      super(undefined, debugOptions);
      if (options === undefined) {
        options = containerOrOptions;
        containerOrOptions = undefined;
      }
    } else {
      super(undefined, debugOptions);
    }
    // options
    if (options !== undefined) {
      if (!options || typeof options !== 'object' || Array.isArray(options)) {
        throw new InvalidArgumentError(
          'Parameter "options" must be an Object, but %v was given.',
          options,
        );
      }
      // options.baseDir
      if (options.baseDir !== undefined) {
        if (typeof options.baseDir !== 'string') {
          throw new InvalidArgumentError(
            'Option "baseDir" must be a String, but %v was given.',
            options.baseDir,
          );
        }
        if (!path.isAbsolute(options.baseDir)) {
          throw new InvalidArgumentError(
            'Option "baseDir" must be an absolute path, but %v was given.',
            options.baseDir,
          );
        }
      }
      this._options = {...options};
    }
    Object.freeze(this._options);
  }

  /**
   * Define route.
   *
   * @param {import('./static-route.js').StaticRouteDefinition} routeDef
   * @returns {this}
   */
  defineRoute(routeDef) {
    if (!routeDef || typeof routeDef !== 'object' || Array.isArray(routeDef)) {
      throw new InvalidArgumentError(
        'Parameter "routeDef" must be an Object, but %v was given.',
        routeDef,
      );
    }
    if (
      this._options.baseDir !== undefined &&
      !path.isAbsolute(routeDef.resourcePath)
    ) {
      routeDef = {...routeDef};
      routeDef.resourcePath = path.join(
        this._options.baseDir,
        routeDef.resourcePath,
      );
    }
    const debug = this.getDebuggerFor(this.defineRoute);
    const route = new StaticRoute(routeDef);
    debug('Adding a new route.');
    debug('Resource path is %v.', route.resourcePath);
    debug('Remote path is %v.', route.remotePath);
    debug('Resource type is %s.', route.isFile ? 'File' : 'Folder');
    this._routes.push(route);
    // самые длинные пути проверяются первыми,
    // чтобы избежать коллизий при поиске маршрута
    this._routes.sort((a, b) => b.remotePath.length - a.remotePath.length);
    return this;
  }

  /**
   * Handle request.
   *
   * @param {import('http').IncomingMessage} request
   * @param {import('http').ServerResponse} response
   * @returns {Promise<boolean>}
   */
  async handleRequest(request, response) {
    const fileInfo = await this._findFileForRequest(request);
    if (fileInfo !== undefined) {
      this._sendFile(request, response, fileInfo);
      return true;
    }
    return false;
  }

  /**
   * Find file for request.
   *
   * @param {import('http').IncomingMessage} request
   * @returns {Promise<FileInfo|undefined>|undefined}
   */
  async _findFileForRequest(request) {
    if (!(request instanceof IncomingMessage)) {
      throw new InvalidArgumentError(
        'Parameter "request" must be an instance of IncomingMessage, ' +
          'but %v was given.',
        request,
      );
    }
    const debug = this.getDebuggerFor(this._findFileForRequest);
    debug('File finding for an incoming request.');
    debug('Incoming request %s %v.', request.method, request.url);
    let requestPath;
    try {
      requestPath = decodeURIComponent(getPathnameFromUrl(request.url || ''));
    } catch {
      debug('Invalid URL encoding .');
      return;
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      debug('Method not allowed.');
      return;
    }
    if (requestPath.includes('//')) {
      debug('Request path contains duplicate slashes.');
      return;
    }
    if (!this._routes.length) {
      debug('No registered routes.');
      return;
    }
    debug('Walking through %v routes.', this._routes.length);
    for (const route of this._routes) {
      const isMatched = route.regexp.test(requestPath);
      if (isMatched) {
        debug('Matched route %v.', route.remotePath);
        // если ресурс ссылается на папку, то из адреса запроса
        // извлекается дополнительная часть (если присутствует),
        // и формируется целевой путь файловой системы
        let targetPath = route.resourcePath;
        if (!route.isFile) {
          // извлечение относительного пути в дополнение к адресу
          // ресурса путем удаления из адреса запроса той части,
          // которая была указана при объявлении маршрута
          const relativePath = requestPath.replace(route.regexp, '');
          // объединение адреса ресурса
          // с дополнительной частью
          targetPath = path.join(route.resourcePath, relativePath);
        }
        // если обнаружена попытка выхода за пределы
        // директории маршрута, то возвращается undefined
        targetPath = path.resolve(targetPath);
        const resourceRoot = path.resolve(route.resourcePath);
        if (
          targetPath !== resourceRoot &&
          !targetPath.startsWith(resourceRoot + path.sep)
        ) {
          return;
        }
        // с определением размера файла одновременно выполняется
        // отсечение отсутствующих файлов и директорий, в таких
        // случаях значение размера будет является undefined
        const fileSize = await new Promise(resolve => {
          fs.stat(targetPath, (statsError, stats) => {
            if (statsError || stats.isDirectory()) {
              resolve(undefined);
              return;
            }
            resolve(stats.size);
            return;
          });
        });
        // если размер файла определен, то поиск
        // прерывается и возвращается информация
        if (fileSize !== undefined) {
          // если файл найден, но запрос заканчивается
          // на слеш, то файл должен быть проигнорирован
          if (requestPath.endsWith('/')) {
            continue;
          }
          debug('File found %v.', targetPath);
          return {path: targetPath, size: fileSize};
        }
      }
    }
    debug('File not found.');
  }

  /**
   * Send file.
   *
   * @param {import('http').IncomingMessage} request
   * @param {import('http').ServerResponse} response
   * @param {FileInfo} fileInfo
   */
  _sendFile(request, response, fileInfo) {
    const debug = this.getDebuggerFor(this._sendFile);
    debug('File sending for an incoming request.');
    debug('Incoming request %s %v.', request.method, request.url);
    debug('File path %v.', fileInfo.path);
    debug('File size %v bytes.', fileInfo.size);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      debug('Method not allowed.');
      return;
    }
    // формирование заголовка "content-type"
    // в зависимости от расширения файла
    const extname = path.extname(fileInfo.path);
    const contentType =
      mimeTypes.contentType(extname) || 'application/octet-stream';
    // файл читается и отправляется частями,
    // что значительно снижает использование памяти
    const fileStream = createReadStream(fileInfo.path);
    fileStream.on('error', error => {
      debug('Unable to open a file stream.');
      this._handleFsError(error, response);
    });
    // отправка заголовка 200, только после
    // этого начинается отдача файла
    fileStream.on('open', () => {
      response.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': fileInfo.size,
      });
      // для HEAD запроса отправляются
      // только заголовки (без тела)
      if (request.method === 'HEAD') {
        response.end();
        debug('Response has been sent without a body for the HEAD request.');
        // важно закрыть файловый поток, чтобы операционная
        // система не исчерпала лимит открытых файлов
        fileStream.destroy();
        return;
      }
      fileStream.pipe(response);
    });
    request.on('close', () => {
      debug('File has been sent.');
      fileStream.destroy();
    });
  }

  /**
   * Handle filesystem error.
   *
   * @param {object} error
   * @param {object} response
   * @returns {undefined}
   */
  _handleFsError(error, response) {
    if (response.headersSent) {
      response.destroy();
      return;
    }
    if ('code' in error && error.code === 'ENOENT') {
      response.writeHead(404, {'Content-Type': 'text/plain'});
      response.write('404 Not Found');
      response.end();
    } else {
      response.writeHead(500, {'Content-Type': 'text/plain'});
      response.write('500 Internal Server Error');
      response.end();
    }
  }
}
