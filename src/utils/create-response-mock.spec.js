import {expect} from 'chai';
import {PassThrough} from 'stream';
import {createResponseMock} from './create-response-mock.js';

describe('createResponseMock', function () {
  it('should return an instance of PassThrough', function () {
    const res = createResponseMock();
    expect(res).to.be.instanceof(PassThrough);
  });

  describe('statusCode', function () {
    it('should be initialized with 200 by default', function () {
      const res = createResponseMock();
      expect(res.statusCode).to.be.eq(200);
    });
  });

  describe('setEncoding', function () {
    it('should set the given encoding and return the response', function () {
      const res = createResponseMock();
      expect(res._encoding).to.be.undefined;
      const ret = res.setEncoding('utf-8');
      expect(ret).to.be.eq(res);
      expect(res._encoding).to.be.eq('utf-8');
    });
  });

  describe('getEncoding', function () {
    it('should return the current encoding', function () {
      const res = createResponseMock();
      expect(res._encoding).to.be.undefined;
      const ret1 = res.getEncoding();
      expect(ret1).to.be.undefined;
      res._encoding = 'utf-8';
      const ret2 = res.getEncoding();
      expect(ret2).to.be.eq('utf-8');
    });
  });

  describe('headersSent', function () {
    it('should return false when the response is not sent', function () {
      const res = createResponseMock();
      expect(res._headersSent).to.be.false;
      expect(res.headersSent).to.be.false;
    });

    it('should return a value from the "_headersSent" property', function () {
      const res = createResponseMock();
      expect(res._headersSent).to.be.false;
      expect(res.headersSent).to.be.false;
      res._headersSent = true;
      expect(res.headersSent).to.be.true;
    });
  });

  describe('setHeader', function () {
    it('should set the given header and return the response', function () {
      const res = createResponseMock();
      expect(res._headers['foo']).to.be.eq(undefined);
      const ret = res.setHeader('foo', 'bar');
      expect(ret).to.be.eq(res);
      expect(res._headers['foo']).to.be.eq('bar');
    });

    it('should throw an error when headers are sent', function () {
      const res = createResponseMock();
      res._headersSent = true;
      const throwable = () => res.setHeader('foo');
      expect(throwable).to.throw(
        'Error [ERR_HTTP_HEADERS_SENT]: ' +
          'Cannot set headers after they are sent to the client',
      );
    });

    it('should set the header value as a String', function () {
      const res = createResponseMock();
      expect(res._headers['num']).to.be.eq(undefined);
      const ret = res.setHeader('num', 10);
      expect(ret).to.be.eq(res);
      expect(res._headers['num']).to.be.eq('10');
    });

    it('should not stringify an array value', function () {
      const res = createResponseMock();
      expect(res._headers['key']).to.be.eq(undefined);
      const ret = res.setHeader('key', ['foo', 'bar']);
      expect(ret).to.be.eq(res);
      expect(res._headers['key']).to.be.eql(['foo', 'bar']);
    });

    it('should stringify an array elements', function () {
      const res = createResponseMock();
      expect(res._headers['key']).to.be.eq(undefined);
      const ret = res.setHeader('key', [1, 2]);
      expect(ret).to.be.eq(res);
      expect(res._headers['key']).to.be.eql(['1', '2']);
    });
  });

  describe('getHeader', function () {
    it('should return the header value if exists', function () {
      const res = createResponseMock();
      res._headers['foo'] = 'bar';
      const ret = res.getHeader('foo');
      expect(ret).to.be.eq('bar');
    });

    it('should ignore case-sensitivity for header names', function () {
      const res = createResponseMock();
      res._headers['foo'] = 'bar';
      const ret = res.getHeader('FOO');
      expect(ret).to.be.eq('bar');
    });
  });

  describe('getHeaders', function () {
    it('should return a copy of the headers object', function () {
      const res = createResponseMock();
      const ret1 = res.getHeaders();
      res._headers['foo'] = 'bar';
      res._headers['baz'] = 'qux';
      const ret2 = res.getHeaders();
      expect(ret1).to.be.eql({});
      expect(ret2).to.be.eql({foo: 'bar', baz: 'qux'});
      expect(ret1).not.to.be.eq(res._headers);
      expect(ret2).not.to.be.eq(res._headers);
    });
  });

  describe('getBody', function () {
    it('should return a Promise of the stream content', async function () {
      const body = 'Lorem Ipsum is simply dummy text.';
      const res = createResponseMock();
      res.end(body);
      const promise = res.getBody();
      expect(promise).to.be.instanceof(Promise);
      const result = await promise;
      expect(result).to.be.eq(body);
    });
  });

  describe('Stream', function () {
    it('should set the property "headersSent" to true when the stream ends', function () {
      const res = createResponseMock();
      expect(res.headersSent).to.be.false;
      res.end('test');
      expect(res.headersSent).to.be.true;
    });
  });
});
