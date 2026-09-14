
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  FileWarning,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../services/supabase/client";

function Reports() {
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("reports")
        .select(`
          id,
          category,
          description,
          severity,
          status,
          admin_notes,
          created_at,
          property_id,
          properties (
            id,
            title,
            location
          )
        `)
        .eq("reporter_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading reports:", error);
        setErrorMessage(
          "We couldn't load your reports. Please try again later."
        );
        setReports([]);
      } else {
        setReports(data || []);
      }

      setLoading(false);
    };

    fetchReports();
  }, [user?.id]);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case "under_review":
        return {
          label: "Under Review",
          className: "bg-[#FFF7E6] text-[#B45309]",
        };

      case "resolved":
        return {
          label: "Resolved",
          className: "bg-[#E8F5EC] text-[#15803D]",
        };

      case "dismissed":
        return {
          label: "Dismissed",
          className: "bg-[#F3F4F6] text-[#4B5563]",
        };

      default:
        return {
          label: "Under Review",
          className: "bg-[#FFF7E6] text-[#B45309]",
        };
    }
  };

  const getSeverityDetails = (severity) => {
    switch (severity) {
      case "high":
        return {
          label: "High",
          className: "bg-[#FEF2F2] text-[#B91C1C]",
        };

      case "low":
        return {
          label: "Low",
          className: "bg-[#F3F4F6] text-[#4B5563]",
        };

      default:
        return {
          label: "Medium",
          className: "bg-[#FFF7E6] text-[#B45309]",
        };
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      {/* Header */}
      <section className="border-b border-[#E8DDE1] bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-12">
          <Link
            to="/renter/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="mt-7 max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EDEF]">
                <FileWarning
                  size={23}
                  className="text-[#7A1F3D]"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#7A1F3D]">
                  Safety Reports
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                  My Reports
                </h1>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-[#756970] sm:text-base">
              Review the rental concerns you have reported to RentSure and
              keep track of their review status.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-12">
        {/* Safety Notice */}
        <div className="mb-8 rounded-2xl border border-[#E8DDE1] bg-white p-5 sm:p-6">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8EDEF]">
              <ShieldCheck
                size={20}
                className="text-[#7A1F3D]"
              />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#24171C]">
                Why reporting matters
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#756970]">
                Your reports can help RentSure identify suspicious listings,
                payment concerns, and other potential safety issues. Reports
                are reviewed as part of the platform's safety process and are
                not a guarantee that every reported issue will be confirmed.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-8 flex gap-3 rounded-xl border border-[#F1CACA] bg-[#FEF2F2] px-5 py-4">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-[#B91C1C]"
            />

            <p className="text-sm leading-6 text-[#B91C1C]">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-[#E8DDE1] bg-white px-6 py-16 text-center">
            <Loader2
              size={30}
              className="mx-auto animate-spin text-[#7A1F3D]"
            />

            <p className="mt-4 text-sm font-medium text-[#756970]">
              Loading your reports...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !errorMessage && reports.length === 0 && (
          <div className="rounded-2xl border border-[#E8DDE1] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8EDEF]">
              <FileWarning
                size={25}
                className="text-[#7A1F3D]"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#24171C]">
              No reports yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756970]">
              You haven't submitted any safety reports. If you encounter a
              suspicious listing or payment request, you can report it from
              the relevant property page.
            </p>

            <Link
              to="/properties"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
            >
              Browse Properties
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {/* Reports */}
        {!loading && reports.length > 0 && (
          <div className="space-y-5">
            {reports.map((report) => {
              const status = getStatusDetails(report.status);
              const severity = getSeverityDetails(report.severity);

              return (
                <article
                  key={report.id}
                  className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-7"
                >
                  {/* Top */}
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#F8EDEF] px-3 py-1 text-xs font-semibold text-[#7A1F3D]">
                          {report.category}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${severity.className}`}
                        >
                          {severity.label} Severity
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <h2 className="mt-4 text-lg font-bold text-[#24171C]">
                        Report #{report.id}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-[#756970]">
                      <CalendarDays size={16} />
                      {formatDate(report.created_at)}
                    </div>
                  </div>

                  {/* Property */}
                  {report.properties && (
                    <div className="mt-6 rounded-xl bg-[#FAF8F9] p-5">
                      <div className="flex items-start gap-3">
                        <MapPin
                          size={19}
                          className="mt-0.5 shrink-0 text-[#7A1F3D]"
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#24171C]">
                            {report.properties.title}
                          </p>

                          <p className="mt-1 text-sm text-[#756970]">
                            {report.properties.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="mt-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#756970]">
                      Your Report
                    </p>

                    <p className="mt-2 text-sm leading-7 text-[#24171C]">
                      {report.description}
                    </p>
                  </div>

                  {/* Admin Notes */}
                  {report.admin_notes && (
                    <div className="mt-6 rounded-xl border border-[#E8DDE1] bg-[#F8EDEF] p-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#7A1F3D]">
                        RentSure Review Note
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#4A1025]">
                        {report.admin_notes}
                      </p>
                    </div>
                  )}

                  {/* Property Link */}
                  {report.property_id && (
                    <div className="mt-6 border-t border-[#E8DDE1] pt-5">
                      <Link
                        to={`/properties/${report.property_id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:underline"
                      >
                        View Property
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Reports;
