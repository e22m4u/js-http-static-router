import {PassThrough} from 'stream';

/**
 * Create response mock.
 *
 * @returns {import('http').ServerResponse}
 */
export function createResponseMock() {
  const response = new PassThrough();
  response.statusCode = 200;
  patchEncoding(response);
  patchHeaders(response);
  patchBody(response);
  return response;
}

/**
 * Patch encoding.
 *
 * @param {object} response
 */
function patchEncoding(response) {
  Object.defineProperty(response, '_encoding', {
    configurable: true,
    writable: true,
    value: undefined,
  });
  Object.defineProperty(response, 'setEncoding', {
    configurable: true,
    value: function (enc) {
      this._encoding = enc;
      return this;
    },
  });
  Object.defineProperty(response, 'getEncoding', {
    configurable: true,
    value: function () {
      return this._encoding;
    },
  });
}

/**
 * Patch headers.
 *
 * @param {object} response
 */
function patchHeaders(response) {
  Object.defineProperty(response, '_headersSent', {
    configurable: true,
    writable: true,
    value: false,
  });
  Object.defineProperty(response, 'headersSent', {
    configurable: true,
    get() {
      return this._headersSent;
    },
  });
  Object.defineProperty(response, '_headers', {
    configurable: true,
    writable: true,
    value: {},
  });
  Object.defineProperty(response, 'setHeader', {
    configurable: true,
    value: function (name, value) {
      if (this.headersSent) {
        throw new Error(
          'Error [ERR_HTTP_HEADERS_SENT]: ' +
            'Cannot set headers after they are sent to the client',
        );
      }
      const key = name.toLowerCase();
      this._headers[key] = Array.isArray(value)
        ? [...value.map(String)]
        : String(value);
      return this;
    },
  });
  Object.defineProperty(response, 'getHeader', {
    configurable: true,
    value: function (name) {
      return this._headers[name.toLowerCase()];
    },
  });
  Object.defineProperty(response, 'getHeaders', {
    configurable: true,
    value: function () {
      return JSON.parse(JSON.stringify(this._headers));
    },
  });
}

/**
 * Patch body.
 *
 * @param {object} response
 */
function patchBody(response) {
  let resolve, reject;
  const promise = new Promise((rsv, rej) => {
    resolve = rsv;
    reject = rej;
  });
  const data = [];
  response.on('data', c => data.push(c));
  response.on('error', e => reject(e));
  response.on('end', () => {
    resolve(Buffer.concat(data));
  });
  // флаг _headersSent должен быть установлен синхронно
  // после вызова метода response.end, так как асинхронная
  // установка (к примеру в response.on('end')) не позволит
  // отследить отправку ответа при синхронном выполнении
  const originalEnd = response.end.bind(response);
  response.end = function (...args) {
    this._headersSent = true;
    return originalEnd(...args);
  };
  Object.defineProperty(response, 'getBody', {
    configurable: true,
    value: function () {
      return promise.then(buffer => {
        const enc = this.getEncoding();
        const str = buffer.toString(enc);
        return data.length ? str : undefined;
      });
    },
  });
}
