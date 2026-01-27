# 🏗️ DalalFree Partner Flow Implementation Plan

**Updated:** January 27, 2026
**Status:** Planning Phase
**Priority:** High - Complete Partner Flow MVP Today

---

## 🎯 Project Overview

### **Business Requirements (Updated)**
- **RERA Numbers**: DalalFree will assign RERA numbers to partners (no verification flow needed)
- **No Partner Analytics**: Remove analytics requirements
- **No RERA Verification Flow**: Partners get RERA numbers from DalalFree
- **No Partner Onboarding**: Focus on core partner functionality only

### **Partner Role Definition**
Partners are real estate agents who:
- List properties on behalf of owners
- Earn 90% commission on property sales (DalalFree keeps 10%)
- Manage their property portfolio
- Track earnings and withdraw commissions

---

## 📋 Current State Analysis

### **✅ What Exists**
1. **User Model**: Partner role exists with RERA number field
2. **Partner Dashboard**: Basic dashboard with metrics (`/partner/page.jsx`)
3. **Partner Layout**: Navigation sidebar with Dashboard, My Properties, Earnings links
4. **Admin APIs**: Can create partner users with RERA validation
5. **Property System**: Properties can be owned by partners

### **❌ What's Missing**
1. **Partner Properties Management**: No `/partner/properties` page
2. **Partner Earnings System**: No earnings tracking or commission system
3. **Partner-Specific APIs**: No dedicated partner APIs
4. **Commission Tracking**: No system for tracking partner commissions
5. **Withdrawal System**: No way for partners to withdraw earnings

---

## 🚀 Implementation Plan (MVP Focus)

### **Phase 1: Database Schema Updates** *(1 hour)*

#### **1.1 Update User Model** *(app/lib/models/User.js)*
```javascript
// Add to User schema for partners:
partnerCommissionRate: {
  type: Number,
  default: 0.9, // 90% commission rate
  min: 0,
  max: 1
},
totalEarnings: {
  type: Number,
  default: 0,
  min: 0
},
pendingWithdrawals: {
  type: Number,
  default: 0,
  min: 0
},
withdrawnAmount: {
  type: Number,
  default: 0,
  min: 0
},
lastWithdrawalDate: {
  type: Date
},
reraNumber: {
  type: String,
  validate: {
    validator: function(value) {
      // RERA required only for partners
      if (this.role === "partner") {
        return value && value.trim() !== "";
      }
      return true; // optional for others
    },
    message: "RERA number is required for partners",
  },
}
```

#### **1.2 Update Property Model** *(app/lib/models/Property.js)*
```javascript
// Add commission tracking to Property schema:
partnerCommission: {
  type: Number,
  default: 0,
  min: 0
},
commissionPaid: {
  type: Boolean,
  default: false
},
commissionPaidDate: {
  type: Date
},
commissionTransactionId: {
  type: String
}
```

#### **1.3 Create Withdrawal Model** *(app/lib/models/Withdrawal.js)*
```javascript
import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 100 // Minimum withdrawal amount
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "rejected"],
      default: "pending"
    },
    transactionId: {
      type: String
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
      bankName: String
    },
    notes: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    processedAt: Date
  },
  { timestamps: true }
);

// Indexes
withdrawalSchema.index({ partnerId: 1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ createdAt: -1 });

export default mongoose.models.Withdrawal || mongoose.model("Withdrawal", withdrawalSchema);
```

---

### **Phase 2: Partner API Development** *(2 hours)*

#### **2.1 Create Partner Properties API** *(app/api/partner/properties/route.js)*
```javascript
// GET /api/partner/properties - Get partner's properties with commission data
export async function GET(req) {
  // Implementation:
  // - Authenticate partner
  // - Get properties owned by partner
  // - Calculate commission for each property
  // - Include commission status
  // - Support filtering by status
  // - Support pagination
}

// POST /api/partner/properties - Create property as partner
export async function POST(req) {
  // Implementation:
  // - Authenticate partner
  // - Create property with partner as owner
  // - Set default commission (90%)
  // - Handle file uploads
  // - Return created property
}
```

#### **2.2 Create Partner Earnings API** *(app/api/partner/earnings/route.js)*
```javascript
// GET /api/partner/earnings - Get earnings summary and history
export async function GET(req) {
  // Implementation:
  // - Authenticate partner
  // - Calculate total earnings
  // - Calculate pending withdrawals
  // - Calculate available balance
  // - Get earnings history (last 6 months)
  // - Include commission breakdown
}

// GET /api/partner/earnings/history - Get detailed earnings history
export async function GET(req) {
  // Implementation:
  // - Authenticate partner
  // - Get paginated earnings history
  // - Include property details
  // - Include commission amounts
  // - Include payment dates
}
```

#### **2.3 Create Partner Withdrawal API** *(app/api/partner/withdrawals/route.js)*
```javascript
// POST /api/partner/withdrawals - Request withdrawal
export async function POST(req) {
  // Implementation:
  // - Authenticate partner
  // - Validate withdrawal amount (min ₹100)
  // - Check available balance
  // - Create withdrawal request
  // - Update partner's pending withdrawals
  // - Send notification to admin
}

// GET /api/partner/withdrawals - Get withdrawal history
export async function GET(req) {
  // Implementation:
  // - Authenticate partner
  // - Get withdrawal history
  // - Include status filtering
  // - Include pagination
}
```

#### **2.4 Update Admin Properties API** *(app/api/admin/properties/[id]/route.js)*
```javascript
// PUT /api/admin/properties/[id]/commission - Update commission status
export async function PUT(req, { params }) {
  // Implementation:
  // - Admin only
  // - Mark commission as paid
  // - Update property commission status
  // - Update partner's earnings
  // - Create transaction record
}
```

---

### **Phase 3: Partner UI Components** *(3 hours)*

#### **3.1 Partner Properties Page** *(app/(dashboard)/partner/properties/page.jsx)*
```jsx
// Features:
// - Property grid with cards
// - Filter by status (All, Pending, Approved, Rejected, Sold)
// - Search functionality
// - Property actions (Edit, Archive, Boost)
// - Commission status indicators
// - Pagination
// - Quick stats (Total properties, Total earnings, Pending approvals)
```

#### **3.2 Partner Earnings Page** *(app/(dashboard)/partner/earnings/page.jsx)*
```jsx
// Features:
// - Earnings dashboard with key metrics
// - Total earnings, Available balance, Pending withdrawals
// - Earnings chart (last 6 months)
// - Recent transactions table
// - Withdrawal button
// - Commission breakdown by property
```

#### **3.3 Partner Withdrawal Modal** *(app/components/PartnerWithdrawalModal.jsx)*
```jsx
// Features:
// - Withdrawal form
// - Available balance display
// - Minimum withdrawal validation (₹100)
// - Bank details input
// - Withdrawal history link
// - Confirmation dialog
```

#### **3.4 Partner Property Card** *(app/components/PartnerPropertyCard.jsx)*
```jsx
// Features:
// - Property image thumbnail
// - Property details (title, price, location)
// - Status badge
// - Commission amount
// - Commission status
// - Quick actions (Edit, View, Archive)
// - Views and inquiries count
```

---

### **Phase 4: Partner Business Logic** *(2 hours)*

#### **4.1 Commission Calculation Service** *(app/lib/services/commissionService.js)*
```javascript
// Functions:
// - calculateCommission(propertyPrice): Calculate 90% commission
// - updatePartnerEarnings(partnerId, amount): Update partner's total earnings
// - processWithdrawal(withdrawalId): Process withdrawal request
// - getPartnerEarningsSummary(partnerId): Get earnings summary
// - getEarningsHistory(partnerId): Get detailed earnings history
```

#### **4.2 Partner Property Service** *(app/lib/services/partnerPropertyService.js)*
```javascript
// Functions:
// - getPartnerProperties(partnerId, filters): Get partner's properties
// - createPartnerProperty(partnerId, propertyData): Create property
// - updatePropertyCommission(propertyId): Update commission status
// - archivePartnerProperty(propertyId): Archive property
// - getPropertyCommission(propertyId): Get commission details
```

#### **4.3 Withdrawal Processing Service** *(app/lib/services/withdrawalService.js)*
```javascript
// Functions:
// - createWithdrawalRequest(partnerId, amount, bankDetails): Create request
// - processWithdrawal(withdrawalId, adminId): Process withdrawal
// - rejectWithdrawal(withdrawalId, adminId, reason): Reject request
// - getWithdrawalHistory(partnerId): Get history
// - validateWithdrawalAmount(partnerId, amount): Validate amount
```

---

### **Phase 5: Admin Integration** *(1 hour)*

#### **5.1 Admin Withdrawal Management** *(app/(dashboard)/admin/withdrawals/page.jsx)*
```jsx
// Features:
// - Withdrawal requests table
// - Filter by status
// - Approve/Reject actions
// - Partner details
// - Amount and bank details
// - Processing history
```

#### **5.2 Admin Partner Management** *(Update app/(dashboard)/admin/users/page.jsx)*
```jsx
// Features:
// - Partner role filter
// - Partner earnings column
// - RERA number display
// - Commission rate editing
// - Partner status management
```

#### **5.3 Admin Property Commission Management** *(Update app/(dashboard)/admin/properties/[id]/page.jsx)*
```jsx
// Features:
// - Commission status indicator
// - Mark commission as paid button
// - Commission amount display
// - Partner earnings update
// - Transaction recording
```

---

### **Phase 6: Testing & Validation** *(1 hour)*

#### **6.1 Unit Testing**
- Test commission calculation logic
- Test withdrawal validation
- Test API endpoints
- Test database operations

#### **6.2 Integration Testing**
- Test partner property creation flow
- Test commission tracking flow
- Test withdrawal request flow
- Test admin approval flow

#### **6.3 UI Testing**
- Test partner dashboard navigation
- Test properties page functionality
- Test earnings page functionality
- Test withdrawal modal functionality

---

## 📅 Implementation Timeline (Today)

| Phase | Task | Time Estimate | Priority |
|-------|------|---------------|----------|
| 1 | Database Schema Updates | 1 hour | High |
| 2 | Partner API Development | 2 hours | High |
| 3 | Partner UI Components | 3 hours | High |
| 4 | Business Logic Services | 2 hours | High |
| 5 | Admin Integration | 1 hour | Medium |
| 6 | Testing & Validation | 1 hour | High |

**Total Estimated Time:** 10 hours

---

## 🎯 Success Criteria (MVP)

### **Core Features**
- [ ] Partners can view and manage their properties
- [ ] Partners can see their earnings and commission details
- [ ] Partners can request withdrawals (minimum ₹100)
- [ ] Admins can process withdrawal requests
- [ ] Commission tracking works automatically (90% to partner)

### **Technical Requirements**
- [ ] All APIs are secure and authenticated
- [ ] Database operations are efficient
- [ ] Error handling is comprehensive
- [ ] UI is responsive and user-friendly
- [ ] Code follows existing patterns and conventions

### **Business Requirements**
- [ ] RERA numbers are assigned by DalalFree (no verification)
- [ ] 90/10 commission split is implemented
- [ ] Minimum withdrawal amount is ₹100
- [ ] Withdrawal processing is manual (admin approval)
- [ ] All partner features are accessible only to partner role

---

## 🔧 Technical Notes

### **Authentication**
- Use existing NextAuth.js session validation
- All partner endpoints require `role: "partner"` verification
- Admin endpoints require `role: "admin"` verification

### **Error Handling**
- Consistent error responses across all APIs
- Proper validation for all inputs
- Meaningful error messages for users
- Logging for debugging and auditing

### **Performance**
- Add appropriate database indexes
- Implement pagination for all lists
- Cache frequently accessed data
- Optimize image loading

### **Security**
- Validate all user inputs
- Sanitize database queries
- Use HTTPS for all requests
- Implement rate limiting where needed

---

## 📝 Next Steps

1. **Start with Phase 1**: Database schema updates
2. **Proceed to Phase 2**: Partner API development
3. **Continue with Phase 3**: Partner UI components
4. **Implement Phase 4**: Business logic services
5. **Add Phase 5**: Admin integration
6. **Complete Phase 6**: Testing and validation

**Note:** This plan focuses on the MVP requirements. Additional features can be added in future iterations based on business needs and user feedback.

---

## 👍 Implementation Checklist

- [ ] ✅ Create implementation_plan.md (This document)
- [ ] Update User model with partner fields
- [ ] Update Property model with commission fields
- [ ] Create Withdrawal model
- [ ] Create Partner Properties API
- [ ] Create Partner Earnings API
- [ ] Create Partner Withdrawal API
- [ ] Update Admin Properties API
- [ ] Create Partner Properties Page
- [ ] Create Partner Earnings Page
- [ ] Create Partner Withdrawal Modal
- [ ] Create Partner Property Card
- [ ] Create Commission Service
- [ ] Create Partner Property Service
- [ ] Create Withdrawal Service
- [ ] Create Admin Withdrawal Management
- [ ] Update Admin Partner Management
- [ ] Update Admin Property Commission Management
- [ ] Test all functionality
- [ ] Validate implementation

**Status:** Ready for implementation
**Next Action:** Start with Phase 1 - Database Schema Updates