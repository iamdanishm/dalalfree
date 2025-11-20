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
- **Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "buyer"
}
```

- **Response:** `201 Created`

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
    "subscriptionStartDate": null,
    "subscriptionEndDate": null,
    "freeTrialUsed": false,
    "freeTrialStartDate": null,
    "freeTrialEndDate": "2025-12-20T18:17:00.000Z",
    "adUnlockCredits": 5
  }
}
```

- **Error Response:** `400 Bad Request`

```json
{
  "error": "Missing required fields",
  "required": ["name", "email", "password"],
  "missing": ["email"]
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
- **Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

- **Response:** `200 OK`

```json
{
  "message": "Login successful",
  "user": {
    "id": "_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "accountStatus": "active",
    "isVerified": false,
    "subscriptionStatus": "free_trial",
    "subscriptionStartDate": null,
    "subscriptionEndDate": null,
    "freeTrialUsed": false,
    "freeTrialStartDate": null,
    "freeTrialEndDate": "2025-12-20T18:17:00.000Z",
    "adUnlockCredits": 5
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzMzc2ODBkZjk2Zjk2Zjk2ZjlmNTM3NjgiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYnV5ZXIiLCJuYW1lIjoiSm9obiBEb2UifQ.X1Z2Z3Z4Z5Z6Z7Z8Z9Z0Za1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
}
```

- **Error Response:** `401 Unauthorized`

```json
{
  "error": "Invalid credentials."
}
```

### GET `/api/users/profile`

- **Purpose:** Get complete authenticated user profile with subscription data
- **Auth:** Required
- **Response:** `200 OK`

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
    "accountStatusReason": null,
    "isVerified": false,
    "reraNumber": null,
    "subscriptionStatus": "free_trial",
    "subscriptionStartDate": null,
    "subscriptionEndDate": null,
    "freeTrialUsed": false,
    "freeTrialStartDate": null,
    "freeTrialEndDate": "2025-12-20T18:17:00.000Z",
    "adUnlockCredits": 5,
    "createdAt": "2025-11-20T18:17:00.000Z",
    "updatedAt": "2025-11-20T18:17:00.000Z"
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
- **Response:** `200 OK`

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
      "freeTrialEndDate": "2025-12-20T18:17:00.000Z",
      "adUnlockCredits": 5,
      "createdAt": "2025-11-20T18:17:00.000Z",
      "updatedAt": "2025-11-20T18:17:00.000Z"
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

## KYC (Know Your Customer)

### KYC Conversion Flow

1. **Buyer registers** → Auto free trial
2. **Buyer wants to sell** → Apply for KYC
3. **KYC approved** → Role becomes `seller`
4. **Seller status** → Can now list properties

### GET `/api/kyc/convert`

- **Purpose:** Check if buyer can convert to seller
- **Auth:** Required
- **Response:** `200 OK`

```json
{
  "canConvert": true,
  "currentRole": "buyer",
  "isVerified": false
}
```

### POST `/api/kyc/convert`

- **Purpose:** Convert buyer to seller via KYC verification
- **Auth:** Required
- **Response:** `200 OK`

```json
{
  "message": "Successfully converted buyer to seller",
  "user": {
    "id": "_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "seller",
    "accountStatus": "active",
    "isVerified": true,
    "subscriptionStatus": "free_trial",
    "subscriptionStartDate": null,
    "subscriptionEndDate": null,
    "freeTrialUsed": false,
    "freeTrialStartDate": null,
    "freeTrialEndDate": "2025-12-20T18:17:00.000Z",
    "adUnlockCredits": 5
  }
}
```

- **Error Response:** `400 Bad Request`

```json
{
  "error": "Only buyers can convert to sellers"
}
```

### GET `/api/kyc`

- **Purpose:** Get logged-in user's KYC status
- **Auth:** Required
- **Response:** `200 OK`

```json
{
  "_id": "_id",
  "userId": "_id",
  "aadhaarPhoto": "https://example.com/aadhaar.jpg",
  "agreementPhoto": "https://example.com/agreement.jpg",
  "videoUrl": "https://example.com/video.mp4",
  "status": "pending",
  "reviewedBy": null,
  "reviewedAt": null,
  "remarks": null,
  "rejectionReason": null,
  "createdAt": "2025-11-20T18:17:00.000Z",
  "updatedAt": "2025-11-20T18:17:00.000Z"
}
```

**Empty Response (not submitted):** `{}`

### POST `/api/kyc`

- **Purpose:** Submit new KYC application
- **Auth:** Required
- **Request Body:**

```json
{
  "aadhaarPhoto": "https://example.com/aadhaar.jpg",
  "agreementPhoto": "https://example.com/agreement.jpg",
  "videoUrl": "https://example.com/video.mp4"
}
```

- **Response:** `201 Created`

```json
{
  "_id": "_id",
  "userId": "_id",
  "aadhaarPhoto": "https://example.com/aadhaar.jpg",
  "agreementPhoto": "https://example.com/agreement.jpg",
  "videoUrl": "https://example.com/video.mp4",
  "status": "pending",
  "reviewedBy": null,
  "reviewedAt": null,
  "remarks": null,
  "rejectionReason": null,
  "createdAt": "2025-11-20T18:17:00.000Z",
  "updatedAt": "2025-11-20T18:17:00.000Z"
}
```

- **Error Response:** `400 Bad Request`

```json
{
  "error": "Already submitted"
}
```

## Property Management APIs

### Public Property APIs

#### GET `/api/properties`

- **Purpose:** Get all properties (public view)
- **Auth:** Optional
- **Response:** `200 OK`

```json
[
  {
    "_id": "_id",
    "title": "Modern 2BHK Apartment",
    "description": "Beautiful apartment in prime location",
    "price": 2500000,
    "propertyType": "apartment",
    "category": "Residential",
    "location": {
      "address": "123 Main St, Mumbai",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "bedrooms": 2,
    "bathrooms": 2,
    "area": 1200,
    "verified": true,
    "featured": false,
    "status": "approved",
    "ownerId": {
      "_id": "_id",
      "name": "Property Owner",
      "email": "owner@example.com"
    },
    "createdAt": "2025-11-20T18:17:00.000Z",
    "updatedAt": "2025-11-20T18:17:00.000Z"
  }
]
```

#### GET `/api/properties/[id]`

- **Purpose:** Get single property details
- **Auth:** Optional
- **Response:** `200 OK`

```json
{
  "_id": "_id",
  "title": "Modern 2BHK Apartment",
  "description": "Beautiful apartment in prime location with amenities",
  "price": 2500000,
  "propertyType": "apartment",
  "category": "Residential",
  "location": {
    "address": "123 Main St, Mumbai",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "bedrooms": 2,
  "bathrooms": 2,
  "area": 1200,
  "verified": true,
  "featured": false,
  "status": "approved",
  "ownerId": {
    "_id": "_id",
    "name": "Property Owner",
    "email": "owner@example.com"
  },
  "createdAt": "2025-11-20T18:17:00.000Z",
  "updatedAt": "2025-11-20T18:17:00.000Z"
}
```

- **Error Response:** `404 Not Found`

```json
{
  "error": "Not found"
}
```

#### POST `/api/properties`

- **Purpose:** Create new property listing
- **Auth:** Required (Partners only)
- **Request Body:**

```json
{
  "title": "Modern 2BHK Apartment",
  "description": "Beautiful apartment in prime location with amenities",
  "price": 2500000,
  "propertyType": "apartment",
  "category": "Residential",
  "location": {
    "address": "123 Main St, Mumbai",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "bedrooms": 2,
  "bathrooms": 2,
  "area": 1200
}
```

- **Response:** `201 Created`

```json
{
  "_id": "_id",
  "title": "Modern 2BHK Apartment",
  "description": "Beautiful apartment in prime location with amenities",
  "price": 2500000,
  "propertyType": "apartment",
  "category": "Residential",
  "location": {
    "address": "123 Main St, Mumbai",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "bedrooms": 2,
  "bathrooms": 2,
  "area": 1200,
  "verified": true,
  "featured": false,
  "status": "pending",
  "ownerId": "_id",
  "createdAt": "2025-11-20T18:17:00.000Z",
  "updatedAt": "2025-11-20T18:17:00.000Z"
}
```

- **Error Response:** `403 Forbidden`

```json
{
  "error": "Only partners can list properties"
}
```

#### PUT `/api/properties/[id]`

- **Purpose:** Update property listing
- **Auth:** Required (Owner or Admin)
- **Request Body:**

```json
{
  "title": "Updated Property Title",
  "price": 2800000,
  "description": "Updated description",
  "featured": true
}
```

- **Response:** `200 OK`

```json
{
  "_id": "_id",
  "title": "Updated Property Title",
  "description": "Updated description",
  "price": 2800000,
  "propertyType": "apartment",
  "category": "Residential",
  "location": {
    "address": "123 Main St, Mumbai",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "bedrooms": 2,
  "bathrooms": 2,
  "area": 1200,
  "verified": true,
  "featured": true,
  "status": "pending",
  "ownerId": "_id",
  "createdAt": "2025-11-20T18:17:00.000Z",
  "updatedAt": "2025-11-20T18:17:00.000Z"
}
```

- **Error Response:** `403 Forbidden`

```json
{
  "error": "Forbidden"
}
```

#### DELETE `/api/properties/[id]`

- **Purpose:** Delete property listing
- **Auth:** Required (Owner or Admin)
- **Response:** `200 OK`

```json
{
  "success": true
}
```

- **Error Response:** `403 Forbidden`

```json
{
  "error": "Forbidden"
}
```

#### GET `/api/properties/daily-chart`

- **Purpose:** Get property addition statistics for charts
- **Auth:** Required (Admin only)
- **Response:** `200 OK`

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
- **Auth:** Required (Admin only)
- **Query Params:**
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 10)
  - `role` (string): Filter by user role
  - `status` (string): Filter by account status
  - `search` (string): Search in name, email, phone
- **Response:** `200 OK`

```json
{
  "users": [
    {
      "_id": "_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "Buyer",
      "isSubAdmin": false,
      "accountStatus": "Active",
      "accountStatusReason": null,
      "reraNumber": null,
      "isVerified": false,
      "createdAt": "2025-11-20T18:17:00.000Z",
      "status": "Active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 47,
    "pages": 5
  }
}
```

### POST `/api/admin/users`

- **Purpose:** Admin create user with any role
- **Auth:** Required (Admin only)
- **Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "phone": "+1234567890",
  "role": "buyer"
}
```

- **Response:** `201 Created`

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
    "createdAt": "2025-11-20T18:17:00.000Z"
  },
  "message": "User created successfully as buyer"
}
```

- **Error Response:** `400 Bad Request`

```json
{
  "error": "Missing required fields",
  "required": ["name", "email", "password"],
  "missing": ["name"]
}
```

## Analytics APIs

### GET `/api/admin/users/analytics`

- **Purpose:** Dashboard metrics and user statistics
- **Auth:** Required (Admin only)
- **Response:** `200 OK`

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
- **Auth:** Required (Admin only)
- **Query Params:** `status`, `page`, `limit`
- **Response:** `200 OK`

```json
{
  "kycs": [
    {
      "_id": "_id",
      "userId": "_id",
      "aadhaarPhoto": "https://example.com/aadhaar.jpg",
      "agreementPhoto": "https://example.com/agreement.jpg",
      "videoUrl": "https://example.com/video.mp4",
      "status": "pending",
      "reviewedBy": null,
      "reviewedAt": null,
      "remarks": null,
      "rejectionReason": null,
      "createdAt": "2025-11-20T18:17:00.000Z",
      "updatedAt": "2025-11-20T18:17:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 23,
    "pages": 3
  }
}
```

### PUT `/api/admin/kyc/[id]`

- **Purpose:** Approve/reject KYC submission
- **Auth:** Required (Admin)
- **Request Body:**

```json
{
  "status": "approved",
  "remarks": "All documents verified successfully"
}
```

- **Response:** `200 OK`

```json
{
  "kyc": {
    "_id": "_id",
    "userId": "_id",
    "aadhaarPhoto": "https://example.com/aadhaar.jpg",
    "agreementPhoto": "https://example.com/agreement.jpg",
    "videoUrl": "https://example.com/video.mp4",
    "status": "approved",
    "reviewedBy": "_admin_id",
    "reviewedAt": "2025-11-20T18:17:00.000Z",
    "remarks": "All documents verified successfully",
    "rejectionReason": null,
    "createdAt": "2025-11-20T18:17:00.000Z",
    "updatedAt": "2025-11-20T18:17:00.000Z"
  },
  "message": "KYC approved successfully"
}
```

### GET `/api/admin/kyc/[id]`

- **Purpose:** Get detailed KYC info
- **Auth:** Required (Admin)
- **Response:** `200 OK`

```json
{
  "kyc": {
    "user": {
      "_id": "_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "buyer"
    },
    "kyc": {
      "_id": "_id",
      "userId": "_id",
      "aadhaarPhoto": "https://example.com/aadhaar.jpg",
      "agreementPhoto": "https://example.com/agreement.jpg",
      "videoUrl": "https://example.com/video.mp4",
      "status": "pending",
      "reviewedBy": null,
      "reviewedAt": null,
      "remarks": null,
      "rejectionReason": null,
      "createdAt": "2025-11-20T18:17:00.000Z",
      "updatedAt": "2025-11-20T18:17:00.000Z"
    },
    "reviewer": null
  }
}
```

## Property Management APIs

### GET `/api/admin/properties`

- **Purpose:** Admin property listing with filters
- **Auth:** Required (Admin only)
- **Query Params:** `status`, `verified`, `featured`, `page`, `limit`
- **Response:** `200 OK`

```json
{
  "properties": [
    {
      "_id": "_id",
      "title": "Modern 2BHK Apartment",
      "description": "Beautiful apartment in prime location",
      "price": 2500000,
      "propertyType": "apartment",
      "category": "Residential",
      "verified": true,
      "featured": false,
      "status": "approved",
      "ownerId": {
        "_id": "_id",
        "name": "Property Owner",
        "email": "owner@example.com"
      },
      "createdAt": "2025-11-20T18:17:00.000Z",
      "updatedAt": "2025-11-20T18:17:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1284,
    "pages": 129
  }
}
```

### PUT `/api/admin/properties/[id]`

- **Purpose:** Multi-purpose property actions
- **Auth:** Required (Admin)
- **Request Body:**

```json
{
  "action": "approve",
  "reason": "All documents verified"
}
```

- **Available Actions:**
  - `approve`: Set status to "approved"
  - `reject`: Set status to "rejected" with reason
  - `verify`: Toggle verified status
  - `feature`: Toggle featured status
  - `boost`: Toggle boosted status
- **Response:** `200 OK`

```json
{
  "_id": "_id",
  "title": "Modern 2BHK Apartment",
  "description": "Beautiful apartment in prime location",
  "price": 2500000,
  "propertyType": "apartment",
  "category": "Residential",
  "verified": true,
  "featured": true,
  "status": "approved",
  "ownerId": "_id",
  "createdAt": "2025-11-20T18:17:00.000Z",
  "updatedAt": "2025-11-20T18:17:00.000Z"
}
```

### DELETE `/api/admin/properties/[id]`

- **Purpose:** Hard delete property with audit
- **Auth:** Required (Admin)
- **Request Body:**

```json
{
  "reason": "Property violates community guidelines"
}
```

- **Response:** `200 OK`

```json
{
  "success": true,
  "message": "Property deleted successfully",
  "property": {
    "_id": "_id",
    "title": "Modern 2BHK Apartment",
    "deletedAt": "2025-11-20T18:17:00.000Z",
    "deletedReason": "Property violates community guidelines"
  }
}
```

### GET `/api/admin/properties/analytics`

- **Purpose:** Property statistics for dashboard
- **Auth:** Required (Admin only)
- **Response:** `200 OK`

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
