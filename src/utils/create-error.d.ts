import {Constructor} from '../types.js';

/**
 * Create error.
 *
 * @param errorCtor
 * @param message
 * @param args
 */
export declare function createError<T>(
  errorCtor: Constructor<T>,
  message: string,
  ...args: unknown[]
): T;
