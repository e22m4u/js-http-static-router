import HttpErrors from 'http-errors';
import {IncomingMessage} from 'http';
import {createError} from './create-error.js';
import {InvalidArgumentError} from '@e22m4u/js-format';
import {parseContentType} from './parse-content-type.js';

/**
 * Character encoding list.
 */
export const CHARACTER_ENCODING_LIST = [
  'ascii',
  'utf8',
  'utf-8',
  'utf16le',
  'utf-16le',
  'ucs2',
  'ucs-2',
  'latin1',
];

/**
 * Fetch request body.
 *
 * @param {IncomingMessage} request
 * @param {number} bodyBytesLimit
 * @returns {Promise<string|undefined>}
 */
export function fetchRequestBody(request, bodyBytesLimit = 0) {
  if (!(request instanceof IncomingMessage)) {
    throw new InvalidArgumentError(
      'Parameter "request" must be an instance of IncomingMessage, ' +
        'but %v was given.',
      request,
    );
  }
  if (typeof bodyBytesLimit !== 'number') {
    throw new InvalidArgumentError(
      'Parameter "bodyBytesLimit" must be a Number, but %v was given.',
      bodyBytesLimit,
    );
  }
  return new Promise((resolve, reject) => {
    // сравнение внутреннего ограничения
    // размера тела запроса с заголовком
    // "content-length"
    const contentLength = parseInt(
      request.headers['content-length'] || '0',
      10,
    );
    if (bodyBytesLimit && contentLength && contentLength > bodyBytesLimit) {
      throw createError(
        HttpErrors.PayloadTooLarge,
        'Request body limit is %s bytes, but %s bytes given.',
        bodyBytesLimit,
        contentLength,
      );
    }
    // определение кодировки
    // по заголовку "content-type"
    let encoding = 'utf-8';
    const contentType = request.headers['content-type'] || '';
    if (contentType) {
      const parsedContentType = parseContentType(contentType);
      if (parsedContentType && parsedContentType.charset) {
        encoding = parsedContentType.charset.toLowerCase();
        if (!CHARACTER_ENCODING_LIST.includes(encoding)) {
          throw createError(
            HttpErrors.UnsupportedMediaType,
            'Request encoding %v is not supported.',
            encoding,
          );
        }
      }
    }
    // подготовка массива загружаемых байтов
    // и счетчика для отслеживания их объема
    const data = [];
    let receivedLength = 0;
    // обработчик проверяет объем загружаемых
    // данных и складывает их в массив
    const onData = chunk => {
      receivedLength += chunk.length;
      if (bodyBytesLimit && receivedLength > bodyBytesLimit) {
        cleanupListeners();
        const error = createError(
          HttpErrors.PayloadTooLarge,
          'Request body limit is %v bytes, but %v bytes given.',
          bodyBytesLimit,
          receivedLength,
        );
        // после удаления слушателей поток продолжает быть
        // в состоянии resume (flowing mode), данные будут
        // считываться в никуда, и чтобы сэкономить трафик
        // и ресурсы сервера при превышении лимита,
        // выполняется уничтожение потока запроса
        request.unpipe();
        request.destroy();
        reject(error);
        return;
      }
      data.push(chunk);
    };
    // кода данные полностью загружены, нужно удалить
    // обработчики событий, и сравнить полученный объем
    // данных с заявленным в заголовке "content-length"
    const onEnd = () => {
      cleanupListeners();
      if (contentLength && contentLength !== receivedLength) {
        const error = createError(
          HttpErrors.BadRequest,
          'Received bytes do not match the "content-length" header.',
        );
        reject(error);
        return;
      }
      // объединение массива байтов в буфер, кодирование
      // результата в строку, и передача полученных данных
      // в ожидающий Promise
      const buffer = Buffer.concat(data);
      const body = buffer.toString(encoding);
      resolve(body || undefined);
    };
    // при ошибке загрузки тела запроса,
    // удаляются обработчики событий,
    // и отклоняется ожидающий Promise
    // ошибкой с кодом 400
    const onError = error => {
      cleanupListeners();
      reject(HttpErrors(400, error));
    };
    // запрос может иметь слушателей, установленных самим Node.js
    // сервером или другими инструментами, которые подписались
    // на close, aborted или error, потому нельзя использовать
    // метод removeAllListeners
    const cleanupListeners = () => {
      request.removeListener('data', onData);
      request.removeListener('end', onEnd);
      request.removeListener('error', onError);
    };
    // добавление обработчиков прослушивающих
    // события входящего запроса и возобновление
    // потока данных
    request.on('data', onData);
    request.on('end', onEnd);
    request.on('error', onError);
    request.resume();
  });
}
