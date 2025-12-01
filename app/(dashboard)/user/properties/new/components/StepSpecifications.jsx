import React from "react";

export default function StepSpecifications({
  formData,
  updateFormData,
  errors,
}) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Property Specifications
        </h3>
        <p className="text-gray-600">
          Component under development. Will include BHK, area, floor, age,
          parking, etc.
        </p>
      </div>

      {/* Temporary BHK field for validation */}
      {errors.bhk && <p className="text-red-600 text-sm mt-2">{errors.bhk}</p>}
    </div>
  );
}
