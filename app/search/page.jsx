"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
import { FiMapPin, FiHeart, FiFilter, FiSliders } from "react-icons/fi";
import { AiOutlineHeart } from "react-icons/ai";
import { FaCheck } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import { formatPrice } from "@/app/lib/propertyHelpers";


function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [activeTab, setActiveTab] = useState("buy");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budgetRange, setBudgetRange] = useState(null);
  const [sortBy, setSortBy] = useState("relevance");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);

  // Fetch properties from API
  const fetchProperties = async (overrideParams = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();

      // Use override params if provided, otherwise use current state
      const currentTab = overrideParams.tab || activeTab;
      const currentCity =
        overrideParams.city !== undefined ? overrideParams.city : city;
      const currentLocality =
        overrideParams.locality !== undefined
          ? overrideParams.locality
          : locality;
      const currentPropertyType =
        overrideParams.propertyType !== undefined
          ? overrideParams.propertyType
          : propertyType;
      const currentBudgetRange =
        overrideParams.budgetRange !== undefined
          ? overrideParams.budgetRange
          : budgetRange;
      const currentSortBy =
        overrideParams.sortBy !== undefined ? overrideParams.sortBy : sortBy;
      const currentVerifiedOnly =
        overrideParams.showVerifiedOnly !== undefined
          ? overrideParams.showVerifiedOnly
          : showVerifiedOnly;

      params.set("tab", currentTab);
      if (currentCity) params.set("city", currentCity);
      if (currentLocality) params.set("locality", currentLocality);
      if (currentPropertyType) params.set("propertyType", currentPropertyType);
      if (currentBudgetRange) {
        params.set("budgetMin", currentBudgetRange.min.toString());
        params.set("budgetMax", currentBudgetRange.max?.toString() || "");
      }
      params.set("sort", currentSortBy);
      if (currentVerifiedOnly) params.set("verifiedOnly", "true");

      const response = await fetch(`/api/properties?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }

      const data = await response.json();

      if (data.success) {
        setProperties(data.properties || []);
      } else {
        throw new Error(data.error || "Failed to fetch properties");
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError(err.message);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Parse URL params and fetch initial data
  useEffect(() => {
    const tab = searchParams.get("tab") || "buy";
    const cityParam = searchParams.get("city") || "";
    const localityParam = searchParams.get("locality") || "";
    const propertyTypeParam = searchParams.get("propertyType") || "";
    const budgetMin = searchParams.get("budgetMin");
    const budgetMax = searchParams.get("budgetMax");

    // Set all state at once to avoid cascading renders
    const newBudgetRange =
      budgetMin && budgetMax
        ? {
          min: parseInt(budgetMin),
          max: budgetMax ? parseInt(budgetMax) : null,
        }
        : null;

    setActiveTab(tab);
    setCity(cityParam);
    setLocality(localityParam);
    setPropertyType(propertyTypeParam);
    if (newBudgetRange) setBudgetRange(newBudgetRange);

    // Fetch data immediately with the URL params to avoid state update timing issues
    const urlParams = {
      tab,
      city: cityParam,
      locality: localityParam,
      propertyType: propertyTypeParam,
      budgetRange: newBudgetRange,
      sortBy: "relevance",
      showVerifiedOnly: false,
    };

    fetchProperties(urlParams);
  }, []); // Only run on mount

  const budgetOptions =
    budgetRanges[activeTab]?.map((range) => ({
      value: range,
      label: range.label,
    })) || [];

  const handleSearch = () => {
    // Update URL params
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    if (city) params.set("city", city);
    if (locality) params.set("locality", locality);
    if (propertyType) params.set("propertyType", propertyType);
    if (budgetRange) {
      params.set("budgetMin", budgetRange.min.toString());
      params.set("budgetMax", budgetRange.max?.toString() || "");
    }
    router.replace(`/search?${params.toString()}`, { scroll: false });

    // Fetch new results
    fetchProperties();
  };

  const handleClearFilters = () => {
    // Reset all filters
    setCity("");
    setLocality("");
    setPropertyType("");
    setBudgetRange(null);
    setSortBy("relevance");
    setShowVerifiedOnly(false);

    // Update URL to remove all params except tab
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    router.replace(`/search?${params.toString()}`, { scroll: false });

    // Fetch all properties for current tab with cleared filters
    fetchProperties({
      city: "",
      locality: "",
      propertyType: "",
      budgetRange: null,
      sortBy: "relevance",
      showVerifiedOnly: false,
    });
  };

  const handleWishlistClick = (propertyId) => {
    // PropertyCard component now handles wishlist internally via the useWishlist hook
    // This function is kept for backward compatibility but PropertyCard handles the logic
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const getSortLabel = (value) => {
    const labels = {
      relevance: "Relevance",
      "price-low": "Price: Low to High",
      "price-high": "Price: High to Low",
      "verified-first": "Verified First",
    };
    return labels[value] || "Relevance";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative bg-secondary text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary to-primary/20"></div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Find Your Dream Property
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Discover verified properties directly from owners across India
            </p>
          </motion.div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg border p-4 sm:p-6 pb-2 sm:pb-4">
            <div className="flex flex-wrap gap-4 mb-6 justify-center sm:justify-start">
              {["Buy", "Rent"].map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const newTab = tab.toLowerCase();
                    setActiveTab(newTab);
                    setPropertyType("");
                    setBudgetRange(null);
                    const params = new URLSearchParams(searchParams);
                    params.set("tab", newTab);
                    params.delete("city");
                    params.delete("locality");
                    params.delete("propertyType");
                    params.delete("budgetMin");
                    params.delete("budgetMax");
                    router.replace(`/search?${params.toString()}`, {
                      scroll: false,
                    });
                    // Fetch properties for new tab with explicit tab parameter
                    fetchProperties({ tab: newTab });
                  }}
                  className={`px-6 py-3 text-sm font-semibold rounded-full transition-all duration-200 ${activeTab === tab.toLowerCase()
                      ? "bg-primary text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                    }`}
                  suppressHydrationWarning
                >
                  {tab}
                </motion.button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <Select
                value={city ? { value: city, label: city } : null}
                onChange={(selectedOption) => {
                  setCity(selectedOption ? selectedOption.value : "");
                  setLocality(""); // Clear locality when city changes
                }}
                options={cities.map((city) => ({ value: city, label: city }))}
                placeholder="City"
                className="w-full"
                classNamePrefix="react-select"
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
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
                    <MdKeyboardArrowDown
                      className="text-gray-400 mr-2"
                      size={16}
                    />
                  ),
                }}
              />

              <input
                type="text"
                placeholder={city ? "Locality" : "Select city first"}
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                disabled={!city}
                className={`bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 w-full ${!city ? "opacity-50 cursor-not-allowed" : ""
                  }`}
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
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
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
                    <MdKeyboardArrowDown
                      className="text-gray-400 mr-2"
                      size={16}
                    />
                  ),
                }}
              />

              <Select
                value={
                  budgetRange
                    ? {
                      value: budgetRange,
                      label:
                        budgetRange.label ||
                        `${budgetRange.min} - ${budgetRange.max || "above"}`,
                    }
                    : null
                }
                onChange={(selectedOption) =>
                  setBudgetRange(selectedOption ? selectedOption.value : null)
                }
                options={budgetOptions}
                placeholder="Budget"
                className="w-full"
                classNamePrefix="react-select"
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
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
                    <MdKeyboardArrowDown
                      className="text-gray-400 mr-2"
                      size={16}
                    />
                  ),
                }}
              />

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSearch}
                transition={{ duration: 0.2 }}
                className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 text-sm"
                suppressHydrationWarning
              >
                Search
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleClearFilters}
                transition={{ duration: 0.2 }}
                className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 text-sm border border-gray-300"
                suppressHydrationWarning
              >
                Clear Filters
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                transition={{ duration: 0.2 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold px-5 py-2.5 rounded-xl border border-blue-200 hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100 flex items-center gap-2 text-sm shadow-sm hover:shadow-md transition-all duration-200"
                suppressHydrationWarning
              >
                <FiSliders
                  size={16}
                  className={showFilters ? "text-blue-600" : "text-blue-500"}
                />
                <span className="hidden sm:inline">
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </span>
                <span className="sm:hidden">
                  {showFilters ? "Hide" : "Filters"}
                </span>
              </motion.button>
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Sort By
                    </label>
                    <Select
                      value={
                        sortBy
                          ? { value: sortBy, label: getSortLabel(sortBy) }
                          : null
                      }
                      onChange={(selectedOption) => {
                        setSortBy(
                          selectedOption ? selectedOption.value : "relevance"
                        );
                        // Fetch with new sort
                        setTimeout(fetchProperties, 100);
                      }}
                      options={[
                        { value: "relevance", label: "Relevance" },
                        { value: "price-low", label: "Price: Low to High" },
                        { value: "price-high", label: "Price: High to Low" },
                        { value: "verified-first", label: "Verified First" },
                      ]}
                      placeholder="Sort By"
                      className="w-full"
                      classNamePrefix="react-select"
                      menuPortalTarget={
                        typeof document !== "undefined" ? document.body : null
                      }
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          border: "1px solid #e5e7eb",
                          borderRadius: "0.75rem",
                          padding: "0.25rem",
                          minHeight: "48px",
                          boxShadow: "none",
                          "&:hover": {
                            border: "1px solid #e5e7eb",
                          },
                          "&:focus-within": {
                            borderColor: "var(--color-primary)",
                            borderWidth: "3px",
                            boxShadow:
                              "0 0 0 2px rgba(var(--color-primary), 0.5)",
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
                          <MdKeyboardArrowDown
                            className="text-gray-500"
                            size={18}
                          />
                        ),
                      }}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Filter Options
                    </label>
                    <div className="flex items-center bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="verified-only"
                          checked={showVerifiedOnly}
                          onChange={(e) => {
                            setShowVerifiedOnly(e.target.checked);
                            // Fetch with new verified filter
                            setTimeout(fetchProperties, 100);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 bg-gray-200 rounded-lg peer-checked:bg-primary transition-colors duration-200 flex items-center justify-center">
                          <svg
                            className={`w-3 h-3 text-white transition-opacity duration-200 ${showVerifiedOnly ? "opacity-100" : "opacity-0"
                              }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          </svg>
                        </div>
                      </div>
                      <label
                        htmlFor="verified-only"
                        className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        Verified listings only
                      </label>
                    </div>
                  </div>

                  <div className="hidden lg:block"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-heading mb-2">
              {isLoading
                ? "Searching..."
                : `${properties.length} Properties Found${city ? ` in ${city}` : ""
                }${locality ? `, ${locality}` : ""}`}
            </h1>
            {city && (
              <p className="text-gray-600 text-sm">
                Showing results for {city}
                {locality ? `, ${locality}` : ""}
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-pulse"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {properties.map((property) => {
              // Transform API data to match PropertyCard expectations
              const transformedProperty = {
                _id: property._id,
                title: property.title,
                price: property.price
                  ? formatPrice(property.price)
                  : "Price not available",
                images: property.images || [],
                location:
                  property.location || `${property.city}, ${property.state}`,
                city: property.city,
                state: property.state,
                bhk: property.bhk || property.category,
                builtUpArea: property.builtUpArea,
                furnishing: property.furnishing || "Not specified",
                verified: property.verified || false,
                featured: property.featured || false,
                propertyType: property.propertyType,
                slug: property.slug,
                ownerId: property.ownerId,
              };

              return (
                <PropertyCard
                  key={property._id}
                  property={transformedProperty}
                  onWishlistClick={handleWishlistClick}
                />
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No properties found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search criteria or browse all properties.
            </p>
            <button
              onClick={handleClearFilters}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90"
            >
              Clear Filters & Browse All
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

// Static data for dropdowns
const propertyTypes = {
  residential: ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4+ BHK"],
  commercial: [
    "Office Space",
    "Retail Space",
    "Warehouse",
    "Showroom",
    "Co-working",
  ],
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <p>Loading search page...</p>
            </div>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}