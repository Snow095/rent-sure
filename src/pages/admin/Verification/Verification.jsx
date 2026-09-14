
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ShieldCheck,
    Clock3,
    XCircle,
    Search,
    FileText,
    Building2,
    UserCheck,
    Eye,
    MoreHorizontal,
} from "lucide-react";

import { supabase } from "../../../services/supabase/client";
import { useAuth } from "../../../context/AuthContext";

function AdminVerification() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [verificationItems, setVerificationItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    /*
     * Fetch verification submissions from Supabase
     */
    useEffect(() => {
        const fetchVerificationItems = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setErrorMessage("");

            try {
                const { data, error } = await supabase
                    .from("property_verifications")
                    .select(`
                        id,
                        property_id,
                        submitted_by,
                        status,
                        document_count,
                        created_at,
                        properties (
                            id,
                            title,
                            location,
                            agent_id
                        )
                    `)
                    .order("created_at", { ascending: false });

                if (error) {
                    throw error;
                }

                const formattedItems = (data || []).map((item) => ({
                    id: item.id,

                    // Current verification table represents property verification
                    type: "Property",

                    subject:
                        item.properties?.title ||
                        "Unknown Property",

                    description:
                        item.properties?.location ||
                        "Location unavailable",

                    submitted: new Date(
                        item.created_at
                    ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    }),

                    status:
                        item.status === "pending"
                            ? "Pending Review"
                            : item.status === "under_review"
                                ? "Under Review"
                                : item.status === "needs_information"
                                    ? "Needs Information"
                                    : item.status === "verified"
                                        ? "Verified"
                                        : item.status === "rejected"
                                            ? "Rejected"
                                            : item.status,

                    documents: item.document_count || 0,

                    /*
                     * Priority calculation will be added later.
                     * For now, every real submission uses Medium.
                     */
                    priority: "Medium",

                    propertyId: item.property_id,
                    submittedBy: item.submitted_by,
                }));

                setVerificationItems(formattedItems);
            } catch (error) {
                console.error(
                    "Error fetching verification queue:",
                    error
                );

                setErrorMessage(
                    error.message ||
                    "Unable to load verification submissions."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchVerificationItems();
    }, [user]);

    /*
     * Search and filter verification submissions
     */
    const filteredItems = useMemo(() => {
        return verificationItems.filter((item) => {
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch =
                !search ||
                item.subject.toLowerCase().includes(search) ||
                item.description.toLowerCase().includes(search);

            const matchesType =
                typeFilter === "All" ||
                item.type === typeFilter;

            const matchesStatus =
                statusFilter === "All" ||
                item.status === statusFilter;

            return (
                matchesSearch &&
                matchesType &&
                matchesStatus
            );
        });
    }, [
        verificationItems,
        searchTerm,
        typeFilter,
        statusFilter,
    ]);

    /*
     * Summary cards
     */
    const summaryCards = [
        {
            label: "Total Queue",
            value: verificationItems.length,
            icon: ShieldCheck,
            description: "Items requiring review",
        },
        {
            label: "Pending Review",
            value: verificationItems.filter(
                (item) => item.status === "Pending Review"
            ).length,
            icon: Clock3,
            description: "Awaiting admin review",
        },
        {
            label: "Needs Information",
            value: verificationItems.filter(
                (item) => item.status === "Needs Information"
            ).length,
            icon: FileText,
            description: "Additional evidence needed",
        },
        {
            label: "High Priority",
            value: verificationItems.filter(
                (item) => item.priority === "High"
            ).length,
            icon: XCircle,
            description: "Requires closer attention",
        },
    ];

    return (
        <main className="min-h-screen bg-[#FAF8F9] px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-12">
            <div className="mx-auto w-full max-w-7xl">

                {/* Back */}
                <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
                >
                    <ArrowLeft size={17} />
                    Back to Admin Dashboard
                </Link>

                {/* Header */}
                <section className="mt-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7A1F3D]">
                                Verification
                            </p>

                            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                                Verification Queue
                            </h1>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#756970] sm:text-base">
                                Review submitted property information, inspect
                                supporting evidence, and make structured
                                verification decisions.
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 text-sm font-semibold text-[#4A1025] shadow-sm">
                            <Clock3 size={17} />

                            {verificationItems.filter(
                                (item) =>
                                    item.status === "Pending Review"
                            ).length}{" "}
                            awaiting review
                        </div>
                    </div>
                </section>

                {/* Summary Cards */}
                <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <div
                                key={card.label}
                                className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-[#756970]">
                                            {card.label}
                                        </p>

                                        <p className="mt-3 text-3xl font-bold text-[#24171C]">
                                            {card.value}
                                        </p>
                                    </div>

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF]">
                                        <Icon
                                            size={21}
                                            className="text-[#7A1F3D]"
                                        />
                                    </div>
                                </div>

                                <p className="mt-4 text-xs text-[#756970]">
                                    {card.description}
                                </p>
                            </div>
                        );
                    })}
                </section>

                {/* Review Guidance */}
                <section className="mt-10 rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF]">
                            <ShieldCheck
                                size={22}
                                className="text-[#7A1F3D]"
                            />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-[#24171C]">
                                Verification review standard
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#756970]">
                                Review the information submitted by the agent
                                or property owner, compare it with the
                                available supporting evidence, and record a
                                clear verification decision. RentSure
                                verification is an evidence-review process
                                and should not be treated as a legal
                                guarantee.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Search and Filters */}
                <section className="mt-10 rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-7">
                    <div>
                        <h2 className="text-lg font-bold text-[#24171C]">
                            Find a Submission
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#756970]">
                            Search the verification queue and filter
                            submissions by type or review status.
                        </p>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-3">

                        {/* Search */}
                        <div>
                            <label
                                htmlFor="verification-search"
                                className="mb-2 block text-sm font-semibold text-[#24171C]"
                            >
                                Search
                            </label>

                            <div className="relative">
                                <Search
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#756970]"
                                />

                                <input
                                    id="verification-search"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search property or location"
                                    className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white pl-11 pr-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#9A8D93] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                                />
                            </div>
                        </div>

                        {/* Type */}
                        <div>
                            <label
                                htmlFor="verification-type"
                                className="mb-2 block text-sm font-semibold text-[#24171C]"
                            >
                                Submission Type
                            </label>

                            <select
                                id="verification-type"
                                value={typeFilter}
                                onChange={(event) =>
                                    setTypeFilter(
                                        event.target.value
                                    )
                                }
                                className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                            >
                                <option value="All">
                                    All Types
                                </option>

                                <option value="Property">
                                    Property
                                </option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label
                                htmlFor="verification-status"
                                className="mb-2 block text-sm font-semibold text-[#24171C]"
                            >
                                Review Status
                            </label>

                            <select
                                id="verification-status"
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                                className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                            >
                                <option value="All">
                                    All Statuses
                                </option>

                                <option value="Pending Review">
                                    Pending Review
                                </option>

                                <option value="Under Review">
                                    Under Review
                                </option>

                                <option value="Needs Information">
                                    Needs Information
                                </option>

                                <option value="Verified">
                                    Verified
                                </option>

                                <option value="Rejected">
                                    Rejected
                                </option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Loading */}
                {loading && (
                    <div className="mt-6 rounded-2xl border border-[#E8DDE1] bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#F8EDEF] border-t-[#7A1F3D]" />

                        <p className="mt-4 text-sm font-medium text-[#756970]">
                            Loading verification submissions...
                        </p>
                    </div>
                )}

                {/* Error */}
                {errorMessage && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-[#B91C1C]">
                        {errorMessage}
                    </div>
                )}

                {/* Queue */}
                <section className="mt-10">
                    <div>
                        <h2 className="text-xl font-bold text-[#24171C]">
                            Review Queue
                        </h2>

                        <p className="mt-2 text-sm text-[#756970]">
                            Showing {filteredItems.length} of{" "}
                            {verificationItems.length} submissions.
                        </p>
                    </div>

                    {/* Desktop Table */}
                    <div className="mt-6 hidden overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm lg:block">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px]">
                                <thead className="border-b border-[#E8DDE1] bg-[#FAF8F9]">
                                    <tr className="text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                                        <th className="px-6 py-4">
                                            Submission
                                        </th>

                                        <th className="px-6 py-4">
                                            Type
                                        </th>

                                        <th className="px-6 py-4">
                                            Documents
                                        </th>

                                        <th className="px-6 py-4">
                                            Submitted
                                        </th>

                                        <th className="px-6 py-4">
                                            Priority
                                        </th>

                                        <th className="px-6 py-4">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#E8DDE1]">
                                    {filteredItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="transition hover:bg-[#FAF8F9]"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF]">
                                                        {item.type ===
                                                            "Agent" ? (
                                                            <UserCheck
                                                                size={20}
                                                                className="text-[#7A1F3D]"
                                                            />
                                                        ) : (
                                                            <Building2
                                                                size={20}
                                                                className="text-[#7A1F3D]"
                                                            />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-[#24171C]">
                                                            {item.subject}
                                                        </p>

                                                        <p className="mt-1 text-xs text-[#756970]">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className="text-sm font-medium text-[#24171C]">
                                                    {item.type}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-sm text-[#24171C]">
                                                    <FileText
                                                        size={16}
                                                        className="text-[#756970]"
                                                    />

                                                    {item.documents} files
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-sm text-[#756970]">
                                                {item.submitted}
                                            </td>

                                            <td className="px-6 py-5">
                                                <PriorityBadge
                                                    value={
                                                        item.priority
                                                    }
                                                />
                                            </td>

                                            <td className="px-6 py-5">
                                                <VerificationStatus
                                                    value={item.status}
                                                />
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/verification/${item.id}`
                                                            )
                                                        }
                                                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#7A1F3D] px-3 text-xs font-semibold text-white transition hover:bg-[#4A1025]"
                                                    >
                                                        <Eye size={15} />
                                                        Review
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E8DDE1] text-[#756970] transition hover:border-[#7A1F3D] hover:text-[#7A1F3D]"
                                                        aria-label={`More actions for ${item.subject}`}
                                                    >
                                                        <MoreHorizontal
                                                            size={18}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile / Tablet Cards */}
                    <div className="mt-6 grid gap-5 lg:hidden">
                        {filteredItems.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-start gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF]">
                                            {item.type ===
                                                "Agent" ? (
                                                <UserCheck
                                                    size={20}
                                                    className="text-[#7A1F3D]"
                                                />
                                            ) : (
                                                <Building2
                                                    size={20}
                                                    className="text-[#7A1F3D]"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="font-bold text-[#24171C]">
                                                {item.subject}
                                            </p>

                                            <p className="mt-1 text-sm text-[#756970]">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E8DDE1] text-[#756970]"
                                        aria-label={`More actions for ${item.subject}`}
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>
                                </div>

                                <div className="mt-6 grid gap-4 border-y border-[#E8DDE1] py-5 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs font-medium text-[#756970]">
                                            Submission Type
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-[#24171C]">
                                            {item.type}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-[#756970]">
                                            Documents
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-[#24171C]">
                                            {item.documents} files
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-[#756970]">
                                            Submitted
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-[#24171C]">
                                            {item.submitted}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-[#756970]">
                                            Priority
                                        </p>

                                        <div className="mt-2">
                                            <PriorityBadge
                                                value={
                                                    item.priority
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <VerificationStatus
                                        value={item.status}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/admin/verification/${item.id}`
                                        )
                                    }
                                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                                >
                                    <Eye size={17} />
                                    Review Submission
                                </button>
                            </article>
                        ))}
                    </div>

                    {/* Empty State */}
                    {!loading &&
                        filteredItems.length === 0 && (
                            <div className="mt-6 rounded-2xl border border-dashed border-[#E8DDE1] bg-white px-6 py-14 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8EDEF]">
                                    <Search
                                        size={22}
                                        className="text-[#7A1F3D]"
                                    />
                                </div>

                                <h3 className="mt-5 text-lg font-bold text-[#24171C]">
                                    No submissions found
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756970]">
                                    Try adjusting your search term or
                                    verification filters.
                                </p>
                            </div>
                        )}
                </section>

                {/* Decision Notice */}
                <section className="mt-12 rounded-2xl bg-[#2D0A17] p-7 text-white sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                            <ShieldCheck size={22} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold">
                                Make evidence-based decisions
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/75">
                                Approval, rejection, or requests for
                                additional information should be based on
                                the evidence available during review.
                                RentSure does not claim to automatically
                                detect every fake document or guarantee
                                that a verified submission is completely
                                free from fraud.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function PriorityBadge({ value }) {
    const styles = {
        High: "bg-[#FDECEC] text-[#B91C1C]",
        Medium: "bg-[#FFF4E5] text-[#B45309]",
        Low: "bg-[#E8F5EC] text-[#15803D]",
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                styles[value] ||
                "bg-[#F3F1F2] text-[#756970]"
            }`}
        >
            {value}
        </span>
    );
}

function VerificationStatus({ value }) {
    const styles = {
        "Pending Review":
            "bg-[#FFF4E5] text-[#B45309]",

        "Under Review":
            "bg-[#F8EDEF] text-[#7A1F3D]",

        "Needs Information":
            "bg-[#FDECEC] text-[#B91C1C]",

        Verified:
            "bg-[#E8F5EC] text-[#15803D]",

        Rejected:
            "bg-[#FDECEC] text-[#B91C1C]",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                styles[value] ||
                "bg-[#F3F1F2] text-[#756970]"
            }`}
        >
            {value === "Pending Review" ? (
                <Clock3 size={14} />
            ) : value === "Verified" ? (
                <ShieldCheck size={14} />
            ) : value === "Rejected" ? (
                <XCircle size={14} />
            ) : (
                <FileText size={14} />
            )}

            {value}
        </span>
    );
}

export default AdminVerification;

