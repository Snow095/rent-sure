
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bath,
  BedDouble,
  Building2,
  ChevronDown,
  Filter,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { supabase } from "../../services/supabase/client";

const PAGE_SIZE = 9;

const propertyTypes = [
  "All Types",
  "Apartment",
  "House",
  "Duplex",
  "Self Contain",
];

const verificationOptions = [
  {
    value: "all",
    label: "All Verification Statuses",
  },
  {
    value: "verified",
    label: "Verified Only",
  },
  {
    value: "pending",
    label: "Under Review",
  },
  {
    value: "needs_information",
    label: "Needs Information",
  },
];

const sortOptions = [
  {
    value: "newest",
    label: "Newest",
  },
  {
    value: "price-low",
    label: "Price: Low to High",
  },
  {
    value: "price-high",
    label: "Price: High to Low",
  },
  {
    value: "bedrooms",
    label: "Most Bedrooms",
  },
];

function formatAmount(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "₦0";
  }

  return `₦${amount.toLocaleString("en-NG")}`;
}

function VerificationBadge({ status }) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5EC] px-3 py-1.5 text-xs font-semibold text-[#15803D]">
        <ShieldCheck size={14} />
        Verified
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-[#B91C1C]">
        Not Verified
      </span>
    );
  }

  if (status === "needs_information") {
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-[#B45309]">
        Needs Information
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-[#B45309]">
      Under Review
    </span>
  );
}

function PropertyCard({ property }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Property visual */}
      <div className="flex h-48 items-center justify-center bg-[#F8EDEF]">
        <Building2
          size={62}
          strokeWidth={1.4}
          className="text-[#7A1F3D]"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-[#FAF8F9] px-3 py-1.5 text-xs font-semibold text-[#756970]">
            {property.property_type}
          </span>

          <VerificationBadge
            status={property.verification_status}
          />
        </div>

        <h2 className="mt-5 line-clamp-2 text-lg font-bold text-[#24171C]">
          {property.title}
        </h2>

        <div className="mt-3 flex items-start gap-2 text-sm text-[#756970]">
          <MapPin
            size={17}
            className="mt-0.5 shrink-0"
          />

          <span className="line-clamp-2">
            {property.location}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-[#756970]">
            <BedDouble size={17} />
            <span>
              {property.bedrooms}{" "}
              {property.bedrooms === 1 ? "Bedroom" : "Bedrooms"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#756970]">
            <Bath size={17} />
            <span>
              {property.bathrooms}{" "}
              {property.bathrooms === 1 ? "Bathroom" : "Bathrooms"}
            </span>
          </div>
        </div>

        <div className="mt-auto border-t border-[#E8DDE1] pt-5">
          <p className="text-xs text-[#756970]">
            Annual Rent
          </p>

          <div className="mt-1 flex items-end justify-between gap-4">
            <p className="text-lg font-bold text-[#7A1F3D]">
              {formatAmount(property.annual_rent)}
            </p>

            <Link
              to={`/properties/${property.id}`}
              className="text-sm font-semibold text-[#7A1F3D] hover:underline"
            >
              View Property
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function Properties() {
  const [properties, setProperties] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");

  const [propertyType, setPropertyType] =
    useState("All Types");

  const [verificationStatus, setVerificationStatus] =
    useState("all");

  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");

  const [minBedrooms, setMinBedrooms] = useState("");
  const [minBathrooms, setMinBathrooms] = useState("");

  const [sortBy, setSortBy] = useState("newest");

  const [showFilters, setShowFilters] = useState(false);

  const [visibleCount, setVisibleCount] =
    useState(PAGE_SIZE);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("properties")
        .select(`
          id,
          title,
          location,
          property_type,
          annual_rent,
          bedrooms,
          bathrooms,
          verification_status,
          property_status,
          created_at
        `)
        .eq("property_status", "active")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Error loading properties:",
          error
        );

        setErrorMessage(
          "We couldn't load the available properties. Please try again."
        );

        setProperties([]);
        setLoading(false);
        return;
      }

      setProperties(data ?? []);
      setLoading(false);
    };

    fetchProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const locationQuery = location.trim().toLowerCase();

    const minimumRent =
      minRent === "" ? null : Number(minRent);

    const maximumRent =
      maxRent === "" ? null : Number(maxRent);

    const minimumBedrooms =
      minBedrooms === "" ? null : Number(minBedrooms);

    const minimumBathrooms =
      minBathrooms === ""
        ? null
        : Number(minBathrooms);

    const result = properties.filter((property) => {
      const title =
        property.title?.toLowerCase() ?? "";

      const propertyLocation =
        property.location?.toLowerCase() ?? "";

      const matchesSearch =
        !search ||
        title.includes(search) ||
        propertyLocation.includes(search);

      const matchesLocation =
        !locationQuery ||
        propertyLocation.includes(locationQuery);

      const matchesType =
        propertyType === "All Types" ||
        property.property_type === propertyType;

      const matchesVerification =
        verificationStatus === "all" ||
        property.verification_status ===
          verificationStatus;

      const rent = Number(property.annual_rent);

      const matchesMinimumRent =
        minimumRent === null ||
        rent >= minimumRent;

      const matchesMaximumRent =
        maximumRent === null ||
        rent <= maximumRent;

      const matchesBedrooms =
        minimumBedrooms === null ||
        Number(property.bedrooms) >= minimumBedrooms;

      const matchesBathrooms =
        minimumBathrooms === null ||
        Number(property.bathrooms) >= minimumBathrooms;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesType &&
        matchesVerification &&
        matchesMinimumRent &&
        matchesMaximumRent &&
        matchesBedrooms &&
        matchesBathrooms
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === "price-low") {
        return (
          Number(a.annual_rent) -
          Number(b.annual_rent)
        );
      }

      if (sortBy === "price-high") {
        return (
          Number(b.annual_rent) -
          Number(a.annual_rent)
        );
      }

      if (sortBy === "bedrooms") {
        return (
          Number(b.bedrooms) -
          Number(a.bedrooms)
        );
      }

      return (
        new Date(b.created_at) -
        new Date(a.created_at)
      );
    });
  }, [
    properties,
    searchTerm,
    location,
    propertyType,
    verificationStatus,
    minRent,
    maxRent,
    minBedrooms,
    minBathrooms,
    sortBy,
  ]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    searchTerm,
    location,
    propertyType,
    verificationStatus,
    minRent,
    maxRent,
    minBedrooms,
    minBathrooms,
    sortBy,
  ]);

  const visibleProperties =
    filteredProperties.slice(0, visibleCount);

  const hasMore =
    visibleCount < filteredProperties.length;

  const activeFilterCount = [
    location.trim(),
    propertyType !== "All Types",
    verificationStatus !== "all",
    minRent,
    maxRent,
    minBedrooms,
    minBathrooms,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm("");
    setLocation("");
    setPropertyType("All Types");
    setVerificationStatus("all");
    setMinRent("");
    setMaxRent("");
    setMinBedrooms("");
    setMinBathrooms("");
    setSortBy("newest");
  };

  const removeFilter = (filterName) => {
    if (filterName === "location") {
      setLocation("");
    }

    if (filterName === "type") {
      setPropertyType("All Types");
    }

    if (filterName === "verification") {
      setVerificationStatus("all");
    }

    if (filterName === "minRent") {
      setMinRent("");
    }

    if (filterName === "maxRent") {
      setMaxRent("");
    }

    if (filterName === "bedrooms") {
      setMinBedrooms("");
    }

    if (filterName === "bathrooms") {
      setMinBathrooms("");
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      {/* Page Header */}
      <section className="border-b border-[#E8DDE1] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-4 py-2 text-sm font-semibold text-[#7A1F3D]">
              <Building2 size={17} />
              Property Marketplace
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
              Find a rental property with confidence.
            </h1>

            <p className="mt-4 text-sm leading-7 text-[#756970] sm:text-base">
              Search rental properties, compare important details
              and review verification indicators before making a
              decision.
            </p>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
            {/* Search */}
            <div>
              <label
                htmlFor="property-search"
                className="text-sm font-semibold text-[#24171C]"
              >
                Search
              </label>

              <div className="relative mt-2">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#756970]"
                />

                <input
                  id="property-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search property or area..."
                  className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white pl-11 pr-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#9B8F94] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location-search"
                className="text-sm font-semibold text-[#24171C]"
              >
                Location
              </label>

              <div className="relative mt-2">
                <MapPin
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#756970]"
                />

                <input
                  id="location-search"
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="e.g. Lekki, Yaba, GRA..."
                  className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white pl-11 pr-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#9B8F94] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={() =>
                  setShowFilters((current) => !current)
                }
                className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold transition lg:w-auto ${
                  showFilters
                    ? "border-[#7A1F3D] bg-[#F8EDEF] text-[#7A1F3D]"
                    : "border-[#E8DDE1] bg-white text-[#24171C] hover:bg-[#FAF8F9]"
                }`}
              >
                <SlidersHorizontal size={18} />
                More Filters

                {activeFilterCount > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#7A1F3D] px-1.5 text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* More Filters */}
          {showFilters && (
            <div className="mt-6 border-t border-[#E8DDE1] pt-6">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Property Type */}
                <div>
                  <label
                    htmlFor="property-type"
                    className="text-sm font-semibold text-[#24171C]"
                  >
                    Property Type
                  </label>

                  <select
                    id="property-type"
                    value={propertyType}
                    onChange={(event) =>
                      setPropertyType(event.target.value)
                    }
                    className="mt-2 min-h-11 w-full rounded-lg border border-[#E8DDE1] bg-white px-3 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  >
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Verification */}
                <div>
                  <label
                    htmlFor="verification-status"
                    className="text-sm font-semibold text-[#24171C]"
                  >
                    Verification
                  </label>

                  <select
                    id="verification-status"
                    value={verificationStatus}
                    onChange={(event) =>
                      setVerificationStatus(
                        event.target.value
                      )
                    }
                    className="mt-2 min-h-11 w-full rounded-lg border border-[#E8DDE1] bg-white px-3 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  >
                    {verificationOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label
                    htmlFor="minimum-bedrooms"
                    className="text-sm font-semibold text-[#24171C]"
                  >
                    Minimum Bedrooms
                  </label>

                  <select
                    id="minimum-bedrooms"
                    value={minBedrooms}
                    onChange={(event) =>
                      setMinBedrooms(event.target.value)
                    }
                    className="mt-2 min-h-11 w-full rounded-lg border border-[#E8DDE1] bg-white px-3 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                {/* Bathrooms */}
                <div>
                  <label
                    htmlFor="minimum-bathrooms"
                    className="text-sm font-semibold text-[#24171C]"
                  >
                    Minimum Bathrooms
                  </label>

                  <select
                    id="minimum-bathrooms"
                    value={minBathrooms}
                    onChange={(event) =>
                      setMinBathrooms(event.target.value)
                    }
                    className="mt-2 min-h-11 w-full rounded-lg border border-[#E8DDE1] bg-white px-3 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
              </div>

              {/* Price */}
              <div className="mt-5">
                <p className="text-sm font-semibold text-[#24171C]">
                  Annual Rent Range
                </p>

                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#756970]">
                      ₦
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={minRent}
                      onChange={(event) =>
                        setMinRent(event.target.value)
                      }
                      placeholder="Minimum rent"
                      className="min-h-11 w-full rounded-lg border border-[#E8DDE1] pl-9 pr-4 text-sm text-[#24171C] outline-none placeholder:text-[#9B8F94] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                    />
                  </div>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#756970]">
                      ₦
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={maxRent}
                      onChange={(event) =>
                        setMaxRent(event.target.value)
                      }
                      placeholder="Maximum rent"
                      className="min-h-11 w-full rounded-lg border border-[#E8DDE1] pl-9 pr-4 text-sm text-[#24171C] outline-none placeholder:text-[#9B8F94] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                >
                  <X size={16} />
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 lg:px-10 lg:pb-20">
        <div className="flex flex-col gap-4 border-b border-[#E8DDE1] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#24171C]">
              {loading
                ? "Finding properties..."
                : `${filteredProperties.length} ${
                    filteredProperties.length === 1
                      ? "property"
                      : "properties"
                  } found`}
            </p>

            {!loading && activeFilterCount > 0 && (
              <p className="mt-1 text-xs text-[#756970]">
                Filters are currently active.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="sort-properties"
              className="text-sm font-medium text-[#756970]"
            >
              Sort:
            </label>

            <div className="relative">
              <select
                id="sort-properties"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
                className="min-h-10 appearance-none rounded-lg border border-[#E8DDE1] bg-white py-2 pl-3 pr-9 text-sm font-medium text-[#24171C] outline-none focus:border-[#7A1F3D]"
              >
                {sortOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#756970]"
              />
            </div>
          </div>
        </div>

        {/* Filter chips */}
        {!loading && activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 py-5">
            {location.trim() && (
              <button
                type="button"
                onClick={() => removeFilter("location")}
                className="inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-3 py-2 text-xs font-semibold text-[#7A1F3D]"
              >
                Location: {location}
                <X size={14} />
              </button>
            )}

            {propertyType !== "All Types" && (
              <button
                type="button"
                onClick={() => removeFilter("type")}
                className="inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-3 py-2 text-xs font-semibold text-[#7A1F3D]"
              >
                {propertyType}
                <X size={14} />
              </button>
            )}

            {verificationStatus !== "all" && (
              <button
                type="button"
                onClick={() =>
                  removeFilter("verification")
                }
                className="inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-3 py-2 text-xs font-semibold text-[#7A1F3D]"
              >
                {
                  verificationOptions.find(
                    (option) =>
                      option.value === verificationStatus
                  )?.label
                }
                <X size={14} />
              </button>
            )}

            {minRent && (
              <button
                type="button"
                onClick={() => removeFilter("minRent")}
                className="inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-3 py-2 text-xs font-semibold text-[#7A1F3D]"
              >
                Min: {formatAmount(minRent)}
                <X size={14} />
              </button>
            )}

            {maxRent && (
              <button
                type="button"
                onClick={() => removeFilter("maxRent")}
                className="inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-3 py-2 text-xs font-semibold text-[#7A1F3D]"
              >
                Max: {formatAmount(maxRent)}
                <X size={14} />
              </button>
            )}

            {minBedrooms && (
              <button
                type="button"
                onClick={() => removeFilter("bedrooms")}
                className="inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-3 py-2 text-xs font-semibold text-[#7A1F3D]"
              >
                {minBedrooms}+ Bedrooms
                <X size={14} />
              </button>
            )}

            {minBathrooms && (
              <button
                type="button"
                onClick={() => removeFilter("bathrooms")}
                className="inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-3 py-2 text-xs font-semibold text-[#7A1F3D]"
              >
                {minBathrooms}+ Bathrooms
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="text-center">
              <Loader2
                size={36}
                className="mx-auto animate-spin text-[#7A1F3D]"
              />

              <p className="mt-4 text-sm font-medium text-[#756970]">
                Loading available properties...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-bold text-[#B91C1C]">
              Unable to load properties
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !errorMessage &&
          filteredProperties.length === 0 && (
            <div className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8EDEF] text-[#7A1F3D]">
                <Search size={28} />
              </div>

              <h2 className="mt-6 text-xl font-bold text-[#24171C]">
                No properties match your search
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#756970]">
                Try changing your location, price range,
                property type or verification filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
              >
                <X size={17} />
                Clear Filters
              </button>
            </div>
          )}

        {/* Property Grid */}
        {!loading &&
          !errorMessage &&
          visibleProperties.length > 0 && (
            <>
              <div className="grid gap-6 pt-7 sm:grid-cols-2 lg:grid-cols-3">
                {visibleProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount(
                        (current) =>
                          current + PAGE_SIZE
                      )
                    }
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#7A1F3D] bg-white px-6 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                  >
                    <ChevronDown size={18} />
                    Load More Properties
                  </button>
                </div>
              )}

              {!hasMore && filteredProperties.length > 0 && (
                <p className="mt-10 text-center text-xs text-[#756970]">
                  You've reached the end of the available
                  properties.
                </p>
              )}
            </>
          )}
      </section>

      {/* Safety Notice */}
      <section className="border-t border-[#E8DDE1] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={21}
              className="mt-0.5 shrink-0 text-[#7A1F3D]"
            />

            <div>
              <h2 className="text-sm font-bold text-[#24171C]">
                Rent safely
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-[#756970]">
                A RentSure verification indicator is designed to
                support informed decisions. It is not a legal
                guarantee of ownership, property condition or
                transaction outcome. Always inspect a property and
                verify important information before making payments.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Properties;

