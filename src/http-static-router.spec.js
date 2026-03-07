import {format} from '@e22m4u/js-format';
import {HttpStaticRouter} from './http-static-router.js';
import {expect} from 'chai';
import {ServiceContainer} from '@e22m4u/js-service';

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
  });
});
