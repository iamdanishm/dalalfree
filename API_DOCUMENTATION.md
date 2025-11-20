# 📚 DalalFree API Documentation

## User Roles & Subscription System

### User Roles

DalalFree implements a comprehensive role-based system supporting the business workflow:

| **Role**    | **Purpose**       | **Registration**     | **Features**                             |
| ----------- | ----------------- | -------------------- | ---------------------------------------- |
| `buyer`     | Property browsers | Default registration | Free trial, ad unlocks, property search  |
| `seller`    | Property listers  | Via KYC conversion   | Property listings, seller dashboard      |
| `partner`   | RERA agents       | Manual registration  | Commission sharing, dedicated properties |
| `sub-admin` | Limited admins    | Admin creation       | User management (limited)                |
| `admin`     | Full admins       | System created       | Complete platform control                |

### Subscription System for Buyers

New buyers automatically receive subscription benefits:

**Default Buyer Subscription:**

- **Status:** `free_trial` (30 days)
- **Ad Unlock Credits:** 5 free credits
- **Expiration:** 30 days from registration
- **Upgrade Path:** KYC → Become seller

**Subscription Statuses:**

- `free_trial`: Active trial period
- `active`: Paid subscription
- `expired`: Trial/subscription ended
- `cancelled`: User cancelled
- `none`: No subscription (sellers/partners)

## Authentication APIs

### POST `/api/auth/register`

- **Purpose:** User registration with role assignment
- **Body:** `{ name, email, password, role: "buyer"|"partner" }`
- **Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "accountStatus": "active",
    "isVerified": false,
    "subscriptionStatus": "free_trial",
    "freeTrialEndDate": "2025-12-19T16:47:39.000Z",
    "adUnlockCredits": 5
  }
}
```

### POST `/api/auth/login`

- **Purpose:** User authentication with subscription data
- **Body:** `{ email, password }`
- **Response:**

```json
{
  "message": "Login successful",
  "user": {
    "id": "_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "isVerified": false,
    "subscriptionStatus": "free_trial",
    "freeTrialEndDate": "2025-12-19T16:47:39.000Z",
    "adUnlockCredits": 5
  }
}
```

### GET `/api/users/profile`

- **Purpose:** Get complete user profile with subscription data
- **Auth:** Required
- **Response:**

```json
{
  "success": true,
  "user": {
    "id": "_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "phone": null,
    "accountStatus": "active",
    "isVerified": false,
    "reraNumber": null,
    "subscriptionStatus": "free_trial",
    "subscriptionStartDate": null,
    "subscriptionEndDate": null,
    "freeTrialUsed": false,
    "freeTrialStartDate": null,
    "freeTrialEndDate": "2025-12-19T16:47:39.000Z",
    "adUnlockCredits": 5,
    "createdAt": "2025-11-19T16:47:39.000Z"
  }
}
```

### POST `/api/kyc/convert`

- **Purpose:** Convert buyer to seller via KYC verification
- **Auth:** Required
- **Response:**

```json
{
  "message": "Successfully converted buyer to seller",
  "user": {
    "id": "_id",
    "role": "seller",
    "isVerified": true,
    "subscriptionStatus": "free_trial"
  }
}
```

## User Management APIs

### GET `/api/users`

- **Purpose:** Get paginated list of users with subscription data
- **Auth:** Optional (admin recommended)
- **Query Params:**
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 10)
  - `role` (string): Filter by user role (`buyer`, `seller`, `partner`, `admin`, `sub-admin`)
  - `status` (string): Filter by account status (`active`, `suspended`, `pending`)
  - `search` (string): Search in name or email (case-insensitive)
- **Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "buyer",
      "phone": "+1234567890",
      "accountStatus": "active",
      "isVerified": false,
      "reraNumber": null,
      "subscriptionStatus": "free_trial",
      "subscriptionStartDate": null,
      "subscriptionEndDate": null,
      "freeTrialUsed": false,
      "freeTrialStartDate": null,
      "freeTrialEndDate": "2025-12-19T16:47:39.000Z",
      "adUnlockCredits": 5,
      "createdAt": "2025-11-19T16:47:39.000Z",
      "updatedAt": "2025-11-19T16:47:39.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalUsers": 47,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### POST `/api/users`

- **Purpose:** Create new user with auto-subscription setup
- **Body:** `{ name, email, password, phone?, role? }`
- **Default Role:** `buyer` (includes free trial)
- **Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "accountStatus": "active",
    "subscriptionStatus": "free_trial",
    "freeTrialEndDate": "2025-12-19T16:47:39.000Z",
    "adUnlockCredits": 5,
    "createdAt": "2025-11-19T16:47:39.000Z"
  }
}
```

### GET `/api/users/profile`

- **Purpose:** Get complete authenticated user profile
- **Auth:** Required
- **Response:** Full user object with all subscription data (see above example)

## KYC (Know Your Customer)

### KYC Conversion Flow

1. **Buyer registers** → Auto free trial
2. **Buyer wants to sell** → Apply for KYC
3. **KYC approved** → Role becomes `seller`
4. **Seller status** → Can now list properties

### POST `/api/kyc/convert`

- **Purpose:** Convert buyer to seller via KYC approval
- **Auth:** Required
- **Response:** Updated user with seller role and subscription data

### GET `/api/kyc/convert`

- **Purpose:** Check if buyer can convert to seller
- **Auth:** Required
- **Response:**

```json
{
  "canConvert": true,
  "currentRole": "buyer",
  "isVerified": false
}
```

## Admin API Documentation

## User Management APIs

### GET `/api/admin/users`

- **Purpose:** Get paginated list of users with filters
- **Query Params:**
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 10)
  - `role` (string): Filter by user role
  - `status` (string): Filter by account status
  - `search` (string): Search in name, email, phone
- **Response:** `{ users: [...], pagination: {...} }`
- **UI Mapping:**
  - `users[].role`: Maps "user" → "Buyer", "partner" → "Partner", "admin" → "Admin"
  - `users[].status`: Capitalizes accountStatus ("active" → "Active")

### POST `/api/admin/users/sub-admin`

- **Purpose:** Create new sub-admin user
- **Body:** `{ name, email, password, phone }`
- **Response:** `{ user: {...}, message }`

### PUT `/api/admin/users/[id]`

- **Purpose:** Update user account details
- **Body:** `{ role?, accountStatus?, accountStatusReason?, isSubAdmin? }`
- **Response:** `{ user, message: "User updated successfully" }`

### DELETE `/api/admin/users/[id]`

- **Purpose:** Soft delete user (suspend account)
- **Body:** `{ reason }`
- **Response:** `{ success: true, message, user }`

## Analytics APIs

### GET `/api/admin/users/analytics`

- **Purpose:** Dashboard metrics and user statistics
- **Response:**

```json
{
  "metrics": [
    {
      "title": "Total Users",
      "value": "123",
      "change": "+12%",
      "positive": true
    },
    {
      "title": "Active Properties",
      "value": "456",
      "change": "+8%",
      "positive": true
    },
    {
      "title": "Pending KYC",
      "value": "23",
      "change": "-5%",
      "positive": false
    },
    {
      "title": "Monthly Revenue",
      "value": "$12,450",
      "change": "+18%",
      "positive": true
    }
  ],
  "detailedStats": {
    /* full breakdown */
  }
}
```

## KYC Management APIs

### GET `/api/admin/kyc`

- **Purpose:** Get paginated KYC applications
- **Query Params:** `status`, `page`, `limit`
- **Response:** `{ kycs: [...], pagination }`

### PUT `/api/admin/kyc/[id]`

- **Purpose:** Approve/reject KYC submission
- **Body:** `{ status: "approved"|"rejected", remarks?, rejectionReason? }`
- **Response:** `{ kyc, message }`

### GET `/api/admin/kyc/[id]`

- **Purpose:** Get detailed KYC info
- **Response:** `{ kyc: { user data, kyc data, reviewer data } }`

## Property Management APIs

### GET `/api/admin/properties`

- **Purpose:** Admin property listing with filters
- **Query Params:** `status`, `verified`, `featured`, `page`, `limit`
- **Response:** `{ properties: [...], pagination }`

### PUT `/api/admin/properties/[id]`

- **Purpose:** Multi-purpose property actions
- **Body:** `{ action: "approve"|"reject"|"verify"|"feature"|"boost", ...data }`
- **Actions:**
  - `approve`: Set status to "approved"
  - `reject`: Set status to "rejected" with reason
  - `verify`: Toggle verified status
  - `feature`: Toggle featured status
  - `boost`: Toggle boosted status

### DELETE `/api/admin/properties/[id]`

- **Purpose:** Hard delete property with audit
- **Body:** `{ reason }`

### POST `/api/admin/properties/analytics`

- **Purpose:** Property statistics for dashboard
- **Response:**

```json
{
  "propertyStats": [
    { "type": "Residential", "count": 856, "percentage": 65 },
    { "type": "Commercial", "count": 234, "percentage": 18 },
    { "type": "Industrial", "count": 89, "percentage": 7 },
    { "type": "Land", "count": 135, "percentage": 10 }
  ]
}
```

## Data Structure Compatibility ✅ Verified

| **UI Component**   | **Database Field**          | **API Field**     | **Status** |
| ------------------ | --------------------------- | ----------------- | ---------- |
| User Table Role    | `role: "user"`              | `"Buyer"`         | ✅ Fixed   |
| User Table Status  | `accountStatus: "active"`   | `"Active"`        | ✅ Fixed   |
| Metrics Cards      | User/Property/KYC Analytics | `metrics[]`       | ✅ Fixed   |
| Property Chart     | `category: "Residential"`   | `propertyStats[]` | ✅ Fixed   |
| Recent Users Table | User Collection + Mappings  | Formatted users   | ✅ Ready   |
| Quick Actions      | Static links                | Need UI routing   | 📋 TODO    |

## Database Indices Added ✅

- **User**: role, accountStatus, createdAt
- **Property**: status, verified, featured, propertyType, category, ownerId
- **KYC**: status, userId, approvalLevel, reviewedBy

## Validation Status ✅ All APIs Tested

- ✅ User creation/updates with proper RERA validation for partners
- ✅ Property status workflows (pending → approved/rejected)
- ✅ KYC approval updates user verification status
- ✅ Soft delete instead of hard delete for audit compliance
- ✅ Role-based access control in all admin endpoints
- ✅ Paginated responses for performance
- ✅ Cross-entity data population (populate user, admin references)
