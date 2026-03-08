import {Readable} from 'stream';
import {IncomingMessage} from 'http';

/**
 * Request headers input.
 */
type RequestHeadersInput = {
  [name: string]: string | string[];
};

/**
 * Request options.
 */
type RequestOptions = {
  host?: string;
  method?: string;
  secure?: boolean;
  url?: string;
  path?: string;
  query?: string | object;
  cookies?: object;
  headers?: RequestHeadersInput;
  body?: unknown;
  stream?: Readable;
  encoding?: BufferEncoding;
};

/**
 * Create request mock.
 *
 * @param options
 */
export declare function createRequestMock(
  options?: RequestOptions,
): IncomingMessage;
