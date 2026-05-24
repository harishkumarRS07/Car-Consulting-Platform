# ✅ WhatsApp Integration - Implementation Checklist

## 🎯 What CLIENT Must Provide (4 Credentials)

Your client needs to set up their own Meta Business Account and provide you with **4 environment variables**:

### **1. WHATSAPP_PHONE_NUMBER_ID**
- **Where to find**: Meta App Dashboard → WhatsApp API → Phone Number ID
- **Format**: Example: `123456789012345`
- **What it is**: Your WhatsApp phone number's unique ID in Meta system

### **2. WHATSAPP_WABA_ID**
- **Where to find**: Business Manager → WhatsApp Business Accounts → Select account → Account Details
- **Format**: Example: `987654321098765`
- **What it is**: Your WhatsApp Business Account ID

### **3. WHATSAPP_ACCESS_TOKEN**
- **Where to find**: App Dashboard → System Users → Generate Token
- **Format**: Example: `ABCdef12345GHIjkl67890MNOpqrst...`
- **What it is**: Bearer token for authenticating API requests
- **⚠️ IMPORTANT**: 
  - Generate from a SYSTEM USER (not personal account)
  - Keep this SECRET
  - Never commit to git
  - Permissions needed: `whatsapp_business_messaging`

### **4. WHATSAPP_BUSINESS_PHONE_NUMBER**
- **Where to find**: The verified phone number in their WABA
- **Format**: `919876543210` (country code + number, NO + symbol)
- **Example**: 
  - India: `919876543210`
  - US: `12125551234`
  - UK: `442071838750`
- **What it is**: Where admin receives booking notifications

---

## 📋 Setup Steps for Your CLIENT

### **Step 1: Create Meta Business Account**
```
Go to: business.facebook.com
- Sign up with business email
- Verify email
```

### **Step 2: Create WhatsApp Business Account (WABA)**
```
In Business Manager:
- Settings → WhatsApp Business Accounts
- Click "Create Account"
- Select verified phone number
- Enter display name
- Verify with OTP
```

### **Step 3: Get Phone Number ID**
```
Settings → WhatsApp Business Accounts → Select Account
→ API Setup → Copy "Phone Number ID"
```

### **Step 4: Create System User & Get Access Token**
```
Settings → Users → Create System User
- Name: "carconsult-whatsapp-api"
- Role: "Admin"
→ Generate New Token
- Select your app
- Permissions: "whatsapp_business_messaging"
- Token expiry: "Never"
→ Copy token (KEEP SECRET!)
```

### **Step 5: Get WABA ID**
```
Settings → WhatsApp Business Accounts → Select Account
→ Account Details → Copy "WABA ID"
```

### **Step 6: Add Billing Method**
```
Billing → Payment Methods → Add Credit Card
(Required for WhatsApp messages to send)
```

---

## 🔧 What YOU Need to Do (Developer)

### **Step 1: Create `.env` File**
In `backend/` folder, create `.env`:

```env
# WhatsApp Configuration
WHATSAPP_PHONE_NUMBER_ID=<client_phone_number_id>
WHATSAPP_WABA_ID=<client_waba_id>
WHATSAPP_ACCESS_TOKEN=<client_access_token>
WHATSAPP_BUSINESS_PHONE_NUMBER=<client_phone_number>

# Other configs
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
NODE_ENV=production
```

### **Step 2: Install Dependencies**
```bash
cd backend
npm install
```

### **Step 3: Test the Setup**

**Test 1: Verify Credentials**
```bash
curl --location 'https://graph.facebook.com/v19.0/YOUR_PHONE_NUMBER_ID' \
--header 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

**Test 2: Create a Test Booking**
1. Go to frontend: `http://localhost:3000/sell-car`
2. Fill the form completely
3. Submit booking
4. Check admin's WhatsApp in 2-3 seconds

**Test 3: Check Admin Dashboard**
1. Login as admin
2. Go to "Scheduled Consulting" tab
3. See the booking in table
4. Try updating status

---

## 📊 What Gets Sent to WhatsApp

When a booking is created, admin receives:

```
🚗 New Car Evaluation Booking

👤 Name: John Doe
📞 Phone: 9876543210
📍 Area: Mumbai

🚘 Car: Honda City
📅 Year: 2021
⛽ Fuel Type: Petrol
👨 Owner: 1st Owner
🛣️ KMs Driven: 45,000 km

📅 Scheduled Date: 2026-04-15
⏰ Time Slot: 02:00 PM
🔖 Booking ID: BK1712156789456
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid phone" error | Remove `+` symbol, include country code (e.g., `919876543210`) |
| No notification received | Check `.env` variables are correct, billing active |
| Admin sees no bookings | Check authentication token, refresh page |
| "Access token invalid" | Regenerate token from Meta, ensure `whatsapp_business_messaging` permission |

---

## ✨ What Works After Setup

✅ Users can book car evaluation with 8-step form
✅ Booking data saved in MongoDB
✅ Admin receives WhatsApp notification instantly
✅ Admin can see all bookings in dashboard
✅ Admin can update booking status
✅ Booking ID auto-generated & tracked
✅ WhatsApp message ID stored for tracking

---

## 📞 Client Communication Template

Send this to your client:

---

**Hi [Client Name],**

We're ready to integrate WhatsApp notifications for car evaluations. To complete setup, please provide these 4 credentials from your Meta Business Account:

1. **WHATSAPP_PHONE_NUMBER_ID**: ________________
2. **WHATSAPP_WABA_ID**: ________________
3. **WHATSAPP_ACCESS_TOKEN**: ________________
4. **WHATSAPP_BUSINESS_PHONE_NUMBER**: ________________

For detailed setup instructions, see attached: `WHATSAPP_SETUP_GUIDE.md`

Once you provide these, we'll:
- Add them to the backend
- Test the system
- Deploy to production

No development work needed on your side - just provide the credentials!

---

## 🚀 Deployment Checklist

Once you have the 4 credentials:

- [ ] Add credentials to `.env`
- [ ] Run `npm install` in backend
- [ ] Test with sample booking
- [ ] Verify WhatsApp message received
- [ ] Check admin dashboard loads bookings
- [ ] Deploy to production server
- [ ] Monitor WhatsApp delivery
- [ ] Set up error logging

---

## 💰 WhatsApp Costs

**Pricing**: ~$0.0079 per message (varies by country)

**Example**: 100 bookings/month ≈ $0.79/month

Payment goes directly to client's Meta Business Account billing.

---

**Status**: ✅ Ready for Client Credentials  
**Next Step**: Request 4 environment variables from client
