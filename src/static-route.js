import fs from 'fs';
import path from 'path';
import {escapeRegexp} from './utils/escape-regexp.js';
import {InvalidArgumentError} from '@e22m4u/js-format';

/**
 * Static route.
 */
export class StaticRoute {
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
   * @param {string} routeDef
   */
  constructor(routeDef) {
    if (!routeDef || typeof routeDef !== 'object' || Array.isArray(routeDef)) {
      throw new InvalidArgumentError(
        'Parameter "routeDef" must be an Object, but %v was given.',
        routeDef,
      );
    }
    // remotePath
    if (typeof routeDef.remotePath !== 'string') {
      throw new InvalidArgumentError(
        'Option "remotePath" must be a String, but %v was given.',
        routeDef.remotePath,
      );
    }
    if (!routeDef.remotePath.startsWith('/')) {
      throw new InvalidArgumentError(
        'Option "remotePath" must start with "/", but %v was given.',
        routeDef.remotePath,
      );
    }
    // resourcePath
    if (typeof routeDef.resourcePath !== 'string') {
      throw new InvalidArgumentError(
        'Option "resourcePath" must be a String, but %v was given.',
        routeDef.resourcePath,
      );
    }
    if (!path.isAbsolute(routeDef.resourcePath)) {
      throw new InvalidArgumentError(
        'Option "resourcePath" must be an absolute path, but %v was given.',
        routeDef.resourcePath,
      );
    }
    let stats;
    try {
      stats = fs.statSync(routeDef.resourcePath);
    } catch (error) {
      console.error(error);
      throw new InvalidArgumentError(
        'Resource path %v does not exist.',
        routeDef.resourcePath,
      );
    }
    const isFile = stats.isFile();
    const escapedRemotePath = escapeRegexp(routeDef.remotePath);
    const regexp = isFile
      ? new RegExp(`^${escapedRemotePath}$`)
      : new RegExp(`^${escapedRemotePath}(?:$|\\/)`);
    this.remotePath = routeDef.remotePath;
    this.resourcePath = routeDef.resourcePath;
    this.regexp = regexp;
    this.isFile = isFile;
  }
}
