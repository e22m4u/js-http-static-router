
/**
 * Static route definition.
 */
export type StaticRouteDefinition = {
  remotePath: string;
  resourcePath: string;
}

/**
 * Static route.
 */
export class StaticRoute {
  /**
   * Remote path.
   *
   * @type {string}
   */
  readonly remotePath: string;

  /**
   * Resource path.
   *
   * @type {string}
   */
  readonly resourcePath: string;

  /**
   * RegExp.
   *
   * @type {RegExp}
   */
  readonly regexp: RegExp;

  /**
   * Is file.
   *
   * @type {boolean}
   */
  readonly isFile: boolean;

  /**
   * Constructor.
   * 
   * @param routeDef
   */
  constructor(routeDef: StaticRouteDefinition);
}
