# KrishiAI Local Development & Testing Guide

This guide explains how to start and test the KrishiAI project locally (Backend, Frontend Web App, and Mobile App).

---

## ⚡ Quick Start Summary

Open two terminal windows in the project root (`krishiai`):

### Terminal 1: Backend (Port 8000)
```powershell
# In PowerShell (from krishiai root):
cd backend
.\venv\Scripts\Activate.ps1
python server.py

# OR directly in one line without activation:
.\backend\venv\Scripts\python.exe backend\server.py
```
> **Backend URL:** http://localhost:8000  
> **Interactive API Docs (Swagger):** http://localhost:8000/docs

---

### Terminal 2: Frontend Domain Applications

You can run individual domains or all domains according to your workflow:

#### Option A: Run Specific Domain Portal
```powershell
# From the krishiai root directory:
npm run dev:farmer   # 🌾 Farmer Portal (Port 5173)
npm run dev:vendor   # 🏪 Vendor Portal (Port 5174)
npm run dev:admin    # 🛡️ Admin Governance Portal (Port 5175)

# OR directly inside the domain folder:
cd frontend/farmer; npm run dev   # Port 5173
cd frontend/vendor; npm run dev   # Port 5174
cd frontend/admin;  npm run dev   # Port 5175
```

#### Option B: Run All Portals Together
```powershell
# From the krishiai root directory:
npm run dev:all
```

> **Farmer App URL:** http://localhost:5173  
> **Vendor App URL:** http://localhost:5174  
> **Admin App URL:** http://localhost:5175  

---

## 📋 Step-by-Step Setup

### Step 1: Environment Variables

1. **Backend Environment (`backend/.env`)**
   Make sure `backend/.env` exists. If using 2Factor.in SMS OTP:
   ```env
   TWO_FACTOR_API_KEY=your_actual_api_key_here
   ```
   > *Note:* If `TWO_FACTOR_API_KEY` is omitted or empty, the backend runs in **Test Mode** and outputs the OTP directly to the terminal console!

2. **Frontend Environment (`frontend/.env`)**
   Ensure `VITE_API_BASE_URL` points to your local backend:
   ```env
   VITE_API_BASE_URL="http://127.0.0.1:8000/"
   ```

---

## 🚀 Starting the Services

### 1. Backend Service

The Python virtual environment is located inside `krishiai/backend/venv` (Python 3.11).

#### Option A: PowerShell (Windows)
```powershell
# From the krishiai root directory:
cd backend
.\venv\Scripts\Activate.ps1
python server.py
```
*(If PowerShell displays an execution policy error, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first).*

#### Option B: Direct Python Execution (No activation needed)
```powershell
# From the krishiai root directory:
.\backend\venv\Scripts\python.exe backend\server.py
```

#### Option C: Windows Command Prompt (cmd.exe)
```cmd
cd backend
venv\Scripts\activate.bat
python server.py
```

#### Option D: Linux / macOS
```bash
cd backend
source venv/bin/activate
python server.py
```

#### Verification:
Verify the backend is running:
- **Browser:** Open http://localhost:8000/
  - Response: `{"message": "Welcome to KrishiAI MCP Server. Go to /docs to see the REST tools or connect via MCP SDK."}`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri http://localhost:8000/
  ```

---

### 2. Frontend Web Application

The frontend is a Vite + React application.

```powershell
# From the krishiai root directory:
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser to access the farmer advisory, mandi prices, satellite dashboard, and vendor marketplace.

---

### 3. Mobile App (Expo / React Native)

If testing `krishi-mobile`:

1. **Update mobile backend URL** (if testing on a physical phone):
   - Edit `krishi-mobile/constants/Config.ts`
   - Use your PC's local Wi-Fi IP (e.g., `http://192.168.1.XX:8000`) instead of `localhost`.
2. **Start Expo**:
   ```bash
   cd krishi-mobile
   npm start
   ```
3. Scan the QR code using the Expo Go app on your phone.

---

## 🧪 Testing OTP Endpoints (cURL / PowerShell)

### 1. Send OTP
```powershell
# PowerShell:
Invoke-RestMethod -Uri http://localhost:8000/api/auth/send-otp -Method Post -ContentType "application/json" -Body '{"phone": "9876543210"}'
```

```bash
# cURL:
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'
```

**Expected Response (Test Mode):**
```json
{
  "success": true,
  "message": "Test OTP: 123456",
  "phone": "9876543210"
}
```

### 2. Verify OTP
```powershell
# PowerShell:
Invoke-RestMethod -Uri http://localhost:8000/api/auth/verify-otp -Method Post -ContentType "application/json" -Body '{"phone": "9876543210", "code": "123456"}'
```

```bash
# cURL:
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "code": "123456"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "phone": "9876543210",
  "token": null
}
```

---

## 🛠️ Troubleshooting Common Errors

| Error | Reason & Fix |
|---|---|
| `Cannot find path '...krishiai\venv\Scripts\activate'` | The `venv` is located inside `backend/venv`, not the root. Run `cd backend` first, or run `.\backend\venv\Scripts\Activate.ps1`. |
| `cd venv\Scripts\activate` fails | `activate` is a script, not a folder. Do not use `cd`. Call `.\backend\venv\Scripts\Activate.ps1`. |
| `The module 'venv' could not be loaded` | PowerShell requires the script prefix `.\venv\Scripts\Activate.ps1`. |
| `Execution of scripts is disabled on this system` | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in your PowerShell window. |
| `Python was not found...` | Use the project's virtual environment binary directly: `.\backend\venv\Scripts\python.exe`. |
| `Port 8000 or 5173 already in use` | Check listening processes: `Get-NetTCPConnection -LocalPort 8000,5173` and terminate conflicting processes. |
