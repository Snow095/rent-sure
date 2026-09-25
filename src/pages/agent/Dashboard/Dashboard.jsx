import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Home,
  Loader2,
  Plus,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../../context/useAuth";
import { supabase } from "../../../services/supabase/client";

function AgentDashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [reports, setReports] = useState([]);
  const [viewingRequests, setViewingRequests] = useState([]);

  const [loadedUserId, setLoadedUserId] = useState(null);
  const [retryLoading, setRetryLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loading =
    Boolean(user) &&
    (loadedUserId !== user.id || retryLoading);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    let cancelled = false;

    const loadDashboardData = async () => {
      setErrorMessage("");

      try {
        const [
          profileResponse,
          propertiesResponse,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", user.id)
            .maybeSingle(),

          supabase
            .from("properties")
            .select(
              `
                id,
                title,
                location,
                property_type,
                annual_rent,
                verification_status,
                risk_score,
                property_status,
                created_at
              `
            )
            .eq("agent_id", user.id)
            .order("created_at", { ascending: false }),
        ]);

        if (profileResponse.error) {
          throw profileResponse.error;
        }

        if (propertiesResponse.error) {
          throw propertiesResponse.error;
        }

        const agentProperties =
          propertiesResponse.data || [];

        const propertyIds = agentProperties.map(
          (property) => property.id
        );

        let reportsResponse = {
          data: [],
          error: null,
        };

        let viewingResponse = {
          data: [],
          error: null,
        };

        if (propertyIds.length > 0) {
          [
            reportsResponse,
            viewingResponse,
          ] = await Promise.all([
            supabase
              .from("reports")
              .select(
                `
                  id,
                  property_id,
                  status,
                  created_at,
                  properties (
                    id,
                    title,
                    location
                  )
                `
              )
              .in("property_id", propertyIds)
              .order("created_at", {
                ascending: false,
              })
              .limit(5),

            supabase
              .from("viewing_requests")
              .select(
                `
                  id,
                  property_id,
                  renter_id,
                  requested_date,
                  requested_time,
                  status,
                  created_at,
                  properties (
                    id,
                    title,
                    location
                  ),
                  profiles:renter_id (
                    id,
                    full_name
                  )
                `
              )
              .in("property_id", propertyIds)
              .order("requested_date", {
                ascending: true,
              })
              .order("requested_time", {
                ascending: true,
              })
              .limit(6),
          ]);
        }

        if (reportsResponse.error) {
          throw reportsResponse.error;
        }

        if (viewingResponse.error) {
          throw viewingResponse.error;
        }

        if (cancelled) {
          return;
        }

        setProfile(profileResponse.data);
        setProperties(agentProperties);
        setReports(reportsResponse.data || []);
        setViewingRequests(
          viewingResponse.data || []
        );
        setLoadedUserId(user.id);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Error loading agent dashboard:",
          error
        );

        setErrorMessage(
          "We couldn't load your dashboard right now. Please try again."
        );

        setLoadedUserId(user.id);
      }
    };

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) {
      return;
    }

    setRetryLoading(true);
    setErrorMessage("");

    try {
      const [
        profileResponse,
        propertiesResponse,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .maybeSingle(),

        supabase
          .from("properties")
          .select(
            `
              id,
              title,
              location,
              property_type,
              annual_rent,
              verification_status,
              risk_score,
              property_status,
              created_at
            `
          )
          .eq("agent_id", user.id)
          .order("created_at", {
            ascending: false,
          }),
      ]);

      if (profileResponse.error) {
        throw profileResponse.error;
      }

      if (propertiesResponse.error) {
        throw propertiesResponse.error;
      }

      const agentProperties =
        propertiesResponse.data || [];

      const propertyIds = agentProperties.map(
        (property) => property.id
      );

      let reportsResponse = {
        data: [],
        error: null,
      };

      let viewingResponse = {
        data: [],
        error: null,
      };

      if (propertyIds.length > 0) {
        [
          reportsResponse,
          viewingResponse,
        ] = await Promise.all([
          supabase
            .from("reports")
            .select(
              `
                id,
                property_id,
                status,
                created_at,
                properties (
                  id,
                  title,
                  location
                )
              `
            )
            .in("property_id", propertyIds)
            .order("created_at", {
              ascending: false,
            })
            .limit(5),

          supabase
            .from("viewing_requests")
            .select(
              `
                id,
                property_id,
                renter_id,
                requested_date,
                requested_time,
                status,
                created_at,
                properties (
                  id,
                  title,
                  location
                ),
                profiles:renter_id (
                  id,
                  full_name
                )
              `
            )
            .in("property_id", propertyIds)
            .order("requested_date", {
              ascending: true,
            })
            .order("requested_time", {
              ascending: true,
            })
            .limit(6),
        ]);
      }

      if (reportsResponse.error) {
        throw reportsResponse.error;
      }

      if (viewingResponse.error) {
        throw viewingResponse.error;
      }

      setProfile(profileResponse.data);
      setProperties(agentProperties);
      setReports(reportsResponse.data || []);
      setViewingRequests(
        viewingResponse.data || []
      );
      setLoadedUserId(user.id);
    } catch (error) {
      console.error(
        "Error loading agent dashboard:",
        error
      );

      setErrorMessage(
        "We couldn't load your dashboard right now. Please try again."
      );
    } finally {
      setRetryLoading(false);
    }
  };

  const stats = useMemo(() => {
    const activeProperties = properties.filter(
      (property) =>
        property.property_status === "active"
    ).length;

    const verifiedProperties = properties.filter(
      (property) =>
        property.verification_status === "verified"
    ).length;

    const pendingVerification = properties.filter(
      (property) =>
        property.verification_status === "pending"
    ).length;

    const needsInformation = properties.filter(
      (property) =>
        property.verification_status ===
        "needs_information"
    ).length;

    const flaggedProperties = properties.filter(
      (property) =>
        property.property_status === "flagged"
    ).length;

    const pendingViewings = viewingRequests.filter(
      (request) => request.status === "pending"
    ).length;

    const confirmedViewings = viewingRequests.filter(
      (request) => request.status === "confirmed"
    ).length;

    const unresolvedReports = reports.filter(
      (report) =>
        report.status === "under_review"
    ).length;

    return {
      total: properties.length,
      activeProperties,
      verifiedProperties,
      pendingVerification,
      needsInformation,
      flaggedProperties,
      pendingViewings,
      confirmedViewings,
      unresolvedReports,
    };
  }, [properties, reports, viewingRequests]);

  const recentProperties = properties.slice(0, 5);

  const getVerificationConfig = (status) => {
    switch (status) {
      case "verified":
        return {
          label: "Verified",
          icon: CheckCircle2,
          className:
            "border-green-200 bg-green-50 text-green-700",
        };

      case "needs_information":
        return {
          label: "Needs information",
          icon: AlertTriangle,
          className:
            "border-amber-200 bg-amber-50 text-amber-700",
        };

      case "rejected":
        return {
          label: "Rejected",
          icon: XCircle,
          className:
            "border-red-200 bg-red-50 text-red-700",
        };

      case "pending":
      default:
        return {
          label: "Pending",
          icon: Clock3,
          className:
            "border-amber-200 bg-amber-50 text-amber-700",
        };
    }
  };

  const getViewingStatusConfig = (status) => {
    switch (status) {
      case "confirmed":
        return {
          label: "Confirmed",
          className:
            "border-green-200 bg-green-50 text-green-700",
        };

      case "completed":
        return {
          label: "Completed",
          className:
            "border-blue-200 bg-blue-50 text-blue-700",
        };

      case "cancelled":
        return {
          label: "Cancelled",
          className:
            "border-gray-200 bg-gray-100 text-gray-600",
        };

      case "pending":
      default:
        return {
          label: "Pending",
          className:
            "border-amber-200 bg-amber-50 text-amber-700",
        };
    }
  };

  const getRiskLabel = (riskScore) => {
    if (
      riskScore === null ||
      riskScore === undefined
    ) {
      return {
        label: "Not scored",
        className: "text-[#756970]",
      };
    }

    if (riskScore >= 60) {
      return {
        label: "High risk",
        className: "text-[#B91C1C]",
      };
    }

    if (riskScore >= 30) {
      return {
        label: "Moderate risk",
        className: "text-[#B45309]",
      };
    }

    return {
      label: "Low risk",
      className: "text-[#15803D]",
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "—";
    }

    return new Date(dateString).toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) {
      return "";
    }

    const [hours, minutes] = timeString.split(":");
    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F9]">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#7A1F3D]" />

            <p className="text-sm text-[#756970]">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <section className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#7A1F3D]">
                <Building2 className="h-4 w-4" />
                <span>Agent workspace</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#24171C] sm:text-3xl">
                Welcome back
                {profile?.full_name
                  ? `, ${profile.full_name}`
                  : ""}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
                Manage your rental listings, verification
                activity, reports, and viewing requests from
                one place.
              </p>
            </div>

            <Link
              to="/agent/add-property"
              className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025]"
            >
              <Plus className="h-4 w-4" />
              Add Property
            </Link>
          </div>
        </section>

        {/* Error */}
        {errorMessage && (
          <section className="mb-8 rounded-xl border border-red-200 bg-red-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#B91C1C]" />

                <div>
                  <h2 className="text-sm font-semibold text-red-800">
                    Dashboard data could not be loaded
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-red-700">
                    {errorMessage}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchDashboardData}
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm ring-1 ring-inset ring-red-200 transition hover:bg-red-100"
              >
                Try Again
              </button>
            </div>
          </section>
        )}

        {/* Stats */}
        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[#756970]">
                Total Properties
              </span>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8EDEF]">
                <Home className="h-4 w-4 text-[#7A1F3D]" />
              </div>
            </div>

            <p className="text-2xl font-bold text-[#24171C]">
              {stats.total}
            </p>

            <p className="mt-1 text-xs text-[#756970]">
              {stats.activeProperties} active
            </p>
          </div>

          <div className="rounded-xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[#756970]">
                Verified
              </span>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                <ShieldCheck className="h-4 w-4 text-green-600" />
              </div>
            </div>

            <p className="text-2xl font-bold text-[#24171C]">
              {stats.verifiedProperties}
            </p>

            <p className="mt-1 text-xs text-[#756970]">
              Approved listings
            </p>
          </div>

          <div className="rounded-xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[#756970]">
                Verification
              </span>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <FileCheck2 className="h-4 w-4 text-amber-600" />
              </div>
            </div>

            <p className="text-2xl font-bold text-[#24171C]">
              {stats.pendingVerification}
            </p>

            <p className="mt-1 text-xs text-[#756970]">
              Pending review
            </p>
          </div>

          <div className="rounded-xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[#756970]">
                Viewings
              </span>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8EDEF]">
                <CalendarDays className="h-4 w-4 text-[#7A1F3D]" />
              </div>
            </div>

            <p className="text-2xl font-bold text-[#24171C]">
              {stats.pendingViewings}
            </p>

            <p className="mt-1 text-xs text-[#756970]">
              Pending requests
            </p>
          </div>
        </section>

        {/* Action Alerts */}
        {(stats.needsInformation > 0 ||
          stats.flaggedProperties > 0 ||
          stats.unresolvedReports > 0) && (
          <section className="mb-8 grid gap-4 lg:grid-cols-3">
            {stats.needsInformation > 0 && (
              <Link
                to="/agent/properties"
                className="rounded-xl border border-amber-200 bg-amber-50 p-5 transition hover:border-amber-300 hover:bg-amber-100"
              >
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-[#B45309]" />

                  <div>
                    <h2 className="text-sm font-bold text-[#24171C]">
                      Information needed
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[#756970]">
                      {stats.needsInformation}{" "}
                      {stats.needsInformation === 1
                        ? "property needs"
                        : "properties need"}{" "}
                      additional information before
                      verification can continue.
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {stats.flaggedProperties > 0 && (
              <Link
                to="/agent/properties"
                className="rounded-xl border border-red-200 bg-red-50 p-5 transition hover:border-red-300 hover:bg-red-100"
              >
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-[#B91C1C]" />

                  <div>
                    <h2 className="text-sm font-bold text-[#24171C]">
                      Flagged properties
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[#756970]">
                      {stats.flaggedProperties}{" "}
                      {stats.flaggedProperties === 1
                        ? "property requires"
                        : "properties require"}{" "}
                      your attention.
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {stats.unresolvedReports > 0 && (
              <Link
                to="/agent/reports"
                className="rounded-xl border border-[#E8DDE1] bg-white p-5 transition hover:border-[#CDBCC2] hover:bg-[#FAF8F9]"
              >
                <div className="flex gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-[#7A1F3D]" />

                  <div>
                    <h2 className="text-sm font-bold text-[#24171C]">
                      Reports to review
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[#756970]">
                      {stats.unresolvedReports}{" "}
                      {stats.unresolvedReports === 1
                        ? "report is"
                        : "reports are"}{" "}
                      currently under review.
                    </p>
                  </div>
                </div>
              </Link>
            )}
          </section>
        )}

        {/* Main Grid */}
        <section className="grid gap-8 lg:grid-cols-3">
          {/* Properties */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-[#E8DDE1] bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-[#E8DDE1] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h2 className="text-lg font-bold text-[#24171C]">
                    Recent Properties
                  </h2>

                  <p className="mt-1 text-sm text-[#756970]">
                    Your latest rental property listings.
                  </p>
                </div>

                <Link
                  to="/agent/properties"
                  className="text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
                >
                  View all
                </Link>
              </div>

              {recentProperties.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EDEF]">
                    <Home className="h-5 w-5 text-[#7A1F3D]" />
                  </div>

                  <h3 className="mt-4 text-base font-bold text-[#24171C]">
                    No properties yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#756970]">
                    Add your first property to begin the
                    verification process.
                  </p>

                  <Link
                    to="/agent/add-property"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#7A1F3D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Property
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#E8DDE1]">
                  {recentProperties.map((property) => {
                    const verification =
                      getVerificationConfig(
                        property.verification_status
                      );

                    const VerificationIcon =
                      verification.icon;

                    const risk = getRiskLabel(
                      property.risk_score
                    );

                    return (
                      <div
                        key={property.id}
                        className="p-5 transition hover:bg-[#FAF8F9] sm:p-6"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F8EDEF]">
                              <Home className="h-5 w-5 text-[#7A1F3D]" />
                            </div>

                            <div className="min-w-0">
                              <Link
                                to={`/properties/${property.id}`}
                                className="block truncate text-sm font-bold text-[#24171C] transition hover:text-[#7A1F3D]"
                              >
                                {property.title}
                              </Link>

                              <p className="mt-1 truncate text-sm text-[#756970]">
                                {property.location}
                              </p>

                              <p className="mt-1 text-xs capitalize text-[#9A8D93]">
                                {property.property_type?.replace(
                                  /_/g,
                                  " "
                                )}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${verification.className}`}
                          >
                            <VerificationIcon className="h-3.5 w-3.5" />
                            {verification.label}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 border-t border-[#E8DDE1] pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#756970]">
                            <span>
                              Status:{" "}
                              <span className="font-semibold capitalize text-[#24171C]">
                                {property.property_status?.replace(
                                  /_/g,
                                  " "
                                )}
                              </span>
                            </span>

                            <span>
                              Risk:{" "}
                              <span
                                className={`font-semibold ${risk.className}`}
                              >
                                {risk.label}
                              </span>
                            </span>

                            {property.annual_rent !==
                              null &&
                              property.annual_rent !==
                                undefined && (
                                <span>
                                  Rent:{" "}
                                  <span className="font-semibold text-[#24171C]">
                                    ₦
                                    {Number(
                                      property.annual_rent
                                    ).toLocaleString()}
                                    /yr
                                  </span>
                                </span>
                              )}
                          </div>

                          <Link
                            to={`/agent/properties/${property.id}/edit`}
                            className="text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
                          >
                            Manage
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <aside className="space-y-6">
            <div className="rounded-xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-[#24171C]">
                Quick Actions
              </h2>

              <div className="mt-5 space-y-2">
                <Link
                  to="/agent/add-property"
                  className="flex items-center gap-3 rounded-lg border border-[#E8DDE1] px-4 py-3 text-sm font-semibold text-[#24171C] transition hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                >
                  <Plus className="h-4 w-4 text-[#7A1F3D]" />
                  Add Property
                </Link>

                <Link
                  to="/agent/properties"
                  className="flex items-center gap-3 rounded-lg border border-[#E8DDE1] px-4 py-3 text-sm font-semibold text-[#24171C] transition hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                >
                  <Home className="h-4 w-4 text-[#7A1F3D]" />
                  Manage Properties
                </Link>

                <Link
                  to="/agent/verification"
                  className="flex items-center gap-3 rounded-lg border border-[#E8DDE1] px-4 py-3 text-sm font-semibold text-[#24171C] transition hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                >
                  <FileCheck2 className="h-4 w-4 text-[#7A1F3D]" />
                  Verification
                </Link>

                <Link
                  to="/agent/viewing-requests"
                  className="flex items-center gap-3 rounded-lg border border-[#E8DDE1] px-4 py-3 text-sm font-semibold text-[#24171C] transition hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                >
                  <CalendarDays className="h-4 w-4 text-[#7A1F3D]" />
                  Viewing Requests
                </Link>

                <Link
                  to="/agent/reports"
                  className="flex items-center gap-3 rounded-lg border border-[#E8DDE1] px-4 py-3 text-sm font-semibold text-[#24171C] transition hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                >
                  <FileText className="h-4 w-4 text-[#7A1F3D]" />
                  Property Reports
                </Link>
              </div>
            </div>

            {/* Verification Summary */}
            <div className="rounded-xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8EDEF]">
                  <ShieldCheck className="h-5 w-5 text-[#7A1F3D]" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-[#24171C]">
                    Verification Summary
                  </h2>

                  <p className="mt-1 text-xs text-[#756970]">
                    Current listing verification activity.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#756970]">
                    Verified
                  </span>

                  <span className="text-sm font-bold text-green-700">
                    {stats.verifiedProperties}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#756970]">
                    Pending
                  </span>

                  <span className="text-sm font-bold text-amber-700">
                    {stats.pendingVerification}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#756970]">
                    Needs information
                  </span>

                  <span className="text-sm font-bold text-amber-700">
                    {stats.needsInformation}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#756970]">
                    Flagged
                  </span>

                  <span className="text-sm font-bold text-red-700">
                    {stats.flaggedProperties}
                  </span>
                </div>
              </div>

              <Link
                to="/agent/verification"
                className="mt-5 block rounded-lg bg-[#F8EDEF] px-4 py-3 text-center text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F2E2E7]"
              >
                Open Verification
              </Link>
            </div>
          </aside>
        </section>

        {/* Viewing Requests */}
        <section className="mt-8 rounded-xl border border-[#E8DDE1] bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#E8DDE1] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-[#24171C]">
                Recent Viewing Requests
              </h2>

              <p className="mt-1 text-sm text-[#756970]">
                Upcoming requests from renters for your
                properties.
              </p>
            </div>

            <Link
              to="/agent/viewing-requests"
              className="text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
            >
              Manage requests
            </Link>
          </div>

          {viewingRequests.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <CalendarDays className="mx-auto h-7 w-7 text-[#9A8D93]" />

              <p className="mt-3 text-sm text-[#756970]">
                No viewing requests yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E8DDE1]">
              {viewingRequests.map((request) => {
                const viewingStatus =
                  getViewingStatusConfig(
                    request.status
                  );

                return (
                  <div
                    key={request.id}
                    className="p-5 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8EDEF]">
                          <CalendarDays className="h-4 w-4 text-[#7A1F3D]" />
                        </div>

                        <div>
                          <Link
                            to={`/properties/${request.property_id}`}
                            className="text-sm font-bold text-[#24171C] transition hover:text-[#7A1F3D]"
                          >
                            {request.properties?.title ||
                              "Property"}
                          </Link>

                          <p className="mt-1 text-sm text-[#756970]">
                            {request.profiles?.full_name ||
                              "Renter"}{" "}
                            requested a viewing.
                          </p>

                          <p className="mt-1 text-xs text-[#9A8D93]">
                            {formatDate(
                              request.requested_date
                            )}
                            {request.requested_time
                              ? ` • ${formatTime(
                                  request.requested_time
                                )}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${viewingStatus.className}`}
                      >
                        {viewingStatus.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Reports */}
        <section className="mt-8 rounded-xl border border-[#E8DDE1] bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#E8DDE1] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-[#24171C]">
                Recent Property Reports
              </h2>

              <p className="mt-1 text-sm text-[#756970]">
                Reports associated with your rental listings.
              </p>
            </div>

            <Link
              to="/agent/reports"
              className="text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
            >
              View reports
            </Link>
          </div>

          {reports.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <FileText className="mx-auto h-7 w-7 text-[#9A8D93]" />

              <p className="mt-3 text-sm text-[#756970]">
                No property reports to display.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E8DDE1]">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8EDEF]">
                        <FileText className="h-4 w-4 text-[#7A1F3D]" />
                      </div>

                      <div>
                        <Link
                          to={`/properties/${report.property_id}`}
                          className="text-sm font-bold text-[#24171C] transition hover:text-[#7A1F3D]"
                        >
                          {report.properties?.title ||
                            "Property"}
                        </Link>

                        {report.properties?.location && (
                          <p className="mt-1 text-sm text-[#756970]">
                            {report.properties.location}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-[#9A8D93]">
                          Submitted{" "}
                          {formatDate(
                            report.created_at
                          )}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        report.status === "resolved"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : report.status === "dismissed"
                          ? "border-gray-200 bg-gray-100 text-gray-600"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {report.status
                        ?.replace(/_/g, " ")
                        .replace(
                          /\b\w/g,
                          (letter) =>
                            letter.toUpperCase()
                        ) ||
                        "Under Review"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Safety Notice */}
        <section className="mt-8 rounded-xl border border-[#E8DDE1] bg-white p-5 sm:p-6">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#7A1F3D]" />

            <div>
              <h2 className="text-sm font-semibold text-[#24171C]">
                RentSure verification reminder
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#756970]">
                Verification is based on the information and
                documents reviewed by RentSure. A verified
                listing does not guarantee legal ownership,
                future conduct, or the absence of every
                possible rental risk. Keep property
                information accurate and respond to requests
                for additional verification information.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs leading-5 text-[#9A8D93]">
          RentSure provides verification and risk-awareness
          tools to support more informed rental decisions.
        </p>
      </div>
    </main>
  );
}

export default AgentDashboard;