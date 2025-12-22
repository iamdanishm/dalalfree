# Property Creation API

Complete API endpoint for creating properties with all wizard data, file uploads, and KYC verification.

## Endpoint

```
POST /api/properties/create
```

## Authentication

Requires authentication via `requireAuth` middleware. User must be logged in (KYC approval not required upfront - KYC documents are submitted with the property).

## Request Format

**Content-Type:** `multipart/form-data`

The request uses FormData to handle both text data and file uploads.

### Text Fields

| Field              | Type        | Required | Description                                       |
| ------------------ | ----------- | -------- | ------------------------------------------------- |
| `title`            | string      | ✅       | Property title                                    |
| `description`      | string      | ✅       | Property description                              |
| `propertyType`     | string      | ✅       | "sell" or "rent"                                  |
| `category`         | string      | ✅       | "Residential", "Commercial", "Industrial", "Land" |
| `price`            | number      | ✅       | Property price                                    |
| `marketRange`      | string      | ❌       | Price range category                              |
| `negotiable`       | string      | ❌       | "Yes" or "No"                                     |
| `address`          | string      | ✅       | Full property address                             |
| `location`         | string      | ✅       | Area/locality                                     |
| `city`             | string      | ✅       | City name                                         |
| `state`            | string      | ✅       | State name                                        |
| `pincode`          | string      | ✅       | Pincode                                           |
| `coordinates`      | JSON string | ✅       | `{lat: number, lng: number}`                      |
| `bhk`              | string      | ✅\*     | BHK config (required for Residential)             |
| `bathrooms`        | number      | ❌       | Number of bathrooms                               |
| `balcony`          | number      | ❌       | Number of balconies                               |
| `furnishing`       | string      | ❌       | "furnished", "semi-furnished", "unfurnished"      |
| `builtUpArea`      | number      | ✅       | Built-up area in sq ft                            |
| `carpetArea`       | number      | ✅       | Carpet area in sq ft                              |
| `floor`            | string      | ✅       | Floor number (e.g., "3rd", "Ground")              |
| `totalFloors`      | number      | ❌       | Total floors in building                          |
| `age`              | number      | ✅       | Property age                                      |
| `ageUnit`          | string      | ❌       | "years old" or "months old"                       |
| `parking`          | string      | ✅       | Parking details                                   |
| `facing`           | string      | ✅       | Property facing direction                         |
| `possessionStatus` | string      | ✅       | Possession status                                 |
| `maintenance`      | string      | ❌       | Maintenance cost                                  |
| `highlights`       | JSON string | ❌       | Array of highlight strings                        |
| `societyAmenities` | JSON string | ❌       | Array of amenity IDs                              |
| `nearbyPlaces`     | JSON string | ❌       | Array of nearby place objects                     |

### File Fields

| Field      | Type   | Description                                    |
| ---------- | ------ | ---------------------------------------------- |
| `images`   | File[] | Property images (max 20, 10MB each)            |
| `videos`   | File[] | Property videos (max 5, 100MB each)            |
| `kycFiles` | File[] | KYC documents (Aadhaar, PAN, Agreement, Video) |

## Usage Example

```javascript
import {
  transformPropertyDataForAPI,
  addFilesToFormData,
} from "@/lib/propertyHelpers";

// Your form data from the wizard
const formData = {
  title: "Beautiful 3BHK Apartment",
  description: "Modern apartment with great amenities",
  propertyType: "sell",
  category: "Residential",
  price: 8500000,
  // ... other fields
  societyAmenities: ["24-7-security", "gym", "swimming-pool"],
  nearbyPlaces: [
    { type: "school", name: "City School", distance: "1", rating: 4.2 },
  ],
  coordinates: { lat: 18.5642, lng: 73.7769 },
};

// File objects
const files = {
  images: [file1, file2, file3],
  videos: [videoFile],
  kycFiles: {
    aadhaar: [aadhaarFront, aadhaarBack],
    pan: panFile,
    agreement: agreementFile,
    video: kycVideoFile,
  },
};

// Transform data
const apiData = transformPropertyDataForAPI(formData);
const finalFormData = addFilesToFormData(apiData, files);

// Submit to API
const response = await fetch("/api/properties/create", {
  method: "POST",
  body: finalFormData,
});

const result = await response.json();
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Property created successfully",
  "property": {
    "id": "property_id",
    "slug": "beautiful-3bhk-apartment-mumbai",
    "title": "Beautiful 3BHK Apartment",
    "status": "pending",
    "files": {
      "images": { "uploaded": 3, "failed": 0 },
      "videos": { "uploaded": 1, "failed": 0 },
      "kyc": { "uploaded": 4, "failed": 0 }
    }
  }
}
```

### Error Response

```json
{
  "error": "Validation failed",
  "details": {
    "title": "Title is required",
    "builtUpArea": "Built-up area must be a positive number",
    "coordinates": "Location coordinates are required"
  }
}
```

## Validation Rules

### Required Fields

- All basic information fields
- Location coordinates
- Property specifications (area, floor, age, etc.)
- At least one property image

### File Limits

- **Images:** Max 20 files, 10MB each
- **Videos:** Max 5 files, 100MB each
- **KYC Files:** Various limits per document type

### Business Rules

- User must be authenticated (KYC documents submitted with property)
- Residential properties require BHK specification
- Properties are created with "pending" status for admin approval
- Admin reviews both property details and KYC documents together

## Data Transformation

### Amenity Processing

- `societyAmenities` IDs are transformed into full amenity objects
- `nearbyPlaces` are converted to amenities.nearby format
- Both populate the `amenities` object for frontend display

### Slug Generation

- Automatic SEO-friendly slug generation from title
- Handles duplicates with incremental numbering

### File Processing

- Files are stored in organized directory structure
- Metadata includes upload timestamps and file information
- Automatic cleanup on processing failures

## Error Handling

### Validation Errors

- Missing required fields
- Invalid data types
- Business rule violations

### File Processing Errors

- File size/type violations
- Storage failures
- Upload interruptions

### System Errors

- Database connectivity issues
- Authentication failures
- Server errors

## Helper Functions

The `propertyHelpers.js` file provides several utility functions:

- `transformPropertyDataForAPI()` - Converts UI data to API format
- `addFilesToFormData()` - Adds files to FormData
- `validatePropertyData()` - Client-side validation
- `createPropertySummary()` - Data summary for review
- `estimateProcessingTime()` - Processing time estimation

## Testing

Use the helper functions for client-side validation before API submission:

```javascript
import { validatePropertyData } from "@/lib/propertyHelpers";

const { isValid, errors } = validatePropertyData(formData);
if (!isValid) {
  // Handle validation errors
  console.log("Validation errors:", errors);
}
```

## File Storage Structure

```
uploads/
├── properties/
│   ├── images/
│   └── videos/
└── kyc/
    ├── documents/
    └── videos/
```

## Status Flow

1. **pending** - Property submitted, awaiting admin approval
2. **approved** - Property approved and visible to buyers
3. **rejected** - Property rejected by admin
4. **featured** - Property promoted (paid feature)

## Rate Limiting

Consider implementing rate limiting for property creation to prevent abuse:

- Max properties per user per day
- File upload limits
- API call frequency limits
