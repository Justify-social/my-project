# Vercel Deployment Guide

## Fixing FontAwesome Authentication Error

The build error you're encountering is related to FontAwesome Pro authentication when deploying to Vercel. The error occurs because Vercel doesn't have the necessary authentication token to download the private FontAwesome Pro packages.

### Solution: Set up Environment Variables in Vercel

Follow these steps to fix the issue:

1. **Go to your Vercel project dashboard**
   - Navigate to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project

2. **Add Environment Variable**
   - Click on "Settings" tab
   - Navigate to "Environment Variables" section
   - Add a new environment variable:
     - Name: `FONTAWESOME_NPM_AUTH_TOKEN`
     - Value: Your FontAwesome Pro token (get this from your FontAwesome account)
   - Ensure it's set for all environments (Production, Preview, Development)

3. **Deploy Again**
   - After adding the environment variable, trigger a new deployment
   - The build should now be able to access the FontAwesome Pro packages

### Verification

You can verify the build is using the correct token by checking the build logs in Vercel. Look for messages related to npm package installation and confirm there are no authentication errors when downloading FontAwesome packages.

## Additional Vercel Configuration Notes

This project uses the following configurations for Vercel:

- **Legacy Peer Dependencies**: The project is configured to use `--legacy-peer-deps` flag during installation to handle peer dependency conflicts
- **Build Command**: `npm run build`
- **Install Command**: `npm install --legacy-peer-deps --no-package-lock`

These settings are already configured in the `vercel.json` file at the root of the project.

## Troubleshooting

If you continue to experience issues after setting up the environment variable:

1. Verify the token value is correct
2. Check if the token has expired and needs to be refreshed
3. Ensure the token has the proper permissions to access the required packages
4. Try generating a new token from your FontAwesome account if necessary 