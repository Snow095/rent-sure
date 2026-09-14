
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Search,
    FileWarning,
    Clock3,
    CheckCircle2,
    AlertTriangle,
    Eye,
    MoreHorizontal,
    ShieldCheck,
} from "lucide-react";

const reports = [
    {
        id: 1,
        property: "Modern 3-Bedroom Apartment",
        location: "Lekki Phase 1, Lagos",
        reporter: "Amaka Johnson",
        category: "Suspicious Payment Request",
        description:
            "Agent requested an upfront payment before allowing physical inspection of the property.",
        date: "Sep 1, 2026",
        status: "Under Review",
        severity: "High",
    },
    {
        id: 2,
        property: "Cozy 2-Bedroom Apartment",
        location: "Yaba, Lagos",
        reporter: "Grace Ibrahim",
        category: "Property Information",
        description:
            "The property information displayed on the listing differed from information provided during communication.",
        date: "Aug 25, 2026",
        status: "Resolved",
        severity: "Medium",
    },
    {
        id: 3,
        property: "Executive 5-Bedroom Duplex",
        location: "Banana Island, Lagos",
        reporter: "Daniel Musa",
        category: "Suspicious Listing",
        description:
            "A renter reported concerns about the authenticity and availability of the listing.",
        date: "Sep 3, 2026",
        status: "Under Review",
        severity: "High",
    },
    {
        id: 4,
        property: "Contemporary Family Home",
        location: "GRA, Port Harcourt",
        reporter: "Chinedu Okoro",
        category: "Property Information",
        description:
            "A renter requested clarification about property features that were unclear in the original listing.",
        date: "Aug 24, 2026",
        status: "Resolved",
        severity: "Medium",
    },
    {
        id: 5,
        property: "Modern Self Contain",
        location: "Wuse 2, Abuja",
        reporter: "Amaka Johnson",
        category: "Payment Concern",
        description:
            "The renter received a request for payment through an unusual payment channel.",
        date: "Sep 2, 2026",
        status: "Under Review",
        severity: "High",
    },
    {
        id: 6,
        property: "Bright 2-Bedroom Home",
        location: "Ikeja GRA, Lagos",
        reporter: "Grace Ibrahim",
        category: "Agent Conduct",
        description:
            "The renter reported concerns about the communication and conduct of the listed agent.",
        date: "Aug 30, 2026",
        status: "Resolved",
        severity: "Medium",
    },
];

function AdminReports() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [severityFilter, setSeverityFilter] = useState("All");

    const filteredReports = useMemo(() => {
        return reports.filter((report) => {
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch =
                !search ||
                report.property.toLowerCase().includes(search) ||
                report.location.toLowerCase().includes(search) ||
                report.reporter.toLowerCase().includes(search) ||
                report.category.toLowerCase().includes(search);

            const matchesStatus =
                statusFilter === "All" || report.status === statusFilter;

            const matchesSeverity =
                severityFilter === "All" || report.severity === severityFilter;

            return matchesSearch && matchesStatus && matchesSeverity;
        });
    }, [searchTerm, statusFilter, severityFilter]);

    const summaryCards = [
        {
            label: "Total Reports",
            value: reports.length,
            icon: FileWarning,
            description: "All submitted reports",
        },
        {
            label: "Under Review",
            value: reports.filter(
                (report) => report.status === "Under Review"
            ).length,
            icon: Clock3,
            description: "Require admin attention",
        },
        {
            label: "Resolved",
            value: reports.filter(
                (report) => report.status === "Resolved"
            ).length,
            icon: CheckCircle2,
            description: "Successfully reviewed",
        },
        {
            label: "High Severity",
            value: reports.filter(
                (report) => report.severity === "High"
            ).length,
            icon: AlertTriangle,
            description: "Priority incidents",
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
                                Safety & Reports
                            </p>

                            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                                Manage Reports
                            </h1>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#756970] sm:text-base">
                                Review renter reports, identify potentially risky activity,
                                and maintain a structured record of reported rental concerns.
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 text-sm font-semibold text-[#4A1025] shadow-sm">
                            <FileWarning size={17} />
                            {reports.filter(
                                (report) => report.status === "Under Review"
                            ).length}{" "}
                            reports under review
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
                                        <Icon size={21} className="text-[#7A1F3D]" />
                                    </div>
                                </div>

                                <p className="mt-4 text-xs text-[#756970]">
                                    {card.description}
                                </p>
                            </div>
                        );
                    })}
                </section>

                {/* Safety Guidance */}
                <section className="mt-10 rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF]">
                            <ShieldCheck size={22} className="text-[#7A1F3D]" />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-[#24171C]">
                                Report review process
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#756970]">
                                Reports provide an additional safety signal for RentSure.
                                Administrators can review reported information, investigate
                                supporting evidence, and take appropriate action. A report is
                                an allegation or concern and should not automatically be
                                treated as proof of wrongdoing.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Search and Filters */}
                <section className="mt-10 rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-7">
                    <div>
                        <h2 className="text-lg font-bold text-[#24171C]">
                            Find a Report
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#756970]">
                            Search reports by property, location, reporter, or report
                            category.
                        </p>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-3">
                        {/* Search */}
                        <div>
                            <label
                                htmlFor="report-search"
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
                                    id="report-search"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Search property, reporter, or category"
                                    className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white pl-11 pr-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#9A8D93] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label
                                htmlFor="report-status"
                                className="mb-2 block text-sm font-semibold text-[#24171C]"
                            >
                                Report Status
                            </label>

                            <select
                                id="report-status"
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                        </div>

                        {/* Severity */}
                        <div>
                            <label
                                htmlFor="report-severity"
                                className="mb-2 block text-sm font-semibold text-[#24171C]"
                            >
                                Severity
                            </label>

                            <select
                                id="report-severity"
                                value={severityFilter}
                                onChange={(event) => setSeverityFilter(event.target.value)}
                                className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                            >
                                <option value="All">All Severity</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Reports */}
                <section className="mt-10">
                    <div>
                        <h2 className="text-xl font-bold text-[#24171C]">
                            Report Queue
                        </h2>

                        <p className="mt-2 text-sm text-[#756970]">
                            Showing {filteredReports.length} of {reports.length} reports.
                        </p>
                    </div>

                    {/* Desktop Table */}
                    <div className="mt-6 hidden overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm lg:block">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px]">
                                <thead className="border-b border-[#E8DDE1] bg-[#FAF8F9]">
                                    <tr className="text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                                        <th className="px-6 py-4">Report</th>
                                        <th className="px-6 py-4">Reporter</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Severity</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#E8DDE1]">
                                    {filteredReports.map((report) => (
                                        <tr
                                            key={report.id}
                                            className="transition hover:bg-[#FAF8F9]"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="max-w-md">
                                                    <p className="font-semibold text-[#24171C]">
                                                        {report.category}
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-[#4A1025]">
                                                        {report.property}
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-[#756970]">
                                                        {report.location}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-sm text-[#24171C]">
                                                {report.reporter}
                                            </td>

                                            <td className="px-6 py-5 text-sm text-[#756970]">
                                                {report.date}
                                            </td>

                                            <td className="px-6 py-5">
                                                <SeverityBadge value={report.severity} />
                                            </td>

                                            <td className="px-6 py-5">
                                                <StatusBadge value={report.status} />
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#7A1F3D] px-3 text-xs font-semibold text-white transition hover:bg-[#4A1025]"
                                                    >
                                                        <Eye size={15} />
                                                        Review
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E8DDE1] text-[#756970] transition hover:border-[#7A1F3D] hover:text-[#7A1F3D]"
                                                        aria-label={`More actions for report about ${report.property}`}
                                                    >
                                                        <MoreHorizontal size={18} />
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
                        {filteredReports.map((report) => (
                            <article
                                key={report.id}
                                className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="font-bold text-[#24171C]">
                                            {report.category}
                                        </p>

                                        <p className="mt-2 text-sm font-semibold text-[#4A1025]">
                                            {report.property}
                                        </p>

                                        <p className="mt-1 text-sm text-[#756970]">
                                            {report.location}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E8DDE1] text-[#756970]"
                                        aria-label={`More actions for report about ${report.property}`}
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>
                                </div>

                                <div className="mt-6 rounded-xl bg-[#FAF8F9] p-5">
                                    <p className="text-sm leading-6 text-[#756970]">
                                        {report.description}
                                    </p>
                                </div>

                                <div className="mt-5 grid gap-4 border-b border-[#E8DDE1] pb-5 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs font-medium text-[#756970]">
                                            Reporter
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-[#24171C]">
                                            {report.reporter}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-[#756970]">
                                            Date
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-[#24171C]">
                                            {report.date}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    <SeverityBadge value={report.severity} />
                                    <StatusBadge value={report.status} />
                                </div>

                                <button
                                    type="button"
                                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                                >
                                    <Eye size={17} />
                                    Review Report
                                </button>
                            </article>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredReports.length === 0 && (
                        <div className="mt-6 rounded-2xl border border-dashed border-[#E8DDE1] bg-white px-6 py-14 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8EDEF]">
                                <Search size={22} className="text-[#7A1F3D]" />
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-[#24171C]">
                                No reports found
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756970]">
                                Try adjusting your search term or report filters.
                            </p>
                        </div>
                    )}
                </section>

                {/* Safety Notice */}
                <section className="mt-12 rounded-2xl bg-[#2D0A17] p-7 text-white sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                            <ShieldCheck size={22} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold">
                                Reports support ongoing safety monitoring
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/75">
                                RentSure uses reports as part of an ongoing safety and
                                accountability process. Reported properties or agents can be
                                reviewed again when new information becomes available.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function SeverityBadge({ value }) {
    const styles = {
        High: "bg-[#FDECEC] text-[#B91C1C]",
        Medium: "bg-[#FFF4E5] text-[#B45309]",
        Low: "bg-[#E8F5EC] text-[#15803D]",
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${styles[value] || "bg-[#F3F1F2] text-[#756970]"
                }`}
        >
            {value}
        </span>
    );
}

function StatusBadge({ value }) {
    const styles = {
        "Under Review": "bg-[#FFF4E5] text-[#B45309]",
        Resolved: "bg-[#E8F5EC] text-[#15803D]",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${styles[value] || "bg-[#F3F1F2] text-[#756970]"
                }`}
        >
            {value === "Under Review" ? (
                <Clock3 size={14} />
            ) : (
                <CheckCircle2 size={14} />
            )}

            {value}
        </span>
    );
}

export default AdminReports;

