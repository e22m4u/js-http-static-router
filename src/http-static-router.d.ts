import {ServerResponse} from 'node:http';
import {IncomingMessage} from 'node:http';
import {StaticRouteDefinition} from './static-route.js';
import {DebuggableService, ServiceContainer} from '@e22m4u/js-service';

/**
 * Http static router options.
 */
export type HttpStaticRouterOptions = {
  baseDir?: string;
};

/**
 * Http static router.
 */
export declare class HttpStaticRouter extends DebuggableService {
  /**
   * Constructor.
   *
   * @param container
   */
  constructor(container: ServiceContainer);

  /**
   * Constructor.
   *
   * @param options
   */
  constructor(options: HttpStaticRouterOptions);

  /**
   * Constructor.
   *
   * @param container
   * @param options
   */
  constructor(container: ServiceContainer, options: HttpStaticRouterOptions);

  /**
   * Define route.
   *
   * @param routeDef
   */
  defineRoute(routeDef: StaticRouteDefinition): this;

  /**
   * Handle request.
   *
   * @param request
   * @param response
   */
  handleRequest(
    request: IncomingMessage,
    response: ServerResponse,
  ): Promise<boolean>;
}
