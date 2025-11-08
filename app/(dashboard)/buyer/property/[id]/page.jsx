// Property Details Page for Buyers
export default function PropertyDetails({ params }) {
  const { id } = params;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Property Details #{id}
        </h1>
        <p className="text-gray-600">
          This is a placeholder for the property details page.
        </p>
      </div>
    </div>
  );
}
