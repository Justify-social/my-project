// test-discovery.ts

/**
 * This script tests connectivity from your Node server to the Auth0 discovery endpoint.
 * It uses the built-in global fetch (available in Node 18) along with an AbortController
 * to enforce a timeout. Run this file using ts-node:
 *
 *     npx ts-node test-discovery.ts
 *
 * If the request is successful, it will print the JSON response from Auth0.
 * If there is an error (such as a network error or timeout), it will print an error message.
 */

async function testDiscovery() {
    try {
      // Create an AbortController to allow timeout cancellation.
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 10000); // 10-second timeout
  
      // Send a GET request to the Auth0 discovery endpoint.
      const res = await fetch(
        'https://dev-8r7jiixso74f3ef1.us.auth0.com/.well-known/openid-configuration',
        { signal: controller.signal }
      );
  
      // Clear the timeout once the request completes.
      clearTimeout(timeout);
  
      // If the response is not OK, throw an error.
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      // Parse and log the JSON response.
      const json = await res.json();
      console.log("Discovery endpoint returned:", json);
    } catch (error) {
      console.error("Error fetching discovery endpoint:", error);
    }
  }
  
  testDiscovery();
  