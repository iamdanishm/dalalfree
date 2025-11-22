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

  // Parse URL params on component mount
  useEffect(() => {
    const tab = searchParams.get("tab") || "buy";
    const cityParam = searchParams.get("city") || "";
    const localityParam = searchParams.get("locality") || "";
    const propertyTypeParam = searchParams.get("propertyType") || "";
    const budgetMin = searchParams.get("budgetMin");
    const budgetMax = searchParams.get("budgetMax");

    setActiveTab(tab);
    setCity(cityParam);
    setLocality(localityParam);
    setPropertyType(propertyTypeParam);

    if (budgetMin && budgetMax) {
      setBudgetRange({
        min: parseInt(budgetMin),
        max: budgetMax ? parseInt(budgetMax) : null,
      });
    }

    setTimeout(() => setIsLoading(false), 500);
  }, [searchParams]);

  // Get localities for selected city
  const availableLocalities = useMemo(() => {
    return city && localities[city]
      ? localities[city].map((loc) => ({ value: loc, label: loc }))
      : [];
  }, [city]);

  const budgetOptions =
    budgetRanges[activeTab]?.map((range) => ({
      value: range,
      label: range.label,
    })) || [];

  // Filter properties based on search criteria
  const filteredProperties = useMemo(() => {
    let filtered = mockProperties.filter((property) => {
      // Featured filter - check URL param directly
      const featuredParam = searchParams.get("featured") === "true";
      if (featuredParam && !property.featured) return false;

      // Tab filter (buy/sell -> sell, rent -> rent)
      if (activeTab === "buy" && property.propertyType !== "sell") return false;
      if (activeTab === "rent" && property.propertyType !== "rent")
        return false;
      if (activeTab === "commercial" && property.category !== "Commercial")
        return false;

      // City filter
      if (city && !property.city.toLowerCase().includes(city.toLowerCase()))
        return false;

      // Locality filter
      if (
        locality &&
        !property.locality.toLowerCase().includes(locality.toLowerCase())
      )
        return false;

      // Property type filter
      if (
        propertyType &&
        !property.bhk.toLowerCase().includes(propertyType.toLowerCase())
      )
        return false;

      // Budget filter
      if (budgetRange) {
        const priceValue = parseFloat(
          property.price.replace(/[₹,]/g, "").split("/")[0]
        );
        if (budgetRange.max && priceValue > budgetRange.max) return false;
        if (budgetRange.min && priceValue < budgetRange.min) return false;
      }

      // Verified filter
      if (showVerifiedOnly && !property.verified) return false;

      return true;
    });

    // Sort properties
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => {
          const aPrice = parseFloat(a.price.replace(/[₹,]/g, "").split("/")[0]);
          const bPrice = parseFloat(b.price.replace(/[₹,]/g, "").split("/")[0]);
          return aPrice - bPrice;
        });
        break;
      case "price-high":
        filtered.sort((a, b) => {
          const aPrice = parseFloat(a.price.replace(/[₹,]/g, "").split("/")[0]);
          const bPrice = parseFloat(b.price.replace(/[₹,]/g, "").split("/")[0]);
          return bPrice - aPrice;
        });
        break;
      case "verified-first":
        filtered.sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [
    activeTab,
    city,
    locality,
    propertyType,
    budgetRange,
    showVerifiedOnly,
    sortBy,
    searchParams,
  ]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    if (city) params.set("city", city);
    if (locality) params.set("locality", locality);
    if (propertyType) params.set("propertyType", propertyType);
    if (budgetRange) {
      params.set("budgetMin", budgetRange.min.toString());
      params.set("budgetMax", budgetRange.max?.toString() || "");
    }
    router.replace(`/search?${params.toString()}`);
  };

  const handleWishlistClick = (propertyId) => {
    console.log(`Adding property ${propertyId} to wishlist`);
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
                  }}
                  className={`px-6 py-3 text-sm font-semibold rounded-full transition-all duration-200 ${
                    activeTab === tab.toLowerCase()
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
                  setLocality("");
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
                    padding: "0.1rem",
                    minHeight: "42px",
                    boxShadow: "none",
                  }),
                }}
                components={{
                  DropdownIndicator: () => (
                    <MdKeyboardArrowDown
                      className="text-gray-400 mr-1"
                      size={16}
                    />
                  ),
                }}
              />

              <Select
                value={locality ? { value: locality, label: locality } : null}
                onChange={(selectedOption) =>
                  setLocality(selectedOption ? selectedOption.value : "")
                }
                options={availableLocalities}
                placeholder="Locality"
                className="w-full"
                classNamePrefix="react-select"
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
                isDisabled={!city}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    padding: "0.1rem",
                    minHeight: "42px",
                    boxShadow: "none",
                  }),
                }}
                components={{
                  DropdownIndicator: () => (
                    <MdKeyboardArrowDown
                      className="text-gray-400 mr-1"
                      size={16}
                    />
                  ),
                }}
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
                    padding: "0.1rem",
                    minHeight: "42px",
                    boxShadow: "none",
                  }),
                }}
                components={{
                  DropdownIndicator: () => (
                    <MdKeyboardArrowDown
                      className="text-gray-400 mr-1"
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
                    padding: "0.1rem",
                    minHeight: "42px",
                    boxShadow: "none",
                  }),
                }}
                components={{
                  DropdownIndicator: () => (
                    <MdKeyboardArrowDown
                      className="text-gray-400 mr-1"
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
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
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
                      onChange={(selectedOption) =>
                        setSortBy(
                          selectedOption ? selectedOption.value : "relevance"
                        )
                      }
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
                          borderRadius: "0.75rem",
                          padding: "0.25rem",
                          minHeight: "48px",
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
                          onChange={(e) =>
                            setShowVerifiedOnly(e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 bg-gray-200 rounded-lg peer-checked:bg-primary transition-colors duration-200 flex items-center justify-center">
                          <svg
                            className={`w-3 h-3 text-white transition-opacity duration-200 ${
                              showVerifiedOnly ? "opacity-100" : "opacity-0"
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
                : `${filteredProperties.length} Properties Found${
                    city ? ` in ${city}` : ""
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
        ) : filteredProperties.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {filteredProperties.map((property) => (
              <motion.div
                key={property.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{
                  y: -5,
                  transition: {
                    duration: 0.2,
                  },
                }}
                onClick={() => router.push(`/property/${property.id}`)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg overflow-hidden border border-gray-100 flex flex-col group cursor-pointer"
                style={{ willChange: "transform" }}
              >
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border">
                    {property.bhk}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlistClick(property.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  >
                    <AiOutlineHeart
                      className="text-gray-600 hover:text-red-500 transition-colors"
                      size={16}
                    />
                  </button>
                </div>

                {property.ownerListing && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-sm z-10">
                    Owner Listing
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    {property.verified && (
                      <div className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        <FaCheck size={10} />
                        Verified
                      </div>
                    )}
                    {property.noBrokerage && (
                      <div className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        No Brokerage
                      </div>
                    )}
                  </div>

                  <div className="mb-2">
                    <p className="text-xl font-bold text-gray-900 leading-tight">
                      {property.price}
                    </p>
                  </div>

                  <div className="mb-3">
                    <p className="text-base font-medium text-gray-800 leading-tight">
                      {property.title}
                    </p>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 leading-tight">
                      {property.bhk} • {property.size} sq.ft •{" "}
                      {property.furnishing}
                    </p>
                  </div>

                  <div className="mb-auto">
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 leading-tight">
                      <FiMapPin className="flex-shrink-0" size={14} />
                      {property.location}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/property/${property.id}`);
                      }}
                      transition={{ duration: 0.2 }}
                      className="w-full bg-primary text-white text-sm font-semibold py-3 px-4 rounded-xl hover:shadow-sm transition-shadow"
                    >
                      View Details
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
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
              onClick={() => router.push("/")}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90"
            >
              Browse All Properties
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

// Mock data matching FeaturedGrid (using static data as per todo requirements)
const mockProperties = [
  {
    id: 1,
    price: "₹95 Lakh",
    title: "Green Heights, Baner",
    location: "Pune, Maharashtra",
    bhk: "2BHK",
    size: 1200,
    furnishing: "Semi-furnished",
    verified: true,
    noBrokerage: true,
    propertyType: "sell",
    category: "Residential",
    city: "Pune",
    locality: "Baner",
    image: "/images/home-lifestyle.png",
    ownerListing: true,
    featured: true,
  },
  {
    id: 2,
    price: "₹45,000/mo",
    title: "Skyline Residency, HSR",
    location: "Bengaluru, Karnataka",
    bhk: "3BHK",
    size: 1350,
    furnishing: "Fully-furnished",
    verified: false,
    noBrokerage: false,
    propertyType: "rent",
    category: "Residential",
    city: "Bangalore",
    locality: "HSR",
    image: "/images/home-lifestyle.png",
    ownerListing: false,
    featured: true,
  },
  {
    id: 3,
    price: "₹1.2 Lakh/mo",
    title: "Grade-A Space, Cybercity",
    location: "Gurgaon, Haryana",
    bhk: "Office",
    size: 3000,
    furnishing: "Bare shell",
    verified: true,
    noBrokerage: true,
    propertyType: "rent",
    category: "Commercial",
    city: "Gurgaon",
    locality: "Cybercity",
    image: "/images/home-lifestyle.png",
    ownerListing: true,
    featured: false,
  },
  {
    id: 4,
    price: "₹75 Lakh",
    title: "Sunshine Apartments, Andheri",
    location: "Mumbai, Maharashtra",
    bhk: "1BHK",
    size: 650,
    furnishing: "Fully-furnished",
    verified: true,
    noBrokerage: true,
    propertyType: "sell",
    category: "Residential",
    city: "Mumbai",
    locality: "Andheri",
    image: "/images/home-lifestyle.png",
    ownerListing: false,
    featured: false,
  },
  {
    id: 5,
    price: "₹85,000/mo",
    title: "Tech Park Office, Whitefield",
    location: "Bengaluru, Karnataka",
    bhk: "Office Space",
    size: 2500,
    furnishing: "Fully-furnished",
    verified: true,
    noBrokerage: false,
    propertyType: "rent",
    category: "Commercial",
    city: "Bangalore",
    locality: "Whitefield",
    image: "/images/home-lifestyle.png",
    ownerListing: true,
    featured: false,
  },
];

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

const localities = {
  Mumbai: ["Andheri", "Bandra", "Powai", "Lower Parel", "Goregaon"],
  Bangalore: [
    "HSR",
    "Whitefield",
    "Koramangala",
    "Indiranagar",
    "Electronic City",
  ],
  Pune: ["Baner", "Hinjewadi", "Aundh", "Koregaon Park", "Wakad"],
  Chennai: ["T. Nagar", "Adyar", "Velachery", "Anna Nagar", "Thoraipakkam"],
  Delhi: ["Connaught Place", "Karol Bagh", "Lajpat Nagar", "Dwarka", "Rohini"],
  Noida: [
    "Sector 62",
    "Sector 18",
    "Sector 15",
    "Sector 62A",
    "Botanical Garden",
  ],
  Gurgaon: ["Cybercity", "DLF Phase 1", "Golf Course Road", "MG Road"],
  Hyderabad: ["Hi-Tech City", "Jubilee Hills", "Banjara Hills", "Gachibowli"],
};

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
