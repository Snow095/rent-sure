
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    MapPin,
    BedDouble,
    Bath,
    ShieldCheck,
    AlertTriangle,
    UserRound,
    CalendarDays,
    Loader2,
    AlertCircle,
    Clock3,
    Heart,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase/client";

function PropertyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [property, setProperty] = useState(null);
    const [agent, setAgent] = useState(null);

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [isSaved, setIsSaved] = useState(false);
    const [savingProperty, setSavingProperty] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    useEffect(() => {
        const fetchProperty = async () => {
            setLoading(true);
            setErrorMessage("");

            try {
                const propertyId = Number(id);

                if (!Number.isInteger(propertyId)) {
                    throw new Error("Invalid property ID.");
                }

                const { data, error } = await supabase
                    .from("properties")
                    .select(`
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
                    `)
                    .eq("id", propertyId)
                    .eq("property_status", "active")
                    .single();

                if (error) {
                    throw error;
                }

                setProperty(data);

                if (data?.agent_id) {
                    const {
                        data: agentData,
                        error: agentError,
                    } = await supabase
                        .from("profiles")
                        .select(`
                            id,
                            full_name,
                            role
                        `)
                        .eq("id", data.agent_id)
                        .eq("role", "agent")
                        .single();

                    if (!agentError) {
                        setAgent(agentData);
                    }
                }
            } catch (error) {
                console.error(
                    "Error fetching property:",
                    error
                );

                setErrorMessage(
                    error.message ||
                    "Unable to load this property."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id]);

    /*
     * Check whether the current renter has already
     * saved this property.
     */
    useEffect(() => {
        const checkSavedProperty = async () => {
            if (!user || !id) {
                setIsSaved(false);
                return;
            }

            const propertyId = Number(id);

            if (!Number.isInteger(propertyId)) {
                return;
            }

            const { data, error } = await supabase
                .from("saved_properties")
                .select("id")
                .eq("renter_id", user.id)
                .eq("property_id", propertyId)
                .maybeSingle();

            if (error) {
                console.error(
                    "Error checking saved property:",
                    error
                );
                return;
            }

            setIsSaved(Boolean(data));
        };

        checkSavedProperty();
    }, [user, id]);

    /*
     * Save or remove the current property.
     */
    const handleToggleSave = async () => {
        if (!user) {
            navigate("/login", {
                state: {
                    from: `/properties/${id}`,
                },
            });

            return;
        }

        const propertyId = Number(id);

        if (!Number.isInteger(propertyId)) {
            setSaveMessage("Unable to save this property.");
            return;
        }

        setSavingProperty(true);
        setSaveMessage("");

        try {
            if (isSaved) {
                const { error } = await supabase
                    .from("saved_properties")
                    .delete()
                    .eq("renter_id", user.id)
                    .eq("property_id", propertyId);

                if (error) {
                    throw error;
                }

                setIsSaved(false);
                setSaveMessage(
                    "Property removed from your saved properties."
                );
            } else {
                const { error } = await supabase
                    .from("saved_properties")
                    .insert({
                        renter_id: user.id,
                        property_id: propertyId,
                    });

                if (error) {
                    throw error;
                }

                setIsSaved(true);
                setSaveMessage(
                    "Property saved successfully."
                );
            }
        } catch (error) {
            console.error(
                "Error updating saved property:",
                error
            );

            /*
             * Handles the case where the property was already
             * saved even if the UI state was temporarily stale.
             */
            if (error.code === "23505") {
                setIsSaved(true);
                setSaveMessage(
                    "This property is already saved."
                );
            } else {
                setSaveMessage(
                    error.message ||
                    "Unable to update your saved property."
                );
            }
        } finally {
            setSavingProperty(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#FAF8F9] px-5 py-16">
                <div className="text-center">
                    <Loader2
                        size={36}
                        className="mx-auto animate-spin text-[#7A1F3D]"
                    />

                    <p className="mt-4 text-sm font-medium text-[#756970]">
                        Loading property details...
                    </p>
                </div>
            </main>
        );
    }

    if (errorMessage || !property) {
        return (
            <main className="min-h-screen bg-[#FAF8F9] px-5 py-16 sm:px-8 lg:px-10">
                <div className="mx-auto w-full max-w-3xl">
                    <div className="rounded-2xl border border-[#E8DDE1] bg-white p-8 text-center shadow-sm sm:p-10">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FDECEC]">
                            <AlertCircle
                                size={30}
                                className="text-[#B91C1C]"
                            />
                        </div>

                        <h1 className="mt-6 text-2xl font-bold text-[#24171C]">
                            Property unavailable
                        </h1>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756970]">
                            {errorMessage ||
                                "This property could not be found or is no longer available."}
                        </p>

                        <Link
                            to="/properties"
                            className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                        >
                            <ArrowLeft size={17} />
                            Back to Properties
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const verification =
        getVerificationDetails(
            property.verification_status
        );

    const risk = getRiskDetails(
        property.risk_score
    );

    return (
        <main className="min-h-screen bg-[#FAF8F9] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
            <div className="mx-auto w-full max-w-7xl">

                {/* Back */}
                <Link
                    to="/properties"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
                >
                    <ArrowLeft size={17} />
                    Back to Properties
                </Link>

                {/* Header */}
                <section className="mt-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-[#F8EDEF] px-3 py-1.5 text-xs font-semibold text-[#4A1025]">
                                    {property.property_type}
                                </span>

                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${verification.className}`}
                                >
                                    {verification.icon}
                                    {verification.label}
                                </span>
                            </div>

                            <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl lg:text-5xl">
                                {property.title}
                            </h1>

                            <div className="mt-4 flex items-start gap-2 text-sm text-[#756970] sm:text-base">
                                <MapPin
                                    size={19}
                                    className="mt-0.5 shrink-0 text-[#7A1F3D]"
                                />

                                <span>
                                    {property.location}
                                </span>
                            </div>
                        </div>

                        <div className="shrink-0 rounded-2xl border border-[#E8DDE1] bg-white px-6 py-5 shadow-sm">
                            <p className="text-xs font-medium text-[#756970]">
                                Annual Rent
                            </p>

                            <p className="mt-1 text-2xl font-bold text-[#7A1F3D]">
                                ₦{formatAmount(property.annual_rent)}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Property Visual */}
                <section className="mt-10 overflow-hidden rounded-3xl border border-[#E8DDE1] bg-[#F3E8EB] shadow-sm">
                    <div className="relative flex min-h-[340px] items-end justify-center px-8 pt-12 sm:min-h-[440px] sm:px-16">
                        <div className="relative h-[250px] w-full max-w-3xl rounded-t-[3rem] border border-[#D8C2C9] bg-white shadow-md sm:h-[330px]">

                            <div className="absolute left-8 right-8 top-8 h-3 rounded-full bg-[#7A1F3D]/15 sm:left-12 sm:right-12" />

                            <div className="absolute bottom-10 left-8 right-8 grid grid-cols-3 gap-4 sm:left-16 sm:right-16 sm:gap-6">
                                <div className="h-24 rounded-lg border border-[#E8DDE1] bg-[#F8EDEF] sm:h-32" />
                                <div className="h-24 rounded-lg border border-[#E8DDE1] bg-[#F8EDEF] sm:h-32" />
                                <div className="h-24 rounded-lg border border-[#E8DDE1] bg-[#F8EDEF] sm:h-32" />
                            </div>

                            <div className="absolute bottom-0 left-1/2 h-32 w-24 -translate-x-1/2 rounded-t-xl border border-[#D8C2C9] bg-[#FAF8F9] sm:h-44 sm:w-32" />
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <div className="mt-10 grid gap-8 lg:grid-cols-[1.55fr_0.85fr]">

                    {/* Left */}
                    <div className="space-y-8">

                        {/* Overview */}
                        <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="text-xl font-bold text-[#24171C]">
                                Property Overview
                            </h2>

                            <div className="mt-6 grid gap-5 sm:grid-cols-3">
                                <OverviewItem
                                    icon={BedDouble}
                                    label="Bedrooms"
                                    value={property.bedrooms}
                                />

                                <OverviewItem
                                    icon={Bath}
                                    label="Bathrooms"
                                    value={property.bathrooms}
                                />

                                <OverviewItem
                                    icon={ShieldCheck}
                                    label="Verification"
                                    value={verification.label}
                                />
                            </div>
                        </section>

                        {/* Description */}
                        <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="text-xl font-bold text-[#24171C]">
                                About This Property
                            </h2>

                            <p className="mt-5 text-sm leading-7 text-[#756970]">
                                {property.description ||
                                    "No detailed description has been provided for this property yet."}
                            </p>
                        </section>

                        {/* Verification */}
                        <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8F5EC]">
                                    <ShieldCheck
                                        size={24}
                                        className="text-[#15803D]"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-[#24171C]">
                                        RentSure Verification
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-[#756970]">
                                        This listing has a RentSure verification
                                        status based on the information and
                                        supporting evidence submitted for review.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 rounded-xl bg-[#F8EDEF] p-5">
                                <p className="text-sm font-semibold text-[#4A1025]">
                                    Verification status:{" "}
                                    {verification.label}
                                </p>

                                <p className="mt-2 text-sm leading-6 text-[#756970]">
                                    Verification helps renters assess available
                                    evidence and identify potential concerns.
                                    It is not a legal guarantee of ownership,
                                    availability, or complete freedom from fraud.
                                </p>
                            </div>
                        </section>

                        {/* Risk */}
                        <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-[#24171C]">
                                        RentSure Risk Indicator
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-[#756970]">
                                        A summary indicator designed to help
                                        renters understand the current risk
                                        assessment associated with this listing.
                                    </p>
                                </div>

                                <div className="shrink-0 text-left sm:text-right">
                                    <p className="text-3xl font-bold text-[#24171C]">
                                        {property.risk_score ?? "—"}
                                    </p>

                                    <p
                                        className={`mt-1 text-sm font-semibold ${risk.textClass}`}
                                    >
                                        {risk.label}
                                    </p>
                                </div>
                            </div>

                            {property.risk_score !== null &&
                                property.risk_score !== undefined && (
                                    <div className="mt-6">
                                        <div className="h-3 overflow-hidden rounded-full bg-[#E8DDE1]">
                                            <div
                                                className={`h-full rounded-full ${risk.barClass}`}
                                                style={{
                                                    width: `${Math.min(
                                                        Math.max(
                                                            Number(
                                                                property.risk_score
                                                            ) || 0,
                                                            0
                                                        ),
                                                        100
                                                    )}%`,
                                                }}
                                            />
                                        </div>

                                        <div className="mt-2 flex justify-between text-xs text-[#756970]">
                                            <span>
                                                Lower confidence
                                            </span>

                                            <span>
                                                Higher confidence
                                            </span>
                                        </div>
                                    </div>
                                )}

                            <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#E8DDE1] p-5">
                                <AlertTriangle
                                    size={19}
                                    className="mt-0.5 shrink-0 text-[#B45309]"
                                />

                                <p className="text-sm leading-6 text-[#756970]">
                                    The risk indicator is an informational
                                    assessment, not a guarantee or legal
                                    judgment. Renters should still review
                                    documents, property details, and payment
                                    requests carefully.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Right */}
                    <aside className="space-y-8">

                        {/* Agent */}
                        <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-7">
                            <h2 className="text-lg font-bold text-[#24171C]">
                                Listed By
                            </h2>

                            <div className="mt-6 flex items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F8EDEF]">
                                    <UserRound
                                        size={25}
                                        className="text-[#7A1F3D]"
                                    />
                                </div>

                                <div>
                                    <p className="font-bold text-[#24171C]">
                                        {agent?.full_name ||
                                            "Verified Agent"}
                                    </p>

                                    <p className="mt-1 text-sm text-[#756970]">
                                        RentSure Agent
                                    </p>
                                </div>
                            </div>

                            <Link
                                to="/agents"
                                className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] px-5 py-3 text-sm font-semibold text-[#24171C] transition hover:border-[#7A1F3D] hover:text-[#7A1F3D]"
                            >
                                View Agent Profile
                                <ArrowRight size={16} />
                            </Link>
                        </section>

                        {/* Viewing + Save */}
                        <section className="rounded-2xl bg-[#7A1F3D] p-6 text-white shadow-sm sm:p-7">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                                <CalendarDays size={23} />
                            </div>

                            <h2 className="mt-5 text-xl font-bold">
                                Interested in this property?
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-white/75">
                                Request a viewing and communicate your interest
                                through the RentSure platform.
                            </p>

                            <Link
                                to={`/properties/${property.id}/viewing`}
                                className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                            >
                                Request Viewing
                                <ArrowRight size={16} />
                            </Link>

                            {/* Save Property */}
                            <button
                                type="button"
                                onClick={handleToggleSave}
                                disabled={savingProperty}
                                className={`mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                    isSaved
                                        ? "border-white bg-white text-[#7A1F3D]"
                                        : "border-white/30 bg-white/10 text-white hover:bg-white/15"
                                }`}
                            >
                                {savingProperty ? (
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Heart
                                        size={17}
                                        className={
                                            isSaved
                                                ? "fill-current"
                                                : ""
                                        }
                                    />
                                )}

                                {savingProperty
                                    ? "Saving..."
                                    : isSaved
                                        ? "Saved Property"
                                        : "Save Property"}
                            </button>

                            {saveMessage && (
                                <p className="mt-3 text-center text-xs leading-5 text-white/80">
                                    {saveMessage}
                                </p>
                            )}
                        </section>

                        {/* Report */}
                        <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-7">
                            <div className="flex items-start gap-3">
                                <AlertTriangle
                                    size={20}
                                    className="mt-0.5 shrink-0 text-[#B45309]"
                                />

                                <div>
                                    <h2 className="font-bold text-[#24171C]">
                                        Something doesn't look right?
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-[#756970]">
                                        Help RentSure identify suspicious
                                        listings or concerning rental activity.
                                    </p>
                                </div>
                            </div>

                            <Link
                                to={`/properties/${property.id}/report`}
                                className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[#E8DDE1] px-5 py-3 text-sm font-semibold text-[#B91C1C] transition hover:border-[#B91C1C]"
                            >
                                Report Property
                            </Link>
                        </section>
                    </aside>
                </div>

                {/* Safety Warning */}
                <section className="mt-10 rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF4E5]">
                            <AlertTriangle
                                size={21}
                                className="text-[#B45309]"
                            />
                        </div>

                        <div>
                            <h2 className="font-bold text-[#24171C]">
                                Stay alert before making a payment
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-[#756970]">
                                Never send money solely because a property
                                appears on RentSure or has a verification
                                status. Inspect the property, review relevant
                                information, confirm the transaction details,
                                and remain cautious of unusual payment requests.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function OverviewItem({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-xl bg-[#FAF8F9] p-5">
            <Icon
                size={21}
                className="text-[#7A1F3D]"
            />

            <p className="mt-4 text-xs font-medium text-[#756970]">
                {label}
            </p>

            <p className="mt-1 text-sm font-bold text-[#24171C]">
                {value}
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

function getRiskDetails(score) {
    if (score === null || score === undefined) {
        return {
            label: "Not assessed",
            textClass: "text-[#756970]",
            barClass: "bg-[#756970]",
        };
    }

    const numericScore = Number(score);

    if (numericScore >= 80) {
        return {
            label: "Low Risk",
            textClass: "text-[#15803D]",
            barClass: "bg-[#15803D]",
        };
    }

    if (numericScore >= 60) {
        return {
            label: "Moderate Risk",
            textClass: "text-[#B45309]",
            barClass: "bg-[#B45309]",
        };
    }

    return {
        label: "Higher Risk",
        textClass: "text-[#B91C1C]",
        barClass: "bg-[#B91C1C]",
    };
}

function formatAmount(amount) {
    return new Intl.NumberFormat("en-NG", {
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
}

export default PropertyDetails;

