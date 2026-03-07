import {ServerResponse} from 'http';

/**
 * Server response mock.
 */
export type ServerResponseMock = ServerResponse & {
  statusCode: number;
  _headersSent: boolean;
  _headers: {[name: string]: string | undefined};
  setEncoding(encoding: string): ServerResponseMock;
  getEncoding(): string | undefined;
  getBody(): Promise<string>;
};

/**
 * Create response mock.
 */
export declare function createResponseMock(): ServerResponseMock;
