/**
 * Custom Next.js Server with WebSocket Support
 *
 * This file creates a custom server to enable WebSocket connections
 * for real-time component updates during development.
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

/**
 * Sets up and starts the Next.js server with WebSocket support
 */
export async function setupServer() {
  const dev = process.env.NODE_ENV !== 'production';
  const hostname = 'localhost';
  // Parse PORT environment variable to number
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Log the port being used
  console.log(`Custom server starting on port: ${port}`);

  // Initialize Next.js app with parsed port
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  // Prepare the app
  try {
    await app.prepare();
    console.log('Custom server prepared successfully');

    // Create HTTP server
    const httpServer = createServer((req, res) => {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url ?? '', true); // Add nullish coalescing for req.url
      handle(req, res, parsedUrl);
    });

    // Log server errors
    httpServer.on('error', (err: Error) => {
      // Add type to err
      console.error('HTTP Server Error:', err);
    });

    // Start server
    httpServer.listen(port, () => {
      // Callback takes no args on success
      console.log(`> Ready on http://${hostname}:${port}`);

      // --- TEMP: Comment out WebSocket initialization ---
      /*
      console.log('Attempting to initialize WebSocket server...');
      if (dev) { 
        import('@/lib/server/websocket-server') // Assume correct path if uncommenting
          .then(({ initializeWebSocketServer }) => {
            initializeWebSocketServer(httpServer);
            console.log('> WebSocket server initialized');
          })
          .catch(wsError => {
            console.error('Failed to initialize WebSocket server:', wsError);
          });
      }
      */
      // --- END TEMP ---
    });
  } catch (err) {
    console.error('Error occurred preparing the server:', err);
    // Exit if server prep fails?
    process.exit(1);
  }
}
