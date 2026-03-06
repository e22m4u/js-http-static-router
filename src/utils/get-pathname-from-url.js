import {InvalidArgumentError} from '@e22m4u/js-format';

/**
 * Host RegExp.
 */
const HOST_RE = /^https?:\/\/[^/]+/;

/**
 * Query string RegExp.
 */
const QUERY_STRING_RE = /\?.*$/;

/**
 * Get pathname from url.
 *
 * @param {string} url
 * @returns {string}
 */
export function getPathnameFromUrl(url) {
  if (typeof url !== 'string') {
    throw new InvalidArgumentError(
      'Parameter "url" must be a String, but %v was given.',
      url,
    );
  }
  return url.replace(HOST_RE, '').replace(QUERY_STRING_RE, '');
}
