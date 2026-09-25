import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  Flag,
  Home,
  Loader2,
  MessageSquare,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../../context/useAuth";
import { supabase } from "../../../services/supabase/client";

function Reports() {
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    const loadReports = async () => {
      if (!user) {
        if (!cancelled) {
          setReports([]);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setErrorMessage("");
      }

      const { data, error } = await supabase
        .from("reports")
        .select(
          `
            id,
            property_id,
            reason,
            description,
            status,
            admin_notes,
            created_at,
            updated_at,
            properties (
              id,
              title,
              location,
              property_type,
              verification_status,
              risk_score,
              property_status
            )
          `
        )
        .eq("reporter_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Error fetching renter reports:", error);
        setErrorMessage(
          "We couldn't load your reports right now. Please try again."
        );
        setReports([]);
      } else {
        setReports(data || []);
      }

      setLoading(false);
    };

    loadReports();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const fetchReports = async () => {
    if (!user) return;

    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("reports")
      .select(
        `
          id,
          property_id,
          reason,
          description,
          status,
          admin_notes,
          created_at,
          updated_at,
          properties (
            id,
            title,
            location,
            property_type,
            verification_status,
            risk_score,
            property_status
          )
        `
      )
      .eq("reporter_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching renter reports:", error);
      setErrorMessage(
        "We couldn't load your reports right now. Please try again."
      );
      setReports([]);
    } else {
      setReports(data || []);
    }

    setLoading(false);
  };

  const filteredReports = useMemo(() => {
    if (filter === "all") return reports;

    return reports.filter((report) => report.status === filter);
  }, [reports, filter]);

  const statusCounts = useMemo(() => {
    return {
      all: reports.length,
      under_review: reports.filter(
        (report) => report.status === "under_review"
      ).length,
      resolved: reports.filter((report) => report.status === "resolved")
        .length,
      dismissed: reports.filter((report) => report.status === "dismissed")
        .length,
    };
  }, [reports]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "resolved":
        return {
          label: "Resolved",
          icon: CheckCircle2,
          badge: "bg-green-50 text-green-700 border border-green-200",
          iconClass: "text-green-600",
        };

      case "dismissed":
        return {
          label: "Dismissed",
          icon: XCircle,
          badge: "bg-gray-100 text-gray-700 border border-gray-200",
          iconClass: "text-gray-500",
        };

      case "under_review":
      default:
        return {
          label: "Under Review",
          icon: Clock3,
          badge: "bg-amber-50 text-amber-700 border border-amber-200",
          iconClass: "text-amber-600",
        };
    }
  };

  const getRiskLabel = (riskScore) => {
    if (riskScore === null || riskScore === undefined) {
      return {
        label: "Not scored",
        className: "text-gray-600",
      };
    }

    if (riskScore >= 60) {
      return {
        label: "High risk",
        className: "text-red-700",
      };
    }

    if (riskScore >= 30) {
      return {
        label: "Moderate risk",
        className: "text-amber-700",
      };
    }

    return {
      label: "Low risk",
      className: "text-green-700",
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";

    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatReason = (reason) => {
    if (!reason) return "Property concern";

    return reason
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Page Header */}
        <section className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#7A1F3D]">
                <FileText className="h-4 w-4" />
                <span>Renter account</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#24171C] sm:text-3xl">
                My Reports
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
                Review the property concerns you have submitted and monitor
                their current status.
              </p>
            </div>

            <Link
              to="/properties"
              className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025]"
            >
              <Flag className="h-4 w-4" />
              Report a Property
            </Link>
          </div>
        </section>

        {/* Summary Cards */}
        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[#756970]">
                Total Reports
              </span>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8EDEF]">
                <FileText className="h-4 w-4 text-[#7A1F3D]" />
              </div>
            </div>

            <p className="text-2xl font-bold text-[#24171C]">
              {statusCounts.all}
            </p>
          </div>

          <div className="rounded-xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[#756970]">
                Under Review
              </span>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <Clock3 className="h-4 w-4 text-amber-600" />
              </div>
            </div>

            <p className="text-2xl font-bold text-[#24171C]">
              {statusCounts.under_review}
            </p>
          </div>

          <div className="rounded-xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[#756970]">
                Resolved
              </span>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </div>

            <p className="text-2xl font-bold text-[#24171C]">
              {statusCounts.resolved}
            </p>
          </div>

          <div className="rounded-xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[#756970]">
                Dismissed
              </span>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                <XCircle className="h-4 w-4 text-gray-500" />
              </div>
            </div>

            <p className="text-2xl font-bold text-[#24171C]">
              {statusCounts.dismissed}
            </p>
          </div>
        </section>

        {/* Safety Notice */}
        <section className="mb-8 rounded-xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8EDEF]">
              <ShieldCheck className="h-5 w-5 text-[#7A1F3D]" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-[#24171C]">
                Why reports matter
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#756970]">
                Your reports help RentSure identify properties that may need
                additional review. A report is an alert for investigation and
                does not by itself establish that a property or person has
                acted fraudulently.
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All Reports" },
              { value: "under_review", label: "Under Review" },
              { value: "resolved", label: "Resolved" },
              { value: "dismissed", label: "Dismissed" },
            ].map((item) => {
              const active = filter === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[#7A1F3D] text-white"
                      : "border border-[#E8DDE1] bg-white text-[#756970] hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                  }`}
                >
                  {item.label}
                  <span
                    className={`ml-2 ${
                      active ? "text-white/80" : "text-[#9A8D93]"
                    }`}
                  >
                    {statusCounts[item.value]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 items-center justify-center rounded-xl border border-[#E8DDE1] bg-white">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#7A1F3D]" />

              <p className="text-sm text-[#756970]">
                Loading your reports...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <h2 className="text-sm font-semibold text-red-800">
                  Unable to load reports
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {errorMessage}
                </p>

                <button
                  type="button"
                  onClick={fetchReports}
                  className="mt-4 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm ring-1 ring-inset ring-red-200 transition hover:bg-red-100"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !errorMessage && reports.length === 0 && (
          <div className="rounded-xl border border-[#E8DDE1] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8EDEF]">
              <Flag className="h-6 w-6 text-[#7A1F3D]" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#24171C]">
              No reports yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756970]">
              If you encounter a property that appears suspicious or raises
              a safety concern, you can submit a report for review.
            </p>

            <Link
              to="/properties"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
            >
              Browse Properties
            </Link>
          </div>
        )}

        {/* No Matching Reports */}
        {!loading &&
          !errorMessage &&
          reports.length > 0 &&
          filteredReports.length === 0 && (
            <div className="rounded-xl border border-[#E8DDE1] bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8EDEF]">
                <FileText className="h-6 w-6 text-[#7A1F3D]" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-[#24171C]">
                No matching reports
              </h2>

              <p className="mt-2 text-sm text-[#756970]">
                There are no reports with the selected status.
              </p>

              <button
                type="button"
                onClick={() => setFilter("all")}
                className="mt-5 rounded-lg border border-[#E8DDE1] px-4 py-2.5 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
              >
                View All Reports
              </button>
            </div>
          )}

        {/* Reports List */}
        {!loading && !errorMessage && filteredReports.length > 0 && (
          <section className="space-y-5">
            {filteredReports.map((report) => {
              const status = getStatusConfig(report.status);
              const StatusIcon = status.icon;
              const property = report.properties;
              const risk = getRiskLabel(property?.risk_score);

              return (
                <article
                  key={report.id}
                  className="overflow-hidden rounded-xl border border-[#E8DDE1] bg-white shadow-sm"
                >
                  <div className="p-5 sm:p-6">
                    {/* Report Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F8EDEF]">
                          <Flag className="h-5 w-5 text-[#7A1F3D]" />
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-[#9A8D93]">
                            Report submitted
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#24171C]">
                            {formatDate(report.created_at)}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${status.badge}`}
                      >
                        <StatusIcon
                          className={`h-3.5 w-3.5 ${status.iconClass}`}
                        />
                        {status.label}
                      </div>
                    </div>

                    {/* Property */}
                    <div className="mt-6 rounded-xl border border-[#E8DDE1] bg-[#FAF8F9] p-4 sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white">
                            <Home className="h-5 w-5 text-[#7A1F3D]" />
                          </div>

                          <div>
                            <p className="text-xs font-medium text-[#756970]">
                              Property
                            </p>

                            <h2 className="mt-1 text-base font-bold text-[#24171C]">
                              {property?.title || "Property unavailable"}
                            </h2>

                            {property?.location && (
                              <p className="mt-1 text-sm text-[#756970]">
                                {property.location}
                              </p>
                            )}
                          </div>
                        </div>

                        {property?.id && (
                          <Link
                            to={`/properties/${property.id}`}
                            className="inline-flex w-fit items-center justify-center rounded-lg border border-[#E8DDE1] bg-white px-4 py-2.5 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                          >
                            View Property
                          </Link>
                        )}
                      </div>

                      <div className="mt-4 grid gap-3 border-t border-[#E8DDE1] pt-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-[#756970]">
                            Report reason
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#24171C]">
                            {formatReason(report.reason)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#756970]">
                            Verification
                          </p>

                          <p className="mt-1 text-sm font-semibold capitalize text-[#24171C]">
                            {property?.verification_status
                              ? property.verification_status.replace(
                                  /_/g,
                                  " "
                                )
                              : "Unknown"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#756970]">
                            Risk assessment
                          </p>

                          <p
                            className={`mt-1 text-sm font-semibold ${risk.className}`}
                          >
                            {risk.label}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Report Description */}
                    <div className="mt-6">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-[#7A1F3D]" />

                        <h3 className="text-sm font-semibold text-[#24171C]">
                          Your report
                        </h3>
                      </div>

                      <div className="mt-3 rounded-lg border border-[#E8DDE1] bg-white p-4">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-[#756970]">
                          {report.description ||
                            "No additional description provided."}
                        </p>
                      </div>
                    </div>

                    {/* Admin Notes */}
                    {report.admin_notes && (
                      <div className="mt-5 rounded-lg border border-[#E8DDE1] bg-[#F8EDEF] p-4">
                        <div className="flex gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                            <ShieldCheck className="h-4 w-4 text-[#7A1F3D]" />
                          </div>

                          <div>
                            <h3 className="text-sm font-semibold text-[#24171C]">
                              Review update
                            </h3>

                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#756970]">
                              {report.admin_notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-6 flex flex-col gap-3 border-t border-[#E8DDE1] pt-5 text-xs text-[#756970] sm:flex-row sm:items-center sm:justify-between">
                      <p>
                        Last updated: {formatDate(report.updated_at)}
                      </p>

                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-[#B45309]" />

                        <span>
                          Reports are reviewed based on available
                          information.
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Bottom Disclaimer */}
        <section className="mt-8 rounded-xl border border-[#E8DDE1] bg-white p-5 sm:p-6">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#B45309]" />

            <div>
              <h2 className="text-sm font-semibold text-[#24171C]">
                Important
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#756970]">
                RentSure provides verification and risk-awareness tools to
                support informed rental decisions. A report, verification
                status, or risk score should not be treated as a guarantee of
                legal ownership, authenticity, or future conduct.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Reports;