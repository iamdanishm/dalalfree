# Property Creation API

## Overview

This API endpoint handles the creation of new properties in the DalalFree property marketplace. It includes comprehensive validation, file processing, and KYC document handling.

## Folder Structure

```
app/api/properties/create/
├── route.js              # Main API route handler
├── helpers/
│   ├── amenities.js      # Amenity transformation utilities
│   ├── fileProcessing.js # File upload and validation
│   ├── kycProcessing.js  # KYC document categorization
├── schemas/
│   └── propertySchema.js # Property validation schema
└── README.md             # This documentation
```

## API Endpoint

**POST** `/api/properties/create`

## Authentication

- Requires authenticated user with role `partner` or `user`
- Uses `requireAuth` middleware for authentication
- Returns `403 Forbidden` for unauthorized roles

## Request Format

**Content-Type:** `multipart/form-data`

### Required Fields

#### Text Fields

- `title` (string, 10-150 chars)
- `description` (string, 50-5000 chars)
- `price` (number, ₹10,000 - ₹1,000,000,000)
- `propertyType` (string, enum)
- `category` (string, "sale", "rent", or "lease")
- `builtUpArea` (number, 100-100,000 sq ft)
- `carpetArea` (number, 50-100,000 sq ft)
- `floor` (string, number or "ground"/"basement")
- `age` (number, 0-100 years)
- `parking` (string, enum)
- `facing` (string, direction enum)
- `possessionStatus` (string, enum)
- `location` (string, 5-200 chars)
- `address` (string, 10-500 chars)
- `city` (string, 2-50 chars)
- `state` (string, 2-50 chars)
- `pincode` (string, 6-digit Indian postal code)
- `coordinates` (object with latitude/longitude)

#### File Fields

- `images` (file[], at least 1, max 20)
- `kycFiles` (file[], exactly 4 required: Aadhaar, PAN, Agreement, Video)

### Optional Fields

- `subtitle` (string, max 100 chars)
- `marketRange` (string, enum)
- `negotiable` (string, "Yes"/"No"/"Partially")
- `bhk` (string, enum)
- `bathrooms` (number, 1-10)
- `balcony` (number, 0-10)
- `furnishing` (string, enum)
- `totalFloors` (number, 1-100)
- `ageUnit` (string, enum)
- `maintenance` (number, ₹0-₹100,000/month)
- `highlights` (string[], max 10 items)
- `societyAmenities` (string[], max 30 items)
- `nearbyPlaces` (object[], max 20 items)

## File Requirements

### Images

- **Max Size:** 10MB per image
- **Allowed Types:** JPEG, PNG, WEBP, GIF, AVIF
- **Max Files:** 20
- **Required:** At least 1 image

### Videos

- **Max Size:** 100MB per video
- **Allowed Types:** MP4, WEBM, MOV, AVI
- **Max Files:** 5

### KYC Documents

- **Max Size:** 5MB per document
- **Allowed Types:** JPEG, PNG, PDF, HEIC, HEIF
- **Max Files:** 10 (but exactly 4 required)

### KYC Videos

- **Max Size:** 50MB per video
- **Allowed Types:** MP4, WEBM, MOV
- **Max Files:** 1
- **Required:** 1 KYC verification video

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Property created successfully",
  "property": {
    "id": "property_id",
    "slug": "property-slug",
    "title": "Property Title",
    "status": "pending",
    "files": {
      "files": {
        "images": [],
        "videos": [],
        "kycFiles": {}
      },
      "stats": {
        "images": { "uploaded": 5, "failed": 0, "errors": [] },
        "videos": { "uploaded": 1, "failed": 0, "errors": [] },
        "kyc": { "uploaded": 4, "failed": 0, "errors": [] }
      },
      "hasPartialFailures": false,
      "criticalFailures": false
    }
  }
}
```

### Error Responses

#### Validation Error (400 Bad Request)

```json
{
  "error": "Validation failed",
  "details": {
    "title": "title is required",
    "price": "price must be a number",
    "images": "At least one property image is required"
  }
}
```

#### Authentication Error (403 Forbidden)

```json
{
  "error": "Only partners and users can list properties"
}
```

#### File Upload Error (422 Unprocessable Entity)

```json
{
  "error": "File upload failed",
  "message": "Some files could not be uploaded. Please try again or contact support.",
  "details": "File too large. Max 10MB",
  "code": "FILE_UPLOAD_ERROR"
}
```

#### Duplicate Property (409 Conflict)

```json
{
  "error": "Duplicate property",
  "message": "A property with this title already exists. Please choose a different title.",
  "code": "DUPLICATE_PROPERTY"
}
```

## Error Codes

| Code                 | Status | Description                     |
| -------------------- | ------ | ------------------------------- |
| `VALIDATION_ERROR`   | 400    | Input validation failed         |
| `FILE_UPLOAD_ERROR`  | 422    | File processing failed          |
| `DUPLICATE_PROPERTY` | 409    | Property with same title exists |
| `STORAGE_FULL`       | 507    | Server storage is full          |
| `PERMISSION_ERROR`   | 500    | File system permission denied   |
| `DATABASE_ERROR`     | 503    | Database connection failed      |
| `INTERNAL_ERROR`     | 500    | Unexpected error                |

## File Processing Flow

1. **Validation**: Files are validated for size, type, and count
2. **Secure Naming**: Files are renamed with UUIDs for security
3. **Directory Creation**: Property-specific directories are created
4. **File Storage**: Files are saved to the uploads directory
5. **Database Update**: File URLs are stored in the database
6. **KYC Categorization**: Documents are automatically categorized

## Security Features

- **File Validation**: Strict MIME type and size checking
- **Secure Filenames**: UUID-based filenames prevent directory traversal
- **Input Sanitization**: All text fields are validated and sanitized
- **Role-Based Access**: Only partners and users can create properties
- **Rate Limiting**: Built-in protection against abuse

## Performance Considerations

- **File Processing**: Files are processed in parallel where possible
- **Database Optimization**: Bulk operations reduce database calls
- **Memory Management**: File streams prevent memory overload
- **Error Handling**: Graceful degradation for partial failures

## Testing

The API includes comprehensive error handling for:

- Invalid file types and sizes
- Missing required fields
- Database connection issues
- File system errors
- Authentication failures

## Example Request

```bash
curl -X POST /api/properties/create \
  -H "Authorization: Bearer your_token" \
  -F "title=Luxury Apartment" \
  -F "description=Beautiful 3BHK apartment with sea view" \
  -F "price=5000000" \
  -F "propertyType=apartment" \
  -F "category=sale" \
  -F "builtUpArea=1200" \
  -F "carpetArea=1000" \
  -F "floor=5" \
  -F "age=2" \
  -F "parking=covered" \
  -F "facing=north" \
  -F "possessionStatus=immediate" \
  -F "location=Andheri West" \
  -F "address=123 Main Street" \
  -F "city=Mumbai" \
  -F "state=Maharashtra" \
  -F "pincode=400053" \
  -F "coordinates={\"latitude\":19.1141,\"longitude\":72.8685}" \
  -F "images=@apartment1.jpg" \
  -F "images=@apartment2.jpg" \
  -F "kycFiles=@aadhaar.jpg" \
  -F "kycFiles=@pan.jpg" \
  -F "kycFiles=@agreement.pdf" \
  -F "kycFiles=@kyc-video.mp4"
```

## Notes

- The amenity mapping system is kept for temporary use as requested
- KYC files are automatically categorized based on filename patterns
- All file uploads are processed with proper error handling
- The API follows RESTful conventions and returns appropriate HTTP status codes
