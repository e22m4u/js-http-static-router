import {expect} from 'chai';
import {format} from '@e22m4u/js-format';
import {createError} from './create-error.js';

describe('createError', function () {
  it('should require the parameter "errorCtor" to be a Function', function () {
    const throwable = v => () => createError(v);
    const error = v =>
      format('Parameter "errorCtor" must be a Function, but %s was given.', v);
    expect(throwable('str')).to.throw(error('"str"'));
    expect(throwable('')).to.throw(error('""'));
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable(null)).to.throw(error('null'));
    expect(throwable({})).to.throw(error('Object'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable(undefined)).to.throw(error('undefined'));
    throwable(Error)();
  });

  it('should require the parameter "message" to be a String', function () {
    const throwable = v => () => createError(Error, v);
    const error = v =>
      format('Parameter "message" must be a String, but %s was given.', v);
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable({})).to.throw(error('Object'));
    expect(throwable([])).to.throw(error('Array'));
    throwable('str')();
    throwable('')();
    throwable(null)();
    throwable(undefined)();
  });

  it('should interpolate the given message with arguments', function () {
    const res = createError(Error, 'My %s', 'message');
    expect(res.message).to.be.eq('My message');
  });
});
