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
  HttpStaticRouter: () => HttpStaticRouter
});
module.exports = __toCommonJS(index_exports);

// src/http-static-router.js
var import_path = __toESM(require("path"), 1);
var import_mime_types = __toESM(require("mime-types"), 1);
var import_fs = __toESM(require("fs"), 1);

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
var import_js_format = require("@e22m4u/js-format");
var _HttpStaticRouter = class _HttpStaticRouter extends import_js_service.DebuggableService {
  /**
   * Routes.
   *
   * @protected
   */
  _routes = [];
  /**
   * Constructor.
   *
   * @param {import('@e22m4u/js-service').ServiceContainer} container
   */
  constructor(container) {
    super(container, {
      noEnvironmentNamespace: true,
      namespace: "jsHttpStaticRouter"
    });
  }
  /**
   * Add route.
   *
   * @param {string} remotePath
   * @param {string} resourcePath
   * @returns {object}
   */
  addRoute(remotePath, resourcePath) {
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
      throw new import_js_format.InvalidArgumentError(
        "Static resource path does not exist %v.",
        resourcePath
      );
    }
    const isFile = stats.isFile();
    debug("Resource type is %s.", isFile ? "File" : "Folder");
    const normalizedRemotePath = normalizePath(remotePath);
    const escapedRemotePath = escapeRegexp(normalizedRemotePath);
    const regexp = isFile ? new RegExp(`^${escapedRemotePath}$`) : new RegExp(`^${escapedRemotePath}(?:$|\\/)`);
    const route = { remotePath, resourcePath, regexp, isFile };
    this._routes.push(route);
    this._routes.sort((a, b) => b.remotePath.length - a.remotePath.length);
    return this;
  }
  /**
   * Match route.
   *
   * @param {import('http').IncomingMessage} req
   * @returns {object|undefined}
   */
  matchRoute(req) {
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
   * @param {object} route
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  sendFileByRoute(route, req, res) {
    const reqUrl = req.url || "/";
    const reqPath = reqUrl.replace(/\?.*$/, "");
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
        return _handleFsError(statsError, res);
      }
      if (stats.isDirectory()) {
        if (/[^/]$/.test(reqPath)) {
          const searchMatch = reqUrl.match(/\?.*$/);
          const search = searchMatch ? searchMatch[0] : "";
          const normalizedPath = reqUrl.replace(/\/{2,}/g, "/");
          res.writeHead(302, { location: `${normalizedPath}/${search}` });
          res.end();
          return;
        }
        if (/\/{2,}/.test(reqUrl)) {
          const normalizedUrl = reqUrl.replace(/\/{2,}/g, "/");
          res.writeHead(302, { location: normalizedUrl });
          res.end();
          return;
        }
        targetPath = import_path.default.join(targetPath, "index.html");
      }
      const extname = import_path.default.extname(targetPath);
      const contentType = import_mime_types.default.contentType(extname) || "application/octet-stream";
      const fileStream = (0, import_fs.createReadStream)(targetPath);
      fileStream.on("error", (error) => {
        _handleFsError(error, res);
      });
      fileStream.on("open", () => {
        res.writeHead(200, { "content-type": contentType });
        if (req.method === "HEAD") {
          res.end();
          return;
        }
        fileStream.pipe(res);
      });
    });
  }
};
__name(_HttpStaticRouter, "HttpStaticRouter");
var HttpStaticRouter = _HttpStaticRouter;
function _handleFsError(error, res) {
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
__name(_handleFsError, "_handleFsError");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HttpStaticRouter
});
