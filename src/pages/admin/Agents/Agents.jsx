
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Search,
    ShieldCheck,
    Clock3,
    Users,
    Building2,
    MoreHorizontal,
    Eye,
    UserCheck,
} from "lucide-react";

const agents = [
    {
        id: 1,
        name: "Michael Adewale",
        email: "michael@example.com",
        company: "Adewale Properties",
        properties: 12,
        verification: "Verified",
        status: "Active",
        joined: "Aug 18, 2026",
    },
    {
        id: 2,
        name: "Sarah Okafor",
        email: "sarah@example.com",
        company: "Prime Homes",
        properties: 9,
        verification: "Verified",
        status: "Active",
        joined: "Aug 20, 2026",
    },
    {
        id: 3,
        name: "David Williams",
        email: "david@example.com",
        company: "Urban Lettings",
        properties: 5,
        verification: "Pending",
        status: "Pending",
        joined: "Aug 27, 2026",
    },
    {
        id: 4,
        name: "Daniel Musa",
        email: "daniel@example.com",
        company: "Capital Homes",
        properties: 15,
        verification: "Verified",
        status: "Active",
        joined: "Aug 30, 2026",
    },
    {
        id: 5,
        name: "Grace Ibrahim",
        email: "grace@example.com",
        company: "Abuja Lettings",
        properties: 7,
        verification: "Pending",
        status: "Active",
        joined: "Sep 1, 2026",
    },
    {
        id: 6,
        name: "John Peters",
        email: "john@example.com",
        company: "Lagos Homes",
        properties: 11,
        verification: "Verified",
        status: "Active",
        joined: "Sep 2, 2026",
    },
    {
        id: 7,
        name: "Chinedu Okoro",
        email: "chinedu@example.com",
        company: "Trusted Living",
        properties: 3,
        verification: "Pending",
        status: "Suspended",
        joined: "Sep 3, 2026",
    },
];

function AdminAgents() {
    const [searchTerm, setSearchTerm] = useState("");
    const [verificationFilter, setVerificationFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const filteredAgents = useMemo(() => {
        return agents.filter((agent) => {
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch =
                !search ||
                agent.name.toLowerCase().includes(search) ||
                agent.email.toLowerCase().includes(search) ||
                agent.company.toLowerCase().includes(search);

            const matchesVerification =
                verificationFilter === "All" ||
                agent.verification === verificationFilter;

            const matchesStatus =
                statusFilter === "All" || agent.status === statusFilter;

            return matchesSearch && matchesVerification && matchesStatus;
        });
    }, [searchTerm, verificationFilter, statusFilter]);

    const totalProperties = agents.reduce(
        (total, agent) => total + agent.properties,
        0
    );

    const summaryCards = [
        {
            label: "Total Agents",
            value: agents.length,
            icon: Users,
            description: "Registered agents",
        },
        {
            label: "Verified Agents",
            value: agents.filter(
                (agent) => agent.verification === "Verified"
            ).length,
            icon: ShieldCheck,
            description: "Passed verification",
        },
        {
            label: "Pending Review",
            value: agents.filter(
                (agent) => agent.verification === "Pending"
            ).length,
            icon: Clock3,
            description: "Awaiting verification",
        },
        {
            label: "Listed Properties",
            value: totalProperties,
            icon: Building2,
            description: "Across all agents",
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
                                Agent Management
                            </p>

                            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                                Manage Agents
                            </h1>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#756970] sm:text-base">
                                Review registered agents, monitor verification progress, and
                                keep track of the properties associated with each agent.
                            </p>
                        </div>

                        <Link
                            to="/admin/verification"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                        >
                            <ShieldCheck size={17} />
                            Verification Queue
                        </Link>
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

                {/* Search and Filters */}
                <section className="mt-10 rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-7">
                    <div>
                        <h2 className="text-lg font-bold text-[#24171C]">
                            Find an Agent
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#756970]">
                            Search agents by name, email, or company and filter the results
                            by verification or account status.
                        </p>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-3">
                        {/* Search */}
                        <div>
                            <label
                                htmlFor="agent-search"
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
                                    id="agent-search"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Search name, email, or company"
                                    className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white pl-11 pr-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#9A8D93] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                                />
                            </div>
                        </div>

                        {/* Verification Filter */}
                        <div>
                            <label
                                htmlFor="agent-verification"
                                className="mb-2 block text-sm font-semibold text-[#24171C]"
                            >
                                Verification
                            </label>

                            <select
                                id="agent-verification"
                                value={verificationFilter}
                                onChange={(event) =>
                                    setVerificationFilter(event.target.value)
                                }
                                className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                            >
                                <option value="All">All Verification</option>
                                <option value="Verified">Verified</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>

                        {/* Account Status */}
                        <div>
                            <label
                                htmlFor="agent-status"
                                className="mb-2 block text-sm font-semibold text-[#24171C]"
                            >
                                Account Status
                            </label>

                            <select
                                id="agent-status"
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Pending">Pending</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Results */}
                <section className="mt-10">
                    <div>
                        <h2 className="text-xl font-bold text-[#24171C]">
                            Registered Agents
                        </h2>

                        <p className="mt-2 text-sm text-[#756970]">
                            Showing {filteredAgents.length} of {agents.length} agents.
                        </p>
                    </div>

                    {/* Desktop Table */}
                    <div className="mt-6 hidden overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm lg:block">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px]">
                                <thead className="border-b border-[#E8DDE1] bg-[#FAF8F9]">
                                    <tr className="text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                                        <th className="px-6 py-4">Agent</th>
                                        <th className="px-6 py-4">Company</th>
                                        <th className="px-6 py-4">Properties</th>
                                        <th className="px-6 py-4">Verification</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Joined</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#E8DDE1]">
                                    {filteredAgents.map((agent) => (
                                        <tr
                                            key={agent.id}
                                            className="transition hover:bg-[#FAF8F9]"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F8EDEF] text-sm font-bold text-[#7A1F3D]">
                                                        {getInitials(agent.name)}
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-[#24171C]">
                                                            {agent.name}
                                                        </p>

                                                        <p className="mt-1 text-xs text-[#756970]">
                                                            {agent.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-sm text-[#24171C]">
                                                {agent.company}
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className="text-sm font-semibold text-[#24171C]">
                                                    {agent.properties}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <StatusBadge
                                                    type="verification"
                                                    value={agent.verification}
                                                />
                                            </td>

                                            <td className="px-6 py-5">
                                                <StatusBadge
                                                    type="status"
                                                    value={agent.status}
                                                />
                                            </td>

                                            <td className="px-6 py-5 text-sm text-[#756970]">
                                                {agent.joined}
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#E8DDE1] px-3 text-xs font-semibold text-[#7A1F3D] transition hover:border-[#7A1F3D] hover:bg-[#F8EDEF]"
                                                    >
                                                        <Eye size={15} />
                                                        View
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E8DDE1] text-[#756970] transition hover:border-[#7A1F3D] hover:text-[#7A1F3D]"
                                                        aria-label={`More actions for ${agent.name}`}
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
                        {filteredAgents.map((agent) => (
                            <article
                                key={agent.id}
                                className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F8EDEF] text-sm font-bold text-[#7A1F3D]">
                                            {getInitials(agent.name)}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate font-bold text-[#24171C]">
                                                {agent.name}
                                            </p>

                                            <p className="mt-1 truncate text-xs text-[#756970]">
                                                {agent.email}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E8DDE1] text-[#756970]"
                                        aria-label={`More actions for ${agent.name}`}
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>
                                </div>

                                <div className="mt-6 grid gap-4 border-y border-[#E8DDE1] py-5 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs font-medium text-[#756970]">
                                            Company
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-[#24171C]">
                                            {agent.company}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-[#756970]">
                                            Properties
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-[#24171C]">
                                            {agent.properties} listings
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-[#756970]">
                                            Joined
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-[#24171C]">
                                            {agent.joined}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-[#756970]">
                                            Account
                                        </p>

                                        <div className="mt-2">
                                            <StatusBadge
                                                type="status"
                                                value={agent.status}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    <StatusBadge
                                        type="verification"
                                        value={agent.verification}
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#7A1F3D] px-4 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                                >
                                    <Eye size={17} />
                                    View Agent
                                </button>
                            </article>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredAgents.length === 0 && (
                        <div className="mt-6 rounded-2xl border border-dashed border-[#E8DDE1] bg-white px-6 py-14 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8EDEF]">
                                <Search size={22} className="text-[#7A1F3D]" />
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-[#24171C]">
                                No agents found
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756970]">
                                Try changing your search term or adjusting the filters.
                            </p>
                        </div>
                    )}
                </section>

                {/* Admin Notice */}
                <section className="mt-12 rounded-2xl bg-[#2D0A17] p-7 text-white sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                            <UserCheck size={22} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold">
                                Agent verification protects renter trust
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/75">
                                Agent verification should be based on identity information,
                                supporting evidence, and administrative review. A verified
                                status indicates that the agent has passed RentSure's review
                                process; it is not a legal guarantee of every claim made by the
                                agent.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function getInitials(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function StatusBadge({ type, value }) {
    const styles = {
        verification: {
            Verified: "bg-[#E8F5EC] text-[#15803D]",
            Pending: "bg-[#FFF4E5] text-[#B45309]",
        },
        status: {
            Active: "bg-[#E8F5EC] text-[#15803D]",
            Pending: "bg-[#FFF4E5] text-[#B45309]",
            Suspended: "bg-[#FDECEC] text-[#B91C1C]",
        },
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${styles[type]?.[value] || "bg-[#F3F1F2] text-[#756970]"
                }`}
        >
            {value}
        </span>
    );
}

export default AdminAgents;

