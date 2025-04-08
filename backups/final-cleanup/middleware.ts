// This file is a wrapper that imports and exports the middleware from config/middleware
// We're keeping this file to avoid breaking imports, but all middleware logic is now in config/middleware

import middleware, { config } from '../config/middleware/middleware';

export default middleware;
export { config }; 