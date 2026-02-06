import {InvalidArgumentError} from '@e22m4u/js-format';

/**
 * Static file route.
 */
export class HttpStaticRoute {
  /**
   * Remote path.
   *
   * @type {string}
   */
  remotePath;

  /**
   * Resource path.
   *
   * @type {string}
   */
  resourcePath;

  /**
   * RegExp.
   *
   * @type {RegExp}
   */
  regexp;

  /**
   * Is file.
   *
   * @type {boolean}
   */
  isFile;

  /**
   * Constructor.
   *
   * @param {string} remotePath
   * @param {string} resourcePath
   * @param {RegExp} regexp
   * @param {boolean} isFile
   */
  constructor(remotePath, resourcePath, regexp, isFile) {
    if (typeof remotePath !== 'string') {
      throw new InvalidArgumentError(
        'Parameter "remotePath" must be a String, but %v was given.',
        remotePath,
      );
    }
    if (typeof resourcePath !== 'string') {
      throw new InvalidArgumentError(
        'Parameter "resourcePath" must be a String, but %v was given.',
        resourcePath,
      );
    }
    if (!(regexp instanceof RegExp)) {
      throw new InvalidArgumentError(
        'Parameter "regexp" must be an instance of RegExp, but %v was given.',
        regexp,
      );
    }
    if (typeof isFile !== 'boolean') {
      throw new InvalidArgumentError(
        'Parameter "isFile" must be a String, but %v was given.',
        isFile,
      );
    }
    this.remotePath = remotePath;
    this.resourcePath = resourcePath;
    this.regexp = regexp;
    this.isFile = isFile;
  }
}
