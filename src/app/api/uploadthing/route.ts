import { createRouteHandler } from "uploadthing/next"
import { ourFileRouter } from "./core"

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
}) 

// Add this temporarily to check data
console.log('Form Values:', values);
console.log('Campaign ID:', campaignId); 