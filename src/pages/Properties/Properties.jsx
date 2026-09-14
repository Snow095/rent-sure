
import { useEffect, useMemo, useState } from "react";
import {
    Search,
    SlidersHorizontal,
    ArrowUpDown,
    MapPin,
    BedDouble,
    Bath,
    ShieldCheck,
    Clock3,
    AlertCircle,
    Loader2,
    X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../../services/supabase/client";

function Properties() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [propertyType, setPropertyType] = useState("All");
    const [priceRange, setPriceRange] = useState("All");
    const [sortBy, setSortBy] = useState("Newest");

    const [showMoreFilters, setShowMoreFilters] = useState(false);

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            setErrorMessage("");

            try {
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
                    throw error;
                }

                setProperties(data || []);
            } catch (error) {
                console.error(
                    "Error fetching properties:",
                    error
                );

                setErrorMessage(
                    error.message ||
                    "Unable to load properties."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const filteredProperties = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        let results = properties.filter((property) => {
            const matchesSearch =
                !search ||
                property.title
                    ?.toLowerCase()
                    .includes(search) ||
                property.location
                    ?.toLowerCase()
                    .includes(search);

            const matchesType =
                propertyType === "All" ||
                property.property_type === propertyType;

            const rent = Number(property.annual_rent) || 0;

            let matchesPrice = true;

            if (priceRange === "Under ₦1m") {
                matchesPrice = rent < 1_000_000;
            }

            if (priceRange === "₦1m - ₦2m") {
                matchesPrice =
                    rent >= 1_000_000 &&
                    rent <= 2_000_000;
            }

            if (priceRange === "₦2m - ₦4m") {
                matchesPrice =
                    rent > 2_000_000 &&
                    rent <= 4_000_000;
            }

            if (priceRange === "Above ₦4m") {
                matchesPrice = rent > 4_000_000;
            }

            return (
                matchesSearch &&
                matchesType &&
                matchesPrice
            );
        });

        results = [...results].sort((a, b) => {
            if (sortBy === "Price: Low to High") {
                return (
                    Number(a.annual_rent) -
                    Number(b.annual_rent)
                );
            }

            if (sortBy === "Price: High to Low") {
                return (
                    Number(b.annual_rent) -
                    Number(a.annual_rent)
                );
            }

            if (sortBy === "Bedrooms") {
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

        return results;
    }, [
        properties,
        searchTerm,
        propertyType,
        priceRange,
        sortBy,
    ]);

    const clearFilters = () => {
        setSearchTerm("");
        setPropertyType("All");
        setPriceRange("All");
        setSortBy("Newest");
    };

    const hasActiveFilters =
        searchTerm.trim() ||
        propertyType !== "All" ||
        priceRange !== "All";

    return (
        <main className="min-h-screen bg-[#FAF8F9] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
            <div className="mx-auto w-full max-w-7xl">

                {/* Page Header */}
                <section>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7A1F3D]">
                        Property Search
                    </p>

                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                        Find a rental with more confidence
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[#756970] sm:text-base">
                        Explore available rental properties and use
                        RentSure verification information to make more
                        informed decisions.
                    </p>
                </section>

                {/* Search Panel */}
                <section className="mt-10 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                    <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr_1fr_auto] lg:items-end">

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
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#756970]"
                                />

                                <input
                                    id="property-search"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search by property or location"
                                    className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white pl-11 pr-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#A49A9F] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#7A1F3D]/10"
                                />
                            </div>
                        </div>

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
                                    setPropertyType(
                                        event.target.value
                                    )
                                }
                                className="mt-2 min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#7A1F3D]/10"
                            >
                                <option value="All">
                                    All Types
                                </option>
                                <option value="Apartment">
                                    Apartment
                                </option>
                                <option value="House">
                                    House
                                </option>
                                <option value="Duplex">
                                    Duplex
                                </option>
                                <option value="Self Contain">
                                    Self Contain
                                </option>
                            </select>
                        </div>

                        {/* Price */}
                        <div>
                            <label
                                htmlFor="price-range"
                                className="text-sm font-semibold text-[#24171C]"
                            >
                                Annual Rent
                            </label>

                            <select
                                id="price-range"
                                value={priceRange}
                                onChange={(event) =>
                                    setPriceRange(
                                        event.target.value
                                    )
                                }
                                className="mt-2 min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#7A1F3D]/10"
                            >
                                <option value="All">
                                    Any Price
                                </option>
                                <option value="Under ₦1m">
                                    Under ₦1m
                                </option>
                                <option value="₦1m - ₦2m">
                                    ₦1m - ₦2m
                                </option>
                                <option value="₦2m - ₦4m">
                                    ₦2m - ₦4m
                                </option>
                                <option value="Above ₦4m">
                                    Above ₦4m
                                </option>
                            </select>
                        </div>

                        {/* More Filters */}
                        <button
                            type="button"
                            onClick={() =>
                                setShowMoreFilters(
                                    !showMoreFilters
                                )
                            }
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] px-5 py-3 text-sm font-semibold text-[#24171C] transition hover:border-[#7A1F3D] hover:text-[#7A1F3D]"
                        >
                            <SlidersHorizontal size={17} />
                            More Filters
                        </button>
                    </div>

                    {/* More Filters Panel */}
                    {showMoreFilters && (
                        <div className="mt-6 border-t border-[#E8DDE1] pt-6">
                            <div className="rounded-xl bg-[#F8EDEF] p-5">
                                <div className="flex items-start gap-3">
                                    <SlidersHorizontal
                                        size={19}
                                        className="mt-0.5 shrink-0 text-[#7A1F3D]"
                                    />

                                    <div>
                                        <p className="text-sm font-semibold text-[#4A1025]">
                                            Additional filters
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-[#756970]">
                                            More detailed filters such as
                                            bedroom count, bathroom count,
                                            and verification status can be
                                            added as the property search
                                            experience expands.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Results Header */}
                <section className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[#24171C]">
                            Available Properties
                        </h2>

                        <p className="mt-2 text-sm text-[#756970]">
                            {loading
                                ? "Finding properties..."
                                : `${filteredProperties.length} ${
                                      filteredProperties.length === 1
                                          ? "property"
                                          : "properties"
                                  } found`}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:min-w-52">
                        <label
                            htmlFor="sort-properties"
                            className="text-xs font-semibold uppercase tracking-wide text-[#756970]"
                        >
                            Sort By
                        </label>

                        <div className="relative">
                            <ArrowUpDown
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
                            />

                            <select
                                id="sort-properties"
                                value={sortBy}
                                onChange={(event) =>
                                    setSortBy(
                                        event.target.value
                                    )
                                }
                                className="min-h-11 w-full appearance-none rounded-lg border border-[#E8DDE1] bg-white pl-9 pr-4 text-sm font-medium text-[#24171C] outline-none focus:border-[#7A1F3D]"
                            >
                                <option value="Newest">
                                    Newest
                                </option>
                                <option value="Price: Low to High">
                                    Price: Low to High
                                </option>
                                <option value="Price: High to Low">
                                    Price: High to Low
                                </option>
                                <option value="Bedrooms">
                                    Most Bedrooms
                                </option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Active Filters */}
                {hasActiveFilters && !loading && (
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                        {searchTerm.trim() && (
                            <FilterTag
                                label={`Search: ${searchTerm}`}
                                onRemove={() =>
                                    setSearchTerm("")
                                }
                            />
                        )}

                        {propertyType !== "All" && (
                            <FilterTag
                                label={propertyType}
                                onRemove={() =>
                                    setPropertyType("All")
                                }
                            />
                        )}

                        {priceRange !== "All" && (
                            <FilterTag
                                label={priceRange}
                                onRemove={() =>
                                    setPriceRange("All")
                                }
                            />
                        )}

                        <button
                            type="button"
                            onClick={clearFilters}
                            className="ml-1 text-xs font-semibold text-[#7A1F3D] hover:underline"
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {/* Error */}
                {errorMessage && (
                    <div className="mt-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-[#B91C1C]">
                        <AlertCircle
                            size={19}
                            className="mt-0.5 shrink-0"
                        />

                        <p>{errorMessage}</p>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-12 text-center shadow-sm">
                        <Loader2
                            size={34}
                            className="mx-auto animate-spin text-[#7A1F3D]"
                        />

                        <p className="mt-4 text-sm font-medium text-[#756970]">
                            Loading available properties...
                        </p>
                    </div>
                )}

                {/* Empty */}
                {!loading &&
                    !errorMessage &&
                    filteredProperties.length === 0 && (
                        <section className="mt-8 rounded-2xl border border-dashed border-[#E8DDE1] bg-white px-6 py-16 text-center shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8EDEF]">
                                <Search
                                    size={27}
                                    className="text-[#7A1F3D]"
                                />
                            </div>

                            <h3 className="mt-6 text-xl font-bold text-[#24171C]">
                                No properties found
                            </h3>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756970]">
                                Try changing your search or filters to
                                find available properties.
                            </p>

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#7A1F3D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                            >
                                Clear Filters
                            </button>
                        </section>
                    )}

                {/* Property Grid */}
                {!loading &&
                    !errorMessage &&
                    filteredProperties.length > 0 && (
                        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {filteredProperties.map(
                                (property) => (
                                    <PropertyCard
                                        key={property.id}
                                        property={property}
                                    />
                                )
                            )}
                        </section>
                    )}

                {/* Safety Notice */}
                <section className="mt-12 rounded-2xl bg-[#2D0A17] p-7 text-white sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                            <ShieldCheck size={22} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold">
                                Use verification information wisely
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/75">
                                A verified status indicates that a property
                                has passed RentSure's verification process.
                                It does not guarantee ownership, availability,
                                or complete freedom from fraud. Always review
                                the available information before making a
                                rental decision or payment.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function PropertyCard({ property }) {
    const verification =
        getVerificationDetails(
            property.verification_status
        );

    return (
        <article className="overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            {/* Visual */}
            <div className="relative h-56 overflow-hidden bg-[#F3E8EB]">
                <div className="absolute inset-0 flex items-end justify-center px-8 pt-8">
                    <div className="relative h-full w-full rounded-t-[1.75rem] border border-[#D8C2C9] bg-white shadow-sm">
                        <div className="absolute left-5 right-5 top-5 h-2 rounded-full bg-[#7A1F3D]/15" />

                        <div className="absolute bottom-7 left-6 right-6 grid grid-cols-3 gap-2.5">
                            <div className="h-16 rounded-md border border-[#E8DDE1] bg-[#F8EDEF]" />
                            <div className="h-16 rounded-md border border-[#E8DDE1] bg-[#F8EDEF]" />
                            <div className="h-16 rounded-md border border-[#E8DDE1] bg-[#F8EDEF]" />
                        </div>

                        <div className="absolute bottom-0 left-1/2 h-24 w-16 -translate-x-1/2 rounded-t-lg border border-[#D8C2C9] bg-[#FAF8F9]" />
                    </div>
                </div>

                <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#4A1025] shadow-sm">
                    {property.property_type}
                </span>

                <span
                    className={`absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${verification.className}`}
                >
                    {verification.icon}
                    {verification.label}
                </span>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-lg font-bold leading-6 text-[#24171C]">
                    {property.title}
                </h3>

                <div className="mt-2 flex items-start gap-2 text-sm text-[#756970]">
                    <MapPin
                        size={16}
                        className="mt-0.5 shrink-0"
                    />

                    <span>
                        {property.location}
                    </span>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-[#756970]">
                            Annual Rent
                        </p>

                        <p className="mt-1 text-lg font-bold text-[#7A1F3D]">
                            ₦{formatAmount(property.annual_rent)}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#756970]">
                        <span className="inline-flex items-center gap-1">
                            <BedDouble
                                size={15}
                                className="text-[#7A1F3D]"
                            />
                            {property.bedrooms}
                        </span>

                        <span className="inline-flex items-center gap-1">
                            <Bath
                                size={15}
                                className="text-[#7A1F3D]"
                            />
                            {property.bathrooms}
                        </span>
                    </div>
                </div>

                <Link
                    to={`/properties/${property.id}`}
                    className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                >
                    View Property
                    <ArrowRight size={16} />
                </Link>
            </div>
        </article>
    );
}

function FilterTag({
    label,
    onRemove,
}) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-3 py-1.5 text-xs font-semibold text-[#4A1025]">
            {label}

            <button
                type="button"
                onClick={onRemove}
                className="rounded-full transition hover:text-[#7A1F3D]"
                aria-label={`Remove ${label} filter`}
            >
                <X size={14} />
            </button>
        </span>
    );
}

function getVerificationDetails(status) {
    switch (status) {
        case "verified":
            return {
                label: "Verified",
                className:
                    "bg-[#E8F5EC] text-[#15803D]",
                icon: <ShieldCheck size={14} />,
            };

        case "under_review":
            return {
                label: "Under Review",
                className:
                    "bg-[#F8EDEF] text-[#7A1F3D]",
                icon: <Clock3 size={14} />,
            };

        case "needs_information":
            return {
                label: "Needs Information",
                className:
                    "bg-[#FFF4E5] text-[#B45309]",
                icon: <AlertCircle size={14} />,
            };

        case "rejected":
            return {
                label: "Rejected",
                className:
                    "bg-[#FDECEC] text-[#B91C1C]",
                icon: <AlertCircle size={14} />,
            };

        case "pending":
        default:
            return {
                label: "Pending Verification",
                className:
                    "bg-[#FFF4E5] text-[#B45309]",
                icon: <Clock3 size={14} />,
            };
    }
}

function formatAmount(amount) {
    return new Intl.NumberFormat("en-NG", {
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
}

export default Properties;

