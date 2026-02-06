/**
 * Static file route.
 */
export class HttpStaticRoute {
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
   * @param remotePath 
   * @param resourcePath 
   * @param regexp 
   * @param isFile 
   */
  constructor(
    remotePath: string,
    resourcePath: string,
    regexp: RegExp,
    isFile: boolean,
  );
}
