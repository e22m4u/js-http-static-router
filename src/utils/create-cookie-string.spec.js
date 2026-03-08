import {expect} from 'chai';
import {format} from '@e22m4u/js-format';
import {createCookieString} from './create-cookie-string.js';

describe('createCookieString', function () {
  it('should require the parameter "data" to be an object', function () {
    const throwable = v => () => createCookieString(v);
    const error = v =>
      format('Cookie data must be an Object, but %s was given.', v);
    expect(throwable('str')).to.throw(error('"str"'));
    expect(throwable('')).to.throw(error('""'));
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable(null)).to.throw(error('null'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable(undefined)).to.throw(error('undefined'));
    throwable({key: 'value'})();
    throwable({})();
  });

  it('should return an empty string for an empty object', function () {
    expect(createCookieString({})).to.be.eq('');
  });

  it('should return the cookie string for the given object', function () {
    const data = {foo: 'bar', baz: 'quz'};
    const result = createCookieString(data);
    expect(result).to.be.eq('foo=bar; baz=quz');
  });
});
