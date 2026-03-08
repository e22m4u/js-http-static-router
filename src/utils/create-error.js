import {format, InvalidArgumentError} from '@e22m4u/js-format';

/**
 * Create error.
 *
 * @param {Function} errorCtor
 * @param {string} message
 * @param {*[]|undefined} args
 * @returns {object}
 */
export function createError(errorCtor, message, ...args) {
  if (typeof errorCtor !== 'function') {
    throw new InvalidArgumentError(
      'Parameter "errorCtor" must be a Function, but %v was given.',
      errorCtor,
    );
  }
  if (message != null && typeof message !== 'string') {
    throw new InvalidArgumentError(
      'Parameter "message" must be a String, but %v was given.',
      message,
    );
  }
  if (message == null) {
    return new errorCtor();
  }
  const interpolatedMessage = format(message, ...args);
  return new errorCtor(interpolatedMessage);
}
