#!/bin/bash

echo "🚀 Starting DHA Back Office Server..."

# Force production mode
export NODE_ENV=production
export USE_PRODUCTION_APIS=true
export FORCE_REAL_APIS=true
export VERIFICATION_LEVEL=high
export REAL_TIME_VALIDATION=true

# IMPORTANT: Use port 5000 for Replit webview (don't use database port 5432)
export PORT=5000

# Start the server
node server/index.js
