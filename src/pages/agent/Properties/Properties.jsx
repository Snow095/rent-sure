
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Plus,
    Building2,
    MapPin,
    BedDouble,
    Bath,
    ShieldCheck,
    Clock3,
    ArrowRight,
    Pencil,
    AlertCircle,
    Loader2,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../services/supabase/client";

function Properties() {
    const { user } = useAuth();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchProperties = async () => {
            if (!user) {
                setProperties([]);
                setLoading(false);
                return;
            }

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
                        created_at,
                        updated_at
                    `)
                    .eq("agent_id", user.id)
                    .order("created_at", {
                        ascending: false,
                    });

                if (error) {
                    throw error;
                }

                setProperties(data || []);
            } catch (error) {
                console.error(
                    "Error fetching agent properties:",
                    error
                );

                setErrorMessage(
                    error.message ||
                    "Unable to load your properties."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [user]);

    return (
        <main className="min-h-screen bg-[#FAF8F9] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
            <div className="mx-auto w-full max-w-7xl">

                {/* Header */}
                <section>
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7A1F3D]">
                                Agent Portal
                            </p>

                            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                                My Properties
                            </h1>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#756970] sm:text-base">
                                Manage your rental listings, monitor their
                                verification status, and keep your property
                                information up to date.
                            </p>
                        </div>

                        <Link
                            to="/agent/add-property"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025]"
                        >
                            <Plus size={18} />
                            Add Property
                        </Link>
                    </div>
                </section>

                {/* Stats */}
                <section className="mt-10 grid gap-5 sm:grid-cols-3">
                    <StatCard
                        label="Total Properties"
                        value={properties.length}
                        icon={Building2}
                    />

                    <StatCard
                        label="Verified"
                        value={
                            properties.filter(
                                (property) =>
                                    property.verification_status ===
                                    "verified"
                            ).length
                        }
                        icon={ShieldCheck}
                    />

                    <StatCard
                        label="Pending"
                        value={
                            properties.filter(
                                (property) =>
                                    property.verification_status ===
                                    "pending"
                            ).length
                        }
                        icon={Clock3}
                    />
                </section>

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
                    <div className="mt-10 rounded-2xl border border-[#E8DDE1] bg-white p-10 text-center shadow-sm">
                        <Loader2
                            size={32}
                            className="mx-auto animate-spin text-[#7A1F3D]"
                        />

                        <p className="mt-4 text-sm font-medium text-[#756970]">
                            Loading your properties...
                        </p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !errorMessage && properties.length === 0 && (
                    <section className="mt-10 rounded-2xl border border-dashed border-[#E8DDE1] bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8EDEF]">
                            <Building2
                                size={27}
                                className="text-[#7A1F3D]"
                            />
                        </div>

                        <h2 className="mt-6 text-xl font-bold text-[#24171C]">
                            No properties yet
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756970]">
                            You haven't added any rental properties yet.
                            Start by creating your first property listing.
                        </p>

                        <Link
                            to="/agent/add-property"
                            className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                        >
                            <Plus size={17} />
                            Add Your First Property
                        </Link>
                    </section>
                )}

                {/* Properties */}
                {!loading && properties.length > 0 && (
                    <section className="mt-10">

                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-[#24171C]">
                                    Your Listings
                                </h2>

                                <p className="mt-2 text-sm text-[#756970]">
                                    {properties.length}{" "}
                                    {properties.length === 1
                                        ? "property"
                                        : "properties"}{" "}
                                    listed
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            {properties.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Information Notice */}
                <section className="mt-12 rounded-2xl bg-[#2D0A17] p-7 text-white sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                            <ShieldCheck size={22} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold">
                                Keep your property information accurate
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/75">
                                Properties submitted through RentSure begin
                                with a pending verification status. Providing
                                accurate information and appropriate supporting
                                evidence helps the verification process.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
}) {
    return (
        <div className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-[#756970]">
                        {label}
                    </p>

                    <p className="mt-3 text-3xl font-bold text-[#24171C]">
                        {value}
                    </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF]">
                    <Icon
                        size={21}
                        className="text-[#7A1F3D]"
                    />
                </div>
            </div>
        </div>
    );
}

function PropertyCard({ property }) {
    const verification = getVerificationDetails(
        property.verification_status
    );

    return (
        <article className="overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm transition hover:shadow-md">

            {/* Property Visual */}
            <div className="relative h-60 overflow-hidden bg-[#F3E8EB]">
                <div className="absolute inset-0 flex items-end justify-center px-10 pt-8">
                    <div className="relative h-full w-full max-w-md rounded-t-[2rem] border border-[#D8C2C9] bg-white shadow-sm">
                        <div className="absolute left-6 right-6 top-6 h-2 rounded-full bg-[#7A1F3D]/15" />

                        <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-3">
                            <div className="h-20 rounded-md border border-[#E8DDE1] bg-[#F8EDEF]" />
                            <div className="h-20 rounded-md border border-[#E8DDE1] bg-[#F8EDEF]" />
                            <div className="h-20 rounded-md border border-[#E8DDE1] bg-[#F8EDEF]" />
                        </div>

                        <div className="absolute bottom-0 left-1/2 h-28 w-20 -translate-x-1/2 rounded-t-lg border border-[#D8C2C9] bg-[#FAF8F9]" />
                    </div>
                </div>

                {/* Type */}
                <span className="absolute left-5 top-5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#4A1025] shadow-sm">
                    {property.property_type}
                </span>

                {/* Verification */}
                <span
                    className={`absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${verification.className}`}
                >
                    {verification.icon}

                    {verification.label}
                </span>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-7">

                <div>
                    <h3 className="text-xl font-bold text-[#24171C]">
                        {property.title}
                    </h3>

                    <div className="mt-2 flex items-start gap-2 text-sm text-[#756970]">
                        <MapPin
                            size={17}
                            className="mt-0.5 shrink-0"
                        />

                        <span>
                            {property.location}
                        </span>
                    </div>
                </div>

                {/* Property Details */}
                <div className="mt-6 grid grid-cols-3 gap-3 border-y border-[#E8DDE1] py-5">
                    <PropertyFeature
                        icon={BedDouble}
                        value={property.bedrooms}
                        label="Beds"
                    />

                    <PropertyFeature
                        icon={Bath}
                        value={property.bathrooms}
                        label="Baths"
                    />

                    <div>
                        <p className="text-xs text-[#756970]">
                            Annual Rent
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#24171C]">
                            ₦{formatAmount(property.annual_rent)}
                        </p>
                    </div>
                </div>

                {/* Status */}
                <div className="mt-5">
                    <p className="text-xs font-medium text-[#756970]">
                        Verification Status
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#24171C]">
                        {verification.label}
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Link
                        to={`/properties/${property.id}`}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] px-4 py-3 text-sm font-semibold text-[#24171C] transition hover:border-[#7A1F3D] hover:text-[#7A1F3D]"
                    >
                        View Property
                        <ArrowRight size={16} />
                    </Link>

                    <Link
                        to={`/agent/verification/${property.id}/details`}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                    >
                        <ShieldCheck size={16} />
                        Verification
                    </Link>
                </div>

                <button
                    type="button"
                    disabled
                    className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-[#756970] opacity-70"
                    title="Property editing will be connected next"
                >
                    <Pencil size={15} />
                    Edit Property
                </button>
            </div>
        </article>
    );
}

function PropertyFeature({
    icon: Icon,
    value,
    label,
}) {
    return (
        <div>
            <div className="flex items-center gap-1.5">
                <Icon
                    size={16}
                    className="text-[#7A1F3D]"
                />

                <span className="text-sm font-bold text-[#24171C]">
                    {value}
                </span>
            </div>

            <p className="mt-1 text-xs text-[#756970]">
                {label}
            </p>
        </div>
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