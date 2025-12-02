# Complete Deployment Guide: 4 Backends + 1 Frontend (Free Tier)

This guide will walk you through deploying your entire application stack for **FREE** using **Render.com** (free tier).

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Setup GitHub Repository](#step-1-setup-github-repository)
3. [Step 2: Secure Your Code (Remove API Keys)](#step-2-secure-your-code-remove-api-keys)
4. [Step 3: Deploy Backend 1 - Spring Boot (Port 8082)](#step-3-deploy-backend-1---spring-boot-port-8082)
5. [Step 4: Deploy Backend 2 - Hospital Case Management (Port 5052)](#step-4-deploy-backend-2---hospital-case-management-port-5052)
6. [Step 5: Deploy Backend 3 - Discharge Planning (Port 5053)](#step-5-deploy-backend-3---discharge-planning-port-5053)
7. [Step 6: Deploy Backend 4 - Pharmacy Management (Port 8081)](#step-6-deploy-backend-4---pharmacy-management-port-8081)
8. [Step 7: Deploy Frontend - React Application](#step-7-deploy-frontend---react-application)
9. [Step 8: Update Frontend API URLs](#step-8-update-frontend-api-urls)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ **GitHub account** (free) - [Sign up here](https://github.com/signup)
- ✅ **Render.com account** (free) - [Sign up here](https://render.com)
- ✅ **Git installed** on your computer
- ✅ **Groq API key** - Get it from [Groq Console](https://console.groq.com) (keep it secret, never commit to Git!)

---

## Step 1: Setup GitHub Repository

### 1.1 Create a New Repository on GitHub

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in:
   - **Repository name**: `raf-medical-management` (or any name you prefer)
   - **Description**: "Integrated Medical Management System"
   - **Visibility**: Choose **Private** (recommended) or **Public**
   - **DO NOT** check "Initialize with README" (we'll push existing code)
4. Click **"Create repository"**

### 1.2 Initialize Git in Your Project

Open PowerShell in your project root:

```powershell
cd C:\RAF_final_demo
```

**Check if Git is already initialized:**
```powershell
git status
```

If you see "not a git repository", initialize it:
```powershell
git init
```

### 1.3 Create/Update .gitignore

We need to ensure sensitive files are not committed. Create a root `.gitignore`:

```powershell
# Create .gitignore in root
New-Item -Path "C:\RAF_final_demo\.gitignore" -ItemType File -Force
```

Add this content to `.gitignore`:

```
# Python
__pycache__/
*.py[cod]
*$py.class
*.log
*.jsonl
.env
.venv
venv/
myenv/

# Java
target/
*.class
*.jar
*.war
.mvn/

# Node
node_modules/
dist/
build/
.env.local
.env.production

# IDE
.idea/
.vscode/
*.iml
*.ipr
*.iws

# OS
.DS_Store
Thumbs.db

# Sensitive files
*.log
*.jsonl
.env
application-local.properties
```

### 1.4 Add All Files and Commit

```powershell
git add .
git commit -m "Initial commit: Medical Management System"
```

### 1.5 Connect to GitHub and Push

```powershell
# Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual values
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

**Note**: You'll be prompted for your GitHub username and password (use a Personal Access Token, not your password).

---

## Step 2: Secure Your Code (Remove API Keys)

**⚠️ IMPORTANT**: Before pushing to GitHub, we must remove hardcoded API keys and use environment variables instead.

**🔒 Security Note**: API keys should NEVER be committed to Git. Always use environment variables or `.env` files (which are in `.gitignore`).

### 2.1 Update Hospital_case_management_groq.py

Change the hardcoded API key from:
```python
GROQ_API_KEY: str = "YOUR_API_KEY_HERE"
```

To:
```python
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
```

### 2.2 Update Discharge_planning_groq.py

Find the GROQ_API_KEY line and change it to:
```python
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
```

### 2.3 Update Pharmacy_management_groq.py

Find the GROQ_API_KEY line and change it to:
```python
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
```

### 2.4 Update Spring Boot application.properties

Change hardcoded values to use environment variables:

```properties
server.port=${PORT:8082}

spring.datasource.url=${DATABASE_URL:jdbc:mysql://localhost:3306/precert}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:root}

spring.mail.username=${MAIL_USERNAME:notify@parseez.com}
spring.mail.password=${MAIL_PASSWORD:Parseez@123}

cors.origin.url=${CORS_ORIGIN:http://localhost:3000}
```

### 2.5 Commit These Changes

```powershell
git add .
git commit -m "Security: Move API keys and secrets to environment variables"
git push
```

---

## Step 3: Deploy Backend 1 - Spring Boot (Port 8082)

### 3.1 Go to Render Dashboard

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**

### 3.2 Connect Your GitHub Repository

1. Click **"Connect account"** if you haven't connected GitHub yet
2. Authorize Render to access your repositories
3. Select your repository: `raf-medical-management`
4. Click **"Connect"**

### 3.3 Configure the Service

Fill in the following:

- **Name**: `percert-backend` (or any name)
- **Region**: Choose closest to you (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `imm/speedauth-be`
- **Environment**: `Java`
- **Build Command**: `./mvnw clean package -DskipTests`
- **Start Command**: `java -jar target/*.jar`

### 3.4 Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**:

Add these variables:
- `PORT` = `8082` (or leave blank, Render will set it automatically)
- `DATABASE_URL` = (if you have a database, otherwise leave default)
- `DB_USERNAME` = (your database username)
- `DB_PASSWORD` = (your database password)
- `CORS_ORIGIN` = (we'll update this after frontend is deployed)

### 3.5 Deploy

1. Scroll down and click **"Create Web Service"**
2. Render will start building your application
3. Wait 5-10 minutes for the build to complete
4. Once deployed, you'll get a URL like: `https://percert-backend.onrender.com`

### 3.6 Test Your Deployment

Open your browser and visit:
```
https://percert-backend.onrender.com/actuator/health
```

Or test any of your API endpoints.

**✅ Save this URL** - You'll need it for the frontend configuration!

---

## Step 4: Deploy Backend 2 - Hospital Case Management (Port 5052)

### 4.1 Create New Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Select the same repository: `raf-medical-management`

### 4.2 Configure the Service

- **Name**: `hospital-case-management`
- **Region**: Same as before
- **Branch**: `main`
- **Root Directory**: `imm/speedauth-be`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python Hospital_case_management_groq.py`

### 4.3 Set Environment Variables

Add:
- `GROQ_API_KEY` = `YOUR_GROQ_API_KEY_HERE` (get from https://console.groq.com)
- `PORT` = `5052` (optional, Render sets this automatically)
- `BACKEND_URL` = `https://percert-backend.onrender.com` (URL from Step 3.5)

### 4.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment
3. Save the URL: `https://hospital-case-management.onrender.com`

**✅ Save this URL!**

---

## Step 5: Deploy Backend 3 - Discharge Planning (Port 5053)

### 5.1 Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Select repository: `raf-medical-management`

### 5.2 Configure the Service

- **Name**: `discharge-planning`
- **Region**: Same as before
- **Branch**: `main`
- **Root Directory**: `imm/speedauth-be`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python Discharge_planning_groq.py`

### 5.3 Set Environment Variables

Add:
- `GROQ_API_KEY` = `YOUR_GROQ_API_KEY_HERE` (get from https://console.groq.com)
- `PORT` = `5053` (optional)
- `BACKEND_URL` = `https://percert-backend.onrender.com`

### 5.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment
3. Save the URL: `https://discharge-planning.onrender.com`

**✅ Save this URL!**

---

## Step 6: Deploy Backend 4 - Pharmacy Management (Port 8081)

### 6.1 Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Select repository: `raf-medical-management`

### 6.2 Configure the Service

- **Name**: `pharmacy-management`
- **Region**: Same as before
- **Branch**: `main`
- **Root Directory**: `imm/speedauth-be`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python Pharmacy_management_groq.py`

### 6.3 Set Environment Variables

Add:
- `GROQ_API_KEY` = `YOUR_GROQ_API_KEY_HERE` (get from https://console.groq.com)
- `PORT` = `8081` (optional)

### 6.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment
3. Save the URL: `https://pharmacy-management.onrender.com`

**✅ Save this URL!**

---

## Step 7: Deploy Frontend - React Application

**Note**: You have two frontend projects. Choose which one to deploy:

1. **Enterprise Medical Management UI** (Vite) - `imm/Enterprise Medical Management UI/`
2. **Create React App** - `imm/src/`

We'll deploy the **Enterprise Medical Management UI** (Vite) as it's the main frontend.

### 7.1 Create Static Site on Render

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect your repository: `raf-medical-management`

### 7.2 Configure the Static Site

- **Name**: `medical-management-frontend`
- **Branch**: `main`
- **Root Directory**: `imm/Enterprise Medical Management UI`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### 7.3 Set Environment Variables (for Build Time)

Add these environment variables (they'll be used during build):
- `VITE_API_BASE_URL` = `https://percert-backend.onrender.com`
- `VITE_HOSPITAL_CASE_API` = `https://hospital-case-management.onrender.com`
- `VITE_DISCHARGE_API` = `https://discharge-planning.onrender.com`
- `VITE_PHARMACY_API` = `https://pharmacy-management.onrender.com`

### 7.4 Deploy

1. Click **"Create Static Site"**
2. Wait for deployment
3. Save the URL: `https://medical-management-frontend.onrender.com`

**✅ This is your frontend URL!**

---

## Step 8: Update Frontend API URLs

Now we need to update the frontend code to use environment variables for API URLs.

### 8.1 Update Frontend API Configuration

**Important**: Create these environment files manually (they're in .gitignore for security):

**For Vite Frontend** (`imm/Enterprise Medical Management UI/.env.production`):
```
VITE_API_BASE_URL=https://percert-backend.onrender.com
VITE_HOSPITAL_CASE_API=https://hospital-case-management.onrender.com
VITE_DISCHARGE_API=https://discharge-planning.onrender.com
VITE_PHARMACY_API=https://pharmacy-management.onrender.com
```

**For Vite Frontend** (`imm/Enterprise Medical Management UI/.env.local` - local development):
```
VITE_API_BASE_URL=http://localhost:8082
VITE_HOSPITAL_CASE_API=http://localhost:5052
VITE_DISCHARGE_API=http://localhost:5053
VITE_PHARMACY_API=http://localhost:8081
```

**For Create React App** (`imm/.env.production` - if deploying this frontend instead):
```
REACT_APP_API_BASE_URL=https://percert-backend.onrender.com
REACT_APP_HOSPITAL_CASE_API=https://hospital-case-management.onrender.com
REACT_APP_DISCHARGE_API=https://discharge-planning.onrender.com
REACT_APP_PHARMACY_API=https://pharmacy-management.onrender.com
```

### 8.2 Update Frontend Code to Use Environment Variables

Update `imm/Enterprise Medical Management UI/src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
```

Update any hardcoded API URLs in components to use environment variables.

### 8.3 Update CORS Settings

Go back to each backend service on Render and update CORS origins:

- **percert-backend**: Add `https://medical-management-frontend.onrender.com` to CORS_ORIGIN
- **hospital-case-management**: Update CORS_ORIGINS in code or environment
- **discharge-planning**: Update CORS_ORIGINS
- **pharmacy-management**: Update CORS_ORIGINS

### 8.4 Commit and Push Changes

```powershell
git add .
git commit -m "Update frontend to use environment variables for API URLs"
git push
```

Render will automatically redeploy your frontend.

---

## Troubleshooting

### Issue: Build Fails

**Solution**: Check the build logs in Render dashboard. Common issues:
- Missing dependencies in `requirements.txt` or `package.json`
- Wrong root directory path
- Build command errors

### Issue: Service Goes to Sleep (Free Tier)

**Solution**: Render free tier services sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds. Consider:
- Using a free uptime monitor (like UptimeRobot) to ping your services
- Upgrading to paid tier for always-on services

### Issue: CORS Errors

**Solution**: Make sure all backend services have the frontend URL in their CORS allowed origins.

### Issue: Environment Variables Not Working

**Solution**: 
- Restart the service after adding environment variables
- Check variable names match exactly (case-sensitive)
- Verify the code reads from `os.getenv()` correctly

### Issue: Port Conflicts

**Solution**: Render automatically sets the `PORT` environment variable. Make sure your code uses `${PORT}` or `os.getenv("PORT")` instead of hardcoded ports.

---

## Summary of Your Deployed URLs

After completing all steps, you should have:

1. **Backend 1 (Spring Boot)**: `https://percert-backend.onrender.com`
2. **Backend 2 (Hospital Case)**: `https://hospital-case-management.onrender.com`
3. **Backend 3 (Discharge Planning)**: `https://discharge-planning.onrender.com`
4. **Backend 4 (Pharmacy)**: `https://pharmacy-management.onrender.com`
5. **Frontend**: `https://medical-management-frontend.onrender.com`

**🎉 Congratulations! Your application is now live!**

---

## Next Steps

1. Test all endpoints from the frontend
2. Monitor your Render dashboard for any errors
3. Set up custom domains (optional, paid feature)
4. Configure database if needed (Render offers free PostgreSQL)

---

## Need Help?

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Check build logs in Render dashboard for detailed error messages

