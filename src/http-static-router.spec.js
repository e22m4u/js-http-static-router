import path from 'path';
import {expect} from 'chai';
import {format} from '@e22m4u/js-format';
import {ServiceContainer} from '@e22m4u/js-service';
import {HttpStaticRouter} from './http-static-router.js';

/**
 * Relative rabbit file path.
 */
const REL_RABBIT_FILE_PATH = '../fixtures/rabbit.txt';

/**
 * Absolute rabbit file path.
 */
const ABS_RABBIT_FILE_PATH = path.join(
  import.meta.dirname,
  REL_RABBIT_FILE_PATH,
);

describe('HttpStaticRouter', function () {
  describe('constructor', function () {
    it('should require the first parameter to be a correct value', function () {
      const throwable = v => () => new HttpStaticRouter(v);
      const error = s =>
        format(
          'First parameter must be an Object or an instance ' +
            'of ServiceContainer, but %s was given.',
          s,
        );
      expect(throwable('str')).to.throw(error('"str"'));
      expect(throwable('')).to.throw(error('""'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable(null)).to.throw(error('null'));
      throwable(new ServiceContainer())();
      throwable({})();
      throwable(undefined)();
    });

    it('should require the second parameter to be a correct value', function () {
      const throwable = v => () => new HttpStaticRouter(undefined, v);
      const error = s =>
        format('Parameter "options" must be an Object, but %s was given.', s);
      expect(throwable('str')).to.throw(error('"str"'));
      expect(throwable('')).to.throw(error('""'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable(null)).to.throw(error('null'));
      throwable({})();
      throwable(undefined)();
    });

    it('should require the option "baseDir" to be a String', function () {
      const throwable = v => () => new HttpStaticRouter({baseDir: v});
      const error = s =>
        format('Option "baseDir" must be a String, but %s was given.', s);
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable(null)).to.throw(error('null'));
      throwable('/path')();
      throwable(undefined)();
    });

    it('should require the option "baseDir" to be an absolute path', function () {
      const throwable = () => new HttpStaticRouter({baseDir: 'test'});
      expect(throwable).to.throw(
        'Option "baseDir" must be an absolute path, but "test" was given.',
      );
    });

    it('should set the given service container to the current instance', function () {
      const container = new ServiceContainer();
      const S = new HttpStaticRouter(container);
      expect(S.container).to.be.eq(container);
    });

    it('should set the service container and the options object to the current instance', function () {
      const container = new ServiceContainer();
      const options = {baseDir: '/dir'};
      const S = new HttpStaticRouter(container, options);
      expect(S.container).to.be.eq(container);
      expect(S['_options']).to.be.eql(options);
    });

    it('should set an options object from the first parameter to the current instance', function () {
      const options = {baseDir: '/dir'};
      const S = new HttpStaticRouter(options);
      expect(S['_options']).to.be.eql(options);
    });

    it('should set an options object from the second parameter to the current instance', function () {
      const options = {baseDir: '/dir'};
      const S = new HttpStaticRouter(undefined, options);
      expect(S['_options']).to.be.eql(options);
    });

    it('should freeze an internal options object', function () {
      const options = {baseDir: '/dir'};
      const S = new HttpStaticRouter(undefined, options);
      expect(Object.isFrozen(S['_options'])).to.be.true;
    });
  });

  describe('defineRoute', function () {
    it('should require the parameter "routeDef" to be an Object', function () {
      const throwable = v => () => {
        const S = new HttpStaticRouter();
        S.defineRoute(v);
      };
      const error = s =>
        format('Parameter "routeDef" must be an Object, but %s was given.', s);
      expect(throwable('str')).to.throw(error('"str"'));
      expect(throwable('')).to.throw(error('""'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable(undefined)).to.throw(error('undefined'));
      expect(throwable(null)).to.throw(error('null'));
      throwable({
        remotePath: '/path',
        resourcePath: ABS_RABBIT_FILE_PATH,
      })();
    });

    it('should require the option "remotePath" to be a String', function () {
      const throwable = v => () => {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: v,
          resourcePath: ABS_RABBIT_FILE_PATH,
        });
      };
      const error = s =>
        format('Option "remotePath" must be a String, but %s was given.', s);
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable({})).to.throw(error('Object'));
      expect(throwable(undefined)).to.throw(error('undefined'));
      expect(throwable(null)).to.throw(error('null'));
      throwable('/path')();
    });

    it('should require the option "remotePath" to start with "/"', function () {
      const throwable = v => () => {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: v,
          resourcePath: ABS_RABBIT_FILE_PATH,
        });
      };
      const error = s =>
        format('Option "remotePath" must start with "/", but %s was given.', s);
      expect(throwable('path')).to.throw(error('"path"'));
      expect(throwable('')).to.throw(error('""'));
      throwable('/path')();
      throwable('/')();
    });

    it('should require the option "resourcePath" to be a String', function () {
      const throwable = v => () => {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/path',
          resourcePath: v,
        });
      };
      const error = s =>
        format('Option "resourcePath" must be a String, but %s was given.', s);
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable({})).to.throw(error('Object'));
      expect(throwable(undefined)).to.throw(error('undefined'));
      expect(throwable(null)).to.throw(error('null'));
      throwable(ABS_RABBIT_FILE_PATH)();
    });

    it('should require the option "resourcePath" to be an absolute path when the route option "baseDir" is not specified', function () {
      const throwable = () => {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/path',
          resourcePath: 'test',
        });
      };
      expect(throwable).to.throw(
        'Option "resourcePath" must be an absolute path when the router ' +
          'option "basePath" is not specified, but "test" was given.',
      );
    });

    it('should resolve a relative path of the resource when the option "baseDir" is provided', function () {
      const S = new HttpStaticRouter({baseDir: import.meta.dirname});
      const route = S.defineRoute({
        remotePath: '/path',
        resourcePath: REL_RABBIT_FILE_PATH,
      });
      expect(route.resourcePath).to.be.eq(ABS_RABBIT_FILE_PATH);
    });
  });
});
