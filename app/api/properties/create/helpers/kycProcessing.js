/**
 * Smart KYC file categorization based on file names and types
 * @param {Object} doc - Document file info
 * @returns {string} Categorized document type
 */
export function categorizeDocument(doc) {
  const name = doc.name.toLowerCase();
  const type = doc.type.toLowerCase();

  // Aadhaar patterns
  if (
    name.includes("aadhar") ||
    name.includes("aadh") ||
    name.includes("aadhaar")
  ) {
    return "aadhaar";
  }

  // PAN patterns
  if (
    name.includes("pan") ||
    name.includes("pancard") ||
    name.includes("pan card")
  ) {
    return "pan";
  }

  // KYC Video patterns
  if (
    name.startsWith("video_") ||
    name.includes("video") ||
    type.startsWith("video/")
  ) {
    return "video";
  }

  // Agreement patterns (PDFs are likely agreements)
  if (
    type === "application/pdf" ||
    name.includes("agreement") ||
    name.includes("contract") ||
    name.includes("deal") ||
    name.includes("property") ||
    name.includes("document")
  ) {
    return "agreement";
  }

  // Default to aadhaar for remaining images (assuming users upload aadhaar first)
  return "aadhaar";
}

/**
 * Categorize KYC documents into proper structure
 * @param {Array<Object>} documents - Array of document files
 * @returns {Object} Categorized documents
 */
export function categorizeKycDocuments(documents) {
  const categorizedDocs = {
    aadhaar: [],
    pan: null,
    agreement: null,
  };

  for (const doc of documents) {
    const category = categorizeDocument(doc);

    if (category === "aadhaar") {
      if (categorizedDocs.aadhaar.length < 2) {
        // Max 2 aadhaar files
        categorizedDocs.aadhaar.push(doc);
      }
    } else if (category === "pan" && !categorizedDocs.pan) {
      categorizedDocs.pan = doc;
    } else if (category === "agreement" && !categorizedDocs.agreement) {
      categorizedDocs.agreement = doc;
    }
  }

  return categorizedDocs;
}

/**
 * Transform KYC files to database structure
 * @param {Object} categorizedDocs - Categorized documents
 * @param {Array<Object>} videos - Video files
 * @returns {Object} Database-ready KYC structure
 */
export function transformKycFilesToDatabaseStructure(categorizedDocs, videos) {
  const kycFilesForDB = {};

  // Transform Aadhaar files
  if (categorizedDocs.aadhaar.length > 0) {
    kycFilesForDB.aadhaar = categorizedDocs.aadhaar.map((file) => ({
      url: file.url,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: file.uploadedAt,
    }));
  }

  // Transform PAN file
  if (categorizedDocs.pan) {
    kycFilesForDB.pan = {
      url: categorizedDocs.pan.url,
      name: categorizedDocs.pan.name,
      size: categorizedDocs.pan.size,
      type: categorizedDocs.pan.type,
      uploadedAt: categorizedDocs.pan.uploadedAt,
    };
  }

  // Transform Agreement file
  if (categorizedDocs.agreement) {
    kycFilesForDB.agreement = {
      url: categorizedDocs.agreement.url,
      name: categorizedDocs.agreement.name,
      size: categorizedDocs.agreement.size,
      type: categorizedDocs.agreement.type,
      uploadedAt: categorizedDocs.agreement.uploadedAt,
    };
  }

  // Transform Video file (first video only)
  if (videos.length >= 1) {
    kycFilesForDB.video = {
      url: videos[0].url,
      name: videos[0].name,
      size: videos[0].size,
      type: videos[0].type,
      uploadedAt: videos[0].uploadedAt,
      duration: videos[0].duration || 15,
    };
  }

  return kycFilesForDB;
}

/**
 * Validate KYC file completeness
 * @param {Object} kycFiles - KYC files object
 * @returns {Object} Validation result
 */
export function validateKycCompleteness(kycFiles) {
  const requiredFields = ["aadhaar", "pan", "agreement", "video"];
  const missingFields = [];

  for (const field of requiredFields) {
    if (
      !kycFiles[field] ||
      (Array.isArray(kycFiles[field]) && kycFiles[field].length === 0)
    ) {
      missingFields.push(field);
    }
  }

  return {
    complete: missingFields.length === 0,
    missingFields,
    message:
      missingFields.length > 0
        ? `Missing KYC documents: ${missingFields.join(", ")}`
        : "All KYC documents present",
  };
}
