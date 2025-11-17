#!/bin/bash
cd /workspaces/Inshallah786
echo "📊 Git Status:"
git status

echo ""
echo "🔄 Pulling latest changes..."
git pull origin main

echo ""
echo "📤 Staging all changes..."
git add -A

echo ""
echo "📝 Committing..."
git commit -m "🇿🇦 Official DHA website complete - all 13 applicants verified with authentic documents and official styling"

echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Check Render for deployment (2-5 minutes)"
