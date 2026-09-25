import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileWarning,
  Heart,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../../context/useAuth";
import { supabase } from "../../../services/supabase/client";

export default function Dashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [savedProperties, setSavedProperties] = useState([]);
  const [viewingRequests, setViewingRequests] =
    useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          profileResult,
          savedPropertiesResult,
          viewingRequestsResult,
          reportsResult,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single(),

          supabase
            .from("saved_properties")
            .select(`
              id,
              created_at,
              property:properties (
                id,
                title,
                location,
                annual_rent,
                property_type,
                verification_status,
                bedrooms,
                bathrooms
              )
            `)
            .eq("renter_id", user.id)
            .order("created_at", {
              ascending: false,
            })
            .limit(5),

          supabase
            .from("viewing_requests")
            .select(`
              id,
              status,
              requested_date,
              requested_time,
              created_at,
              property:properties (
                id,
                title,
                location
              )
            `)
            .eq("renter_id", user.id)
            .order("created_at", {
              ascending: false,
            })
            .limit(5),

          supabase
            .from("reports")
            .select(`
              id,
              status,
              created_at,
              property:properties (
                id,
                title,
                location
              )
            `)
            .eq("reporter_id", user.id)
            .order("created_at", {
              ascending: false,
            })
            .limit(5),
        ]);

        if (cancelled) {
          return;
        }

        if (profileResult.error) {
          throw profileResult.error;
        }

        if (savedPropertiesResult.error) {
          throw savedPropertiesResult.error;
        }

        if (viewingRequestsResult.error) {
          throw viewingRequestsResult.error;
        }

        if (reportsResult.error) {
          throw reportsResult.error;
        }

        setProfile(
          profileResult.data || null
        );

        setSavedProperties(
          savedPropertiesResult.data || []
        );

        setViewingRequests(
          viewingRequestsResult.data || []
        );

        setReports(
          reportsResult.data || []
        );
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Renter dashboard error:",
          loadError
        );

        setError(
          loadError?.message ||
            "Unable to load your dashboard. Please try again."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const formatCurrency = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "Rent unavailable";
    }

    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const getFirstName = () => {
    const fullName =
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "Renter";

    return fullName.split(" ")[0];
  };

  const getVerificationLabel = (status) => {
    switch (status) {
      case "verified":
        return "Verified";

      case "pending":
        return "Pending verification";

      case "rejected":
        return "Verification rejected";

      case "needs_information":
        return "Needs information";

      default:
        return "Not verified";
    }
  };

  const getVerificationClasses = (status) => {
    switch (status) {
      case "verified":
        return "bg-emerald-50 text-emerald-700";

      case "pending":
        return "bg-amber-50 text-amber-700";

      case "needs_information":
        return "bg-amber-50 text-amber-700";

      case "rejected":
        return "bg-red-50 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getViewingStatusClasses = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700";

      case "pending":
        return "bg-amber-50 text-amber-700";

      case "rejected":
      case "cancelled":
        return "bg-red-50 text-red-700";

      case "completed":
        return "bg-blue-50 text-blue-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getViewingStatusLabel = (status) => {
    switch (status) {
      case "approved":
        return "Approved";

      case "pending":
        return "Pending";

      case "rejected":
        return "Rejected";

      case "cancelled":
        return "Cancelled";

      case "completed":
        return "Completed";

      default:
        return status || "Unknown";
    }
  };

  const getReportStatusClasses = (status) => {
    switch (status) {
      case "resolved":
        return "bg-emerald-50 text-emerald-700";

      case "investigating":
        return "bg-blue-50 text-blue-700";

      case "pending":
        return "bg-amber-50 text-amber-700";

      case "rejected":
        return "bg-red-50 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f9] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded bg-gray-200" />
            <div className="h-4 w-96 max-w-full rounded bg-gray-200" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 rounded-2xl bg-gray-200"
                />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-72 rounded-2xl bg-gray-200" />
              <div className="h-72 rounded-2xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f9] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-[#7c1d5e]">
              Renter dashboard
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-[#241c21] sm:text-3xl">
              Welcome back, {getFirstName()} 👋
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
              Keep track of your saved properties, viewing
              requests, and property concerns from one place.
            </p>
          </div>

          <Link
            to="/properties"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7c1d5e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#64184c]"
          >
            <Search className="h-4 w-4" />
            Find a property
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Unable to load dashboard
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#eee5e9] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-[#f7edf4] p-3">
                <Heart className="h-5 w-5 text-[#7c1d5e]" />
              </div>

              <span className="text-xs font-medium text-[#756970]">
                Saved
              </span>
            </div>

            <p className="mt-5 text-2xl font-bold text-[#241c21]">
              {savedProperties.length}
            </p>

            <p className="mt-1 text-sm text-[#756970]">
              Saved properties
            </p>
          </div>

          <div className="rounded-2xl border border-[#eee5e9] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-blue-50 p-3">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>

              <span className="text-xs font-medium text-[#756970]">
                Requests
              </span>
            </div>

            <p className="mt-5 text-2xl font-bold text-[#241c21]">
              {viewingRequests.length}
            </p>

            <p className="mt-1 text-sm text-[#756970]">
              Viewing requests
            </p>
          </div>

          <div className="rounded-2xl border border-[#eee5e9] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-50 p-3">
                <FileWarning className="h-5 w-5 text-amber-600" />
              </div>

              <span className="text-xs font-medium text-[#756970]">
                Reports
              </span>
            </div>

            <p className="mt-5 text-2xl font-bold text-[#241c21]">
              {reports.length}
            </p>

            <p className="mt-1 text-sm text-[#756970]">
              Property concerns
            </p>
          </div>

          <div className="rounded-2xl border border-[#eee5e9] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>

              <span className="text-xs font-medium text-[#756970]">
                RentSure
              </span>
            </div>

            <p className="mt-5 text-2xl font-bold text-[#241c21]">
              Protected
            </p>

            <p className="mt-1 text-sm text-[#756970]">
              Safer property discovery
            </p>
          </div>
        </div>

        {/* Saved Properties + Safety */}
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-[#eee5e9] bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#241c21]">
                  Saved properties
                </h2>

                <p className="mt-1 text-sm text-[#756970]">
                  Properties you want to keep an eye on.
                </p>
              </div>

              <Link
                to="/renter/saved-properties"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#7c1d5e] hover:text-[#64184c]"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {savedProperties.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#ddd2d8] p-8 text-center">
                <Heart className="mx-auto h-8 w-8 text-[#b8abb2]" />

                <h3 className="mt-3 font-semibold text-[#241c21]">
                  No saved properties yet
                </h3>

                <p className="mx-auto mt-1 max-w-md text-sm text-[#756970]">
                  Save properties you like so you can quickly
                  return to them later.
                </p>

                <Link
                  to="/properties"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#7c1d5e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#64184c]"
                >
                  <Search className="h-4 w-4" />
                  Explore properties
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedProperties.map((saved) => {
                  const property = saved.property;

                  if (!property) {
                    return null;
                  }

                  return (
                    <Link
                      key={saved.id}
                      to={`/properties/${property.id}`}
                      className="flex flex-col gap-4 rounded-xl border border-[#eee5e9] p-4 transition hover:border-[#d7b9cc] hover:bg-[#fcfafb] sm:flex-row"
                    >
                      <div className="flex h-24 w-full shrink-0 items-center justify-center rounded-xl bg-[#f4eef1] sm:w-32">
                        <Home className="h-8 w-8 text-[#b8abb2]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="truncate font-semibold text-[#241c21]">
                              {property.title}
                            </h3>

                            <div className="mt-1 flex items-start gap-1 text-sm text-[#756970]">
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              <span>
                                {property.location ||
                                  "Location unavailable"}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${getVerificationClasses(
                              property.verification_status
                            )}`}
                          >
                            {getVerificationLabel(
                              property.verification_status
                            )}
                          </span>
                        </div>

                        <p className="mt-3 text-base font-bold text-[#7c1d5e]">
                          {formatCurrency(
                            property.annual_rent
                          )}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Safety */}
          <section className="rounded-2xl bg-[#241c21] p-6 text-white shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>

            <h2 className="mt-5 text-lg font-bold">
              Stay protected with RentSure
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/70">
              Always verify property details and avoid sending
              money before confirming that the property and
              agent are legitimate.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <p className="text-sm text-white/80">
                  Look for verified property information.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <p className="text-sm text-white/80">
                  Arrange viewings before making payments.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <p className="text-sm text-white/80">
                  Report suspicious property activity.
                </p>
              </div>
            </div>

            <Link
              to="/safety"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-white/80"
            >
              Learn about property safety
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>

        {/* Viewing Requests */}
        <section className="rounded-2xl border border-[#eee5e9] bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#241c21]">
                Viewing requests
              </h2>

              <p className="mt-1 text-sm text-[#756970]">
                Keep track of your property viewing appointments.
              </p>
            </div>

            <Link
              to="/renter/viewing-requests"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#7c1d5e] hover:text-[#64184c]"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {viewingRequests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#ddd2d8] p-8 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-[#b8abb2]" />

              <h3 className="mt-3 font-semibold text-[#241c21]">
                No viewing requests
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-[#756970]">
                Request a viewing when you find a property you
                are interested in.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#eee5e9] text-left">
                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-[#756970]">
                      Property
                    </th>

                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-[#756970]">
                      Date
                    </th>

                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-[#756970]">
                      Time
                    </th>

                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-[#756970]">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {viewingRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-[#f1eaee] last:border-0"
                    >
                      <td className="px-3 py-4">
                        <div>
                          <p className="font-semibold text-[#241c21]">
                            {request.property?.title ||
                              "Property unavailable"}
                          </p>

                          {request.property?.location && (
                            <p className="mt-1 flex items-start gap-1 text-xs text-[#756970]">
                              <MapPin className="mt-0.5 h-3 w-3 shrink-0" />

                              <span>
                                {request.property.location}
                              </span>
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-4 text-sm text-[#756970]">
                        {formatDate(
                          request.requested_date
                        )}
                      </td>

                      <td className="px-3 py-4 text-sm text-[#756970]">
                        {request.requested_time ||
                          "Time not specified"}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getViewingStatusClasses(
                            request.status
                          )}`}
                        >
                          {getViewingStatusLabel(
                            request.status
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Reports */}
        <section className="rounded-2xl border border-[#eee5e9] bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-[#241c21]">
              Property reports
            </h2>

            <p className="mt-1 text-sm text-[#756970]">
              Monitor concerns you have reported.
            </p>
          </div>

          {reports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#ddd2d8] p-8 text-center">
              <FileWarning className="mx-auto h-8 w-8 text-[#b8abb2]" />

              <h3 className="mt-3 font-semibold text-[#241c21]">
                No reports yet
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-[#756970]">
                If you encounter a suspicious or problematic
                property, you can report it for review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col gap-4 rounded-xl border border-[#eee5e9] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-amber-50 p-3">
                      <FileWarning className="h-5 w-5 text-amber-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#241c21]">
                        {report.property?.title ||
                          "Property concern"}
                      </h3>

                      {report.property?.location && (
                        <p className="mt-1 flex items-start gap-1 text-xs text-[#756970]">
                          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />

                          <span>
                            {report.property.location}
                          </span>
                        </p>
                      )}

                      <p className="mt-1 text-xs text-[#756970]">
                        Reported •{" "}
                        {formatDate(
                          report.created_at
                        )}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${getReportStatusClasses(
                      report.status
                    )}`}
                  >
                    {report.status || "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#241c21]">
              Quick actions
            </h2>

            <p className="mt-1 text-sm text-[#756970]">
              Get where you need to go quickly.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/properties"
              className="group rounded-2xl border border-[#eee5e9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#d7b9cc]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7edf4]">
                <Search className="h-5 w-5 text-[#7c1d5e]" />
              </div>

              <h3 className="mt-4 font-semibold text-[#241c21]">
                Browse properties
              </h3>

              <p className="mt-1 text-sm text-[#756970]">
                Find your next home.
              </p>
            </Link>

            <Link
              to="/renter/saved-properties"
              className="group rounded-2xl border border-[#eee5e9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#d7b9cc]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7edf4]">
                <Heart className="h-5 w-5 text-[#7c1d5e]" />
              </div>

              <h3 className="mt-4 font-semibold text-[#241c21]">
                Saved properties
              </h3>

              <p className="mt-1 text-sm text-[#756970]">
                Review properties you saved.
              </p>
            </Link>

            <Link
              to="/renter/viewing-requests"
              className="group rounded-2xl border border-[#eee5e9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#d7b9cc]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>

              <h3 className="mt-4 font-semibold text-[#241c21]">
                Viewing requests
              </h3>

              <p className="mt-1 text-sm text-[#756970]">
                Manage your appointments.
              </p>
            </Link>

            <Link
              to="/account"
              className="group rounded-2xl border border-[#eee5e9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#d7b9cc]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <UserRound className="h-5 w-5 text-emerald-600" />
              </div>

              <h3 className="mt-4 font-semibold text-[#241c21]">
                My profile
              </h3>

              <p className="mt-1 text-sm text-[#756970]">
                Update your account details.
              </p>
            </Link>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 rounded-2xl border border-[#eadde4] bg-[#fdf9fb] p-4">
          <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#7c1d5e]" />

          <p className="text-xs leading-5 text-[#756970]">
            Property availability, pricing, verification status,
            and viewing schedules may change. Always confirm the
            latest information before making any financial
            commitment.
          </p>
        </div>
      </div>
    </div>
  );
}