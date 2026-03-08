/**
 * A callable type with the "new" operator
 * allows class and constructor.
 */
export interface Constructor<T = unknown> {
  new (...args: any[]): T;
}
