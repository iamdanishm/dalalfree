"use client";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { MdKeyboardArrowDown } from "react-icons/md";

const propertyTypes = {
  residential: ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4+ BHK"],
};

const cities = [
  "Mumbai",
  "Bangalore",
  "Pune",
  "Chennai",
  "Delhi",
  "Noida",
  "Gurgaon",
  "Hyderabad",
];

const budgetRanges = {
  buy: [
    { label: "Under ₹10 Lakhs", min: 0, max: 1000000 },
    { label: "₹10 Lakhs - ₹20 Lakhs", min: 1000000, max: 2000000 },
    { label: "₹20 Lakhs - ₹50 Lakhs", min: 2000000, max: 5000000 },
    { label: "₹50 Lakhs - ₹1 Cr", min: 5000000, max: 10000000 },
    { label: "₹1 Cr+", min: 10000000, max: null },
  ],
  rent: [
    { label: "Under ₹10,000", min: 0, max: 10000 },
    { label: "₹10,000 - ₹25,000", min: 10000, max: 25000 },
    { label: "₹25,000 - ₹50,000", min: 25000, max: 50000 },
    { label: "₹50,000+", min: 50000, max: null },
  ],
  commercial: [
    { label: "Under ₹50 Lakhs", min: 0, max: 5000000 },
    { label: "₹50 Lakhs - ₹1 Cr", min: 5000000, max: 10000000 },
    { label: "₹1 Cr - ₹5 Cr", min: 10000000, max: 50000000 },
    { label: "₹5 Cr+", min: 50000000, max: null },
  ],
};

export default function HeroSearch() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("buy");
  const [propertyType, setPropertyType] = useState("");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [budgetRange, setBudgetRange] = useState(null);
  const [error, setError] = useState("");

  const budgetOptions =
    budgetRanges[activeTab]?.map((range) => ({
      value: range,
      label: range.label,
    })) || [];

  const handleSearch = () => {
    // Validate required fields
    if (!city || !locality.trim()) {
      setError(
        "Please select both city and locality to search for properties."
      );
      return;
    }

    // Clear any existing error
    setError("");

    // Build search parameters
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    if (city) params.set("city", city);
    if (locality) params.set("locality", locality);
    if (propertyType) params.set("propertyType", propertyType);
    if (budgetRange) {
      params.set("budgetMin", budgetRange.min.toString());
      params.set("budgetMax", budgetRange.max?.toString() || "");
    }

    router.push(`/search?${params.toString()}`);
  };

  const resetFilters = () => {
    setPropertyType("");
    setCity("");
    setLocality("");
    setBudgetRange(null);
    setError("");
  };

  return (
    <section className="relative bg-secondary text-white flex items-center justify-center py-20 md:py-28 overflow-hidden">
      {/* === Background Skyline Illustration === */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-image6.png"
          alt="City skyline"
          fill
          priority
          className="object-cover object-bottom sm:object-center md:object-top lg:object-center opacity-25 sm:opacity-35 brightness-100 sm:brightness-125 contrast-100 sm:contrast-125"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
        />
      </div>

      {/* === Search Card === */}
      <div className="relative z-10 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-white rounded-3xl shadow-lg p-6 sm:p-8"
          style={{ willChange: "transform" }}
        >
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["Buy", "Rent"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab.toLowerCase());
                  setPropertyType("");
                  setBudgetRange(null);
                  setError(""); // Clear error when switching tabs
                }}
                className={`px-5 py-2 text-sm sm:text-base font-medium rounded-full transition-colors duration-200 ${
                  activeTab === tab.toLowerCase()
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                suppressHydrationWarning
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Fields (Original 5-field layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select
              value={city ? { value: city, label: city } : null}
              onChange={(selectedOption) =>
                setCity(selectedOption ? selectedOption.value : "")
              }
              options={cities.map((city) => ({ value: city, label: city }))}
              placeholder="City"
              className="w-full"
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              styles={{
                control: (provided) => ({
                  ...provided,
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  padding: "0.25rem",
                  minHeight: "48px",
                  boxShadow: "none",
                  "&:hover": {
                    border: "1px solid #e5e7eb",
                  },
                  "&:focus-within": {
                    borderColor: "var(--color-primary)",
                    borderWidth: "3px",
                    boxShadow: "0 0 0 2px rgba(var(--color-primary), 0.5)",
                  },
                }),
                singleValue: (provided, state) => ({
                  ...provided,
                  color: "#374151",
                }),
                placeholder: (provided, state) => ({
                  ...provided,
                  color: "#9ca3af",
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected
                    ? "var(--color-primary)"
                    : state.isFocused
                    ? "#f3f4f6"
                    : "white",
                  color: state.isSelected ? "white" : "#374151",
                  cursor: "pointer",
                }),
                menu: (provided) => ({
                  ...provided,
                  borderRadius: "0.5rem",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  zIndex: 9999,
                }),
                menuPortal: (provided) => ({
                  ...provided,
                  zIndex: 9999,
                }),
              }}
              components={{
                DropdownIndicator: () => (
                  <MdKeyboardArrowDown className="text-gray-400 mr-2" />
                ),
              }}
            />
            <input
              type="text"
              placeholder="Locality"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
              suppressHydrationWarning
            />
            <Select
              value={
                propertyType
                  ? { value: propertyType, label: propertyType }
                  : null
              }
              onChange={(selectedOption) =>
                setPropertyType(selectedOption ? selectedOption.value : "")
              }
              options={(activeTab === "commercial"
                ? propertyTypes.commercial
                : propertyTypes.residential
              ).map((type) => ({ value: type, label: type }))}
              placeholder="Property Type"
              className="w-full"
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              styles={{
                control: (provided) => ({
                  ...provided,
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  padding: "0.25rem",
                  minHeight: "48px",
                  boxShadow: "none",
                  "&:hover": {
                    border: "1px solid #e5e7eb",
                  },
                  "&:focus-within": {
                    borderColor: "var(--color-primary)",
                    borderWidth: "3px",
                    boxShadow: "0 0 0 2px rgba(var(--color-primary), 0.5)",
                  },
                }),
                singleValue: (provided, state) => ({
                  ...provided,
                  color: "#374151",
                }),
                placeholder: (provided, state) => ({
                  ...provided,
                  color: "#9ca3af",
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected
                    ? "var(--color-primary)"
                    : state.isFocused
                    ? "#f3f4f6"
                    : "white",
                  color: state.isSelected ? "white" : "#374151",
                  cursor: "pointer",
                }),
                menu: (provided) => ({
                  ...provided,
                  borderRadius: "0.5rem",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  zIndex: 9999,
                }),
                menuPortal: (provided) => ({
                  ...provided,
                  zIndex: 9999,
                }),
              }}
              components={{
                DropdownIndicator: () => (
                  <MdKeyboardArrowDown className="text-gray-400 mr-2" />
                ),
              }}
            />
            <Select
              value={
                budgetRange
                  ? { value: budgetRange, label: budgetRange.label }
                  : null
              }
              onChange={(selectedOption) =>
                setBudgetRange(selectedOption ? selectedOption.value : null)
              }
              options={budgetOptions}
              placeholder="Budget"
              className="w-full"
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              styles={{
                control: (provided) => ({
                  ...provided,
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  padding: "0.25rem",
                  minHeight: "48px",
                  boxShadow: "none",
                  "&:hover": {
                    border: "1px solid #e5e7eb",
                  },
                  "&:focus-within": {
                    borderColor: "var(--color-primary)",
                    borderWidth: "3px",
                    boxShadow: "0 0 0 2px rgba(var(--color-primary), 0.5)",
                  },
                }),
                singleValue: (provided, state) => ({
                  ...provided,
                  color: "#374151",
                }),
                placeholder: (provided, state) => ({
                  ...provided,
                  color: "#9ca3af",
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected
                    ? "var(--color-primary)"
                    : state.isFocused
                    ? "#f3f4f6"
                    : "white",
                  color: state.isSelected ? "white" : "#374151",
                  cursor: "pointer",
                }),
                menu: (provided) => ({
                  ...provided,
                  borderRadius: "0.5rem",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  zIndex: 9999,
                }),
                menuPortal: (provided) => ({
                  ...provided,
                  zIndex: 9999,
                }),
              }}
              components={{
                DropdownIndicator: () => (
                  <MdKeyboardArrowDown className="text-gray-400 mr-2" />
                ),
              }}
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSearch}
              transition={{ duration: 0.2 }}
              className="bg-primary text-white font-semibold px-6 py-3 rounded-lg w-full sm:w-auto hover:opacity-90"
              suppressHydrationWarning
            >
              Search
            </motion.button>
          </div>

          {/* Caption */}
          <p className="text-gray-500 text-sm mt-4 text-center sm:text-left">
            No brokerage. 100% verified listings.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
