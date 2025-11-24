# Subscription Flow Implementation - Comprehensive Todo

## 📋 **Phase 1: Backend Model & Registration Updates**

### 1.1 **User Model Modifications**

- [x] Update User schema defaults in `app/lib/models/User.js`:
  - [x] Change `subscriptionStatus` default from "free_trial" to "none"
  - [x] Remove automatic `freeTrialEndDate` assignment for new buyers
  - [x] Reset `adUnlockCredits` default from 5 to 0 (must watch ads to earn credits)
  - [x] Add validation to ensure buyers start with "none" status

### 1.2 **Registration API Updates**

- [x] Modify `app/api/auth/register/route.js`: (No changes needed - works with updated model defaults)
  - [x] Remove automatic free trial date calculations (no more default setter)
  - [x] Ensure subscription status is explicitly set to "none" for new buyers
  - [x] Keep returning complete subscription data in response (for UI compatibility)
- [x] Test registration to confirm no auto-trial activation

### 1.3 **Database Migration Strategy**

- [ ] Create migration to update existing buyer profiles:
  - [ ] Identify users with unused free trials (subscriptionStatus: "free_trial" and freeTrialUsed: false)
  - [ ] Reset to "none" status with clear messaging
  - [ ] Preserve ad unlock credits
- [ ] Document migration plan for existing users

---

## 🎨 **Phase 2: User Experience & Interface Design**

### 2.1 **Onboarding Flow Redesign**

- [x] Post-registration landing page (no login required):
  - [x] Location: `app/(auth)/onboard/page.jsx` ✓
  - [x] Route: `/onboard` (redirect from registration) ✓
  - [x] Disable login redirect after registration ✓
- [x] Welcome header with user name personalization
- [x] Three option cards in responsive grid:
  - [x] **Card 1: Watch Ads** (Blue theme) ✓
    - [x] "Watch Ads to Unlock Contacts" ✓
    - [x] "1 ad = 1 contact reveal" ✓
    - [x] Credits: "0 credits" (no free credits) ✓
    - [x] Button: "Start Watching Ads" ✓
  - [x] **Card 2: Free Trial** (Green theme) ✓
    - [x] "Get 1-Month FREE Trial" ✓
    - [x] "30 direct contact reveals" ✓
    - [x] "₹200/month after trial ends" ✓
    - [x] Button: "Start Free Trial" ✓
  - [x] **Card 3: Direct Purchase** (Gold theme) ✓
    - [x] "Buy Contact Reveals" ✓
    - [x] "₹200 one-time payment" ✓
    - [x] "30 lifetime contact reveals" ✓
    - [x] Button: "Buy Now (₹200)" ✓
- [x] Card hover effects and animations using Framer Motion
- [x] Progress indicator: "Step 1 of 2: Choose Access Method"
- [x] Skip option: "Skip for now" (redirects to dashboard)
- [x] Responsive design: Mobile stack, desktop grid
- [x] Auto-redirect to dashboard after choice selection

### 2.2 **Dashboard Subscription Status UI**

- [ ] Create subscription status header component:
  - [ ] Show current status (None/Free Trial/Active/Expired)
  - [ ] Display remaining credits/days
  - [ ] Clear call-to-actions for each status
- [ ] Update main user dashboard (`app/(dashboard)/user/page.jsx`):
  - [ ] Add subscription CTA section prominently
  - [ ] Show feature limitations for non-subscribed users

### 2.3 **Feature Gate Implementation**

- [ ] Contact reveal feature gate:
  - [ ] Check subscription status before showing contact info
  - [ ] Show appropriate messaging based on status:
    - [ ] "Watch ad to reveal (costs 1 credit)"
    - [ ] "Contact available - using your subscription"
    - [ ] "Start trial or purchase credits"
- [ ] Graceful degradation for feature limitations

---

## 💳 **Phase 3: Trial Activation & Payment Flow**

### 3.1 **Free Trial Activation**

- [ ] Create trial activation page (/trial/activate):
  - [ ] "Get 1-Month FREE Trial" landing page
  - [ ] Benefits showcase (30 direct contact reveals)
  - [ ] Payment method collection (required for trial)
  - [ ] Email verification before activation
- [ ] Trial activation API endpoint:
  - [ ] Validate email verification
  - [ ] Collect payment method (Stripe/PayPal integration)
  - [ ] Set subscriptionStatus to "free_trial"
  - [ ] Set trial end date (30 days from activation)
  - [ ] Send welcome email with trial details

### 3.2 **Direct Purchase Flow**

- [ ] Create purchase page (/purchase/contacts):
  - [ ] ₹200 for 30 contact reveals package
  - [ ] One-time purchase (no recurring billing)
  - [ ] Payment processing integration
  - [ ] Instant credit allocation after successful payment
- [ ] Purchase confirmation and receipt

### 3.3 **Payment Method Integration** (Future Phase)

- [ ] Choose payment provider (Stripe/PayPal preferred)
- [ ] Implement secure payment forms
- [ ] Add payment method storage for recurring billing
- [ ] Handle payment failures and retries

---

## 🎯 **Phase 4: Ad-Based Credit System**

### 4.1 **Ad Integration Planning**

- [ ] Research ad network options:
  - [ ] Google AdMob
  - [ ] Facebook Audience Network
  - [ ] Alternative ad networks
- [ ] Define ad viewing requirements:
  - [ ] Ad viewing duration (15-30 seconds typical)
  - [ ] Ad completion validation
  - [ ] Reward distribution (1 credit per completed ad)

### 4.2 **Ad UI Components**

- [ ] Create ad viewing modal:
  - [ ] Skip protection (no skipping allowed)
  - [ ] Progress indicator
  - [ ] "Watch to unlock contact" messaging
- [ ] Integrate with contact reveal flow:
  - [ ] Replace contact with "Watch Ad" button
  - [ ] Logic: User clicks → Ad loads → Complete ad → Reveal contact

### 4.3 **Credit Management System**

- [ ] Credit expenditure tracking:
  - [ ] Deduct 1 credit per ad watch
  - [ ] Log credit usage per property
  - [ ] Prevent overspending
- [ ] Credit recharge flow (ads and purchases)

---

## 📱 **Phase 5: Notifications & Communication**

### 5.1 **Email Notification System**

- [ ] Trial activation confirmations:
  - [ ] Welcome email with trial start/end dates
  - [ ] Feature usage instructions
- [ ] Trial expiration warnings:
  - [ ] 7-day warning
  - [ ] 1-day warning (if no payment method)
  - [ ] Expiration notification
- [ ] Purchase confirmations and receipts

### 5.2 **In-App Notifications**

- [ ] Dashboard banners for trial status
- [ ] Low credit warnings
- [ ] Subscription upgrade prompts
- [ ] Trial expiration countdown

---

## 📊 **Phase 6: Analytics & Monitoring**

### 6.1 **Subscription Metrics**

- [ ] Track conversion funnel:
  - [ ] Registration → Trial activation (%)
  - [ ] Trial → Paid conversion (%)
  - [ ] Ad watch → Credit usage (%)
- [ ] Revenue tracking per channel:
  - [ ] Trial activations
  - [ ] Direct purchases
  - [ ] Projected recurring revenue

### 6.2 **User Behavior Analysis**

- [ ] Feature usage patterns
- [ ] Credit consumption rates
- [ ] Contact reveal frequency
- [ ] Churn prediction signals

### 6.3 **Performance Monitoring**

- [ ] Payment processing success rates
- [ ] Ad completion rates
- [ ] Subscription status update accuracy

---

## 🔧 **Phase 7: Technical Implementation**

### 7.1 **Subscription Management APIs**

- [ ] Subscription status update endpoints
- [ ] Payment webhook handlers
- [ ] Subscription lifecycle management
- [ ] Cancellation and refund processing

### 7.2 **Credit System Backend**

- [ ] Credit transaction logging
- [ ] Ad verification system
- [ ] Credit balance validation
- [ ] Fraud detection for ad watching

### 7.3 **Integration Testing**

- [ ] End-to-end subscription flows
- [ ] Payment processing validation
- [ ] Ad network integration testing
- [ ] Mobile responsiveness testing

---

## 🚀 **Phase 8: Launch & Optimization**

### 8.1 **Beta Testing**

- [ ] Internal testing of full flows
- [ ] User acceptance testing
- [ ] Payment processing validation
- [ ] Ad integration testing

### 8.2 **Gradual Rollout**

- [ ] Phased feature release
- [ ] A/B testing for different CTAs
- [ ] Conversion rate monitoring
- [ ] User feedback collection

### 8.3 **Post-Launch Optimization**

- [ ] Analyze conversion funnel bottlenecks
- [ ] Optimize pricing and messaging
- [ ] Improve user onboarding flow
- [ ] Scale successful features

---

## 📝 **Additional Considerations**

### Revenue Model Details

- **Trial Conversion**: Free trial → ₹200/month recurring
- **One-time Purchase**: ₹200 = 30 contact reveals (lifetime value)
- **Ad-Based**: Each ad view = 1 contact reveal (costs paid to ad network)

### Technical Constraints

- [ ] Mobile-first design priority
- [ ] Offline capability considerations
- [ ] Data privacy and GDPR compliance
- [ ] Fraud prevention measures

### Business Metrics Targets

- Target trial activation rate: 30% of registrations
- Target trial-to-paid conversion: 20% within trial period
- Target ad completion rate: 70% of started ads
