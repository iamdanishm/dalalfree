# 📱 Mobile OTP Verification Implementation - Todo List

## Project Overview

**Dalal Free** - Real Estate Platform
**Goal**: Implement mobile-only OTP authentication (no password login)
**Provider**: BhashSMS API
**Requirements**: 6-digit OTP, 10-minute validity, max 3 attempts

---

## 🎯 **Updated Requirements (After Client Feedback)**

- ❌ **No password-based authentication**
- ✅ **Phone-only login** (enter phone → receive OTP → verify → login)
- ✅ **OTP required for registration** (collect details first, verify phone, create account)
- ✅ **Maintain Google OAuth** for alternative login
- ✅ **Fresh project** (no existing users to migrate)

---

## 📋 **Phase 1: Backend Infrastructure** ⚡ READY

### 1.1 Database Schema Updates

- [ ] Update User model (`app/lib/models/User.js`)
  - [ ] Add `phoneVerified: { type: Boolean, default: false }`
  - [ ] Add `otpCode: String` (hashed, expires after use)
  - [ ] Add `otpExpiresAt: Date`
  - [ ] Add `otpAttempts: { type: Number, default: 0, max: 3 }`
  - [ ] Add `lastOtpRequest: Date` (rate limiting)

### 1.2 SMS Integration Module

- [ ] Create `app/lib/sms.js`
  - [ ] BhashSMS API integration
  - [ ] OTP generation (6-digit random)
  - [ ] Phone number validation/formatting (+91 format)
  - [ ] Error handling & delivery status tracking
  - [ ] Cost tracking/logging for SMS usage

### 1.3 New API Endpoints

- [ ] Create `app/api/auth/send-otp/route.js`
  - [ ] POST endpoint for sending OTP
  - [ ] Rate limiting: max 5 requests/hour per phone
  - [ ] Validate phone number format
  - [ ] Generate & store hashed OTP
- [ ] Create `app/api/auth/verify-otp/route.js`
  - [ ] POST endpoint for OTP verification
  - [ ] Verify code, attempts, expiry
  - [ ] Return user session/token on success
- [ ] Create `app/api/auth/resend-otp/route.js`
  - [ ] POST endpoint for resending OTP
  - [ ] 60-second cooldown enforcement

---

## 📋 **Phase 2: Authentication Flow Restructure** 🔐 CRITICAL

### 2.1 Remove Password Authentication

- [ ] Update `app/api/auth/[...nextauth]/route.js`
  - [ ] Remove CredentialsProvider (password login)
  - [ ] Keep only GoogleProvider
  - [ ] Update error messages
- [ ] Update `app/api/auth/login/route.js`
  - [ ] Replace with OTP-based logic
  - [ ] Change from email/password to phone/OTP flow
  - [ ] Update validation and response format
- [ ] Update `app/api/auth/register/route.js`
  - [ ] Keep user creation (email, phone, name, role)
  - [ ] Add OTP requirement before account activation

### 2.2 New Phone-Based Auth Flow

- [ ] **Registration Flow**:
  1. User enters: name, email, phone
  2. Send OTP to phone
  3. Verify OTP → create active account
  4. Auto-login & redirect to onboarding
- [ ] **Login Flow**:
  1. User enters phone number
  2. Send OTP to phone
  3. Verify OTP → login user
  4. Role-based redirect (admin, partner, buyer)

---

## 📋 **Phase 3: User Interface Updates** 🎨 FRONTEND

### 3.1 Login Page Overhaul

- [ ] Update `app/(auth)/login/page.jsx`
  - [ ] Remove email/password fields
  - [ ] Add single phone input field
  - [ ] Add OTP input component (6 digits)
  - [ ] Implement step-by-step flow: Phone → OTP → Login
  - [ ] Add resend functionality with timer
  - [ ] Update error handling for OTP failures

### 3.2 Registration Page Update

- [ ] Update `app/(auth)/register/page.jsx`
  - [ ] Step 1: Name, Email, Phone
  - [ ] Step 2: OTP Verification
  - [ ] Step 3: Account created → onboarding
  - [ ] Add loading states between steps
  - [ ] Implement "change phone" functionality

### 3.3 Reusable OTP Components

- [ ] Create `app/components/auth/OtpInput.jsx`
  - [ ] 6 individual input fields with auto-focus
  - [ ] Paste support for full code
  - [ ] Visual feedback (filled, error states)
- [ ] Create `app/components/auth/OtpTimer.jsx`
  - [ ] Countdown from 60 seconds
  - [ ] Disable/enable resend button
  - [ ] Auto-refresh when expired
- [ ] Create `app/components/auth/PhoneInput.jsx`
  - [ ] International format handling (+91)
  - [ ] Validation and formatting
  - [ ] Country code dropdown

---

## 📋 **Phase 4: Security & Validation** 🔒 IMPORTANT

### 4.1 Security Measures

- [ ] Hash OTP codes before database storage
- [ ] Implement OTP expiry (10 minutes)
- [ ] Track and limit verification attempts (max 3)
- [ ] Add rate limiting by phone number and IP
- [ ] Clear OTP data after successful verification
- [ ] Add security headers to auth endpoints

### 4.2 Input Validation

- [ ] Phone number format validation
- [ ] Email format validation (for registration)
- [ ] OTP format validation (exactly 6 digits)
- [ ] Required field validation
- [ ] XSS protection and sanitization

### 4.3 Error Handling

- [ ] User-friendly error messages
- [ ] OTP expired scenarios
- [ ] Maximum attempts reached
- [ ] SMS delivery failures
- [ ] Network timeout handling

---

## 📋 **Phase 5: Testing & Validation** 🧪 CRITICAL

### 5.1 Unit Tests

- [ ] OTP generation logic
- [ ] Phone number validation
- [ ] Rate limiting functionality
- [ ] Database field updates

### 5.2 Integration Tests

- [ ] Complete registration flow
- [ ] Login with valid OTP
- [ ] Invalid OTP scenarios
- [ ] Rate limiting enforcement
- [ ] Google OAuth still working

### 5.3 Manual Testing

- [ ] Real phone number testing (test accounts)
- [ ] UI responsiveness on mobile devices
- [ ] Error scenarios (wrong OTP, expired codes)
- [ ] Multiple device login attempts
- [ ] Network connectivity issues

### 5.4 Security Testing

- [ ] Check OTP codes not exposed in logs
- [ ] Verify rate limiting bypass attempts
- [ ] Test SQL injection prevention
- [ ] Validate session security

---

## 📋 **Phase 6: Deployment & Monitoring** 🚀 FINAL

### 6.1 Environment Setup

- [ ] Add BhashSMS credentials to `.env.local`
- [ ] Configure SMS templates
- [ ] Set up monitoring for SMS costs
- [ ] Configure API rate limits

### 6.2 Documentation

- [ ] Update API documentation (`API_DOCUMENTATION.md`)
- [ ] Create user testing guide
- [ ] Document SMS integration setup
- [ ] Update deployment checklist

### 6.3 Monitoring

- [ ] SMS delivery success rate tracking
- [ ] User registration completion metrics
- [ ] Login failure analytics
- [ ] Cost monitoring dashboard

---

## 🔄 **Implementation Dependencies**

### Database Changes First

Complete 1.1 before starting any other phases

### API Updates Second

Complete 1.3 before UI changes (2.1 depends on it)

### Parallel Development Possible

- 3.1 and 3.2 can be developed simultaneously
- 4.1-4.3 can be implemented alongside UI
- 5.1-5.4 should be done throughout development

---

## 🚨 **Risk Mitigation**

### High Risk Items

- **Password removal**: Ensure no existing functionality breaks
- **SMS delivery**: Have fallback options if BhashSMS has issues
- **Rate limiting**: Thoroughly test to prevent abuse

### Rollback Plan

- Keep old login endpoint as backup during transition
- Database fields are additive (safe rollback)
- Feature flags for gradual rollout

### Testing Checklist

- [ ] Happy path (successful registration/login)
- [ ] OTP resend functionality
- [ ] Invalid OTP handling
- [ ] Max attempts exceeded
- [ ] Phone number validation
- [ ] Session persistence
- [ ] Google OAuth unaffected

---

## 💰 **Cost Estimation & Timeline**

### Cost Breakdown

- **BhashSMS Setup**: Free initial testing
- **SMS Costs**: ~₹1-2 per 100 messages (production)
- **Development Time**: 2-3 weeks full-time

### Phase Timeline (Assuming 1 developer)

- **Phase 1**: 3-4 days (Backend infrastructure)
- **Phase 2**: 2-3 days (Auth restructure)
- **Phase 3**: 3-4 days (UI components)
- **Phase 4**: 2-3 days (Security & validation)
- **Phase 5**: 2-3 days (Testing)
- **Phase 6**: 1-2 days (Deployment & docs)

**Total Timeline**: 13-19 working days

---

## ✅ **Acceptance Criteria**

- [ ] Users can register with phone verification only
- [ ] Users can login using phone + OTP only
- [ ] Password authentication completely removed
- [ ] Google OAuth still functional
- [ ] SMS delivery works reliably
- [ ] Security measures prevent abuse
- [ ] Mobile UI works perfectly
- [ ] All test cases pass

---

_Created: November 27, 2025_
_Last Updated: November 27, 2025_
