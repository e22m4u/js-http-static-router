/**
 * Check whether a value has a pipe method.
 *
 * @param {*} value
 * @returns {boolean}
 */
export function isReadableStream(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return typeof value.pipe === 'function';
}
