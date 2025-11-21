# DalalFree Admin-First Development Roadmap

**Current Status: 75-80% Complete**
**Start Date:** November 19, 2025
**Updated:** November 20, 2025 - Code Audit Complete: Individual CRUD ✅, Bulk Ops ❌ (Missing)

## 📋 Project Overview

DalalFree is a real estate platform with 4 main roles:

- **Admin**: Manage platform operations
- **Buyer**: Search properties, contact sellers
- **Seller**: List properties, manage sales
- **Partner**: Real estate agents with commission-based earnings

This roadmap focuses on **Admin role completion first** as it provides the foundation for all other roles.

---

## Phase 1A: Enhanced Database Models & Schema (Days 1-2)

### 1. User Model Extensions

**Status:** Completed | **Priority:** High

- [x] Add RERA number field for partners (String, required)
- [x] Add subAdmin boolean field for admin hierarchy
- [x] Add accountStatus enum: "active", "suspended", "pending"
- [x] Add accountStatusReason string for status changes
- [x] Add registrationDate field (track onboarding)
- [x] Update validation schemas and middleware
- [x] Add indexes for role and status fields
- [x] Test model with dummy data

### 2. Property Model Extensions

**Status:** Completed | **Priority:** High

- [x] Add featured boolean (paid featured listings)
- [x] Add boosted boolean (temporary promotion)
- [x] Add approvedBy ObjectId ref to admin User
- [x] Add approvalDate timestamp
- [x] Add rejectionReason string
- [x] Extend status enum: "pending", "approved", "rejected", "featured"
- [x] Add propertyType enum: "sell", "rent", "lease"
- [x] Add viewsCount, likesCount for analytics
- [x] Add companion photos array for property images

### 3. KYC Model Extensions

**Status:** Completed | **Priority:** High

- [x] Add reviewedBy ObjectId ref to admin User
- [x] Add reviewDate timestamp
- [x] Add rejectionReason string
- [x] Add documentUrls array for supporting docs
- [x] Add videoReviewTime integer (playback position)
- [x] Add approvalLevel enum: "basic", "premium", "partner"

---

## Phase 1B: Core APIs Development (Days 3-6)

### 4. User Management APIs

**Status:** Completed (Individual CRUD ✅, Bulk Operations ❌) | **Priority:** High

- [x] GET /api/admin/users - Paginated user list with filters
- [x] PUT /api/admin/users/[id] - Update role, status, account details
- [x] POST /api/admin/users/sub-admin - Create sub-admin users
- [x] DELETE /api/admin/users/[id] - Soft delete with audit trail
- [x] GET /api/admin/users/analytics - User stats (reg/chart, growth)
- [ ] PUT /api/admin/users/bulk-update - Bulk status updates

### 5. KYC Management APIs

**Status:** Completed (Basic CRUD ✅, Advanced Features ❌) | **Priority:** High

- [x] GET /api/admin/kyc - List KYC by status (pending/rejected/approved)
- [x] PUT /api/admin/kyc/[id] - Approve/reject with remarks
- [ ] GET /api/admin/kyc/[id]/video - Stream video for review
- [ ] POST /api/admin/kyc/[id]/remarks - Add review notes
- [x] GET /api/admin/kyc/analytics - KYC completion rates
- [ ] PUT /api/admin/kyc/bulk-review - Bulk approve/reject pending

### 6. Property Management APIs

**Status:** Completed (Individual Ops ✅, Bulk Operations ❌) | **Priority:** High

- [x] GET /api/admin/properties - Admin view with full details
- [x] PUT /api/admin/properties/[id]/verify - Toggle verified status
- [x] PUT /api/admin/properties/[id]/feature - Enable/disable featured
- [x] PUT /api/admin/properties/[id]/boost - Enable/disable boosted
- [x] DELETE /api/admin/properties/[id] - Hard delete with reason
- [x] GET /api/admin/properties/analytics - Property metrics
- [ ] PUT /api/admin/properties/bulk-approve - Bulk operations

---

## Phase 1C: Admin Dashboard UI (Days 7-10)

### 7. Real Data Integration

**Status:** ✅ Completed | **Priority:** Medium

- [x] Connect dashboard metrics to real API calls (/api/admin/users/analytics)
- [x] Implement analytics chart components (revenue, users, properties)
- [x] Real-time counters for KYC/property queues (polling every 30 seconds)
- [x] Dashboard auto-refresh with polling implementation
- [x] Error handling and loading states
- [x] Real user data from /api/admin/users API

### 8. Interactive Management Tables

**Status:** ✅ Completed | **Priority:** High

- [x] Users table with inline editing (role, status, actions)
- [x] KYC queue table with review buttons and preview
- [x] Properties approval queue with image gallery modal
- [x] Table pagination, sorting, and search filters

### 9. Admin Features Implementation

**Status:** Partially Completed (Search/Filter ✅, Rest ❌) | **Priority:** Medium

- [ ] Bulk operations for mass approvals/rejections
- [x] Search/filter functionality for all entities
- [ ] Export reports (CSV/Excel) for auditing
- [ ] Notification system for admin alerts
- [ ] Admin audit logs for all critical operations

---

## Dependencies & Prerequisites

### Database & Infrastructure

#### Setup MongoDB indexes for performance

- [ ] Create compound indexes for Users model: `role + accountStatus + registrationDate` (admin query optimization)
- [ ] Create compound indexes for Properties model: `status + propertyType + createdAt` (property management queries)
- [ ] Create compound indexes for KYC model: `status + approvalLevel + createdAt` (KYC workflow optimization)
- [ ] Add single-field indexes for common filters: `viewsCount`, `likesCount`, `featured`, `boosted`
- [ ] Implement database migration script for index creation
- [ ] Update connection configuration with indexing strategy

#### Configure local file storage for KYC videos/documents and property images/videos

- [ ] Install multer dependency for file handling middleware
- [ ] Create secure upload directory structure: `/uploads/kyc/videos/`, `/uploads/kyc/documents/`, `/uploads/properties/images/`, `/uploads/properties/videos/`, `/uploads/temp/`
- [ ] Implement file upload API route for KYC content with validation (max 50MB videos, 10MB docs)
- [ ] Implement file upload API route for property images/videos with validation (max 10MB images, 100MB videos)
- [ ] Add file type validation and security checks (MIME types, file signatures)
- [ ] Create secure file serving API with access control headers
- [ ] Implement file deletion and cleanup utilities for temp/expired files
- [ ] Add storage capacity monitoring and alerts

#### Setup email notification system

- [ ] Install nodemailer dependency for email functionality
- [ ] Create email service configuration for SMTP (VPS-compatible settings)
- [ ] Implement email templates for admin notifications: account approvals, property approvals, KYC status updates
- [ ] Create queue-based email system for bulk notifications
- [ ] Add email retry logic and error handling
- [ ] Configure email authentication and security settings

#### Configure role-based permissions middleware

- [ ] Implement JWT-based authentication middleware for API protection
- [ ] Create role hierarchy system: `superAdmin > admin > subAdmin`
- [ ] Add resource-level permissions for different operations
- [ ] Implement API endpoint access control based on user roles
- [ ] Add admin audit logging middleware for all critical operations
- [ ] Create permission validation helpers for frontend components

### Testing & QA

#### Unit tests for all API endpoints

- [ ] Install Jest and Testing Library dependencies for Next.js
- [ ] Create unit tests for admin user management APIs (`POST /api/admin/users`, `PUT /api/admin/users/[id]`)
- [ ] Create unit tests for KYC management APIs (`GET/POST/PUT /api/admin/kyc`, `PUT /api/admin/kyc/[id]`)
- [ ] Create unit tests for property management APIs (`GET/PUT/DELETE /api/admin/properties/[id]`)
- [ ] Create tests for file upload APIs with mocks
- [ ] Implement database mocking for isolated testing
- [ ] Add coverage reporting and CI/CD integration

#### Integration tests for admin workflows

- [ ] Create end-to-end admin login and dashboard access tests
- [ ] Implement bulk operations testing (mass user/property approvals)
- [ ] Test KYC video review and approval workflows
- [ ] Create property listing and management workflow tests
- [ ] Test email notification triggers on admin actions
- [ ] Implement performance testing for large dataset operations

#### Admin dashboard UI testing

- [ ] Set up component testing environment with React Testing Library
- [ ] Create tests for admin tables (UsersManagementTable, KycManagementTable, PropertiesManagementTable)
- [ ] Implement chart component tests (RevenueChart, PropertyStatsChart)
- [ ] Test admin form interactions and validation
- [ ] Add accessibility testing for admin components
- [ ] Create snapshot tests for UI consistency

#### Security testing for admin operations

- [ ] Implement API security tests for unauthorized access prevention
- [ ] Test file upload security (type validation, injection prevention)
- [ ] Create role-based access control testing across all admin endpoints
- [ ] Add input validation and sanitization tests
- [ ] Implement SQL injection and XSS prevention testing
- [ ] Test rate limiting and DDOS protection mechanisms

---

## Success Metrics

- [ ] All admin operations functional end-to-end
- [ ] Dashboard loads real data in <3 seconds
- [ ] Admin can process 100 users/properties per hour
- [ ] 0 critical bugs in admin workflow

---

## Next Phases Preview

### Phase 2A: Buyer Features

- Property search filters and sorting
- Subscription system with Razorpay
- Contact reveal with ad unlocks
- Wishlist and property comparison

### Phase 2B: Seller Features

- Direct property listing upload
- KYC verification flow for credibility
- Property boosting payment integration
- Performance analytics for listings

### Phase 2C: Partner Features

- RERA verification process
- Commission tracking and reporting
- Withdrawal request system
- Partnership management

---

_Auto-updated daily. Progress tracked with MCP tools._
