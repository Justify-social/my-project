import { WebSocketServer } from 'ws';

declare global {
  var WebSocketServerInstance: WebSocketServer | undefined;
}

export {};
