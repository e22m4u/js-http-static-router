import {Readable} from 'stream';

/**
 * Check whether a value has a pipe
 * method.
 *
 * @param value
 */
export declare function isReadableStream(value: unknown): value is Readable;
