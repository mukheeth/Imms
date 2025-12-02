# Quick Start: Deployment Checklist

## ✅ Code Updates Completed

All code has been updated to use environment variables. You're ready to deploy!

## 📝 Manual Steps Required

### 1. Create Frontend Environment Files

Create these files manually (they're in .gitignore for security):

**File**: `imm/Enterprise Medical Management UI/.env.production`
```
VITE_API_BASE_URL=https://percert-backend.onrender.com
VITE_HOSPITAL_CASE_API=https://hospital-case-management.onrender.com
VITE_DISCHARGE_API=https://discharge-planning.onrender.com
VITE_PHARMACY_API=https://pharmacy-management.onrender.com
```

**File**: `imm/Enterprise Medical Management UI/.env.local` (for local development)
```
VITE_API_BASE_URL=http://localhost:8082
VITE_HOSPITAL_CASE_API=http://localhost:5052
VITE_DISCHARGE_API=http://localhost:5053
VITE_PHARMACY_API=http://localhost:8081
```

### 2. Initialize Git and Push to GitHub

```powershell
cd C:\RAF_final_demo
git init
git add .
git commit -m "Initial commit: Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 3. Follow the Full Deployment Guide

Open `DEPLOYMENT_GUIDE.md` and follow steps 3-8 to deploy each service on Render.

## 🔑 Environment Variables to Set in Render

For each Python backend service, add:
- `GROQ_API_KEY` = `YOUR_GROQ_API_KEY_HERE` (get from https://console.groq.com - keep this secret!)
- `BACKEND_URL` = `https://percert-backend.onrender.com` (for services that need it)

For Spring Boot backend, add:
- `PORT` = `8082` (optional, Render sets this automatically)
- `DATABASE_URL` = (if using database)
- `CORS_ORIGIN` = `https://medical-management-frontend.onrender.com`

For Frontend Static Site, add (build-time variables):
- `VITE_API_BASE_URL` = `https://percert-backend.onrender.com`
- `VITE_HOSPITAL_CASE_API` = `https://hospital-case-management.onrender.com`
- `VITE_DISCHARGE_API` = `https://discharge-planning.onrender.com`
- `VITE_PHARMACY_API` = `https://pharmacy-management.onrender.com`

## 📚 Next Steps

1. Read `DEPLOYMENT_GUIDE.md` for detailed step-by-step instructions
2. Create GitHub repository
3. Push your code
4. Deploy each backend one by one on Render
5. Deploy frontend
6. Update CORS settings
7. Test everything!

Good luck! 🚀

