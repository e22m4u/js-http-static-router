import {IncomingMessage} from 'http';

/**
 * Character encoding list.
 */
export const CHARACTER_ENCODING_LIST: (
  | 'ascii'
  | 'utf8'
  | 'utf-8'
  | 'utf16le'
  | 'utf-16le'
  | 'ucs2'
  | 'ucs-2'
  | 'latin1'
)[];

/**
 * Fetch request body.
 *
 * @param request
 * @param bodyBytesLimit
 */
export declare function fetchRequestBody(
  request: IncomingMessage,
  bodyBytesLimit?: number,
): Promise<string>;
