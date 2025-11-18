import { FiFileText } from "react-icons/fi";

export default function DescriptionComponent({ description }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100/50 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
          <FiFileText className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Description</h2>
      </div>
      <p className="text-gray-700 leading-relaxed text-base">{description}</p>
    </div>
  );
}
