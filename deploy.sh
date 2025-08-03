#!/bin/bash

# Deployment script for Hostinger server
echo "Building application for production..."

# Install dependencies
npm install

# Build the application
npm run build

echo "Build complete! Your files are ready in the 'dist' folder."
echo "Upload the contents of the 'dist' folder to your Hostinger public_html directory."
echo ""
echo "Make sure to:"
echo "1. Upload all files from 'dist' folder to your domain's public_html"
echo "2. Ensure .htaccess file is uploaded for proper routing"
echo "3. Your Supabase project should remain accessible from your domain"
echo ""
echo "Your website will be live once uploaded!"