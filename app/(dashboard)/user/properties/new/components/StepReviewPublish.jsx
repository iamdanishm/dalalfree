import React from "react";

export default function StepReviewPublish({
  formData,
  updateFormData,
  errors,
}) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Review & Publish
        </h3>
        <p className="text-gray-600">
          Component under development. Will include complete property preview
          and publishing.
        </p>
      </div>

      {/* Preview Data Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-4">Property Summary</h4>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Type:</strong> {formData.propertyType} - {formData.category}
          </p>
          <p>
            <strong>Title:</strong> {formData.title}
          </p>
          <p>
            <strong>Price:</strong> {formData.price}
          </p>
          <p>
            <strong>Location:</strong> {formData.location}
          </p>
        </div>
      </div>

      {/* Terms and Ready to Publish */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Ready to Publish?</h4>
        <p className="text-blue-700 text-sm">
          Your property will be submitted for approval and become visible to
          buyers once approved.
        </p>
      </div>
    </div>
  );
}
