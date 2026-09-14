import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Building2,
    Search,
    ShieldCheck,
    Clock3,
    AlertTriangle,
    MoreHorizontal,
    Eye,
    CheckCircle2,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { supabase } from "../../../services/supabase/client";

function AdminProperties() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [verificationFilter, setVerificationFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const fetchProperties = async () => {
        try {
            setLoading(true);
            setError("");

            const { data, error: supabaseError } = await supabase
                .from("properties")
                .select(
                    `
                    id,
                    agent_id,
                    title,
                    location,
                    property_type,
                    annual_rent,
                    bedrooms,
                    bathrooms,
                    description,
                    verification_status,
                    property_status,
                    risk_score,
                    created_at,
                    updated_at
                    `
                )
                .order("created_at", { ascending: false });

            if (supabaseError) {
                throw supabaseError;
            }

            setProperties(data || []);
        } catch (err) {
            console.error("Error fetching properties:", err);
            setError(
                "We couldn't load the property listings. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const filteredProperties = useMemo(() => {
        return properties.filter((property) => {
            const search = searchTerm.trim().toLowerCase();

            const title = property.title?.toLowerCase() || "";
            const location = property.location?.toLowerCase() || "";
            const agentId = property.agent_id?.toLowerCase() || "";
            const propertyType = property.property_type?.toLowerCase() || "";

            const matchesSearch =
                !search ||
                title.includes(search) ||
                location.includes(search) ||
                agentId.includes(search) ||
                propertyType.includes(search);

            const verificationStatus =
                property.verification_status?.toLowerCase() || "";

            const propertyStatus =
                property.property_status?.toLowerCase() || "";

            const matchesVerification =
                verificationFilter === "All" ||
                verificationStatus === verificationFilter.toLowerCase();

            const matchesStatus =
                statusFilter === "All" ||
                propertyStatus === statusFilter.toLowerCase();

            return matchesSearch && matchesVerification && matchesStatus;
        });
    }, [properties, searchTerm, verificationFilter, statusFilter]);

    const verifiedCount = properties.filter(
        (property) =>
            property.verification_status?.toLowerCase() === "verified"
    ).length;

    const pendingCount = properties.filter(
        (property) =>
            property.verification_status?.toLowerCase() === "pending"
    ).length;

    const flaggedCount = properties.filter(
        (property) =>
            property.property_status?.toLowerCase() === "flagged"
    ).length;

    const formatRent = (amount) => {
        if (amount === null || amount === undefined) {
            return "Not specified";
        }

        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date) => {
        if (!date) return "—";

        return new Intl.DateTimeFormat("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(date));
    };

    const formatStatus = (status) => {
        if (!status) return "Unknown";

        return status
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    const getVerificationClasses = (status) => {
        switch (status?.toLowerCase()) {
            case "verified":
                return "bg-[#E8F5EC] text-[#15803D]";

            case "rejected":
                return "bg-[#FDECEC] text-[#B91C1C]";

            case "pending":
            default:
                return "bg-[#FFF7E6] text-[#B45309]";
        }
    };

    const getPropertyStatusClasses = (status) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "bg-[#E8F5EC] text-[#15803D]";

            case "flagged":
            case "suspended":
            case "inactive":
                return "bg-[#FDECEC] text-[#B91C1C]";

            default:
                return "bg-[#F8EDEF] text-[#7A1F3D]";
        }
    };

    return (
        <main className="min-h-screen bg-[#FAF8F9]">
            <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-12">
                {/* Back */}
                <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:underline"
                >
                    <ArrowLeft size={17} />
                    Back to Admin Dashboard
                </Link>

                {/* Header */}
                <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EDEF]">
                                <Building2
                                    size={23}
                                    className="text-[#7A1F3D]"
                                />
                            </div>

                            <span className="text-sm font-semibold text-[#7A1F3D]">
                                Property Management
                            </span>
                        </div>

                        <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                            Manage properties
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
                            Review submitted properties, monitor verification
                            status, and identify properties that may require
                            administrative attention.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={fetchProperties}
                            disabled={loading}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] bg-white px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw
                                size={17}
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                        <Link
                            to="/admin/verification"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                        >
                            <ShieldCheck size={17} />
                            Verification Center
                        </Link>
                    </div>
                </div>

                {/* Summary */}
                <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[#756970]">
                                Total Properties
                            </span>

                            <Building2
                                size={20}
                                className="text-[#7A1F3D]"
                            />
                        </div>

                        <p className="mt-4 text-3xl font-bold text-[#24171C]">
                            {loading ? "—" : properties.length}
                        </p>

                        <p className="mt-2 text-xs text-[#756970]">
                            Currently submitted
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[#756970]">
                                Verified
                            </span>

                            <CheckCircle2
                                size={20}
                                className="text-[#15803D]"
                            />
                        </div>

                        <p className="mt-4 text-3xl font-bold text-[#24171C]">
                            {loading ? "—" : verifiedCount}
                        </p>

                        <p className="mt-2 text-xs text-[#756970]">
                            Passed RentSure review
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[#756970]">
                                Pending Review
                            </span>

                            <Clock3
                                size={20}
                                className="text-[#B45309]"
                            />
                        </div>

                        <p className="mt-4 text-3xl font-bold text-[#24171C]">
                            {loading ? "—" : pendingCount}
                        </p>

                        <p className="mt-2 text-xs text-[#756970]">
                            Awaiting verification
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[#756970]">
                                Flagged
                            </span>

                            <AlertTriangle
                                size={20}
                                className="text-[#B91C1C]"
                            />
                        </div>

                        <p className="mt-4 text-3xl font-bold text-[#24171C]">
                            {loading ? "—" : flaggedCount}
                        </p>

                        <p className="mt-2 text-xs text-[#756970]">
                            Require attention
                        </p>
                    </div>
                </section>

                {/* Filters */}
                <section className="mt-10 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
                    <div className="grid gap-4 lg:grid-cols-[1fr_200px_200px]">
                        {/* Search */}
                        <div>
                            <label
                                htmlFor="property-search"
                                className="mb-2 block text-sm font-semibold text-[#24171C]"
                            >
                                Search properties
                            </label>

                            <div className="relative">
                                <Search
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#756970]"
                                />

                                <input
                                    id="property-search"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                    placeholder="Search by property, location, agent ID, or type..."
                                    className="min-h-11 w-full rounded-lg border border-[#E8DDE1] bg-[#FAF8F9] pl-11 pr-4 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                                />
                            </div>
                        </div>

                        {/* Verification Filter */}
                        <div>
                            <label
                                htmlFor="verification-filter"
                                className="mb-2 block text-sm font-semibold text-[#24171C]"
                            >
                                Verification
                            </label>

                            <select
                                id="verification-filter"
                                value={verificationFilter}
                                onChange={(event) =>
                                    setVerificationFilter(event.target.value)
                                }
                                className="min-h-11 w-full rounded-lg border border-[#E8DDE1] bg-[#FAF8F9] px-4 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                            >
                                <option value="All">All</option>
                                <option value="Verified">Verified</option>
                                <option value="Pending">Pending</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label
                                htmlFor="status-filter"
                                className="mb-2 block text-sm font-semibold text-[#24171C]"
                            >
                                Property Status
                            </label>

                            <select
                                id="status-filter"
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                                className="min-h-11 w-full rounded-lg border border-[#E8DDE1] bg-[#FAF8F9] px-4 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                            >
                                <option value="All">All</option>
                                <option value="Active">Active</option>
                                <option value="Flagged">Flagged</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Results */}
                <section className="mt-10">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-[#24171C]">
                                Property listings
                            </h2>

                            <p className="mt-1 text-sm text-[#756970]">
                                {loading
                                    ? "Loading submitted properties..."
                                    : `Showing ${filteredProperties.length} of ${properties.length} properties`}
                            </p>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="mt-6 rounded-2xl border border-[#E8DDE1] bg-white px-6 py-16 text-center shadow-sm">
                            <Loader2
                                size={32}
                                className="mx-auto animate-spin text-[#7A1F3D]"
                            />

                            <h3 className="mt-4 text-lg font-bold text-[#24171C]">
                                Loading properties
                            </h3>

                            <p className="mt-2 text-sm text-[#756970]">
                                Fetching submitted properties from RentSure.
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="mt-6 rounded-2xl border border-[#F1CACA] bg-white px-6 py-12 text-center shadow-sm">
                            <AlertTriangle
                                size={32}
                                className="mx-auto text-[#B91C1C]"
                            />

                            <h3 className="mt-4 text-lg font-bold text-[#24171C]">
                                Unable to load properties
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756970]">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={fetchProperties}
                                className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                            >
                                <RefreshCw size={16} />
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Desktop Table */}
                    {!loading && !error && filteredProperties.length > 0 && (
                        <div className="mt-6 hidden overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm lg:block">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1100px]">
                                    <thead className="border-b border-[#E8DDE1] bg-[#FAF8F9]">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                                                Property
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                                                Agent ID
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                                                Rent
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                                                Verification
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                                                Risk
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                                                Status
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                                                Submitted
                                            </th>

                                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-[#756970]">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-[#E8DDE1]">
                                        {filteredProperties.map((property) => (
                                            <tr
                                                key={property.id}
                                                className="transition hover:bg-[#FAF8F9]"
                                            >
                                                <td className="px-6 py-5">
                                                    <div>
                                                        <p className="font-semibold text-[#24171C]">
                                                            {property.title ||
                                                                "Untitled Property"}
                                                        </p>

                                                        <p className="mt-1 text-xs text-[#756970]">
                                                            {property.location ||
                                                                "Location not specified"}
                                                        </p>

                                                        <span className="mt-2 inline-flex rounded-full bg-[#F8EDEF] px-2.5 py-1 text-[11px] font-semibold text-[#7A1F3D]">
                                                            {formatStatus(
                                                                property.property_type
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5 text-sm text-[#24171C]">
                                                    <span
                                                        className="block max-w-[150px] truncate"
                                                        title={property.agent_id}
                                                    >
                                                        {property.agent_id || "—"}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5 text-sm font-semibold text-[#24171C]">
                                                    {formatRent(
                                                        property.annual_rent
                                                    )}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getVerificationClasses(
                                                            property.verification_status
                                                        )}`}
                                                    >
                                                        {formatStatus(
                                                            property.verification_status
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5">
                                                    {property.risk_score !== null &&
                                                    property.risk_score !==
                                                        undefined ? (
                                                        <span
                                                            className={`text-sm font-bold ${
                                                                property.risk_score >=
                                                                80
                                                                    ? "text-[#15803D]"
                                                                    : property.risk_score >=
                                                                      60
                                                                    ? "text-[#B45309]"
                                                                    : "text-[#B91C1C]"
                                                            }`}
                                                        >
                                                            {property.risk_score}
                                                            /100
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-[#756970]">
                                                            Not scored
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getPropertyStatusClasses(
                                                            property.property_status
                                                        )}`}
                                                    >
                                                        {formatStatus(
                                                            property.property_status
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5 text-sm text-[#756970]">
                                                    {formatDate(
                                                        property.created_at
                                                    )}
                                                </td>

                                                <td className="px-6 py-5 text-right">
                                                    <Link
                                                        to={`/properties/${property.id}`}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                                                        aria-label={`View ${property.title}`}
                                                    >
                                                        <Eye size={18} />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#756970] transition hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                                                        aria-label={`More actions for ${property.title}`}
                                                    >
                                                        <MoreHorizontal
                                                            size={18}
                                                        />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Mobile / Tablet Cards */}
                    {!loading && !error && filteredProperties.length > 0 && (
                        <div className="mt-6 grid gap-5 lg:hidden">
                            {filteredProperties.map((property) => (
                                <article
                                    key={property.id}
                                    className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-[#24171C]">
                                                {property.title ||
                                                    "Untitled Property"}
                                            </h3>

                                            <p className="mt-2 text-sm text-[#756970]">
                                                {property.location ||
                                                    "Location not specified"}
                                            </p>

                                            <span className="mt-3 inline-flex rounded-full bg-[#F8EDEF] px-2.5 py-1 text-[11px] font-semibold text-[#7A1F3D]">
                                                {formatStatus(
                                                    property.property_type
                                                )}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#756970] hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                                            aria-label={`More actions for ${property.title}`}
                                        >
                                            <MoreHorizontal size={19} />
                                        </button>
                                    </div>

                                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs font-medium text-[#756970]">
                                                Agent ID
                                            </p>

                                            <p
                                                className="mt-1 truncate text-sm font-semibold text-[#24171C]"
                                                title={property.agent_id}
                                            >
                                                {property.agent_id || "—"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-[#756970]">
                                                Annual Rent
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-[#24171C]">
                                                {formatRent(
                                                    property.annual_rent
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-[#756970]">
                                                Verification
                                            </p>

                                            <span
                                                className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getVerificationClasses(
                                                    property.verification_status
                                                )}`}
                                            >
                                                {formatStatus(
                                                    property.verification_status
                                                )}
                                            </span>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-[#756970]">
                                                Property Status
                                            </p>

                                            <span
                                                className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getPropertyStatusClasses(
                                                    property.property_status
                                                )}`}
                                            >
                                                {formatStatus(
                                                    property.property_status
                                                )}
                                            </span>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-[#756970]">
                                                Risk Score
                                            </p>

                                            <p
                                                className={`mt-1 text-sm font-bold ${
                                                    property.risk_score >= 80
                                                        ? "text-[#15803D]"
                                                        : property.risk_score >=
                                                          60
                                                        ? "text-[#B45309]"
                                                        : property.risk_score
                                                        ? "text-[#B91C1C]"
                                                        : "text-[#756970]"
                                                }`}
                                            >
                                                {property.risk_score
                                                    ? `${property.risk_score}/100`
                                                    : "Not scored"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-[#756970]">
                                                Submitted
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-[#24171C]">
                                                {formatDate(
                                                    property.created_at
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex flex-col gap-3 border-t border-[#E8DDE1] pt-5 sm:flex-row">
                                        <Link
                                            to={`/properties/${property.id}`}
                                            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] px-4 py-2.5 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                                        >
                                            <Eye size={16} />
                                            View Property
                                        </Link>

                                        <Link
                                            to="/admin/verification"
                                            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                                        >
                                            <ShieldCheck size={16} />
                                            Review
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading &&
                        !error &&
                        filteredProperties.length === 0 && (
                            <div className="mt-6 rounded-2xl border border-dashed border-[#E8DDE1] bg-white px-6 py-12 text-center">
                                <Building2
                                    size={32}
                                    className="mx-auto text-[#756970]"
                                />

                                <h3 className="mt-4 text-lg font-bold text-[#24171C]">
                                    No properties found
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756970]">
                                    Try changing your search term or adjusting
                                    the filters.
                                </p>
                            </div>
                        )}
                </section>

                {/* Admin Notice */}
                <section className="mt-12 rounded-2xl bg-[#2D0A17] p-7 text-white sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                            <ShieldCheck size={22} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold">
                                Administrative review matters
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75">
                                Property verification should be based on
                                submitted information and supporting evidence.
                                A verified property is not a legal guarantee
                                of ownership, availability, or complete
                                freedom from fraud.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default AdminProperties;