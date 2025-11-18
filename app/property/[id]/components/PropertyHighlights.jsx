import { FiThumbsUp } from "react-icons/fi";
import { FaCheck } from "react-icons/fa";

export default function PropertyHighlights({ highlights }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <FiThumbsUp className="mr-2 text-green-600" />
        Property Highlights
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {highlights.map((highlight, index) => (
          <div key={index} className="flex items-center text-sm text-gray-700">
            <FaCheck className="mr-2 text-green-500 flex-shrink-0" size={14} />
            {highlight}
          </div>
        ))}
      </div>
    </div>
  );
}
