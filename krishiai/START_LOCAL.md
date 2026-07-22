# Local Testing Guide: OTP Integration

## Step 1: Update .env with your 2Factor.in API Key

Edit `.env` and replace:
```
TWO_FACTOR_API_KEY=paste_your_api_key_here
```

with your actual API key from https://2factor.in/dashboard

Your dashboard → Settings/API → API Key

---

## Step 2: Start the Backend

**Option A: Direct Python (if venv exists)**
```bash
cd krishiai
# Activate venv (Windows)
venv\Scripts\activate

# Or (macOS/Linux)
source venv/bin/activate

# Install/update deps
pip install -r backend/requirements.txt

# Run backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Option B: Docker**
```bash
cd krishiai
docker build -t krishiai-backend .
docker run -p 8000:8000 -e TWO_FACTOR_API_KEY=your_key krishiai-backend
```

The backend should start at `http://localhost:8000`

Check health:
```bash
curl http://localhost:8000/
```

Should return:
```json
{
  "message": "Welcome to KrishiAI MCP Server. Go to /docs to see the REST tools or connect via MCP SDK."
}
```

---

## Step 3: Test OTP Endpoints Directly (curl)

### Send OTP
```bash
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'
```

Response (success):
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "phone": "9876543210",
  "session_id": "..."
}
```

Or (test mode if API key missing):
```json
{
  "success": true,
  "message": "Test OTP: 482913",
  "phone": "9876543210"
}
```

### Verify OTP
```bash
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "code": "482913"}'
```

Response:
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "phone": "9876543210",
  "token": null
}
```

---

## Step 4: Test on Mobile App

1. **Update mobile backend URL** (if needed)
   - Edit `krishi-mobile/constants/Config.ts`
   - Should already be set to `http://localhost:8000`
   - If running Expo on a different machine: use `http://192.168.x.x:8000` (your PC's IP)

2. **Start Expo**
   ```bash
   cd krishi-mobile
   npm start
   ```

3. **Test the flow**
   - Language → Welcome → "Sign Up"
   - Skip Features/Permissions (or go through)
   - Enter phone: `9876543210`
   - Tap "Send OTP" → should trigger backend call
   - **Check backend logs** — you should see:
     ```
     [OTP] Stored for 9876543210, valid for 10 min
     [2Factor] OTP sent to 9876543210
     ```
   - **Check your phone** — real SMS should arrive with the OTP
   - Enter the OTP in the app → verify → next step ✓

---

## Troubleshooting

**"Failed to send OTP" on app:**
- Check backend logs for errors
- Make sure `TWO_FACTOR_API_KEY` is in `.env` and loaded
- Try the curl test above first

**Backend won't start:**
- Check Python version: `python --version` (3.8+)
- Install deps: `pip install -r backend/requirements.txt`
- Check port 8000 is free: `netstat -ano | findstr :8000`

**Mobile app can't reach backend:**
- Mobile device must be on same network as PC
- Use PC's IP address: `http://192.168.1.x:8000`
- Check firewall allows port 8000

**Test mode (no SMS):**
- If `TWO_FACTOR_API_KEY` is missing, backend logs OTP to console
- Copy the OTP and enter it manually in the app for testing
- Great for UI/UX validation without burning credits

---

## What to Share with Me

Once you've tested locally, tell me:
1. ✅ Backend starts successfully
2. ✅ Send OTP endpoint works (curl test)
3. ✅ Mobile app shows OTP input screen
4. ✅ OTP arrives on your phone (or console in test mode)
5. ✅ App verifies and moves to next step

Then we'll deploy online.
