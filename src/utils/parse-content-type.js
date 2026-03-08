import {InvalidArgumentError} from '@e22m4u/js-format';

/**
 * Parse content type.
 *
 * @param {string} input
 * @returns {{
 *   boundary: string|undefined,
 *   charset: string|undefined,
 *   mediaType: string|undefined,
 * }}
 */
export function parseContentType(input) {
  if (typeof input !== 'string') {
    throw new InvalidArgumentError(
      'Parameter "input" must be a String, but %v was given.',
      input,
    );
  }
  const res = {mediaType: undefined, charset: undefined, boundary: undefined};
  const re =
    /^\s*([^\s;/]+\/[^\s;/]+)(?:;\s*charset=([^\s;]+))?(?:;\s*boundary=([^\s;]+))?.*$/i;
  const matches = re.exec(input);
  if (matches && matches[1]) {
    res.mediaType = matches[1];
    if (matches[2]) {
      res.charset = matches[2];
    }
    if (matches[3]) {
      res.boundary = matches[3];
    }
  }
  return res;
}
