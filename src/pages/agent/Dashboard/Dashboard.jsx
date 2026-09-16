
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  PlusCircle,
  ShieldCheck,
  FileWarning,
  ArrowRight,
  ClipboardCheck,
  CalendarDays,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../services/supabase/client";

function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    properties: 0,
    verified: 0,
    pending: 0,
    reports: 0,
    viewingRequests: 0,
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadDashboardStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const { data: properties, error: propertiesError } = await supabase
          .from("properties")
          .select("id, verification_status")
          .eq("agent_id", user.id);

        if (propertiesError) {
          throw propertiesError;
        }

        const propertyIds = (properties || []).map((property) => property.id);

        let reportsCount = 0;
        let viewingRequestsCount = 0;

        if (propertyIds.length > 0) {
          const [
            reportsResult,
            viewingRequestsResult,
          ] = await Promise.all([
            supabase
              .from("reports")
              .select("id", {
                count: "exact",
                head: true,
              })
              .in("property_id", propertyIds),

            supabase
              .from("viewing_requests")
              .select("id", {
                count: "exact",
                head: true,
              })
              .in("property_id", propertyIds)
              .eq("status", "pending"),
          ]);

          if (reportsResult.error) {
            throw reportsResult.error;
          }

          if (viewingRequestsResult.error) {
            throw viewingRequestsResult.error;
          }

          reportsCount = reportsResult.count || 0;
          viewingRequestsCount = viewingRequestsResult.count || 0;
        }

        const verifiedCount = (properties || []).filter(
          (property) => property.verification_status === "verified"
        ).length;

        const pendingCount = (properties || []).filter(
          (property) =>
            property.verification_status === "pending" ||
            property.verification_status === "under_review" ||
            property.verification_status === "needs_information"
        ).length;

        setStats({
          properties: properties?.length || 0,
          verified: verifiedCount,
          pending: pendingCount,
          reports: reportsCount,
          viewingRequests: viewingRequestsCount,
        });
      } catch (error) {
        console.error("Error loading agent dashboard:", error);

        setErrorMessage(
          error.message ||
            "Unable to load your dashboard information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, [user]);

  const fullName =
    user?.user_metadata?.full_name?.trim() || "Agent";

  const actionCards = [
    {
      title: "My Properties",
      description:
        "View and manage the rental properties you have listed on RentSure.",
      icon: Building2,
      href: "/agent/properties",
      action: "Manage Properties",
    },
    {
      title: "Add Property",
      description:
        "Create a new property listing and submit it for RentSure verification.",
      icon: PlusCircle,
      href: "/agent/add-property",
      action: "Add Property",
    },
    {
      title: "Verification",
      description:
        "Submit supporting documents and track the verification status of your properties.",
      icon: ShieldCheck,
      href: "/agent/properties",
      action: "View Verification",
    },
    {
      title: "Reports",
      description:
        "Review reports submitted by renters about properties you manage.",
      icon: FileWarning,
      href: "/agent/reports",
      action: "View Reports",
    },
    {
      title: "Viewing Requests",
      description:
        "Review renter requests, confirm suitable viewing times, and manage upcoming property viewings.",
      icon: CalendarDays,
      href: "/agent/viewing-requests",
      action: "Manage Viewing Requests",
    },
  ];

  return (
    <main className="min-h-screen bg-[#FAF8F9] px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
      <div className="mx-auto w-full max-w-7xl">

        {/* Header */}
        <section>
          <p className="text-sm font-semibold text-[#7A1F3D]">
            Agent Dashboard
          </p>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                Welcome, {fullName}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
                Manage your rental properties, verification submissions,
                renter reports, and viewing requests from one place.
              </p>
            </div>

            <Link
              to="/agent/add-property"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
            >
              <PlusCircle size={17} />
              Add Property
            </Link>
          </div>
        </section>

        {/* Error */}
        {errorMessage && (
          <div className="mt-8 rounded-xl border border-[#F3C7C7] bg-[#FFF5F5] p-4">
            <p className="text-sm font-medium text-[#B91C1C]">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Stats */}
        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="My Properties"
            value={loading ? "—" : stats.properties}
            icon={Building2}
          />

          <StatCard
            label="Verified"
            value={loading ? "—" : stats.verified}
            icon={ShieldCheck}
          />

          <StatCard
            label="Pending Review"
            value={loading ? "—" : stats.pending}
            icon={ClipboardCheck}
          />

          <StatCard
            label="Reports"
            value={loading ? "—" : stats.reports}
            icon={FileWarning}
          />

          <StatCard
            label="Pending Viewings"
            value={loading ? "—" : stats.viewingRequests}
            icon={CalendarDays}
          />
        </section>

        {/* Action Cards */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#24171C]">
              Manage Your Account
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#756970]">
              Use the tools below to manage your RentSure activity.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {actionCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EDEF]">
                    <Icon
                      size={24}
                      className="text-[#7A1F3D]"
                    />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#24171C]">
                    {card.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#756970]">
                    {card.description}
                  </p>

                  <Link
                    to={card.href}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
                  >
                    {card.action}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Verification Notice */}
        <section className="mt-10 overflow-hidden rounded-3xl bg-[#2D0A17] p-7 text-white sm:p-9 lg:p-10">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <ShieldCheck size={23} />
                </div>

                <h2 className="text-xl font-bold sm:text-2xl">
                  RentSure Verification Standard
                </h2>
              </div>

              <p className="mt-4 text-sm leading-7 text-white/75 sm:text-base">
                Verification helps renters make more informed decisions by
                reviewing submitted information and supporting documents.
                Verification does not guarantee ownership, availability, or
                complete freedom from fraud.
              </p>
            </div>

            <Link
              to="/agent/properties"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#4A1025] transition hover:bg-[#F8EDEF]"
            >
              View My Properties
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        {/* Safety Reminder */}
        <section className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8EDEF]">
              <ShieldCheck
                size={20}
                className="text-[#7A1F3D]"
              />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#24171C]">
                Keep your property information accurate
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#756970]">
                Accurate property details and valid supporting documents help
                RentSure maintain a more trustworthy rental marketplace.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
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

export default Dashboard;

