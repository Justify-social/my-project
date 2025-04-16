/**
 * This file is now located at src/lib/server/server.ts
 * This is a redirect file for backward compatibility
 *
 * Custom Next.js Server with WebSocket Support
 *
 * This file creates a custom server to enable WebSocket connections
 * for real-time component updates during development.
 */

// import { createServer } from 'http'; // Unused
// import { parse } from 'url'; // Unused
// import next from 'next'; // Unused

// Import actual implementation using specific path alias
import { setupServer } from '@/lib/server/server'; // Try specific path

// Initialize and start the server
setupServer();
