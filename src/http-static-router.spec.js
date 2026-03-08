import path from 'path';
import {expect} from 'chai';
import {format} from '@e22m4u/js-format';
import {createRequestMock} from './utils/index.js';
import {ServiceContainer} from '@e22m4u/js-service';
import {HttpStaticRouter} from './http-static-router.js';

const REL_STATIC_DIR = '../static';
const REL_RABBIT_FILE = path.join(REL_STATIC_DIR, '/rabbit.txt');
const REL_HEART_FILE = path.join(REL_STATIC_DIR, '/nested/heart.txt');
const ABS_RABBIT_FILE = path.join(import.meta.dirname, REL_RABBIT_FILE);
const ABS_HEART_FILE = path.join(import.meta.dirname, REL_HEART_FILE);
const ABS_STATIC_DIR = path.join(import.meta.dirname, REL_STATIC_DIR);
const RABBIT_FILE_SIZE = 824;
const HEART_FILE_SIZE = 660;

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
        resourcePath: ABS_RABBIT_FILE,
      })();
    });

    it('should require the option "remotePath" to be a String', function () {
      const throwable = v => () => {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: v,
          resourcePath: ABS_RABBIT_FILE,
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
          resourcePath: ABS_RABBIT_FILE,
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
      throwable(ABS_RABBIT_FILE)();
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
        resourcePath: REL_RABBIT_FILE,
      });
      expect(route.resourcePath).to.be.eq(ABS_RABBIT_FILE);
    });

    it('should register a new route with the given route definition', function () {
      const S = new HttpStaticRouter();
      const route1 = S.defineRoute({
        remotePath: '/first',
        resourcePath: ABS_RABBIT_FILE,
      });
      const route2 = S.defineRoute({
        remotePath: '/second',
        resourcePath: ABS_RABBIT_FILE,
      });
      expect(S['_routes']).to.include(route1);
      expect(S['_routes']).to.include(route2);
    });

    it('should sort registered routes by length of the remote path', function () {
      const S = new HttpStaticRouter();
      const route1 = S.defineRoute({
        remotePath: '/foo',
        resourcePath: ABS_RABBIT_FILE,
      });
      const route2 = S.defineRoute({
        remotePath: '/fooBarBaz',
        resourcePath: ABS_RABBIT_FILE,
      });
      const route3 = S.defineRoute({
        remotePath: '/fooBar',
        resourcePath: ABS_RABBIT_FILE,
      });
      expect(S['_routes']).to.be.eql([route2, route3, route1]);
    });
  });

  describe('_findFileForRequest', function () {
    it('should return undefined if no route matched', async function () {
      const S = new HttpStaticRouter();
      const req = createRequestMock();
      const promise = S._findFileForRequest(req);
      expect(promise).to.be.instanceOf(Promise);
      const res = await promise;
      expect(res).to.be.undefined;
    });

    describe('when a route points to a file', function () {
      it('should return a file info even when the request url has an empty string', async function () {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/',
          resourcePath: ABS_RABBIT_FILE,
        });
        const req = createRequestMock({url: ''});
        const promise = S._findFileForRequest(req);
        expect(promise).to.be.instanceOf(Promise);
        const res = await promise;
        expect(res).to.be.eql({
          path: ABS_RABBIT_FILE,
          size: RABBIT_FILE_SIZE,
        });
      });

      it('should return a file info even when the request url has a protocol and host', async function () {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/',
          resourcePath: ABS_RABBIT_FILE,
        });
        const req = createRequestMock({url: 'http://localhost:3000'});
        const promise = S._findFileForRequest(req);
        expect(promise).to.be.instanceOf(Promise);
        const res = await promise;
        expect(res).to.be.eql({
          path: ABS_RABBIT_FILE,
          size: RABBIT_FILE_SIZE,
        });
      });

      it('should return a file info even when the request url has a protocol and host with a trailing slash', async function () {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/',
          resourcePath: ABS_RABBIT_FILE,
        });
        const req = createRequestMock({url: 'http://localhost:3000/'});
        const promise = S._findFileForRequest(req);
        expect(promise).to.be.instanceOf(Promise);
        const res = await promise;
        expect(res).to.be.eql({
          path: ABS_RABBIT_FILE,
          size: RABBIT_FILE_SIZE,
        });
      });

      it('should return undefined when the request url has a host with trailing slash duplicates', async function () {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/',
          resourcePath: ABS_RABBIT_FILE,
        });
        const req = createRequestMock({url: 'http://localhost:3000//'});
        const promise = S._findFileForRequest(req);
        expect(promise).to.be.instanceOf(Promise);
        const res = await promise;
        expect(res).to.be.undefined;
      });

      it('should return a file info for a matched route with the root path', async function () {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/',
          resourcePath: ABS_RABBIT_FILE,
        });
        const req = createRequestMock({path: '/'});
        const promise = S._findFileForRequest(req);
        expect(promise).to.be.instanceOf(Promise);
        const res = await promise;
        expect(res).to.be.eql({
          path: ABS_RABBIT_FILE,
          size: RABBIT_FILE_SIZE,
        });
      });

      it('should return a file info when a route matches with the GET method', async function () {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/',
          resourcePath: ABS_RABBIT_FILE,
        });
        const req = createRequestMock({method: 'GET'});
        const promise = S._findFileForRequest(req);
        expect(promise).to.be.instanceOf(Promise);
        const res = await promise;
        expect(res).to.be.eql({
          path: ABS_RABBIT_FILE,
          size: RABBIT_FILE_SIZE,
        });
      });

      it('should return a file info when a route matches with the HEAD method', async function () {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/',
          resourcePath: ABS_RABBIT_FILE,
        });
        const req = createRequestMock({method: 'HEAD'});
        const promise = S._findFileForRequest(req);
        expect(promise).to.be.instanceOf(Promise);
        const res = await promise;
        expect(res).to.be.eql({
          path: ABS_RABBIT_FILE,
          size: RABBIT_FILE_SIZE,
        });
      });

      it('should return undefined for the POST method even when the route matches', async function () {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/',
          resourcePath: ABS_RABBIT_FILE,
        });
        const req = createRequestMock({method: 'POST'});
        const promise = S._findFileForRequest(req);
        expect(promise).to.be.instanceOf(Promise);
        const res = await promise;
        expect(res).to.be.undefined;
      });

      it('should return undefined for the PUT method even when the route matches', async function () {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/',
          resourcePath: ABS_RABBIT_FILE,
        });
        const req = createRequestMock({method: 'PUT'});
        const promise = S._findFileForRequest(req);
        expect(promise).to.be.instanceOf(Promise);
        const res = await promise;
        expect(res).to.be.undefined;
      });

      it('should return undefined for the PATCH method even when the route matches', async function () {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/',
          resourcePath: ABS_RABBIT_FILE,
        });
        const req = createRequestMock({method: 'PATCH'});
        const promise = S._findFileForRequest(req);
        expect(promise).to.be.instanceOf(Promise);
        const res = await promise;
        expect(res).to.be.undefined;
      });

      it('should return undefined for the DELETE method even when the route matches', async function () {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/',
          resourcePath: ABS_RABBIT_FILE,
        });
        const req = createRequestMock({method: 'DELETE'});
        const promise = S._findFileForRequest(req);
        expect(promise).to.be.instanceOf(Promise);
        const res = await promise;
        expect(res).to.be.undefined;
      });

      describe('when a remote path has a single segment', function () {
        it('should return a file info for a matched route pointing to an existing file', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment',
            resourcePath: ABS_RABBIT_FILE,
          });
          const req = createRequestMock({path: '/segment'});
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.eql({
            path: ABS_RABBIT_FILE,
            size: RABBIT_FILE_SIZE,
          });
        });

        it('should return a file info when a matched route has a trailing slash', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment/',
            resourcePath: ABS_RABBIT_FILE,
          });
          const req = createRequestMock({path: '/segment/'});
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.eql({
            path: ABS_RABBIT_FILE,
            size: RABBIT_FILE_SIZE,
          });
        });

        it('should return undefined when the remote path does not match a trailing slash in the request url', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment',
            resourcePath: ABS_RABBIT_FILE,
          });
          const req = createRequestMock({path: '/segment/'});
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.undefined;
        });

        it('should return undefined when the request url does not match a trailing slash in the remote path', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment/',
            resourcePath: ABS_RABBIT_FILE,
          });
          const req = createRequestMock({path: '/segment'});
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.undefined;
        });
      });

      describe('when a remote path has two segments', function () {
        it('should return a file info for the matched route pointing to an existing file', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment1/segment2',
            resourcePath: ABS_RABBIT_FILE,
          });
          const req = createRequestMock({path: '/segment1/segment2'});
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.eql({
            path: ABS_RABBIT_FILE,
            size: RABBIT_FILE_SIZE,
          });
        });

        it('should return a file info when a matched route has a trailing slash', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment1/segment2/',
            resourcePath: ABS_RABBIT_FILE,
          });
          const req = createRequestMock({path: '/segment1/segment2/'});
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.eql({
            path: ABS_RABBIT_FILE,
            size: RABBIT_FILE_SIZE,
          });
        });

        it('should return undefined when the remote path does not match a trailing slash in the request url', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment1/segment2',
            resourcePath: ABS_RABBIT_FILE,
          });
          const req = createRequestMock({path: '/segment1/segment2/'});
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.undefined;
        });

        it('should return undefined when the request url does not match a trailing slash in the remote path', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment1/segment2/',
            resourcePath: ABS_RABBIT_FILE,
          });
          const req = createRequestMock({path: '/segment1/segment2'});
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.undefined;
        });

        it('should return undefined when a request path has duplicate slashes between its segments', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment1/segment2',
            resourcePath: ABS_RABBIT_FILE,
          });
          const req = createRequestMock({path: '/segment1//segment2'});
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.undefined;
        });
      });
    });

    describe('when a route points to a directory', function () {
      it('should return a file info when an extra path points to an existing file', async function () {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/',
          resourcePath: ABS_STATIC_DIR,
        });
        const req = createRequestMock({path: '/rabbit.txt'});
        const promise = S._findFileForRequest(req);
        expect(promise).to.be.instanceOf(Promise);
        const res = await promise;
        expect(res).to.be.eql({
          path: ABS_RABBIT_FILE,
          size: RABBIT_FILE_SIZE,
        });
      });

      it('should return undefined when an extra path points to a non-existent file', async function () {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/',
          resourcePath: ABS_STATIC_DIR,
        });
        const req = createRequestMock({path: '/unknown.txt'});
        const promise = S._findFileForRequest(req);
        expect(promise).to.be.instanceOf(Promise);
        const res = await promise;
        expect(res).to.be.undefined;
      });

      it('should return a file info when an extra path points to an existing file in a nested directory', async function () {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/',
          resourcePath: ABS_STATIC_DIR,
        });
        const req = createRequestMock({path: '/nested/heart.txt'});
        const promise = S._findFileForRequest(req);
        expect(promise).to.be.instanceOf(Promise);
        const res = await promise;
        expect(res).to.be.eql({
          path: ABS_HEART_FILE,
          size: HEART_FILE_SIZE,
        });
      });

      it('should return undefined when an extra path pointing to an existing file has a trailing slash', async function () {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/',
          resourcePath: ABS_STATIC_DIR,
        });
        const req = createRequestMock({path: '/rabbit.txt/'});
        const promise = S._findFileForRequest(req);
        expect(promise).to.be.instanceOf(Promise);
        const res = await promise;
        expect(res).to.be.undefined;
      });

      it('should return undefined when an extra path pointing to an existing file in a nested directory has a trailing slash', async function () {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/',
          resourcePath: ABS_STATIC_DIR,
        });
        const req = createRequestMock({path: '/nested/heart.txt/'});
        const promise = S._findFileForRequest(req);
        expect(promise).to.be.instanceOf(Promise);
        const res = await promise;
        expect(res).to.be.undefined;
      });

      it('should return undefined when an extra path pointing to an existing directory but without a specified file name', async function () {
        const S = new HttpStaticRouter();
        S.defineRoute({
          remotePath: '/',
          resourcePath: ABS_STATIC_DIR,
        });
        const req = createRequestMock({path: '/nested'});
        const promise = S._findFileForRequest(req);
        expect(promise).to.be.instanceOf(Promise);
        const res = await promise;
        expect(res).to.be.undefined;
      });

      describe('when a remote path has a single segment', function () {
        it('should return a file info for an extra path pointing to an existing file', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment',
            resourcePath: ABS_STATIC_DIR,
          });
          const req = createRequestMock({path: '/segment/rabbit.txt'});
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.eql({
            path: ABS_RABBIT_FILE,
            size: RABBIT_FILE_SIZE,
          });
        });

        it('should return undefined for an extra path pointing to a non-existent file', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment',
            resourcePath: ABS_STATIC_DIR,
          });
          const req = createRequestMock({path: '/segment/unknown.txt'});
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.undefined;
        });

        it('should return a file info for an extra path pointing to an existing file in a nested directory', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment',
            resourcePath: ABS_STATIC_DIR,
          });
          const req = createRequestMock({path: '/segment/nested/heart.txt'});
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.eql({
            path: ABS_HEART_FILE,
            size: HEART_FILE_SIZE,
          });
        });

        it('should return undefined when an extra path pointing to an existing file has a trailing slash', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment',
            resourcePath: ABS_STATIC_DIR,
          });
          const req = createRequestMock({path: '/segment/rabbit.txt/'});
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.undefined;
        });

        it('should return undefined when an extra path pointing to an existing file in a nested directory has a trailing slash', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment',
            resourcePath: ABS_STATIC_DIR,
          });
          const req = createRequestMock({path: '/segment/nested/heart.txt/'});
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.undefined;
        });
      });

      describe('when a remote path has two segments', function () {
        it('should return a file info for an extra path pointing to an existing file', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment1/segment2',
            resourcePath: ABS_STATIC_DIR,
          });
          const req = createRequestMock({
            path: '/segment1/segment2/rabbit.txt',
          });
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.eql({
            path: ABS_RABBIT_FILE,
            size: RABBIT_FILE_SIZE,
          });
        });

        it('should return undefined for an extra path pointing to a non-existent file', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment1/segment2',
            resourcePath: ABS_STATIC_DIR,
          });
          const req = createRequestMock({
            path: '/segment1/segment2/unknown.txt',
          });
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.undefined;
        });

        it('should return a file info for an extra path pointing to an existing file in a nested directory', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment1/segment2',
            resourcePath: ABS_STATIC_DIR,
          });
          const req = createRequestMock({
            path: '/segment1/segment2/nested/heart.txt',
          });
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.eql({
            path: ABS_HEART_FILE,
            size: HEART_FILE_SIZE,
          });
        });

        it('should return undefined when an extra path pointing to an existing file has a trailing slash', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment1/segment2',
            resourcePath: ABS_STATIC_DIR,
          });
          const req = createRequestMock({
            path: '/segment1/segment2/rabbit.txt/',
          });
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.undefined;
        });

        it('should return undefined when an extra path pointing to an existing file in a nested directory has a trailing slash', async function () {
          const S = new HttpStaticRouter();
          S.defineRoute({
            remotePath: '/segment1/segment2',
            resourcePath: ABS_STATIC_DIR,
          });
          const req = createRequestMock({
            path: '/segment1/segment2/nested/heart.txt/',
          });
          const promise = S._findFileForRequest(req);
          expect(promise).to.be.instanceOf(Promise);
          const res = await promise;
          expect(res).to.be.undefined;
        });
      });
    });
  });
});
