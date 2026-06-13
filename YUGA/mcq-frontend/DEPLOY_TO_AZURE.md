# Deploy Frontend to Azure - Next Steps

## ✅ What's Done

- ✅ Backend deployed to Azure
- ✅ Frontend built successfully (`dist/` folder ready)
- ✅ Environment variables configured

## 🚀 Next Steps: Deploy Frontend

### Option 1: Azure Static Web Apps (Recommended)

1. **Go to Azure Portal**

   - https://portal.azure.com
   - Click "Create a resource"
   - Search for "Static Web App"
   - Click "Create"

2. **Fill in Details:**

   - **Subscription:** Your subscription
   - **Resource Group:** Create new or use existing
   - **Name:** `yuga-frontend` (or your choice)
   - **Plan type:** Free (or Standard for custom domain)
   - **Region:** Choose closest to you
   - **Deployment source:**
     - Option A: GitHub (connect your repo)
     - Option B: Other (for manual deployment)

3. **Build Settings (if using GitHub):**

   - App location: `mcq-frontend`
   - Output location: `dist`
   - API location: (leave empty)

4. **Create** → Wait for deployment

5. **Get Your URL:**
   - After creation, go to Overview
   - Your frontend will be at: `https://<app-name>.azurestaticapps.net`

### Option 2: Manual ZIP Deploy

1. **Zip the dist folder:**

   ```powershell
   cd mcq-frontend
   Compress-Archive -Path dist\* -DestinationPath frontend-dist.zip
   ```

2. **Go to Azure Portal:**

   - Create Static Web App (same as Option 1)
   - Or use existing App Service

3. **Deploy:**
   - Go to Deployment Center
   - Choose "Local Git" or "ZIP Deploy"
   - Upload `frontend-dist.zip`

### Option 3: GitHub Actions (Automatic)

If you have GitHub Actions set up:

1. **Push to GitHub:**

   ```bash
   git add .
   git commit -m "Build frontend for production"
   git push
   ```

2. **GitHub Actions will:**
   - Build automatically
   - Deploy to Azure
   - Use `.env.production` for environment variables

## ✅ Verify Deployment

After deployment:

1. **Open your frontend URL** (e.g., `https://yuga-frontend.azurestaticapps.net`)

2. **Test Login:**

   - Open Developer Tools (F12) → Network tab
   - Try to login
   - Check API request URL:
     - Should be: `https://yuga-backend-eahae9gde8hqf9g7.canadacentral-01.azurewebsites.net/api/auth/login`
     - ✅ NOT: `http://localhost:5000/api/auth/login`

3. **If API calls fail:**
   - Check browser console for errors
   - Verify `.env.production` has correct backend URL
   - Rebuild: `npm run build` (if needed)

## 📋 Quick Checklist

- [ ] Frontend built (`dist/` folder exists)
- [ ] `.env.production` has Azure backend URL
- [ ] Deploy `dist/` folder to Azure
- [ ] Test login functionality
- [ ] Verify API calls go to Azure backend

## 🎯 Recommended: Use Azure Static Web Apps

**Why?**

- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Fast global CDN
- ✅ Easy GitHub integration
- ✅ Perfect for React apps

## 📞 Need Help?

If deployment fails:

1. Check Azure deployment logs
2. Verify `dist/` folder structure
3. Ensure `index.html` is in `dist/` root
4. Check CORS settings on backend
