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
export function setupServer() {
  // Initialize Next.js app
  const dev = process.env.NODE_ENV !== 'production';
  const hostname = 'localhost';
  const port = process.env.PORT || 3000;
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();
  
  // Prepare the app
  app.prepare().then(() => {
    // Create HTTP server
    const server = createServer(async (req, res) => {
      try {
        // Parse URL
        const parsedUrl = parse(req.url, true);
        
        // Let Next.js handle the request
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });
    
    // Start server
    server.listen(port, (err) => {
      if (err) throw err;
      
      console.log(`> Ready on http://${hostname}:${port}`);
      
      // Initialize WebSocket server
      if (dev) {
        try {
          // Dynamic import to avoid issues in production
          import('../../src/app/(admin)/debug-tools/ui-components/api/websocket-server.js')
            .then(({ initWebSocketServer }) => {
              initWebSocketServer(server);
              console.log('> WebSocket server initialized');
            })
            .catch(err => {
              console.error('Failed to initialize WebSocket server:', err);
            });
        } catch (error) {
          console.error('Error importing WebSocket server:', error);
        }
      }
    });
  });
} 