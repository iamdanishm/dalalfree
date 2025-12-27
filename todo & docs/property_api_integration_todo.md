# Property Creation API Integration Plan

## Overview

Integrate the new `/api/properties/create` endpoint into the frontend wizard, including improved file structure organization by propertyId/userId.

## Phase 1: File Structure Improvement

### 1. Implement Improved File Organization

- [] **KYC Files:** Organize by `propertyId` (`uploads/properties/{propertyId}/kyc/documents/` and `uploads/properties/{propertyId}/kyc/videos/`) - **CHANGED: Now property-specific instead of user-specific**
- [] **Property Files:** Organize by `propertyId` (`uploads/properties/{propertyId}/images/` and `uploads/properties/{propertyId}/videos/`)
- [] Add `temp/` directory for temporary storage during creation
- [] Update database schema to support new URL formats
- [] Ensure backward compatibility with existing files

### 2. Update File Processing Logic

- [] **Reorder Operations:** Create property record first → get propertyId → save property files
- [] **KYC Processing:** Use `userId` immediately (available from authentication)
- [] **Property Processing:** Use `propertyId` after database insertion
- [] **Path Generation:** Update `path.join()` calls to include IDs
- [] Update file saving logic in `processImages()`, `processVideos()`, `processKycFiles()`

### 3. Update URL Generation

- [] **KYC URLs:** Generate `/uploads/properties/{propertyId}/kyc/documents/filename` format (corrected: property-specific, not user-specific)
- [] **Property URLs:** Generate `/uploads/properties/{propertyId}/images/filename` format
- [] **Database Storage:** Store complete URLs with IDs in path
- [] Update file metadata objects to include new URL formats

## Phase 2: API Integration Setup

### 4. Update API Helper Functions

- [] Modify `propertyHelpers.js` to use new API endpoint
- [] Update `transformPropertyDataForAPI()` to create FormData instead of JSON
- [] Remove dependency on `/api/properties/upload` endpoint
- [] Update file handling logic for multipart submission
- [] Update `addFilesToFormData()` to handle new file structure
- [] Add `createPropertyFormData()` function for direct API submission

### 5. Modify Wizard Submission Logic

- [] Update `page.jsx` `handleSubmit()` function
- [] Replace separate file upload logic with direct FormData submission
- [] Update error handling for new API response format
- [] Remove intermediate file upload steps
- [] Update loading states and user feedback

## Phase 3: Data Structure Alignment

### 6. Update File Data Structure

- [] Ensure file objects match API expectations
- [] Update file validation to match API requirements
- [] Maintain backward compatibility during transition
- [] Update file preview URLs in components

### 7. Component Updates

- [] Update `StepMediaUpload.jsx` to work with new upload flow
- [] Update `StepKycVerification.jsx` for new file handling
- [] Ensure file preview and management still works
- [] Update file removal logic to handle new paths

## Phase 4: Error Handling & Validation

### 8. Error Handling Enhancement

- [] Update error messages to match new API responses
- [] Add specific handling for file upload failures
- [] Implement retry logic for failed uploads
- [] Add better error reporting for partial failures

### 9. Validation Updates

- [] Update client-side validation to match API requirements
- [] Ensure file type/size limits match API constraints
- [] Add real-time validation feedback
- [] Update validation error display components

## Phase 5: Testing & Optimization

### 10. Testing Implementation

- [] Test complete property creation flow
- [] Verify file uploads work correctly
- [] Test error scenarios and edge cases
- [] Verify file organization by ID works properly (corrected: KYC files are property-specific)
- [] Test backward compatibility with existing files

### 11. Performance Optimization

- [] Implement loading states for large file uploads
- [] Add progress indicators for better UX
- [] Optimize file processing for better performance
- [] Add file compression/optimization if needed

## Technical Details

### File Path Changes

```javascript
// Current paths
uploads / properties / images / filename.jpg;
uploads / properties / videos / filename.mp4;
uploads / kyc / documents / filename.pdf;
uploads / kyc / videos / filename.mp4;

// New paths (property-specific KYC)
uploads / properties / { propertyId } / images / filename.jpg;
uploads / properties / { propertyId } / videos / filename.mp4;
uploads / properties / { propertyId } / kyc / documents / filename.pdf;
uploads / properties / { propertyId } / kyc / videos / filename.mp4;
```

### Operation Flow Changes

```javascript
// Current flow
1. Validate data
2. Process all files
3. Create property record
4. Return response

// New flow
1. Validate data
2. Create property record (get propertyId)
3. Process KYC files (use userId)
4. Process property files (use propertyId)
5. Update property with file URLs
6. Return response
```

### Dependencies

- Requires propertyId from database insertion
- Requires userId from authentication
- Must maintain file URL format compatibility
- Should support existing file access

## Risk Mitigation

- [] Test with sample data before full deployment
- [] Implement rollback plan for file structure changes
- [] Ensure existing files remain accessible
- [] Add migration script for existing files if needed

## Success Criteria

- [] All files upload successfully to new structure
- [] Property creation completes without errors
- [] File URLs are correctly generated and stored
- [] Existing functionality remains intact
- [] Performance is maintained or improved
