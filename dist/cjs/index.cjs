"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  HttpStaticRouter: () => HttpStaticRouter,
  StaticRoute: () => StaticRoute
});
module.exports = __toCommonJS(index_exports);

// src/static-route.js
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);

// src/utils/escape-regexp.js
function escapeRegexp(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
__name(escapeRegexp, "escapeRegexp");

// src/static-route.js
var import_js_format = require("@e22m4u/js-format");
var StaticRoute = class {
  static {
    __name(this, "StaticRoute");
  }
  /**
   * Remote path.
   *
   * @type {string}
   */
  remotePath;
  /**
   * Resource path.
   *
   * @type {string}
   */
  resourcePath;
  /**
   * RegExp.
   *
   * @type {RegExp}
   */
  regexp;
  /**
   * Is file.
   *
   * @type {boolean}
   */
  isFile;
  /**
   * Constructor.
   *
   * @param {string} routeDef
   */
  constructor(routeDef) {
    if (!routeDef || typeof routeDef !== "object" || Array.isArray(routeDef)) {
      throw new import_js_format.InvalidArgumentError(
        'Parameter "routeDef" must be an Object, but %v was given.',
        routeDef
      );
    }
    if (typeof routeDef.remotePath !== "string") {
      throw new import_js_format.InvalidArgumentError(
        'Option "remotePath" must be a String, but %v was given.',
        routeDef.remotePath
      );
    }
    if (!routeDef.remotePath.startsWith("/")) {
      throw new import_js_format.InvalidArgumentError(
        'Option "remotePath" must start with "/", but %v was given.',
        routeDef.remotePath
      );
    }
    if (typeof routeDef.resourcePath !== "string") {
      throw new import_js_format.InvalidArgumentError(
        'Option "resourcePath" must be a String, but %v was given.',
        routeDef.resourcePath
      );
    }
    if (!import_path.default.isAbsolute(routeDef.resourcePath)) {
      throw new import_js_format.InvalidArgumentError(
        'Option "resourcePath" must be an absolute path, but %v was given.',
        routeDef.resourcePath
      );
    }
    let stats;
    try {
      stats = import_fs.default.statSync(routeDef.resourcePath);
    } catch (error) {
      console.error(error);
      throw new import_js_format.InvalidArgumentError(
        "Resource path %v does not exist.",
        routeDef.resourcePath
      );
    }
    const isFile = stats.isFile();
    const escapedRemotePath = escapeRegexp(routeDef.remotePath);
    let regexp;
    if (isFile) {
      regexp = new RegExp(`^${escapedRemotePath}$`);
    } else if (escapedRemotePath === "/") {
      regexp = new RegExp(`^(?:$|\\/)`);
    } else {
      regexp = new RegExp(`^${escapedRemotePath}(?:$|\\/)`);
    }
    this.remotePath = routeDef.remotePath;
    this.resourcePath = routeDef.resourcePath;
    this.regexp = regexp;
    this.isFile = isFile;
  }
};

// src/http-static-router.js
var import_path2 = __toESM(require("path"), 1);
var import_mime_types = __toESM(require("mime-types"), 1);
var import_fs2 = __toESM(require("fs"), 1);

// src/utils/create-error.js
var import_js_format2 = require("@e22m4u/js-format");

// src/utils/fetch-request-body.js
var import_http_errors = __toESM(require("http-errors"), 1);
var import_js_format4 = require("@e22m4u/js-format");

// src/utils/parse-content-type.js
var import_js_format3 = require("@e22m4u/js-format");

// src/utils/create-request-mock.js
var import_js_format7 = require("@e22m4u/js-format");

// src/utils/parse-cookie-string.js
var import_js_format5 = require("@e22m4u/js-format");

// src/utils/create-cookie-string.js
var import_js_format6 = require("@e22m4u/js-format");

// src/utils/get-pathname-from-url.js
var import_js_format8 = require("@e22m4u/js-format");
var HOST_RE = /^https?:\/\/[^/]+/;
var QUERY_STRING_RE = /\?.*$/;
function getPathnameFromUrl(url) {
  if (typeof url !== "string") {
    throw new import_js_format8.InvalidArgumentError(
      'Parameter "url" must be a String, but %v was given.',
      url
    );
  }
  return url.replace(HOST_RE, "").replace(QUERY_STRING_RE, "");
}
__name(getPathnameFromUrl, "getPathnameFromUrl");

// src/http-static-router.js
var import_js_format9 = require("@e22m4u/js-format");
var import_js_service = require("@e22m4u/js-service");
var HttpStaticRouter = class extends import_js_service.DebuggableService {
  static {
    __name(this, "HttpStaticRouter");
  }
  /**
   * Routes.
   *
   * @protected
   * @type {StaticRoute[]}
   */
  _routes = [];
  /**
   * Options.
   *
   * @type {import('./http-static-router.js').HttpStaticRouterOptions}
   * @protected
   */
  _options = {};
  /**
   * Constructor.
   *
   * @param {import('@e22m4u/js-service').ServiceContainer|import('./http-static-router.js').HttpStaticRouterOptions} containerOrOptions
   * @param {import('./http-static-router.js').HttpStaticRouterOptions} options
   */
  constructor(containerOrOptions, options) {
    const debugOptions = {
      noGlobalNamespace: true,
      namespace: "jsHttpStaticRouter"
    };
    if ((0, import_js_service.isServiceContainer)(containerOrOptions)) {
      super(containerOrOptions, debugOptions);
    } else if (containerOrOptions !== void 0) {
      if (!containerOrOptions || typeof containerOrOptions !== "object" || Array.isArray(containerOrOptions)) {
        throw new import_js_format9.InvalidArgumentError(
          "First parameter must be an Object or an instance of ServiceContainer, but %v was given.",
          containerOrOptions
        );
      }
      super(debugOptions);
      if (options === void 0) {
        options = containerOrOptions;
      }
    } else {
      super(debugOptions);
    }
    if (options !== void 0) {
      if (!options || typeof options !== "object" || Array.isArray(options)) {
        throw new import_js_format9.InvalidArgumentError(
          'Parameter "options" must be an Object, but %v was given.',
          options
        );
      }
      if (options.baseDir !== void 0) {
        if (typeof options.baseDir !== "string") {
          throw new import_js_format9.InvalidArgumentError(
            'Option "baseDir" must be a String, but %v was given.',
            options.baseDir
          );
        }
        if (!import_path2.default.isAbsolute(options.baseDir)) {
          throw new import_js_format9.InvalidArgumentError(
            'Option "baseDir" must be an absolute path, but %v was given.',
            options.baseDir
          );
        }
      }
      this._options = { ...options };
    }
    Object.freeze(this._options);
  }
  /**
   * Define route.
   *
   * @param {import('./static-route.js').StaticRouteDefinition} routeDef
   * @returns {import('./static-route.js').StaticRoute}
   */
  defineRoute(routeDef) {
    if (!routeDef || typeof routeDef !== "object" || Array.isArray(routeDef)) {
      throw new import_js_format9.InvalidArgumentError(
        'Parameter "routeDef" must be an Object, but %v was given.',
        routeDef
      );
    }
    if (typeof routeDef.resourcePath !== "string") {
      throw new import_js_format9.InvalidArgumentError(
        'Option "resourcePath" must be a String, but %v was given.',
        routeDef.resourcePath
      );
    }
    if (this._options.baseDir !== void 0 && !import_path2.default.isAbsolute(routeDef.resourcePath)) {
      routeDef = { ...routeDef };
      routeDef.resourcePath = import_path2.default.join(
        this._options.baseDir,
        routeDef.resourcePath
      );
    }
    if (this._options.baseDir === void 0 && !import_path2.default.isAbsolute(routeDef.resourcePath)) {
      throw new import_js_format9.InvalidArgumentError(
        'Option "resourcePath" must be an absolute path when the router option "basePath" is not specified, but %v was given.',
        routeDef.resourcePath
      );
    }
    const debug = this.getDebuggerFor(this.defineRoute);
    const route = new StaticRoute(routeDef);
    debug("Adding a new route.");
    debug("Remote path is %v.", route.remotePath);
    debug("Resource path is %v.", route.resourcePath);
    debug("Resource type is %s.", route.isFile ? "File" : "Folder");
    this._routes.push(route);
    this._routes.sort((a, b) => b.remotePath.length - a.remotePath.length);
    return route;
  }
  /**
   * Handle request.
   *
   * Метод возвращает Promise, который разрешается как:
   *   - false, если маршрут не совпал, файл не найден
   *     или метод запроса не поддерживается;
   *   - true, во всех остальных случаях;
   *
   * @param {import('http').IncomingMessage} request
   * @param {import('http').ServerResponse} response
   * @returns {Promise<boolean>}
   */
  async handleRequest(request, response) {
    const fileInfo = await this._findFileForRequest(request);
    if (fileInfo !== void 0) {
      await this._sendFile(request, response, fileInfo);
      return true;
    }
    return false;
  }
  /**
   * Find file for request.
   *
   * @param {import('http').IncomingMessage} request
   * @returns {Promise<FileInfo|undefined>|undefined}
   */
  async _findFileForRequest(request) {
    const debug = this.getDebuggerFor(this._findFileForRequest);
    debug("File finding for an incoming request.");
    debug("Incoming request %s %v.", request.method, request.url);
    let requestPath;
    try {
      requestPath = decodeURIComponent(getPathnameFromUrl(request.url || ""));
    } catch {
      debug("Invalid URL encoding .");
      return;
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      debug("Method not allowed.");
      return;
    }
    if (requestPath.includes("//")) {
      debug("Request path contains duplicate slashes.");
      return;
    }
    if (requestPath.includes("\0")) {
      debug("Request path contains a null byte.");
      return;
    }
    if (!this._routes.length) {
      debug("No registered routes.");
      return;
    }
    debug("Walking through %v routes.", this._routes.length);
    for (const route of this._routes) {
      const isMatched = route.regexp.test(requestPath || "/");
      if (isMatched) {
        debug("Matched route %v.", route.remotePath);
        let targetPath = route.resourcePath;
        let extraPath = "";
        if (!route.isFile) {
          extraPath = requestPath.replace(route.regexp, "");
          targetPath = import_path2.default.join(route.resourcePath, extraPath);
        }
        targetPath = import_path2.default.resolve(targetPath);
        const resourceRoot = import_path2.default.resolve(route.resourcePath);
        if (targetPath !== resourceRoot && !targetPath.startsWith(resourceRoot + import_path2.default.sep)) {
          return;
        }
        const fileSize = await new Promise((resolve) => {
          import_fs2.default.stat(targetPath, (statsError, stats) => {
            if (statsError || stats.isDirectory()) {
              resolve(void 0);
              return;
            }
            resolve(stats.size);
            return;
          });
        });
        if (fileSize !== void 0) {
          if (extraPath && extraPath.endsWith("/")) {
            continue;
          }
          debug("Found file %v.", targetPath);
          return { path: targetPath, size: fileSize };
        }
      }
    }
    debug("File was not found.");
  }
  /**
   * Send file.
   *
   * @param {import('http').IncomingMessage} request
   * @param {import('http').ServerResponse} response
   * @param {FileInfo} fileInfo
   * @returns {Promise<void>}
   */
  async _sendFile(request, response, fileInfo) {
    let resolve;
    const promise = new Promise((res) => resolve = res);
    const debug = this.getDebuggerFor(this._sendFile);
    debug("File sending for an incoming request.");
    debug("Incoming request %s %v.", request.method, request.url);
    debug("File path %v.", fileInfo.path);
    debug("File size %v bytes.", fileInfo.size);
    const extname = import_path2.default.extname(fileInfo.path);
    const contentType = import_mime_types.default.contentType(extname) || "application/octet-stream";
    const fileStream = (0, import_fs2.createReadStream)(fileInfo.path);
    fileStream.on("error", (error) => {
      debug("Unable to open a file stream.");
      console.error(error);
      if (response.headersSent) {
        response.destroy();
        resolve();
        return;
      }
      response.statusCode = 500;
      response.setHeader("Content-Type", "text/plain; charset=utf-8");
      response.write("500 Internal Server Error");
      response.end();
      resolve();
    });
    fileStream.on("open", () => {
      response.statusCode = 200;
      response.setHeader("Content-Type", contentType);
      response.setHeader("Content-Length", fileInfo.size);
      if (request.method === "HEAD") {
        response.end();
        debug("Response has been sent without a body for the HEAD request.");
        fileStream.destroy();
        return;
      }
      fileStream.pipe(response);
    });
    request.on("close", () => {
      if (!response.writableFinished) {
        debug("Request closed prematurely by the client.");
        fileStream.destroy();
        resolve();
      }
    });
    response.on("finish", () => {
      debug("File has been sent successfully.");
      resolve();
    });
    return promise;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HttpStaticRouter,
  StaticRoute
});
