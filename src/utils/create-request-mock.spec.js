import {Socket} from 'net';
import {expect} from 'chai';
import {TLSSocket} from 'tls';
import {Readable, Stream} from 'stream';
import {format} from '@e22m4u/js-format';
import {createRequestMock} from './create-request-mock.js';
import {CHARACTER_ENCODING_LIST} from './fetch-request-body.js';

describe('createRequestMock', function () {
  it('should require the parameter "options" to be an Object', function () {
    const throwable = v => () => createRequestMock(v);
    const error = v =>
      format('Parameter "options" must be an Object, but %s was given.', v);
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

  it('should require the option "host" to be a String', function () {
    const throwable = v => () => createRequestMock({host: v});
    const error = v =>
      format('Option "host" must be a String, but %s was given.', v);
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    expect(throwable(null)).to.throw(error('null'));
    throwable('str')();
    throwable('')();
    throwable(undefined)();
  });

  it('should require the option "method" to be a String', function () {
    const throwable = v => () => createRequestMock({method: v});
    const error = v =>
      format('Option "method" must be a String, but %s was given.', v);
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    expect(throwable(null)).to.throw(error('null'));
    throwable('str')();
    throwable('')();
    throwable(undefined)();
  });

  it('should require the option "secure" to be a Boolean', function () {
    const throwable = v => () => createRequestMock({secure: v});
    const error = v =>
      format('Option "secure" must be a Boolean, but %s was given.', v);
    expect(throwable('str')).to.throw(error('"str"'));
    expect(throwable('')).to.throw(error('""'));
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    expect(throwable(null)).to.throw(error('null'));
    throwable(true)();
    throwable(false)();
    throwable(undefined)();
  });

  it('should require the option "url" to be a String', function () {
    const throwable = v => () => createRequestMock({url: v});
    const error = v =>
      format('Option "url" must be a String, but %s was given.', v);
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    expect(throwable(null)).to.throw(error('null'));
    throwable('/path')();
    throwable('/')();
    throwable('')();
    throwable(undefined)();
  });

  it('should require the option "url" to not contain "#"', function () {
    const throwable = v => () => createRequestMock({url: v});
    const mustThrowWith = v => {
      expect(throwable(v)).to.throw(
        format('Option "url" must not contain "#", but %v was given.', v),
      );
    };
    mustThrowWith('#');
    mustThrowWith('pathname#');
    mustThrowWith('/pathname#');
    mustThrowWith('http://example.com/#');
    mustThrowWith('http://example.com/pathname#');
    mustThrowWith('http://example.com/pathname?foo=bar#');
  });

  it('should require the option "path" to be a String', function () {
    const throwable = v => () => createRequestMock({path: v});
    const error = v =>
      format('Option "path" must be a String, but %s was given.', v);
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    expect(throwable(null)).to.throw(error('null'));
    throwable('/path')();
    throwable('/')();
    throwable(undefined)();
  });

  it('should require the option "path" to not contain "#"', function () {
    const throwable = v => () => createRequestMock({path: v});
    const mustThrowWith = v => {
      expect(throwable(v)).to.throw(
        format('Option "path" must not contain "#", but %v was given.', v),
      );
    };
    mustThrowWith('/#');
    mustThrowWith('/path#');
  });

  it('should require the option "path" to not contain "?"', function () {
    const throwable = v => () => createRequestMock({path: v});
    const mustThrowWith = v => {
      expect(throwable(v)).to.throw(
        format('Option "path" must not contain "?", but %v was given.', v),
      );
    };
    mustThrowWith('/?');
    mustThrowWith('/path?');
  });

  it('should require the option "path" to start with "/"', function () {
    const throwable = v => () => createRequestMock({path: v});
    const mustThrowWith = v => {
      expect(throwable(v)).to.throw(
        format('Option "path" must start with "/", but %v was given.', v),
      );
    };
    mustThrowWith('path');
    mustThrowWith('');
  });

  it('should require the option "query" to be a String or an Object', function () {
    const throwable = v => () => createRequestMock({query: v});
    const error = v =>
      format(
        'Option "query" must be a String or an Object, but %s was given.',
        v,
      );
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable(null)).to.throw(error('null'));
    throwable({foo: 'bar'})();
    throwable({})();
    throwable('foo=bar')();
    throwable('')();
    throwable(undefined)();
  });

  it('should require the option "cookies" to be an Object', function () {
    const throwable = v => () => createRequestMock({cookies: v});
    const error = v =>
      format('Option "cookies" must be an Object, but %s was given.', v);
    expect(throwable('str')).to.throw(error('"str"'));
    expect(throwable('')).to.throw(error('""'));
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable(null)).to.throw(error('null'));
    throwable({foo: 'bar'})();
    throwable({})();
    throwable(undefined)();
  });

  it('should require values in the option "cookies" to be a String', function () {
    const throwable = v => () => createRequestMock({cookies: {test: v}});
    const error = v =>
      format('Cookie "test" must be a String, but %s was given.', v);
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    expect(throwable(null)).to.throw(error('null'));
    throwable('str')();
    throwable('')();
    throwable(undefined)();
  });

  it('should require the option "headers" to be an Object', function () {
    const throwable = v => () => createRequestMock({headers: v});
    const error = v =>
      format('Option "headers" must be an Object, but %s was given.', v);
    expect(throwable('str')).to.throw(error('"str"'));
    expect(throwable('')).to.throw(error('""'));
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable(null)).to.throw(error('null'));
    throwable({foo: 'bar'})();
    throwable({})();
    throwable(undefined)();
  });

  it('should require values in the option "headers" to be a String or an Array', function () {
    const throwable = v => () => createRequestMock({headers: {Test: v}});
    const error = v =>
      format(
        'Header "Test" must be a String or an Array, but %s was given.',
        v,
      );
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable({})).to.throw(error('Object'));
    expect(throwable(null)).to.throw(error('null'));
    throwable('str')();
    throwable('')();
    throwable([])();
    throwable(undefined)();
  });

  it('should require elements in the option "headers" to be a String', function () {
    const throwable = v => () => createRequestMock({headers: {Test: [v]}});
    const error = v =>
      format(
        'Element 0 of the header "Test" must be a String, ' +
          'but %s was given.',
        v,
      );
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    expect(throwable(undefined)).to.throw(error('undefined'));
    expect(throwable(null)).to.throw(error('null'));
    throwable('str')();
    throwable('')();
  });

  it('should require the option "stream" to be a Stream', function () {
    const throwable = v => () => createRequestMock({stream: v});
    const error = v =>
      format('Option "stream" must be a Stream, but %s was given.', v);
    expect(throwable('str')).to.throw(error('"str"'));
    expect(throwable('')).to.throw(error('""'));
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    expect(throwable(null)).to.throw(error('null'));
    throwable(new Stream())();
    throwable(undefined)();
  });

  it('should require the option "encoding" to be a String', function () {
    const throwable = v => () => createRequestMock({encoding: v});
    const error = v =>
      format('Option "encoding" must be a String, but %s was given.', v);
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    expect(throwable(null)).to.throw(error('null'));
    throwable('utf-8')();
    throwable(undefined)();
  });

  it('should not allow unsupported options', function () {
    const throwable = () => createRequestMock({unknownOption: 'value'});
    expect(throwable).to.throw('Option "unknownOption" is not supported.');
  });

  it('should not allow using the "url" and "path" options together', function () {
    const throwable = () => createRequestMock({url: 'url', path: '/path'});
    const error = 'The "url" and "path" options cannot be used together.';
    expect(throwable).to.throw(error);
  });

  it('should not allow using the "url" and "query" options together', function () {
    const throwable = () => createRequestMock({url: 'url', query: {p: 1}});
    const error = 'The "url" and "query" options cannot be used together.';
    expect(throwable).to.throw(error);
  });

  it('should require the option "encoding" to be a correct value', function () {
    const throwable = v => () => createRequestMock({encoding: v});
    const error = v => format('Character encoding %s is not supported.', v);
    expect(throwable('str')).to.throw(error('"str"'));
    expect(throwable('')).to.throw(error('""'));
    CHARACTER_ENCODING_LIST.forEach(v => throwable(v)());
  });

  it('should not allow using the "stream" and "secure" options together', function () {
    const throwable = v => () =>
      createRequestMock({stream: new Stream(), secure: v});
    const error = 'The "stream" and "secure" options cannot be used together.';
    expect(throwable(true)).to.throw(error);
    expect(throwable(false)).to.throw(error);
    throwable(undefined)();
  });

  it('should not allow using the "stream" and "body" options together', function () {
    const throwable = v => () =>
      createRequestMock({stream: new Stream(), body: v});
    const error = 'The "stream" and "body" options cannot be used together.';
    expect(throwable('str')).to.throw(error);
    expect(throwable({foo: 'bar'})).to.throw(error);
    expect(throwable(Buffer.from('str'))).to.throw(error);
    throwable(undefined)();
  });

  it('should not allow using the "stream" and "encoding" options together', function () {
    const throwable = v => () =>
      createRequestMock({stream: new Stream(), encoding: v});
    const error =
      'The "stream" and "encoding" options cannot be used together.';
    expect(throwable('utf-8')).to.throw(error);
    throwable(undefined)();
  });

  it('should use "GET" as the default method', function () {
    const req = createRequestMock();
    expect(req.method).to.be.eq('GET');
  });

  it('should use an instance of Socket as the default socket', function () {
    const req = createRequestMock();
    expect(req.socket).to.be.instanceof(Socket);
  });

  it('should use "/" as the default value of the request url', function () {
    const req = createRequestMock();
    expect(req.url).to.be.eq('/');
  });

  it('should use "localhost" as the default value of the "host" header', function () {
    const req = createRequestMock();
    expect(req.headers).to.be.eql({host: 'localhost'});
  });

  it('should use "utf-8" as the default value of the data encoding', async function () {
    const body = 'test';
    const req = createRequestMock({body: Buffer.from(body)});
    const chunks = [];
    const data = await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(Buffer.from(chunk)));
      req.on('error', err => reject(err));
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
    expect(data).to.be.eql(body);
  });

  it('should use an instance of Socket when the option "secure" is false', function () {
    const req = createRequestMock({secure: false});
    expect(req.socket).to.be.instanceof(Socket);
  });

  it('should use an instance of TLSSocket when the option "secure" is true', function () {
    const req = createRequestMock({secure: true});
    expect(req.socket).to.be.instanceof(TLSSocket);
  });

  it('should handle an undefined body without writing it to the stream', async function () {
    const req = createRequestMock({body: undefined});
    expect(req.headers['content-length']).to.be.undefined;
    const chunks = [];
    const data = await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(Buffer.from(chunk)));
      req.on('error', err => reject(err));
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
    expect(data).to.be.eq('');
  });

  it('should handle a null body without writing it to the stream', async function () {
    const req = createRequestMock({body: null});
    expect(req.headers['content-length']).to.be.undefined;
    const chunks = [];
    const data = await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(Buffer.from(chunk)));
      req.on('error', err => reject(err));
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
    expect(data).to.be.eq('');
  });

  it('should pass a string body to the stream with "utf-8" encoding by default', async function () {
    const body = 'requestBody';
    const req = createRequestMock({body});
    const chunks = [];
    const data = await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(Buffer.from(chunk)));
      req.on('error', err => reject(err));
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
    expect(data).to.be.eq(body);
  });

  it('should pass a string body to the stream with "ascii" encoding', async function () {
    const body = 'requestBody';
    const req = createRequestMock({body, encoding: 'ascii'});
    const chunks = [];
    const data = await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(Buffer.from(chunk)));
      req.on('error', err => reject(err));
      req.on('end', () => resolve(Buffer.concat(chunks).toString('ascii')));
    });
    expect(data).to.be.eq(body);
  });

  it('should pass a number from the "body" option to the stream as a string', async function () {
    const body = 10;
    const req = createRequestMock({body});
    const chunks = [];
    const data = await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(Buffer.from(chunk)));
      req.on('error', err => reject(err));
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
    expect(data).to.be.eq('10');
  });

  it('should pass a boolean from the "body" option to the stream as a string', async function () {
    const body = true;
    const req = createRequestMock({body});
    const chunks = [];
    const data = await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(Buffer.from(chunk)));
      req.on('error', err => reject(err));
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
    expect(data).to.be.eq('true');
  });

  it('should pass an array from the "body" option to the stream as JSON', async function () {
    const body = [1, 2];
    const req = createRequestMock({body});
    const chunks = [];
    const data = await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(Buffer.from(chunk)));
      req.on('error', err => reject(err));
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
    expect(data).to.be.eq(JSON.stringify(body));
  });

  it('should pass an object from the "body" option to the stream as JSON', async function () {
    const body = {foo: 'bar'};
    const req = createRequestMock({body});
    const chunks = [];
    const data = await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(Buffer.from(chunk)));
      req.on('error', err => reject(err));
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
    expect(data).to.be.eq(JSON.stringify(body));
  });

  it('should pass a Buffer from the "body" option to the stream', async function () {
    const body = Buffer.from('test');
    const req = createRequestMock({body});
    const chunks = [];
    const data = await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(Buffer.from(chunk)));
      req.on('error', err => reject(err));
      req.on('end', () => resolve(Buffer.concat(chunks)));
    });
    expect(data).to.be.eql(body);
  });

  it('should pass a value from the "url" option to the request url', function () {
    const req = createRequestMock({url: '/test'});
    expect(req.url).to.be.eq('/test');
  });

  it('should pass a value from the "path" option to the request url', function () {
    const req = createRequestMock({path: '/test'});
    expect(req.url).to.be.eq('/test');
  });

  it('should pass a string from the "query" option to the request url', async function () {
    const req1 = createRequestMock({query: 'p1=foo&p2=bar'});
    const req2 = createRequestMock({query: '?p1=foo&p2=bar'});
    expect(req1.url).to.be.eq('/?p1=foo&p2=bar');
    expect(req2.url).to.be.eq('/?p1=foo&p2=bar');
  });

  it('should pass an object from the "query" option to the request url', async function () {
    const req = createRequestMock({query: {foo: 'bar', baz: 'qux'}});
    expect(req.url).to.be.eq('/?foo=bar&baz=qux');
  });

  it('should combine the "path" and "query" options in the request url', function () {
    const req1 = createRequestMock({path: '/test', query: 'foo=bar'});
    const req2 = createRequestMock({path: '/test', query: '?foo=bar'});
    const req3 = createRequestMock({path: '/test', query: {foo: 'bar'}});
    expect(req1.url).to.be.eq('/test?foo=bar');
    expect(req2.url).to.be.eq('/test?foo=bar');
    expect(req3.url).to.be.eq('/test?foo=bar');
  });

  it('should set a value from the "method" option to the request method in upper case', async function () {
    const req1 = createRequestMock({method: 'get'});
    const req2 = createRequestMock({method: 'post'});
    expect(req1.method).to.be.eq('GET');
    expect(req2.method).to.be.eq('POST');
  });

  it('should not affect the property "url" when the option "host" is specified', async function () {
    const req = createRequestMock({host: 'myHost'});
    expect(req.url).to.be.eq('/');
    expect(req.headers['host']).to.be.eq('myHost');
  });

  it('should set the header "x-forwarded-proto" when the option "secure" is true', async function () {
    const req = createRequestMock({secure: true});
    expect(req.headers['x-forwarded-proto']).to.be.eq('https');
  });

  it('should serialize and set a value from the "cookies" option to the "cookie" header', function () {
    const req = createRequestMock({cookies: {p1: 'foo', p2: 'bar'}});
    expect(req.headers['cookie']).to.be.eq('p1=foo; p2=bar');
  });

  it('should merge the "cookie" header with the "cookies" option', function () {
    const req = createRequestMock({
      headers: {cookie: 'p1=foo; p2=bar'},
      cookies: {p2: 'baz', p3: 'qux'},
    });
    expect(req.headers['cookie']).to.be.eq('p1=foo; p2=baz; p3=qux');
  });

  it('should set the "content-type" header for a String body', function () {
    const req = createRequestMock({body: 'test'});
    expect(req.headers['content-type']).to.be.eq('text/plain');
  });

  it('should set the "content-type" header for a Buffer body', function () {
    const req = createRequestMock({body: Buffer.from('test')});
    expect(req.headers['content-type']).to.be.eq('application/octet-stream');
  });

  it('should set the "content-type" header for an Object body', function () {
    const req = createRequestMock({body: {foo: 'bar'}});
    expect(req.headers['content-type']).to.be.eq('application/json');
  });

  it('should set the "content-type" header for an Array body', function () {
    const req = createRequestMock({body: [1, 2]});
    expect(req.headers['content-type']).to.be.eq('application/json');
  });

  it('should set the "content-type" header for a Boolean body', function () {
    const req1 = createRequestMock({body: true});
    const req2 = createRequestMock({body: true});
    expect(req1.headers['content-type']).to.be.eq('application/json');
    expect(req2.headers['content-type']).to.be.eq('application/json');
  });

  it('should set the "content-type" header for a Number body', function () {
    const req = createRequestMock({body: 10});
    expect(req.headers['content-type']).to.be.eq('application/json');
  });

  it('should not override the "content-type" header from the provided options', function () {
    const req = createRequestMock({
      body: Buffer.from('test'),
      headers: {'content-type': 'media/type'},
    });
    expect(req.headers['content-type']).to.be.eq('media/type');
  });

  it('should calculate the "content-length" header automatically', function () {
    const body = 'test';
    const length = Buffer.byteLength(body);
    const req = createRequestMock({body});
    expect(req.headers['content-length']).to.be.eq(String(length));
  });

  it('should not override the "content-length" header from the provided options', function () {
    const req = createRequestMock({
      body: 'test',
      headers: {'content-length': '100'},
    });
    expect(req.headers['content-length']).to.be.eq('100');
  });

  it('should not calculate "content-length" automatically if "transfer-encoding" is provided', function () {
    const req = createRequestMock({
      body: 'test',
      headers: {'transfer-encoding': 'chunked'},
    });
    expect(req.headers['content-length']).to.be.undefined;
    expect(req.headers['transfer-encoding']).to.be.eq('chunked');
  });

  it('should convert header keys from the "headers" option to lower case', function () {
    const req = createRequestMock({headers: {Auth: 'secret'}});
    expect(req.headers['auth']).to.be.eq('secret');
  });

  it('should set default IP to socket properties', function () {
    const req = createRequestMock();
    expect(req.socket.remoteAddress).to.be.eq('127.0.0.1');
    expect(req.socket.localAddress).to.be.eq('127.0.0.1');
  });

  it('should set default IP to socket properties when a custom stream is provided', function () {
    const customStream = new Readable({
      read() {
        this.push(null);
      },
    });
    const request = createRequestMock({stream: customStream});
    expect(request.socket.remoteAddress).to.equal('127.0.0.1');
    expect(request.socket.localAddress).to.equal('127.0.0.1');
  });
});
