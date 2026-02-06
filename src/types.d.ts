/**
 * A callable type with the "new" operator
 * that allows class and constructor types.
 */
export interface Constructor<T = object> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
}

/**
 * An object prototype that excludes
 * function and scalar values.
 */
export type Prototype<T = object> = T &
  object & {bind?: never} & {
    call?: never;
  } & {prototype?: object};

/**
 * A function type without class and constructor.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Callable<T = unknown> = (...args: any[]) => T;

/**
 * Makes a specific property of T as optional.
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * A part of the Flatten type.
 */
export type Identity<T> = T;

/**
 * Makes T more human-readable.
 */
export type Flatten<T> = Identity<{[k in keyof T]: T[k]}>;
