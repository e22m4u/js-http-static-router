import {expect} from 'chai';
import {format} from '@e22m4u/js-format';
import {getPathnameFromUrl} from './get-pathname-from-url.js';

describe('getPathnameFromUrl', function () {
  it('should require the parameter "url" to be a String', function () {
    const throwable = v => () => getPathnameFromUrl(v);
    const error = v =>
      format('Parameter "url" must be a String, but %s was given.', v);
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

  it('should return a pathname without a query string', function () {
    const res1 = getPathnameFromUrl('pathname?foo=bar');
    const res2 = getPathnameFromUrl('/pathname?foo=bar');
    const res3 = getPathnameFromUrl('http://example.com/pathname?foo=bar');
    expect(res1).to.be.eq('pathname');
    expect(res2).to.be.eq('/pathname');
    expect(res3).to.be.eq('/pathname');
  });

  it('should preserve a trailing slash', function () {
    const res1 = getPathnameFromUrl('/pathname/');
    expect(res1).to.be.eq('/pathname/');
    const res2 = getPathnameFromUrl('/pathname/?foo=bar');
    expect(res2).to.be.eq('/pathname/');
  });
});
