# 📚 DalalFree API Documentation

## Table of Contents

- [User Roles & Subscription System](#user-roles--subscription-system)
- [Authentication APIs](#authentication-apis)
- [User Management APIs](#user-management-apis)
- [KYC (Know Your Customer) APIs](#kyc-know-your-customer-apis)
- [Property Management APIs](#property-management-apis)
- [Admin APIs](#admin-api-documentation)

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
- `none`: No subscription (sellers/partners/admins)

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

## JWT Authentication

DalalFree APIs support JWT (JSON Web Token) authentication for external API testing and integration. Use Bearer token authentication for secure API access:

### 🔑 **Authentication Flow**

1. **Login** to get JWT token
2. **Use token** in Authorization header
3. **Token expires** after 7 days

### 📋 **Using JWT Tokens**

**Postman Setup:**

- Select **"Bearer Token"** auth type
- Paste JWT token (received from login response)

**API Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Example Request:**

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/users/profile
```

### 📝 **Auth Required Endpoints**

All endpoints marked **"Auth: Required"** support JWT authentication:

- `GET /api/users/profile`
- `POST /api/properties`
- `PUT /api/properties/[id]`
- All admin endpoints
- All KYC endpoints

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
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
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

#### POST `/api/admin/users`

- **Purpose:** Admin create user with any role
- **Auth:** Required (Admin only)
- **Body:** `{ name, email, password, phone?, role?: "buyer"|"seller"|"partner"|"admin"|"sub-admin" }`
- **Default Role:** `buyer`
- **Response:**

```json
{
  "user": {
    "id": "_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "phone": "+1234567890",
    "accountStatus": "active",
    "isVerified": false,
    "isSubAdmin": false,
    "createdAt": "2025-11-19T16:47:39.000Z"
  },
  "message": "User created successfully as buyer"
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

### GET `/api/kyc`

- **Purpose:** Get logged-in user's KYC status
- **Auth:** Required
- **Response:** User's KYC data or empty object if not submitted

### POST `/api/kyc`

- **Purpose:** Submit new KYC application
- **Auth:** Required
- **Body:** `{ aadhaarPhoto, agreementPhoto, videoUrl }`
- **Response:** Created KYC submission object

### PUT `/api/kyc/[id]`

- **Purpose:** Update KYC status (Admin only)
- **Auth:** Required (Admin)
- **Body:** `{ status, remarks }`
- **Response:** Updated KYC object

## Property Management APIs

### Public Property APIs

#### GET `/api/properties`

- **Purpose:** Get all properties (public view)
- **Auth:** Optional
- **Response:** Array of property objects

#### GET `/api/properties/[id]`

- **Purpose:** Get single property details
- **Auth:** Optional
- **Response:** Property object with full details

#### POST `/api/properties`

- **Purpose:** Create new property listing
- **Auth:** Required (Partners only)
- **Body:** Full property data object
- **Response:** Created property object

#### PUT `/api/properties/[id]`

- **Purpose:** Update property listing
- **Auth:** Required (Owner or Admin)
- **Body:** Updated property data
- **Response:** Updated property object

#### DELETE `/api/properties/[id]`

- **Purpose:** Delete property listing
- **Auth:** Required (Owner or Admin)
- **Response:** Success confirmation

#### GET `/api/properties/daily-chart`

- **Purpose:** Get property addition statistics for charts
- **Auth:** Required (Admin only)
- **Response:**

```json
{
  "data": [0, 2, 1, 3, 0, 1, 0],
  "labels": [
    "7 days ago",
    "6 days ago",
    "5 days ago",
    "4 days ago",
    "3 days ago",
    "2 days ago",
    "Yesterday"
  ],
  "total": 7
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

### GET `/api/admin/properties/analytics`

- **Purpose:** Property statistics for dashboard
- **Response:**

```json
{
  "total": 1284,
  "byStatus": {
    "pending": 45,
    "approved": 1200,
    "rejected": 39,
    "active": 1200
  },
  "byVerification": {
    "verified": 1100,
    "notVerified": 84
  },
  "featured": 156,
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
