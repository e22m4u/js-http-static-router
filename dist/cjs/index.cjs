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
  HttpStaticRoute: () => HttpStaticRoute,
  HttpStaticRouter: () => HttpStaticRouter
});
module.exports = __toCommonJS(index_exports);

// src/http-static-route.js
var import_js_format = require("@e22m4u/js-format");
var _HttpStaticRoute = class _HttpStaticRoute {
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
   * @param {string} remotePath
   * @param {string} resourcePath
   * @param {RegExp} regexp
   * @param {boolean} isFile
   */
  constructor(remotePath, resourcePath, regexp, isFile) {
    if (typeof remotePath !== "string") {
      throw new import_js_format.InvalidArgumentError(
        'Parameter "remotePath" must be a String, but %v was given.',
        remotePath
      );
    }
    if (typeof resourcePath !== "string") {
      throw new import_js_format.InvalidArgumentError(
        'Parameter "resourcePath" must be a String, but %v was given.',
        resourcePath
      );
    }
    if (!(regexp instanceof RegExp)) {
      throw new import_js_format.InvalidArgumentError(
        'Parameter "regexp" must be an instance of RegExp, but %v was given.',
        regexp
      );
    }
    if (typeof isFile !== "boolean") {
      throw new import_js_format.InvalidArgumentError(
        'Parameter "isFile" must be a String, but %v was given.',
        isFile
      );
    }
    this.remotePath = remotePath;
    this.resourcePath = resourcePath;
    this.regexp = regexp;
    this.isFile = isFile;
  }
};
__name(_HttpStaticRoute, "HttpStaticRoute");
var HttpStaticRoute = _HttpStaticRoute;

// src/http-static-router.js
var import_path = __toESM(require("path"), 1);
var import_mime_types = __toESM(require("mime-types"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_http = require("http");
var import_js_format2 = require("@e22m4u/js-format");

// src/utils/escape-regexp.js
function escapeRegexp(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
__name(escapeRegexp, "escapeRegexp");

// src/utils/normalize-path.js
function normalizePath(value, noStartingSlash = false) {
  if (typeof value !== "string") {
    return "/";
  }
  const res = value.trim().replace(/\/+/g, "/").replace(/(^\/|\/$)/g, "");
  return noStartingSlash ? res : "/" + res;
}
__name(normalizePath, "normalizePath");

// src/http-static-router.js
var import_js_service = require("@e22m4u/js-service");
var _HttpStaticRouter = class _HttpStaticRouter extends import_js_service.DebuggableService {
  /**
   * Routes.
   *
   * @protected
   * @type {HttpStaticRoute[]}
   */
  _routes = [];
  /**
   * Options.
   *
   * @type {object}
   */
  _options = {};
  /**
   * Constructor.
   *
   * @param {object} options
   */
  constructor(options = {}) {
    if ((0, import_js_service.isServiceContainer)(options)) {
      options = {};
    }
    super(void 0, {
      noEnvironmentNamespace: true,
      namespace: "jsHttpStaticRouter"
    });
    if (!options || typeof options !== "object" || Array.isArray(options)) {
      throw new import_js_format2.InvalidArgumentError(
        'Parameter "options" must be an Object, but %v was given.',
        options
      );
    }
    if (options.trailingSlash !== void 0) {
      if (typeof options.trailingSlash !== "boolean") {
        throw new import_js_format2.InvalidArgumentError(
          'Option "trailingSlash" must be a Boolean, but %v was given.',
          options.trailingSlash
        );
      }
    }
    this._options = { ...options };
  }
  /**
   * Add route.
   *
   * @param {string} remotePath
   * @param {string} resourcePath
   * @returns {object}
   */
  addRoute(remotePath, resourcePath) {
    if (typeof remotePath !== "string") {
      throw new import_js_format2.InvalidArgumentError(
        "Remote path must be a String, but %v was given.",
        remotePath
      );
    }
    if (typeof resourcePath !== "string") {
      throw new import_js_format2.InvalidArgumentError(
        "Resource path must be a String, but %v was given.",
        resourcePath
      );
    }
    const debug = this.getDebuggerFor(this.addRoute);
    resourcePath = import_path.default.resolve(resourcePath);
    debug("Adding a new route.");
    debug("Resource path is %v.", resourcePath);
    debug("Remote path is %v.", remotePath);
    let stats;
    try {
      stats = import_fs.default.statSync(resourcePath);
    } catch (error) {
      console.error(error);
      throw new import_js_format2.InvalidArgumentError(
        "Resource path %v does not exist.",
        resourcePath
      );
    }
    const isFile = stats.isFile();
    debug("Resource type is %s.", isFile ? "File" : "Folder");
    const normalizedRemotePath = normalizePath(remotePath);
    const escapedRemotePath = escapeRegexp(normalizedRemotePath);
    const regexp = isFile ? new RegExp(`^${escapedRemotePath}/*$`) : new RegExp(`^${escapedRemotePath}(?:$|\\/)`);
    const route = new HttpStaticRoute(remotePath, resourcePath, regexp, isFile);
    this._routes.push(route);
    this._routes.sort((a, b) => b.remotePath.length - a.remotePath.length);
    return this;
  }
  /**
   * Match route.
   *
   * @param {IncomingMessage} req
   * @returns {object|undefined}
   */
  matchRoute(req) {
    if (!(req instanceof import_http.IncomingMessage)) {
      throw new import_js_format2.InvalidArgumentError(
        'Parameter "req" must be an instance of IncomingMessage, but %v was given.',
        req
      );
    }
    const debug = this.getDebuggerFor(this.matchRoute);
    debug("Matching routes with incoming request.");
    const url = (req.url || "/").replace(/\?.*$/, "");
    debug("Incoming request is %s %v.", req.method, url);
    if (req.method !== "GET" && req.method !== "HEAD") {
      debug("Method not allowed.");
      return;
    }
    debug("Walking through %v routes.", this._routes.length);
    const route = this._routes.find((route2) => {
      const res = route2.regexp.test(url);
      const phrase = res ? "matched" : "not matched";
      debug("Resource %v %s.", route2.resourcePath, phrase);
      return res;
    });
    route ? debug("Resource %v matched.", route.resourcePath) : debug("No route matched.");
    return route;
  }
  /**
   * Send file by route.
   *
   * @param {HttpStaticRoute} route
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  sendFileByRoute(route, req, res) {
    if (!(route instanceof HttpStaticRoute)) {
      throw new import_js_format2.InvalidArgumentError(
        'Parameter "route" must be an instance of HttpStaticRoute, but %v was given.',
        route
      );
    }
    if (!(req instanceof import_http.IncomingMessage)) {
      throw new import_js_format2.InvalidArgumentError(
        'Parameter "req" must be an instance of IncomingMessage, but %v was given.',
        req
      );
    }
    if (!(res instanceof import_http.ServerResponse)) {
      throw new import_js_format2.InvalidArgumentError(
        'Parameter "res" must be an instance of ServerResponse, but %v was given.',
        res
      );
    }
    const reqUrl = req.url || "/";
    const reqPath = reqUrl.replace(/\?.*$/, "");
    if (!this._options.trailingSlash && reqPath !== "/" && /\/$/.test(reqPath)) {
      const searchMatch = reqUrl.match(/\?.*$/);
      const search = searchMatch ? searchMatch[0] : "";
      const normalizedPath = reqPath.replace(/\/{2,}/g, "/").replace(/\/+$/, "");
      res.writeHead(302, { location: `${normalizedPath}${search}` });
      res.end();
      return;
    }
    if (/\/{2,}/.test(reqUrl)) {
      const normalizedUrl = reqUrl.replace(/\/{2,}/g, "/");
      res.writeHead(302, { location: normalizedUrl });
      res.end();
      return;
    }
    let targetPath = route.resourcePath;
    if (!route.isFile) {
      const relativePath = reqPath.replace(route.regexp, "");
      targetPath = import_path.default.join(route.resourcePath, relativePath);
    }
    targetPath = import_path.default.resolve(targetPath);
    const resourceRoot = import_path.default.resolve(route.resourcePath);
    if (!targetPath.startsWith(resourceRoot)) {
      res.writeHead(403, { "content-type": "text/plain" });
      res.end("403 Forbidden");
      return;
    }
    import_fs.default.stat(targetPath, (statsError, stats) => {
      if (statsError) {
        return this._handleFsError(statsError, res);
      }
      if (stats.isDirectory()) {
        if (this._options.trailingSlash) {
          if (/[^/]$/.test(reqPath)) {
            const searchMatch = reqUrl.match(/\?.*$/);
            const search = searchMatch ? searchMatch[0] : "";
            const normalizedPath = reqPath.replace(/\/{2,}/g, "/");
            res.writeHead(302, { location: `${normalizedPath}/${search}` });
            res.end();
            return;
          }
        }
        targetPath = import_path.default.join(targetPath, "index.html");
      } else {
        if (reqPath !== "/" && /\/$/.test(reqPath)) {
          const searchMatch = reqUrl.match(/\?.*$/);
          const search = searchMatch ? searchMatch[0] : "";
          const normalizedPath = reqPath.replace(/\/{2,}/g, "/").replace(/\/+$/, "");
          res.writeHead(302, { location: `${normalizedPath}${search}` });
          res.end();
          return;
        }
      }
      const extname = import_path.default.extname(targetPath);
      const contentType = import_mime_types.default.contentType(extname) || "application/octet-stream";
      const fileStream = (0, import_fs.createReadStream)(targetPath);
      fileStream.on("error", (error) => {
        this._handleFsError(error, res);
      });
      fileStream.on("open", () => {
        res.writeHead(200, { "content-type": contentType });
        if (req.method === "HEAD") {
          res.end();
          return;
        }
        fileStream.pipe(res);
      });
      req.on("close", () => {
        fileStream.destroy();
      });
    });
  }
  /**
   * Handle filesystem error.
   *
   * @param {object} error
   * @param {object} res
   * @returns {undefined}
   */
  _handleFsError(error, res) {
    if (res.headersSent) {
      return;
    }
    if ("code" in error && error.code === "ENOENT") {
      res.writeHead(404, { "content-type": "text/plain" });
      res.write("404 Not Found");
      res.end();
    } else {
      res.writeHead(500, { "content-type": "text/plain" });
      res.write("500 Internal Server Error");
      res.end();
    }
  }
};
__name(_HttpStaticRouter, "HttpStaticRouter");
var HttpStaticRouter = _HttpStaticRouter;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HttpStaticRoute,
  HttpStaticRouter
});
