#!/bin/bash
set -e

echo "📦 Installing dependencies..."
npm install

echo "✅ Dependencies installed"
echo ""
echo "📝 Commit details:"
echo "- Added /api/applicants router for document management"
echo "- Created all-applicants.html page with 13 applicants display"
echo "- Added QR code generation for each applicant"
echo "- Added PDF download per applicant"
echo "- Added bulk ZIP download for all documents"
echo "- Added jszip dependency"
echo "- Updated index inline HTML with All Applicants link"
echo ""
echo "🚀 Pushing to GitHub..."
git add -A
git commit -m "✨ Add complete applicant management with PDFs, QR codes, and document downloads" || echo "No changes to commit"
git push origin main

echo "✅ Push complete - Render redeployment triggered!"
echo ""
echo "🔍 Features added:"
echo "✓ GET /api/applicants - List all 13 applicants"
echo "✓ GET /api/applicants/:id - Get single applicant details"
echo "✓ GET /api/applicants/:id/pdf - Download applicant PDF with coat of arms"
echo "✓ GET /api/applicants/:id/qr - Generate verification QR code"
echo "✓ POST /api/applicants/download-all - Download all documents as ZIP"
echo "✓ /all-applicants - New page displaying all 13 applicants with QR codes"
echo ""
echo "📍 Access via: https://inshallah786-y0lf.onrender.com/all-applicants"
