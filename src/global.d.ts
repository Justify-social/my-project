import { WebSocketServer } from 'ws';

declare global {
  // eslint-disable-next-line no-var
  var WebSocketServerInstance: WebSocketServer | undefined;
}

export {};
