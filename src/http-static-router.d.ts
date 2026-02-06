import {ServerResponse} from 'node:http';
import {IncomingMessage} from 'node:http';
import {DebuggableService, ServiceContainer} from '@e22m4u/js-service';

/**
 * Static file route.
 */
export type HttpStaticRoute = {
  remotePath: string;
  resourcePath: string;
  regexp: RegExp;
  isFile: boolean;
};

/**
 * Http static router.
 */
export class HttpStaticRouter extends DebuggableService {
  /**
   * Constructor.
   * 
   * @param container 
   */
  constructor(container?: ServiceContainer);

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
