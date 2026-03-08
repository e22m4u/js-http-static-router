import {expect} from 'chai';
import {format} from '@e22m4u/js-format';
import {parseCookieString} from './parse-cookie-string.js';

describe('parseCookieString', function () {
  it('should require the parameter "input" to be a String', function () {
    const throwable = v => () => parseCookieString(v);
    const error = v =>
      format('Parameter "input" must be a String, but %s was given.', v);
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable(null)).to.throw(error('null'));
    expect(throwable({})).to.throw(error('Object'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable(undefined)).to.throw(error('undefined'));
    throwable('str')();
    throwable('')();
  });

  it('should return cookies as a plain object', function () {
    const value = 'pkg=math; equation=E%3Dmc%5E2';
    const result = parseCookieString(value);
    expect(result).to.have.property('pkg', 'math');
    expect(result).to.have.property('equation', 'E=mc^2');
  });

  it('should return an empty object for an empty string', function () {
    const result = parseCookieString('');
    expect(result).to.be.eql({});
  });

  it('should parse an empty cookie as an empty string', function () {
    const result = parseCookieString('foo=bar; baz');
    expect(result).to.be.eql({foo: 'bar', baz: ''});
  });

  it('should ignore prototype properties', function () {
    const result = parseCookieString(
      '__proto__=a; constructor=b; prototype=c; foo=bar',
    );
    expect(result).to.be.eql({foo: 'bar'});
  });
});
