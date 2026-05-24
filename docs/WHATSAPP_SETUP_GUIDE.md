# 🚀 WhatsApp Integration Setup Guide

This guide will help you set up WhatsApp Cloud API integration using your own Meta Business Account for receiving car evaluation booking notifications.

---

## 📋 Prerequisites

- Meta Business Account (create at [business.facebook.com](https://business.facebook.com))
- WhatsApp Business Account (WABA)
- Admin access to your WhatsApp Business Account
- A verified business phone number
- Credit card for WhatsApp API billing

---

## 🎯 Step-by-Step Setup

### **Step 1: Create Meta Business Account**

1. Go to [business.facebook.com](https://business.facebook.com)
2. Click "Create Account"
3. Enter your business details:
   - Business name
   - Business email
   - Country & Business type
4. Verify your email address

### **Step 2: Create WhatsApp Business Account (WABA)**

1. In Business Manager, go to **Settings** → **WhatsApp Business Accounts**
2. Click **Create Account**
3. Choose your business phone number
4. Enter display name (this appears to customers)
5. Verify your phone number with OTP

### **Step 3: Get Your Business Phone Number ID**

1. In Business Manager, go to **Settings** → **WhatsApp Business Accounts**
2. Select your WhatsApp account
3. Click **API Setup**
4. You'll see: **Phone Number ID** (copy this)

### **Step 4: Create System User & Generate Access Token**

1. Go to **Settings** → **Users**
2. Click **Create System User**
3. Username: `carconsult-whatsapp-api`
4. Role: **Admin**
5. After creation, click on the user
6. Click **Generate New Token**
7. Select: **Apps** → select your app
8. Permissions: check `whatsapp_business_messaging`
9. Token expiry: **Never** (recommended for production)
10. Generate & copy the **Access Token**

### **Step 5: Get Your WABA ID**

1. In Business Manager, go to **Settings** → **WhatsApp Business Accounts**
2. Select your WhatsApp account
3. In the Account Details section, find **WABA ID**

### **Step 6: Add Phone Number to Meta App**

1. Go to your app in **App Dashboard**
2. Add **WhatsApp** product
3. In **WhatsApp API** settings:
   - Select your Phone Number ID
   - Select your WABA ID
   - Save configuration

### **Step 7: Set Up Your Admin Phone Number**

- This is the phone number where you'll receive booking notifications
- Format: Include country code without `+` (e.g., `919876543210` for India)
- Must be verified in your WhatsApp Business Account

---

## 🔐 Environment Variables

Create or update your `.env` file in the backend root directory:

```env
# WhatsApp Cloud API Configuration
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_WABA_ID=your_waba_id_here
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_BUSINESS_PHONE_NUMBER=919876543210
```

### Where to find each credential:

| Variable | Where to find | Example |
|----------|---------------|---------|
| `WHATSAPP_PHONE_NUMBER_ID` | App Dashboard → WhatsApp API → Phone Number ID | `123456789012345` |
| `WHATSAPP_WABA_ID` | Business Manager → WhatsApp Account Settings → WABA ID | `987654321098765` |
| `WHATSAPP_ACCESS_TOKEN` | App Dashboard → System Users → Generated Token | `ABCdef12345GHIjkl67890...` |
| `WHATSAPP_BUSINESS_PHONE_NUMBER` | Your verified WhatsApp Business Number | `919876543210` |

---

## ✅ Testing Your Setup

### 1. Test WhatsApp Service Directly

Make an API request to check your configuration:

```bash
curl --location 'https://graph.facebook.com/v19.0/YOUR_PHONE_NUMBER_ID/messages' \
--header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
  "messaging_product": "whatsapp",
  "to": "YOUR_ADMIN_PHONE",
  "type": "text",
  "text": {
    "body": "Test message from CarConsult booking system"
  }
}'
```

### 2. Create a Test Booking

1. Go to the Sell Car page
2. Fill in the form with test data
3. Submit the booking
4. Check your WhatsApp for the notification
5. You should receive a message within 2-3 seconds

### 3. Verify Admin Dashboard

1. Log in to the admin dashboard
2. Go to **Scheduled Consulting** tab
3. Your test booking should appear in the list
4. Check if `notificationsSent` is marked as `true`

---

## 📊 Message Templates (Optional Advanced)

For production, you can use pre-approved message templates for better deliverability:

### Create a Template

1. Go to **Business Manager** → **WhatsApp** → **Message Templates**
2. Click **Create Template**
3. Template name: `new_booking_notification`
4. Category: **Transactional**
5. Template content:

```
🚗 New Car Evaluation Booking

👤 Name: {{1}}
📞 Phone: {{2}}
📍 Area: {{3}}

🚘 Car: {{4}}
📅 Date: {{5}}
⏰ Time: {{6}}

🔖 Booking ID: {{7}}
```

Use this in the WhatsApp service by uncommenting the template code.

---

## 🔔 Webhook Configuration (Optional - For Two-way Messaging)

To receive messages from customers:

1. **Set up webhook URL** in your app:
   - Go to **App Dashboard** → **Webhooks**
   - Set URL: `https://yourdomain.com/api/webhooks/whatsapp`
   - Verify token (generate one in your backend)

2. **Update webhook handling** in `backend/src/routes/webhookRoutes.js` (if you have one)

3. **Test webhook**:
   - Meta will send a test message
   - Verify token matches

---

## 📱 Message Pricing & Billing

### Billing Model

- **Conversation-based pricing**: You're charged per conversation started
- **Not charged** for messages within 24-hour conversation window
- **First message** always costs (even if in same conversation)
- Typical cost: $0.0079 per message (varies by country)

### Setup Billing

1. Go to **Business Manager** → **Billing**
2. Add credit card or payment method
3. Set up automatic payments
4. Monitor usage in **WhatsApp Analytics**

### Cost Estimation

For ~100 bookings per month:
- ~100 notifications × $0.0079 = ~$0.79/month
- Very affordable for small to medium businesses

---

## 🚨 Troubleshooting

### Issue: "Invalid Phone Number"

**Solution:**
- Ensure phone number includes country code
- Use format without `+` symbol (e.g., `919876543210`)
- Verify number is actually registered with WhatsApp Business Account

### Issue: "Invalid Access Token"

**Solution:**
- Regenerate token from App Dashboard
- Ensure correct permissions are set (`whatsapp_business_messaging`)
- Check token hasn't expired

### Issue: "No notification received"

**Solution:**
1. Check backend logs for errors
2. Verify WhatsApp phone number is correct
3. Ensure your phone is registered with WhatsApp Business Account
4. Wait 2-3 seconds (API takes time)
5. Check spam/other folders

### Issue: "Message failed to send"

**Common causes:**
- Phone number not registered with Meta
- Insufficient billing/account suspended
- Phone number blocked/reported as spam
- Temporary API outage (check Meta status page)

---

## 🔐 Security Best Practices

### ✅ Do's

- ✅ Store `WHATSAPP_ACCESS_TOKEN` only in `.env` file
- ✅ Never commit `.env` to git
- ✅ Use environment variables in production
- ✅ Rotate access tokens every 90 days
- ✅ Use HTTPS for all API endpoints
- ✅ Validate all phone numbers before sending
- ✅ Implement rate limiting on booking endpoint
- ✅ Log all API interactions for debugging
- ✅ Use System User (not personal account) tokens

### ❌ Don'ts

- ❌ Don't hardcode tokens in code
- ❌ Don't share token via email or chat
- ❌ Don't use personal Meta tokens
- ❌ Don't expose `.env` file publicly
- ❌ Don't send sensitive data in WhatsApp messages
- ❌ Don't skip input validation

---

## 📞 Support & Resources

- **Meta WhatsApp Business Platform**: https://business.facebook.com
- **WhatsApp API Docs**: https://developers.facebook.com/docs/whatsapp/cloud-api/reference
- **Business Manager Help**: https://www.facebook.com/business/help

---

## 🎯 Production Deployment Checklist

- [ ] Create dedicated Meta Business Account (not personal)
- [ ] Set up WhatsApp Business Account with verified phone
- [ ] Generate system user token (not personal token)
- [ ] Add all environment variables to production`.env`
- [ ] Enable webhook for two-way messaging (optional)
- [ ] Set up monitoring & alerts for API failures
- [ ] Test end-to-end booking flow in production
- [ ] Configure backup notification method (email/SMS)
- [ ] Document credentials in secure vault (NOT in code)
- [ ] Train team on WhatsApp Business best practices
- [ ] Set up analytics dashboard to track message delivery
- [ ] Review and accept WhatsApp Cloud API Terms of Service

---

## 🔄 Common Workflows

### Sending Multiple Messages

For sending messages to multiple admins, modify `.env`:

```env
WHATSAPP_ADMIN_PHONES=919876543210,919987654321,919865432109
```

Then update `whatsappService.js` to loop through phone numbers.

### Scheduled Messages

To send messages at specific times:

```javascript
// In sellController.js
setTimeout(
  () => triggerWhatsAppNotification(sellRequest),
  5000 // Send after 5 seconds
);
```

### Sending to Customer

Enable by setting `WHATSAPP_CUSTOMER_NOTIFICATIONS=true` in `.env`:

```javascript
// Send confirmation to customer
await sendCustomerOptIn(
  bookingData.phone,
  bookingData.name
);
```

---

## 📊 Monitoring & Analytics

### Track Message Delivery

- Use the `whatsappMessageId` stored in database
- Cross-reference with Meta WhatsApp Analytics dashboard
- Monitor delivery rates and identify failures

### Set Up Alerts

Create alerts for:
- API failures (send backup email)
- High failure rate (>5% in 1 hour)
- Token expiration (30 days before)
- Unusual spike in messages

---

## 🆘 Getting Help

If you face issues:

1. Check the webhook logs for error messages
2. Verify all credentials in `.env` are correct
3. Test credentials using cURL (see Testing section)
4. Review Meta WhatsApp API documentation
5. Contact Meta Business Support via Business Manager

---

**Last Updated:** April 2026
**Status:** Production Ready ✅
