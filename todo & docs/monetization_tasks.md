# Monetization Implementation Tasks

## Phase 1: Database Setup
- [ ] Update `User` schema to include `credits` field.
- [ ] Create `Transaction` schema for earning/spending history.
- [ ] Create `UnlockedContact` schema to track access.

## Phase 2: Credit Spending & Contact Unlocking
- [ ] Create API route `POST /api/contacts/unlock`
  - Logic to check balance, deduct credits, record transaction, and return contact data.
- [ ] Update Professional Partner UI:
  - Mask contact info if not unlocked.
  - Show "Unlock for X Credits" button.
  - Show user's current credit balance.
  - Handle unlock API response and reveal info.

## Phase 3: Razorpay Integration (Buying Credits)
- [ ] Set up Razorpay Test Account and get API Keys.
- [ ] Install `razorpay` npm package.
- [ ] Create Next.js pricing page `/buy-credits` showing packages.
- [ ] Implement `POST /api/razorpay/create-order` to generate Order ID.
- [ ] Implement Razorpay Checkout in frontend.
- [ ] Implement Webhook `POST /api/webhooks/razorpay` to verify payment and add credits securely.

## Phase 4: Google AdSense Integration (Earning Credits)
- [ ] Set up Google AdSense account and create a "Rewarded Ad" unit.
- [ ] Inject AdSense script into Next.js using `next/script`.
- [ ] Create Ad Modal/Handler in UI to trigger the video.
- [ ] Implement `POST /api/user/earn-credits` to securely reward the user upon ad completion.

## Phase 5: Testing
- [ ] Test End-to-End Razorpay payment in test mode.
- [ ] Test Ad viewing and credit balance updates.
- [ ] Test Contact unlocking logic (insufficient funds vs sufficient funds).
- [ ] Test that unlocked contacts remain unlocked after page reload.
