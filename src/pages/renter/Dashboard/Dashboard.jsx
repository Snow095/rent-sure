
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Heart,
  CalendarDays,
  FileWarning,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../services/supabase/client";

function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    savedProperties: 0,
    viewingRequests: 0,
    reports: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fullName =
    user?.user_metadata?.full_name?.trim() || "Renter";

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user?.id) {
        setLoadingStats(false);
        return;
      }

      setLoadingStats(true);
      setErrorMessage("");

      try {
        const [
          savedPropertiesResult,
          viewingRequestsResult,
          reportsResult,
        ] = await Promise.all([
          supabase
            .from("saved_properties")
            .select("id", { count: "exact", head: true })
            .eq("renter_id", user.id),

          supabase
            .from("viewing_requests")
            .select("id", { count: "exact", head: true })
            .eq("renter_id", user.id),

          supabase
            .from("reports")
            .select("id", { count: "exact", head: true })
            .eq("reporter_id", user.id),
        ]);

        if (savedPropertiesResult.error) {
          throw savedPropertiesResult.error;
        }

        if (viewingRequestsResult.error) {
          throw viewingRequestsResult.error;
        }

        if (reportsResult.error) {
          throw reportsResult.error;
        }

        setStats({
          savedProperties: savedPropertiesResult.count ?? 0,
          viewingRequests: viewingRequestsResult.count ?? 0,
          reports: reportsResult.count ?? 0,
        });
      } catch (error) {
        console.error("Error loading renter dashboard stats:", error);
        setErrorMessage(
          "We couldn't load your dashboard statistics. Please try again later."
        );
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, [user?.id]);

  const dashboardCards = [
    {
      title: "Find Properties",
      description:
        "Search available rental properties and review their verification information.",
      value: null,
      icon: Search,
      href: "/properties",
      action: "Browse Properties",
    },
    {
      title: "Saved Properties",
      description:
        "Keep track of properties you're interested in and review them later.",
      value: stats.savedProperties,
      icon: Heart,
      href: "/renter/saved-properties",
      action: "View Saved",
    },
    {
      title: "Viewing Requests",
      description:
        "Manage your property viewing requests and keep track of their status.",
      value: stats.viewingRequests,
      icon: CalendarDays,
      href: "/renter/viewing-requests",
      action: "View Requests",
    },
    {
      title: "My Reports",
      description:
        "Review the suspicious listings, payment concerns, or other issues you've reported.",
      value: stats.reports,
      icon: FileWarning,
      href: "/renter/reports",
      action: "View Reports",
    },
  ];

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      {/* Header */}
      <section className="border-b border-[#E8DDE1] bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-12">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-[#7A1F3D]">
              Renter Dashboard
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
              Welcome back, {fullName}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#756970] sm:text-base">
              Manage your rental search, saved properties, viewing requests,
              and safety reports from one place.
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-12">
        {/* Error */}
        {errorMessage && (
          <div className="mb-8 rounded-xl border border-[#F1CACA] bg-[#FEF2F2] px-5 py-4">
            <p className="text-sm leading-6 text-[#B91C1C]">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                to={card.href}
                className="group rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#D8C2CA] hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EDEF]">
                    <Icon
                      size={22}
                      className="text-[#7A1F3D]"
                    />
                  </div>

                  {card.value !== null && (
                    <div className="text-right">
                      {loadingStats ? (
                        <Loader2
                          size={20}
                          className="animate-spin text-[#7A1F3D]"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-[#24171C]">
                          {card.value}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <h2 className="mt-6 text-lg font-bold text-[#24171C]">
                  {card.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#756970]">
                  {card.description}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D]">
                  {card.action}

                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Safety / Trust Section */}
        <div className="mt-10 rounded-2xl bg-[#2D0A17] p-7 sm:p-9 lg:mt-12">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck
                  size={24}
                  className="text-[#C9A227]"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">
                  Rent with more confidence
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#E8DDE1]">
                  Review verification information, risk indicators, and
                  property details before making rental decisions. RentSure
                  helps you identify potential warning signs, but verification
                  does not guarantee ownership, availability, or complete
                  freedom from fraud.
                </p>
              </div>
            </div>

            <Link
              to="/properties"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
            >
              Explore Properties
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
