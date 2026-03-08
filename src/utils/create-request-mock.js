import {Socket} from 'net';
import {TLSSocket} from 'tls';
import queryString from 'querystring';
import {IncomingMessage} from 'http';
import {InvalidArgumentError} from '@e22m4u/js-format';
import {isReadableStream} from './is-readable-stream.js';
import {parseCookieString} from './parse-cookie-string.js';
import {createCookieString} from './create-cookie-string.js';
import {CHARACTER_ENCODING_LIST} from './fetch-request-body.js';

/**
 * Supported options.
 */
const SUPPORTED_OPTIONS = [
  'host',
  'method',
  'secure',
  'url',
  'path',
  'query',
  'cookies',
  'headers',
  'body',
  'stream',
  'encoding',
];

/**
 * Create request mock.
 *
 * @param {import('./create-request-mock.js').RequestOptions} [options]
 * @returns {import('http').IncomingMessage}
 */
export function createRequestMock(options) {
  if (options !== undefined) {
    if (!options || typeof options !== 'object' || Array.isArray(options)) {
      throw new InvalidArgumentError(
        'Parameter "options" must be an Object, but %v was given.',
        options,
      );
    }
    Object.keys(options).forEach(optionName => {
      if (!SUPPORTED_OPTIONS.includes(optionName)) {
        throw new InvalidArgumentError(
          'Option %v is not supported.',
          optionName,
        );
      }
    });
    // options.host
    if (options.host !== undefined && typeof options.host !== 'string') {
      throw new InvalidArgumentError(
        'Option "host" must be a String, but %v was given.',
        options.host,
      );
    }
    // options.method
    if (options.method !== undefined && typeof options.method !== 'string') {
      throw new InvalidArgumentError(
        'Option "method" must be a String, but %v was given.',
        options.method,
      );
    }
    // options.secure
    if (options.secure !== undefined && typeof options.secure !== 'boolean') {
      throw new InvalidArgumentError(
        'Option "secure" must be a Boolean, but %v was given.',
        options.secure,
      );
    }
    // option.url
    if (options.url !== undefined) {
      if (typeof options.url !== 'string') {
        throw new InvalidArgumentError(
          'Option "url" must be a String, but %v was given.',
          options.url,
        );
      }
      if (options.url.indexOf('#') !== -1) {
        throw new InvalidArgumentError(
          'Option "url" must not contain "#", but %v was given.',
          options.url,
        );
      }
    }
    // options.path
    if (options.path !== undefined) {
      if (typeof options.path !== 'string') {
        throw new InvalidArgumentError(
          'Option "path" must be a String, but %v was given.',
          options.path,
        );
      }
      // contain #
      if (options.path.indexOf('#') !== -1) {
        throw new InvalidArgumentError(
          'Option "path" must not contain "#", but %v was given.',
          options.path,
        );
      }
      // contain ?
      if (options.path.indexOf('?') !== -1) {
        throw new InvalidArgumentError(
          'Option "path" must not contain "?", but %v was given.',
          options.path,
        );
      }
      // not starting with /
      if (!options.path.startsWith('/')) {
        throw new InvalidArgumentError(
          'Option "path" must start with "/", but %v was given.',
          options.path,
        );
      }
    }
    // options.query
    if (options.query !== undefined) {
      if (
        options.query === null ||
        (typeof options.query !== 'string' &&
          typeof options.query !== 'object') ||
        Array.isArray(options.query)
      ) {
        throw new InvalidArgumentError(
          'Option "query" must be a String or an Object, but %v was given.',
          options.query,
        );
      }
    }
    // options.cookies
    if (options.cookies !== undefined) {
      if (
        !options.cookies ||
        typeof options.cookies !== 'object' ||
        Array.isArray(options.cookies)
      ) {
        throw new InvalidArgumentError(
          'Option "cookies" must be an Object, but %v was given.',
          options.cookies,
        );
      }
      // options.cookies[k]
      Object.keys(options.cookies).forEach(cookieName => {
        const cookieValue = options.cookies[cookieName];
        if (cookieValue !== undefined && typeof cookieValue !== 'string') {
          throw new InvalidArgumentError(
            'Cookie %v must be a String, but %v was given.',
            cookieName,
            cookieValue,
          );
        }
      });
    }
    // options.headers
    if (options.headers !== undefined) {
      if (
        !options.headers ||
        typeof options.headers !== 'object' ||
        Array.isArray(options.headers)
      ) {
        throw new InvalidArgumentError(
          'Option "headers" must be an Object, but %v was given.',
          options.headers,
        );
      }
      // options.headers[k]
      Object.keys(options.headers).forEach(headerName => {
        const headerValue = options.headers[headerName];
        if (headerValue !== undefined) {
          if (typeof headerValue !== 'string' && !Array.isArray(headerValue)) {
            throw new InvalidArgumentError(
              'Header %v must be a String or an Array, but %v was given.',
              headerName,
              headerValue,
            );
          }
          // options.headers[k][n]
          if (Array.isArray(headerValue)) {
            headerValue.forEach((headerEl, index) => {
              if (typeof headerEl !== 'string') {
                throw new InvalidArgumentError(
                  'Element %d of the header %v must be a String, ' +
                    'but %v was given.',
                  index,
                  headerName,
                  headerEl,
                );
              }
            });
          }
        }
      });
    }
    // options.stream
    if (options.stream !== undefined && !isReadableStream(options.stream)) {
      throw new InvalidArgumentError(
        'Option "stream" must be a Stream, but %v was given.',
        options.stream,
      );
    }
    // options.encoding
    if (options.encoding !== undefined) {
      if (typeof options.encoding !== 'string') {
        throw new InvalidArgumentError(
          'Option "encoding" must be a String, but %v was given.',
          options.encoding,
        );
      }
      if (!CHARACTER_ENCODING_LIST.includes(options.encoding)) {
        throw new InvalidArgumentError(
          'Character encoding %v is not supported.',
          options.encoding,
        );
      }
    }
    // если определен url, выполняется
    // проверка на несовместимые опции
    if (options.url !== undefined) {
      if (options.path !== undefined) {
        throw new InvalidArgumentError(
          'The "url" and "path" options cannot be used together.',
        );
      }
      if (options.query !== undefined) {
        throw new InvalidArgumentError(
          'The "url" and "query" options cannot be used together.',
        );
      }
    }
    // если передан поток, выполняется
    // проверка на несовместимые опции
    if (options.stream !== undefined) {
      if (options.secure !== undefined) {
        throw new InvalidArgumentError(
          'The "stream" and "secure" options cannot be used together.',
        );
      }
      if (options.body !== undefined) {
        throw new InvalidArgumentError(
          'The "stream" and "body" options cannot be used together.',
        );
      }
      if (options.encoding !== undefined) {
        throw new InvalidArgumentError(
          'The "stream" and "encoding" options cannot be used together.',
        );
      }
    }
  }
  options = options || {};
  let request;
  if (options.stream) {
    // перенаправление данных из переданного потока
    // в новый IncomingMessage, чтобы сохранить
    // работу проверки instanceof
    const socket = new Socket();
    request = new IncomingMessage(socket);
    options.stream.on('data', chunk => request.push(chunk));
    options.stream.on('end', () => request.push(null));
    options.stream.on('error', err => request.emit('error', err));
  } else {
    request = createRequestStream(
      options.secure,
      options.body,
      options.encoding,
    );
  }
  // добавление свойств сокета
  // для определения IP адреса
  Object.defineProperty(request.socket, 'remoteAddress', {value: '127.0.0.1'});
  Object.defineProperty(request.socket, 'localAddress', {value: '127.0.0.1'});
  // определение остальных свойств
  // экземпляра IncomingMessage
  request.httpVersion = '1.1';
  request.url = '/';
  if (options.url !== undefined) {
    request.url = options.url;
  } else if (options.path !== undefined || options.query !== undefined) {
    request.url = createRequestUrl(options.path, options.query);
  }
  request.headers = createRequestHeaders(
    options.host,
    options.secure,
    options.body,
    options.cookies,
    options.encoding,
    options.headers,
  );
  request.method = (options.method || 'get').toUpperCase();
  return request;
}

/**
 * Create request stream.
 *
 * @param {boolean|undefined} secure
 * @param {*} body
 * @param {string|undefined} encoding
 * @returns {import('http').IncomingMessage}
 */
function createRequestStream(secure, body, encoding) {
  if (encoding !== undefined && typeof encoding !== 'string') {
    throw new InvalidArgumentError(
      'Parameter "encoding" must be a String, but %v was given.',
      encoding,
    );
  }
  encoding = encoding || 'utf-8';
  // для безопасного подключения
  // использует обертка TLSSocket
  let socket = new Socket();
  // при использовании опции "secure"
  // создается новый экземпляр TLSSocket
  if (secure) {
    socket = new TLSSocket(socket);
  }
  const request = new IncomingMessage(socket);
  // если тело определено, то данные
  // передаются в текущий запрос
  if (body != null) {
    if (typeof body === 'string') {
      request.push(body, encoding);
    } else if (Buffer.isBuffer(body)) {
      request.push(body);
    } else {
      request.push(JSON.stringify(body), encoding);
    }
  }
  // передача "null" определяет
  // конец данных
  request.push(null);
  return request;
}

/**
 * Create request url.
 *
 * @param {string|undefined} path
 * @param {string|object|undefined} query
 * @returns {string}
 */
function createRequestUrl(path, query) {
  if (path !== undefined && typeof path !== 'string') {
    throw new InvalidArgumentError(
      'Parameter "path" must be a String, but %v was given.',
      path,
    );
  }
  if (query !== undefined) {
    if (
      query === null ||
      (typeof query !== 'string' && typeof query !== 'object') ||
      Array.isArray(query)
    ) {
      throw new InvalidArgumentError(
        'Parameter "query" must be a String or an Object, but %v was given.',
        query,
      );
    }
  }
  let res = path !== undefined ? path : '/';
  if (typeof query === 'object') {
    const qs = queryString.stringify(query);
    if (qs) {
      res += `?${qs}`;
    }
  } else if (typeof query === 'string' && query !== '' && query !== '?') {
    res += `?${query.replace(/^\?/, '')}`;
  }
  return res;
}

/**
 * Create request headers.
 *
 * @param {string|undefined} host
 * @param {boolean|undefined} secure
 * @param {*} body
 * @param {object|undefined} cookies
 * @param {string|undefined} encoding
 * @param {object|undefined} headers
 * @returns {object}
 */
function createRequestHeaders(host, secure, body, cookies, encoding, headers) {
  if (host !== undefined && typeof host !== 'string') {
    throw new InvalidArgumentError(
      'Parameter "host" must be a non-empty String, but %v was given.',
      host,
    );
  }
  host = host || 'localhost';
  if (secure !== undefined && typeof secure !== 'boolean') {
    throw new InvalidArgumentError(
      'Parameter "secure" must be a Boolean, but %v was given.',
      secure,
    );
  }
  secure = Boolean(secure);
  if (cookies !== undefined) {
    if (!cookies || typeof cookies !== 'object' || Array.isArray(cookies)) {
      throw new InvalidArgumentError(
        'Parameter "cookies" must be an Object, but %v was given.',
        cookies,
      );
    }
  }
  if (headers !== undefined) {
    if (!headers || typeof headers !== 'object' || Array.isArray(headers)) {
      throw new InvalidArgumentError(
        'Parameter "headers" must be an Object, but %v was given.',
        headers,
      );
    }
  }
  headers = headers || {};
  if (encoding !== undefined && typeof encoding !== 'string') {
    throw new InvalidArgumentError(
      'Parameter "encoding" must be a String, but %v was given.',
      encoding,
    );
  }
  encoding = encoding || 'utf-8';
  const res = {};
  Object.keys(headers).forEach(headerName => {
    res[headerName.toLowerCase()] = headers[headerName];
  });
  if (res.host === undefined) {
    res['host'] = host;
  }
  if (secure) {
    res['x-forwarded-proto'] = 'https';
  }
  // формирование заголовка Cookie используя
  // существующие данные заголовка и объекта,
  // переданного в параметр данной функции
  if (typeof cookies === 'object' && Object.keys(cookies).length) {
    if (res['cookie']) {
      const existedCookies = parseCookieString(res['cookie']);
      res['cookie'] = createCookieString({...existedCookies, ...cookies});
    } else {
      res['cookie'] = createCookieString(cookies);
    }
  }
  // установка заголовка "content-type"
  // в зависимости от тела запроса
  if (body != null && !('content-type' in res)) {
    if (typeof body === 'string') {
      res['content-type'] = 'text/plain';
    } else if (Buffer.isBuffer(body)) {
      res['content-type'] = 'application/octet-stream';
    } else if (
      typeof body === 'object' ||
      typeof body === 'boolean' ||
      typeof body === 'number'
    ) {
      res['content-type'] = 'application/json';
    }
  }
  // подсчет количества байт тела
  // для заголовка "content-length"
  if (
    body != null &&
    res['transfer-encoding'] == null &&
    res['content-length'] == null
  ) {
    if (typeof body === 'string') {
      const length = Buffer.byteLength(body, encoding);
      res['content-length'] = String(length);
    } else if (Buffer.isBuffer(body)) {
      const length = Buffer.byteLength(body);
      res['content-length'] = String(length);
    } else if (
      typeof body === 'object' ||
      typeof body === 'boolean' ||
      typeof body === 'number'
    ) {
      const json = JSON.stringify(body);
      const length = Buffer.byteLength(json, encoding);
      res['content-length'] = String(length);
    }
  }
  return res;
}
