
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  FileWarning,
  Loader2,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../../services/supabase/client";

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    agents: 0,
    properties: 0,
    verifiedProperties: 0,
    pendingVerifications: 0,
    reports: 0,
    reportsUnderReview: 0,
    viewingRequests: 0,
    pendingViewingRequests: 0,
    flaggedProperties: 0,
    highSeverityReports: 0,
  });

  const [recentVerifications, setRecentVerifications] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const [
          usersResult,
          agentsResult,
          propertiesResult,
          verifiedPropertiesResult,
          pendingVerificationsResult,
          reportsResult,
          reportsReviewResult,
          viewingRequestsResult,
          pendingViewingRequestsResult,
          flaggedPropertiesResult,
          highSeverityReportsResult,
          recentVerificationResult,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("id", {
              count: "exact",
              head: true,
            }),

          supabase
            .from("profiles")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq("role", "agent"),

          supabase
            .from("properties")
            .select("id", {
              count: "exact",
              head: true,
            }),

          supabase
            .from("properties")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq("verification_status", "verified"),

          supabase
            .from("property_verifications")
            .select("id", {
              count: "exact",
              head: true,
            })
            .in("status", [
              "pending",
              "under_review",
              "needs_information",
            ]),

          supabase
            .from("reports")
            .select("id", {
              count: "exact",
              head: true,
            }),

          supabase
            .from("reports")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq("status", "under_review"),

          supabase
            .from("viewing_requests")
            .select("id", {
              count: "exact",
              head: true,
            }),

          supabase
            .from("viewing_requests")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq("status", "pending"),

          supabase
            .from("properties")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq("property_status", "flagged"),

          supabase
            .from("reports")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq("severity", "high")
            .eq("status", "under_review"),

          supabase
            .from("property_verifications")
            .select(`
              id,
              property_id,
              status,
              document_count,
              created_at,
              properties (
                id,
                title,
                location
              )
            `)
            .order("created_at", {
              ascending: false,
            })
            .limit(5),
        ]);

        const results = [
          usersResult,
          agentsResult,
          propertiesResult,
          verifiedPropertiesResult,
          pendingVerificationsResult,
          reportsResult,
          reportsReviewResult,
          viewingRequestsResult,
          pendingViewingRequestsResult,
          flaggedPropertiesResult,
          highSeverityReportsResult,
          recentVerificationResult,
        ];

        const failedResult = results.find(
          (result) => result.error
        );

        if (failedResult) {
          throw failedResult.error;
        }

        setStats({
          users: usersResult.count || 0,
          agents: agentsResult.count || 0,
          properties:
            propertiesResult.count || 0,
          verifiedProperties:
            verifiedPropertiesResult.count || 0,
          pendingVerifications:
            pendingVerificationsResult.count || 0,
          reports: reportsResult.count || 0,
          reportsUnderReview:
            reportsReviewResult.count || 0,
          viewingRequests:
            viewingRequestsResult.count || 0,
          pendingViewingRequests:
            pendingViewingRequestsResult.count || 0,
          flaggedProperties:
            flaggedPropertiesResult.count || 0,
          highSeverityReports:
            highSeverityReportsResult.count || 0,
        });

        setRecentVerifications(
          recentVerificationResult.data || []
        );
      } catch (error) {
        console.error(
          "Error loading admin dashboard:",
          error
        );

        setErrorMessage(
          error.message ||
            "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F9] px-5">
        <div className="text-center">
          <Loader2
            size={34}
            className="mx-auto animate-spin text-[#7A1F3D]"
          />

          <p className="mt-4 text-sm font-medium text-[#756970]">
            Loading administrator dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-3 py-1.5 text-xs font-bold text-[#7A1F3D]">
            <ShieldCheck size={14} />
            Administrator Dashboard
          </div>

          <h1 className="text-2xl font-bold text-[#24171C] sm:text-3xl">
            RentSure Overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970]">
            Monitor users, properties, verification,
            reports, and viewing activity.
          </p>
        </header>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {errorMessage}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            label="Users"
            value={stats.users}
            icon={<Users size={20} />}
            href="/admin/users"
          />

          <DashboardCard
            label="Agents"
            value={stats.agents}
            icon={<UserRound size={20} />}
            href="/admin/agents"
          />

          <DashboardCard
            label="Properties"
            value={stats.properties}
            icon={<Building2 size={20} />}
            href="/admin/properties"
          />

          <DashboardCard
            label="Verified Properties"
            value={stats.verifiedProperties}
            icon={<ShieldCheck size={20} />}
            href="/admin/properties"
          />

          <DashboardCard
            label="Pending Verifications"
            value={stats.pendingVerifications}
            icon={<ShieldCheck size={20} />}
            href="/admin/verification"
          />

          <DashboardCard
            label="Reports"
            value={stats.reports}
            icon={<FileWarning size={20} />}
            href="/admin/reports"
          />

          <DashboardCard
            label="Reports Under Review"
            value={stats.reportsUnderReview}
            icon={<AlertTriangle size={20} />}
            href="/admin/reports"
          />

          <DashboardCard
            label="Viewing Requests"
            value={stats.viewingRequests}
            icon={<CalendarDays size={20} />}
            href="/admin/viewing-requests"
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-[#24171C]">
                  Needs Attention
                </h2>

                <p className="mt-1 text-sm text-[#756970]">
                  Items requiring administrator review.
                </p>
              </div>

              <AlertTriangle
                size={22}
                className="text-[#B45309]"
              />
            </div>

            <div className="mt-6 space-y-3">
              <AttentionItem
                label="Pending Verifications"
                value={stats.pendingVerifications}
                href="/admin/verification"
              />

              <AttentionItem
                label="High-Severity Reports"
                value={stats.highSeverityReports}
                href="/admin/reports"
              />

              <AttentionItem
                label="Flagged Properties"
                value={stats.flaggedProperties}
                href="/admin/properties"
              />

              <AttentionItem
                label="Pending Viewing Requests"
                value={stats.pendingViewingRequests}
                href="/admin/viewing-requests"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-[#24171C]">
                  Recent Verification Activity
                </h2>

                <p className="mt-1 text-sm text-[#756970]">
                  Latest property verification records.
                </p>
              </div>

              <Link
                to="/admin/verification"
                className="text-sm font-semibold text-[#7A1F3D]"
              >
                View All
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {recentVerifications.length === 0 ? (
                <p className="rounded-xl bg-[#FAF8F9] p-4 text-sm text-[#756970]">
                  No verification activity yet.
                </p>
              ) : (
                recentVerifications.map(
                  (verification) => (
                    <Link
                      key={verification.id}
                      to={`/admin/verification/${verification.id}`}
                      className="block rounded-xl border border-[#E8DDE1] p-4 transition hover:bg-[#FAF8F9]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#24171C]">
                            {verification.properties
                              ?.title ||
                              `Property #${verification.property_id}`}
                          </p>

                          <p className="mt-1 text-xs text-[#756970]">
                            {
                              verification.properties
                                ?.location
                            }
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-[#F8EDEF] px-2.5 py-1 text-xs font-bold text-[#7A1F3D]">
                          {formatStatus(
                            verification.status
                          )}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-[#756970]">
                        {verification.document_count} document
                        {verification.document_count ===
                        1
                          ? ""
                          : "s"} ·{" "}
                        {formatDate(
                          verification.created_at
                        )}
                      </p>
                    </Link>
                  )
                )
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-[#2D0A17] p-6 text-white shadow-sm sm:p-8">
          <h2 className="text-lg font-bold">
            Administrator Controls
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
            RentSure uses role-based access, Supabase
            Row Level Security, protected database
            functions, and verification controls to
            separate administrative operations from
            renter and agent actions.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AdminAction
              href="/admin/users"
              label="Manage Users"
            />

            <AdminAction
              href="/admin/properties"
              label="Manage Properties"
            />

            <AdminAction
              href="/admin/verification"
              label="Review Verification"
            />

            <AdminAction
              href="/admin/reports"
              label="Review Reports"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardCard({
  label,
  value,
  icon,
  href,
}) {
  return (
    <Link
      to={href}
      className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#756970]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-[#24171C]">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
          {icon}
        </div>
      </div>
    </Link>
  );
}

function AttentionItem({
  label,
  value,
  href,
}) {
  return (
    <Link
      to={href}
      className="flex items-center justify-between rounded-xl border border-[#E8DDE1] p-4 transition hover:bg-[#FAF8F9]"
    >
      <span className="text-sm font-semibold text-[#24171C]">
        {label}
      </span>

      <span className="rounded-full bg-[#F8EDEF] px-3 py-1.5 text-xs font-bold text-[#7A1F3D]">
        {value}
      </span>
    </Link>
  );
}

function AdminAction({ href, label }) {
  return (
    <Link
      to={href}
      className="rounded-lg border border-white/20 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
    >
      {label}
    </Link>
  );
}

function formatStatus(value) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default AdminDashboard;

