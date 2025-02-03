import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: '3wiyh7',
  e2e: {
    baseUrl: 'http://localhost:3000', // Set your base URL here
    specPattern: 'cypress/integration/**/*.js',
  },
})
