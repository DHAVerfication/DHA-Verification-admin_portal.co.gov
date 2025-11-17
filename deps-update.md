Added 'sharp' for SVG conversion in PDFs; will be installed in Render during deployment.

Commands to run locally:

```bash
cd /workspaces/Inshallah786
npm install sharp
```

If you prefer not to add 'sharp', PDF generation will fallback to drawing simple shapes if sharp is unavailable.