import {ServerResponse} from 'node:http';
import {IncomingMessage} from 'node:http';
import {HttpStaticRoute} from './http-static-route.js';
import {DebuggableService, ServiceContainer} from '@e22m4u/js-service';

/**
 * Http static router options.
 */
export type HttpStaticRouterOptions = {
  trailingSlash?: boolean;
}

/**
 * Http static router.
 */
export class HttpStaticRouter extends DebuggableService {
  /**
   * Constructor.
   * 
   * @param options
   */
  constructor(options?: HttpStaticRouterOptions);

  /**
   * Add route.
   *
   * @param remotePath
   * @param resourcePath
   */
  addRoute(remotePath: string, resourcePath: string): this;

  /**
   * Match route.
   *
   * @param req
   */
  matchRoute(req: IncomingMessage): HttpStaticRoute | undefined;

  /**
   * Send file by route.
   *
   * @param route
   * @param req
   * @param res
   */
  sendFileByRoute(
    route: HttpStaticRoute,
    req: IncomingMessage,
    res: ServerResponse,
  ): void;
}
