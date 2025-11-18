import Link from "next/link";

export default function BreadcrumbNavigation({ propertyTitle }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center py-1 text-xs">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <span className="mx-1 text-gray-400">/</span>
          <span className="text-gray-500">Properties</span>
          <span className="mx-1 text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{propertyTitle}</span>
        </nav>
      </div>
    </div>
  );
}
