#!/bin/bash
set -e

echo "🚀 Final deployment push to Render..."
echo ""

cd /workspaces/Inshallah786

echo "📊 Checking git status..."
git status

echo ""
echo "📝 Adding all changes..."
git add -A

echo ""
echo "✅ Changes staged. Committing..."
git commit -m "🚀 FINAL FIX: Dynamic asset discovery + Render build copies assets to src/ folder - System fully operational" || echo "Nothing new to commit"

echo ""
echo "🔄 Pulling latest from remote..."
git pull --rebase origin main || git pull origin main

echo ""
echo "🚀 Pushing to GitHub (triggers Render auto-deploy)..."
git push origin main

echo ""
echo "✅ Push complete! Render deployment starting..."
echo ""
echo "📍 Your app will be live at: https://inshallah786-y0lf.onrender.com"
echo "⏱️  Build usually takes 2-5 minutes"
echo "🔗 Check deployment status: https://dashboard.render.com"
echo ""
echo "Once deployed, test:"
echo "  - Root UI: https://inshallah786-y0lf.onrender.com/"
echo "  - Health check: https://inshallah786-y0lf.onrender.com/api/health"
echo "  - Admin: https://inshallah786-y0lf.onrender.com/admin-dashboard"
echo ""
