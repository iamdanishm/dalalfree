# Monetization Plan: Credits & Rewarded Ads System

## Overview
This document outlines the architecture and implementation details for the "Freemium" monetization model in DalalFree. Users can unlock Premium Contact Details (Phone & Email) of Professional Partners by spending "Credits".
Credits can be acquired in two ways:
1. **Purchasing** them with real money via Razorpay.
2. **Earning** them by watching Rewarded Video Ads via Google AdSense.

## 1. Database Schema Updates (Mongoose)

### User Model (`models/User.js`)
Add a new field to track the user's credit balance.
```javascript
credits: {
  type: Number,
  default: 0
}
```

### Transaction Model (`models/Transaction.js`) - NEW
Keep a ledger of all credit changes for auditing and user history.
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['EARN_AD', 'PURCHASE', 'SPEND_CONTACT'], required: true },
  amount: { type: Number, required: true }, // positive or negative
  description: { type: String },
  referenceId: { type: String }, // Razorpay Payment ID or Ad Interaction ID
  createdAt: { type: Date, default: Date.now }
}
```

### UnlockedContacts Model (`models/UnlockedContact.js`) - NEW
Track which users have unlocked which contacts so they don't have to pay twice.
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The professional partner
  unlockedAt: { type: Date, default: Date.now }
}
```

## 2. Google AdSense (Rewarded Video Ads) Integration

### Frontend
- Include the Google AdSense script via `next/script` in the layout.
- Create an `AdRewardModal` component.
- Use the AdSense `adsbygoogle.push()` API to trigger the rewarded ad.
- Listen for the reward callback.

### Backend (Security)
- To prevent bypassing the ad, we implement Server-to-Server callbacks if AdSense supports it for web, or validate the frontend request securely.
- API Route: `POST /api/user/earn-credits`
  - Validates ad completion.
  - Updates `User.credits` (+ N).
  - Logs `Transaction`.

## 3. Razorpay Integration (Buying Credits)

### Purchase Packages
- 50 Credits for ₹X
- 100 Credits for ₹Y

### Flow
1. **Frontend:** User selects a package on `/buy-credits`.
2. **Backend (`POST /api/razorpay/create-order`):** Calls Razorpay API to create an order and returns `order_id`.
3. **Frontend:** Opens Razorpay Checkout Modal using the `order_id`. User completes payment.
4. **Backend (`POST /api/webhooks/razorpay`):** Webhook endpoint receives success event from Razorpay server.
   - Verifies webhook signature.
   - Updates `User.credits`.
   - Logs `Transaction`.

## 4. Unlocking Contacts Flow

### Process
1. User clicks "Unlock Contact" (Costs X Credits).
2. Frontend calls `POST /api/contacts/unlock` with `contactId`.
3. Backend:
   - Checks if user has enough credits.
   - Decements `User.credits`.
   - Logs `Transaction`.
   - Creates `UnlockedContact` record.
   - Returns the contact details (Phone/Email).
4. Frontend updates UI to display details.
