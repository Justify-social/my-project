/**
 * This file is now located at src/lib/server/server.ts
 * This is a redirect file for backward compatibility
 * 
 * Custom Next.js Server with WebSocket Support
 * 
 * This file creates a custom server to enable WebSocket connections
 * for real-time component updates during development.
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

// Import actual implementation
import { setupServer } from './src/lib/server/server';

// Initialize and start the server
setupServer(); 