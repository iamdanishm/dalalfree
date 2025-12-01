import React from "react";

export default function StepMediaUpload({ formData, updateFormData, errors }) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Photos & Videos
        </h3>
        <p className="text-gray-600">
          Component under development. Will include file upload with
          drag-and-drop.
        </p>
      </div>

      {/* Temporary images field for validation */}
      {errors.images && (
        <p className="text-red-600 text-sm mt-2">{errors.images}</p>
      )}
    </div>
  );
}
