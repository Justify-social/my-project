// test-auth.ts

// If you're using Node 18+, you may have a global fetch available.
// If not, uncomment the following line to import node-fetch (make sure to install it via npm):
// import fetch from 'node-fetch';

async function testLogin() {
    console.log("=== Testing Login Route ===");
    try {
      // Do not follow redirects so we can inspect the Location header.
      const response = await fetch("http://localhost:3000/api/auth/login", { redirect: "manual" });
      console.log("Login Route Status:", response.status);
      const location = response.headers.get("location");
      console.log("Login Route Redirect Location:", location);
    } catch (error) {
      console.error("Error testing login route:", error);
    }
  }
  
  async function testCallback() {
    console.log("=== Testing Callback Route ===");
    try {
      // Here we provide dummy query parameters.
      // (In a real scenario, these should be valid; here we expect an error so we can inspect it.)
      const response = await fetch("http://localhost:3000/api/auth/callback?code=testcode&state=teststate", { redirect: "manual" });
      console.log("Callback Route Status:", response.status);
      const text = await response.text();
      console.log("Callback Route Response Text:", text);
    } catch (error) {
      console.error("Error testing callback route:", error);
    }
  }
  
  async function runTests() {
    await testLogin();
    await testCallback();
  }
  
  runTests();
  