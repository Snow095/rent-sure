
import { Link } from "react-router-dom";
import {
    Users,
    Building2,
    UserCheck,
    ShieldCheck,
    FileWarning,
    ArrowRight,
    Clock3,
    CheckCircle2,
} from "lucide-react";

const overviewCards = [
    {
        title: "Total Users",
        value: "248",
        description: "Registered renters and agents",
        icon: Users,
    },
    {
        title: "Properties",
        value: "126",
        description: "Properties currently listed",
        icon: Building2,
    },
    {
        title: "Verified Agents",
        value: "42",
        description: "Agents that passed verification",
        icon: UserCheck,
    },
    {
        title: "Pending Verification",
        value: "8",
        description: "Items awaiting admin review",
        icon: ShieldCheck,
    },
];

const activityItems = [
    {
        title: "New agent verification request",
        description: "An agent submitted documents for review.",
        time: "12 minutes ago",
        icon: ShieldCheck,
        iconWrapper: "bg-[#FFF7ED] text-[#B45309]",
    },
    {
        title: "Property reported",
        description: "A renter submitted a concern about a property.",
        time: "34 minutes ago",
        icon: FileWarning,
        iconWrapper: "bg-[#FDECEC] text-[#B91C1C]",
    },
    {
        title: "New property submitted",
        description: "A new property is waiting for verification.",
        time: "1 hour ago",
        icon: Building2,
        iconWrapper: "bg-[#F8EDEF] text-[#7A1F3D]",
    },
];

function Dashboard() {
    return (
        <main className="min-h-screen bg-[#FAF8F9] px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
            <div className="mx-auto w-full max-w-7xl">

                {/* Header */}
                <section>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#7A1F3D]">
                        <ShieldCheck size={15} />
                        Admin Dashboard
                    </span>

                    <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                        RentSure administration
                    </h1>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-[#756970] sm:text-base">
                        Monitor the RentSure platform, review verification requests,
                        manage users and properties, and respond to reported concerns.
                    </p>
                </section>

                {/* Overview */}
                <section className="mt-12">
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {overviewCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <div
                                    key={card.title}
                                    className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EDEF]">
                                            <Icon size={21} className="text-[#7A1F3D]" />
                                        </div>

                                        <span className="text-2xl font-bold text-[#24171C]">
                                            {card.value}
                                        </span>
                                    </div>

                                    <h2 className="mt-5 text-sm font-bold text-[#24171C]">
                                        {card.title}
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-[#756970]">
                                        {card.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Management */}
                <section className="mt-12">
                    <div>
                        <h2 className="text-2xl font-bold text-[#24171C]">
                            Platform management
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#756970]">
                            Access the main areas that require administrative oversight.
                        </p>
                    </div>

                    <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {/* Users */}
                        <Link
                            to="/admin/users"
                            className="group rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#7A1F3D] hover:shadow-md sm:p-7"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EDEF]">
                                <Users size={22} className="text-[#7A1F3D]" />
                            </div>

                            <h3 className="mt-6 text-lg font-bold text-[#24171C]">
                                Manage Users
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-[#756970]">
                                Review registered renters and agents and monitor account
                                information.
                            </p>

                            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#7A1F3D]">
                                View Users
                                <ArrowRight
                                    size={16}
                                    className="transition group-hover:translate-x-1"
                                />
                            </span>
                        </Link>

                        {/* Properties */}
                        <Link
                            to="/admin/properties"
                            className="group rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#7A1F3D] hover:shadow-md sm:p-7"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EDEF]">
                                <Building2 size={22} className="text-[#7A1F3D]" />
                            </div>

                            <h3 className="mt-6 text-lg font-bold text-[#24171C]">
                                Manage Properties
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-[#756970]">
                                Review property listings, verification states, and listing
                                activity.
                            </p>

                            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#7A1F3D]">
                                View Properties
                                <ArrowRight
                                    size={16}
                                    className="transition group-hover:translate-x-1"
                                />
                            </span>
                        </Link>

                        {/* Agents */}
                        <Link
                            to="/admin/agents"
                            className="group rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#7A1F3D] hover:shadow-md sm:p-7"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EDEF]">
                                <UserCheck size={22} className="text-[#7A1F3D]" />
                            </div>

                            <h3 className="mt-6 text-lg font-bold text-[#24171C]">
                                Manage Agents
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-[#756970]">
                                Review agent accounts and monitor their verification status.
                            </p>

                            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#7A1F3D]">
                                View Agents
                                <ArrowRight
                                    size={16}
                                    className="transition group-hover:translate-x-1"
                                />
                            </span>
                        </Link>

                        {/* Verification */}
                        <Link
                            to="/admin/verification"
                            className="group rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#7A1F3D] hover:shadow-md sm:p-7"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF7ED]">
                                <ShieldCheck size={22} className="text-[#B45309]" />
                            </div>

                            <h3 className="mt-6 text-lg font-bold text-[#24171C]">
                                Verification Queue
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-[#756970]">
                                Review agents and properties that are waiting for verification.
                            </p>

                            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#7A1F3D]">
                                Review Queue
                                <ArrowRight
                                    size={16}
                                    className="transition group-hover:translate-x-1"
                                />
                            </span>
                        </Link>

                        {/* Reports */}
                        <Link
                            to="/admin/reports"
                            className="group rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#7A1F3D] hover:shadow-md sm:p-7"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FDECEC]">
                                <FileWarning size={22} className="text-[#B91C1C]" />
                            </div>

                            <h3 className="mt-6 text-lg font-bold text-[#24171C]">
                                Reports
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-[#756970]">
                                Review reported properties, agents, and potential rental risks.
                            </p>

                            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#7A1F3D]">
                                View Reports
                                <ArrowRight
                                    size={16}
                                    className="transition group-hover:translate-x-1"
                                />
                            </span>
                        </Link>
                    </div>
                </section>

                {/* Recent Activity */}
                <section className="mt-12">
                    <div>
                        <h2 className="text-2xl font-bold text-[#24171C]">
                            Recent activity
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#756970]">
                            A quick overview of recent activity across the platform.
                        </p>
                    </div>

                    <div className="mt-7 rounded-2xl border border-[#E8DDE1] bg-white shadow-sm">
                        <div className="divide-y divide-[#E8DDE1]">
                            {activityItems.map((activity) => {
                                const Icon = activity.icon;

                                return (
                                    <div
                                        key={activity.title}
                                        className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:p-7"
                                    >
                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${activity.iconWrapper}`}
                                        >
                                            <Icon size={20} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-bold text-[#24171C]">
                                                {activity.title}
                                            </h3>

                                            <p className="mt-1 text-sm leading-6 text-[#756970]">
                                                {activity.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs font-medium text-[#756970]">
                                            <Clock3 size={14} />
                                            {activity.time}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Verification Notice */}
                <section className="mt-12 rounded-2xl bg-[#2D0A17] p-7 text-white sm:p-9">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#4A1025]">
                            <ShieldCheck size={23} className="text-[#C9A227]" />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold">
                                Administrative review protects platform trust
                            </h2>

                            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75">
                                Verification decisions should be based on the information and
                                supporting evidence available for review. RentSure verification
                                is a structured trust mechanism and does not guarantee legal
                                ownership, property availability, or complete freedom from
                                fraud.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Quick Links */}
                <section className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        to="/admin/verification"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                    >
                        Review Verification Queue
                        <ArrowRight size={17} />
                    </Link>

                    <Link
                        to="/admin/reports"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] bg-white px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:border-[#7A1F3D] hover:bg-[#F8EDEF]"
                    >
                        Review Reports
                    </Link>
                </section>
            </div>
        </main>
    );
}

export default Dashboard;

