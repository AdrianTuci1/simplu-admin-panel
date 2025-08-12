#!/bin/bash

# Production Build Script for Simplu Admin Panel
echo "🚀 Starting production build..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run linting
echo "🔍 Running linting..."
npm run lint

# Build for production
echo "🏗️ Building for production..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output: dist/"
    echo "📊 Build size:"
    du -sh dist/
    
    # List build files
    echo "📋 Build contents:"
    ls -la dist/
    
    echo "🎉 Production build ready for deployment!"
else
    echo "❌ Build failed!"
    exit 1
fi 