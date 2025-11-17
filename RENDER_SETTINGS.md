# 🚀 Render Deployment Settings

## ✅ Complete Configuration for Render.com

### 1. **Service Type Settings**
```
Environment: Node
Region: Choose closest to South Africa (Frankfurt or Singapore recommended)
Branch: main
Instance Type: Standard ($7/month) or Starter (Free)
```

### 2. **Build & Deploy Commands**
```bash
Build Command: npm install && mkdir -p /opt/render/project/attached_assets && cp -r attached_assets/* /opt/render/project/attached_assets/ 2>/dev/null || true

Start Command: npm start

Root Directory: (leave blank or use root)
```

### 3. **Environment Variables** (Add in Render Dashboard)
Click "Environment" tab and add these:

```
NODE_ENV = production
PORT = 3000
DOCUMENT_SIGNING_KEY = dha-signing-key-2025
DOCUMENT_ENCRYPTION_KEY = dha-encryption-key-2025
JWT_SECRET = dha-jwt-secret-2025
SESSION_SECRET = dha-session-secret-2025
DHA_NPR_API_KEY = npr-api-key-production
DHA_DMS_API_KEY = dms-api-key-production
DHA_VISA_API_KEY = visa-api-key-production
DHA_MCS_API_KEY = mcs-api-key-production
DHA_ABIS_API_KEY = abis-api-key-production
HANIS_API_KEY = hanis-api-key-production
```

### 4. **Health Check Settings**
```
Health Check Path: /api/health
```

### 5. **Auto-Deploy Settings**
```
✅ Auto-Deploy: Yes (enabled)
```

### 6. **Additional Settings**

#### Docker Settings (if using Docker)
- **Dockerfile Path**: `./Dockerfile`
- **Docker Context**: `.`

#### Advanced Settings
- **Pre-Deploy Command**: (leave empty)
- **Post-Deploy Command**: (leave empty)

---

## 🔧 Step-by-Step Deployment on Render

### Step 1: Create New Web Service
1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository

### Step 2: Configure Service
1. **Name**: `dha-back-office`
2. **Environment**: `Node`
3. **Region**: Frankfurt or Singapore
4. **Branch**: `main`
5. **Build Command**: 
   ```bash
   npm install && mkdir -p /opt/render/project/attached_assets && cp -r attached_assets/* /opt/render/project/attached_assets/ 2>/dev/null || true
   ```
6. **Start Command**: `npm start`

### Step 3: Add Environment Variables
Click "Environment" and add all variables from section 3 above.

### Step 4: Configure Advanced Settings
1. **Health Check Path**: `/api/health`
2. **Auto-Deploy**: ✅ Enabled

### Step 5: Deploy
Click **"Create Web Service"**

---

## 🎯 Verification After Deployment

### 1. Check Health Endpoint
```bash
curl https://your-app.onrender.com/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "operational",
  "service": "DHA Back Office - Production Live",
  "environment": "PRODUCTION",
  "permits": 13
}
```

### 2. Check Home Page
Open browser: `https://your-app.onrender.com/`

Should see the DHA Back Office interface.

### 3. Check System Status
```bash
curl https://your-app.onrender.com/api/system-status
```

---

## 🔒 Important Notes

1. **First Deploy**: Takes 5-10 minutes
2. **Subsequent Deploys**: 2-5 minutes
3. **Free Tier**: Service spins down after 15 min inactivity (first request takes ~30s)
4. **Paid Tier**: Always on, no spin-down

---

## 🛠️ Troubleshooting

### "Cannot GET /" Error
**Cause**: `attached_assets` folder not copied correctly

**Fix**: Ensure build command includes:
```bash
mkdir -p /opt/render/project/attached_assets && cp -r attached_assets/* /opt/render/project/attached_assets/
```

### Environment Variables Not Working
1. Go to Render Dashboard
2. Click your service → "Environment"
3. Verify all variables are set
4. Click "Save Changes"
5. Trigger manual deploy

### Build Fails
1. Check build logs in Render dashboard
2. Ensure `package.json` has all dependencies
3. Verify Node version: >=20.0.0

### Health Check Fails
1. Ensure `/api/health` endpoint is accessible
2. Check logs for errors
3. Verify `PORT` environment variable is set to `3000`

---

## 📊 Monitoring

### View Logs
1. Go to Render Dashboard
2. Click your service
3. Click "Logs" tab
4. Monitor real-time logs

### Metrics
- **Events**: Build/deploy history
- **Metrics**: CPU, Memory, Bandwidth usage

---

## 🎉 Success Indicators

✅ Build completes successfully  
✅ Health check returns `200 OK`  
✅ Homepage loads without errors  
✅ API endpoints respond correctly  
✅ Environment variables are set  
✅ Auto-deploy is enabled  

---

## 📞 Quick Commands

### Trigger Manual Deploy
```bash
# From Render dashboard
Click "Manual Deploy" → "Deploy latest commit"
```

### View Live Logs
```bash
# From Render dashboard
Logs tab → Enable "Auto-scroll"
```

### Restart Service
```bash
# From Render dashboard
Settings → Restart Service
```

---

## 🌐 Your Deployment URL
After deployment, your app will be available at:
```
https://dha-back-office.onrender.com
```
(or your custom domain if configured)
