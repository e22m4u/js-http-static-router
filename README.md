## @e22m4u/js-http-static-router

![npm version](https://badge.fury.io/js/@e22m4u%2Fjs-http-static-router.svg)
![license](https://img.shields.io/badge/license-mit-blue.svg)

English | [Русский](./README.ru.md)

HTTP static file router for Node.js.

The module is useful for embedding documentation or administrative panels
directly into a server application, avoiding the deployment of additional
infrastructure.

- Integration into an existing *HTTP* server.
- Managing file system access via routes.
- Using streams to save RAM.

## Table of Contents

- [Installation](#installation)
- [Basic example](#basic-example)
- [Router](#router)
  - [Instantiation](#instantiation)
  - [Route registration](#route-registration)
  - [Request handling](#request-handling)
- [Tests](#tests)
- [License](#license)

## Installation

```bash
npm install @e22m4u/js-http-static-router
```

The module supports ESM and CommonJS standards.

*ESM*

```js
import {HttpStaticRouter} from '@e22m4u/js-http-static-router';
```

*CommonJS*

```js
const {HttpStaticRouter} = require('@e22m4u/js-http-static-router');
```

## Basic example

The example assumes the following project structure.

```txt
/static
  ├── index.html
  └── /assets
       └── rabbit.txt
/src
  └── server.js
```

Router instantiation, route definition, and server startup.

```js
// src/server.js
import path from 'path';
import http from 'http';
import {HttpStaticRouter} from '@e22m4u/js-http-static-router';

// instantiating the router
const staticRouter = new HttpStaticRouter({
  // when using the "baseDir" option, relative paths
  // in registered routes will be resolved relative to
  // the specified file system path
  baseDir: path.join(import.meta.dirname, '../static'),
});
// access to import.meta.dirname (current module directory)
// is available only for ESM starting from Node.js 20.11.0

// serving the "index.html" file
// as an index page
staticRouter.defineRoute({
  remotePath: '/',
  resourcePath: './index.html',
});

// serving the "assets" directory content
// for access relative to the root
// example: http://localhost:3000/rabbit.txt
staticRouter.defineRoute({
  remotePath: '/',
  resourcePath: './assets',
});

// creating an HTTP server and defining
// a listener for request handling
const server = new http.Server();
server.on('request', async (req, res) => {
  const fileSent = await staticRouter.handleRequest(req, res);
  // if the file was not sent,
  // 404 Not Found is returned
  if (!fileSent) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('404 Not Found');
    res.end();
  }
});

// starting the server
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
  console.log('Try to open:');
  console.log('http://localhost:3000');
  console.log('http://localhost:3000/rabbit.txt');
});
```

Node.js process startup.

```bash
node ./src/server.js
```

## Router

The `HttpStaticRouter` class is the main module component. It is responsible
for storing route definitions, matching incoming HTTP requests with file system
resources, and streaming data to the client.

### Instantiation

The router constructor accepts an options object that allows setting basic
operation parameters.

Signature:

```ts
type HttpStaticRouterOptions = {
  baseDir?: string;
};

constructor(options?: HttpStaticRouterOptions);
```

**Parameters**

- `baseDir: string` - absolute path to the base directory.  
  If the parameter is specified, all relative paths during route registration
  will be resolved relative to this directory.

**Example**

Instantiation with the specified base directory.

```js
import path from 'path';
import {HttpStaticRouter} from '@e22m4u/js-http-static-router';

// router creation with specifying the absolute path
// to the directory where static files are stored
const staticRouter = new HttpStaticRouter({
  baseDir: path.join(import.meta.dirname, '../public'),
});
```

*i. Access to the `import.meta.dirname` variable (current module directory)
is possible only when using the *ESM* standard, starting from Node.js 20.11.0.
For earlier versions or *CommonJS*, `__dirname` is used.*

### Route registration

The `defineRoute` method adds a new routing rule, linking a virtual path
(*URL*) with an actual file or directory on the server. When calling this
method, the router checks the physical existence of the specified resource
in the file system.

Signature:

```ts
type StaticRouteDefinition = {
  remotePath: string;
  resourcePath: string;
};

defineRoute(routeDef: StaticRouteDefinition): StaticRoute;
```

**Parameters**

- `remotePath: string`  
  URL prefix that an incoming request must start with
  (must start with a slash `/`).

- `resourcePath: string`  
  Path to an existing file or directory in the file system.

*i. If the `baseDir` option was not specified during router
[instantiation](#instantiation), the `resourcePath` parameter value must
be an absolute path.*

**Examples**

Specific file registration. A request to the specified path in the `remotePath`
parameter will return the associated file content. The router takes into account
the presence/absence of a trailing slash at the end of the path.

```js
// it is assumed that the router was created
// with the specified base directory ("baseDir" option)
staticRouter.defineRoute({
  remotePath: '/about',
  resourcePath: './pages/about.html',
});

// GET /about
// -> returns the ./pages/about.html content
```

Directory content serving. If the route points to a directory, an additional
part of the URL will be automatically appended to the file system path.

```js
// granting access to all files
// inside the "assets" directory
staticRouter.defineRoute({
  remotePath: '/public',
  resourcePath: './assets',
});

// GET /public/images/logo.png
// -> returns the ./assets/images/logo.png content
```

Route registration using an absolute path.

```js
import path from 'path';
import {HttpStaticRouter} from '@e22m4u/js-http-static-router';

// instantiation without parameters
const router = new HttpStaticRouter();

// since the "baseDir" option is not set, the router requires
// an absolute path for the "resourcePath" property,
// otherwise an InvalidArgumentError will be thrown
router.defineRoute({
  remotePath: '/robots.txt',
  resourcePath: path.join(import.meta.dirname, '../public/robots.txt'),
});
```

*i. The router performs a security check. If a client attempts to traverse
outside the directory using relative paths during a request (for example,
`GET /public/../../config.json`), the handler will interrupt the search and the
file will not be sent.*

### Request handling

The `handleRequest` method performs matching of an incoming HTTP request with
registered routes and sends the found file to the client. When reading a file,
the router uses streams, allowing safe delivery of large files without
overloading the server's RAM.

The router automatically determines the file *MIME-type* based on its
extension, sets the necessary headers, and correctly handles connection drops
from the client side, closing the file stream in a timely manner to prevent
memory leaks.

Signature:

```ts
handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<boolean>;
```

**Parameters**

- `request: IncomingMessage` - native Node.js incoming request stream;
- `response: ServerResponse` - native Node.js outgoing response stream;

**Return value**

The method returns a `Promise` that resolves to a boolean `false` if the route
does not match, the target file is physically missing, or the request method is
not supported. In all other cases, the value will be `true`, which allows
determining whether the router has taken responsibility for handling the
request.

**Example**

Method integration into a native HTTP server event handler. If `handleRequest`
returns `false`, the server takes responsibility for sending an error response
to the client.

```js
import http from 'http';
import {HttpStaticRouter} from '@e22m4u/js-http-static-router';

// instantiating the router
const staticRouter = new HttpStaticRouter();
// staticRouter.defineRoute(...)

const server = new http.Server();

server.on('request', async (req, res) => {
  // passing request and response objects to the router
  const fileSent = await staticRouter.handleRequest(req, res);

  // if the router returned false, the file was not sent
  if (!fileSent) {
    // manual sending of 404 Not Found status
    res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
    res.write('404 Not Found');
    res.end();
  }
});
```

The router handles exclusively requests with `GET` and `HEAD` methods. Upon
receiving a request with any other method, processing is interrupted and the
method returns `false`. In the case of a `HEAD` request, the router correctly
calculates the file size and sends the appropriate headers, skipping the
response body transmission.

## Tests

```bash
npm run test
```

## License

MIT