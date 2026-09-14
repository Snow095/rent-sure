
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
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

      /*
       * We first find the agent's properties.
       * Then we retrieve reports connected to those properties.
       */
      const { data: properties, error: propertiesError } =
        await supabase
          .from("properties")
          .select("id, title, location")
          .eq("agent_id", user.id);

      if (propertiesError) {
        console.error(
          "Error loading agent properties:",
          propertiesError
        );

        setErrorMessage(
          "We couldn't load your property reports. Please try again later."
        );

        setLoading(false);
        return;
      }

      const propertyIds = (properties || []).map(
        (property) => property.id
      );

      if (propertyIds.length === 0) {
        setReports([]);
        setLoading(false);
        return;
      }

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
          property_id
        `)
        .in("property_id", propertyIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading reports:", error);

        setErrorMessage(
          "We couldn't load your reports. Please try again later."
        );

        setReports([]);
        setLoading(false);
        return;
      }

      const propertyMap = new Map(
        (properties || []).map((property) => [
          property.id,
          property,
        ])
      );

      const reportsWithProperties = (data || []).map((report) => ({
        ...report,
        property: propertyMap.get(report.property_id) || null,
      }));

      setReports(reportsWithProperties);
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

  const totalReports = reports.length;

  const highSeverityReports = reports.filter(
    (report) => report.severity === "high"
  ).length;

  const underReviewReports = reports.filter(
    (report) => report.status === "under_review"
  ).length;

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      {/* Header */}
      <section className="border-b border-[#E8DDE1] bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-12">
          <Link
            to="/agent/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="mt-7 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF]">
              <FileWarning
                size={23}
                className="text-[#7A1F3D]"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#7A1F3D]">
                Property Reports
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                Reports About Your Properties
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#756970] sm:text-base">
            Review safety concerns submitted by renters about properties
            associated with your account.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-12">
        {/* Summary */}
        <div className="grid gap-5 sm:grid-cols-3">
          <SummaryCard
            label="Total Reports"
            value={totalReports}
            icon={FileWarning}
          />

          <SummaryCard
            label="Under Review"
            value={underReviewReports}
            icon={AlertCircle}
          />

          <SummaryCard
            label="High Severity"
            value={highSeverityReports}
            icon={AlertTriangle}
          />
        </div>

        {/* Guidance */}
        <div className="mt-8 rounded-2xl bg-[#2D0A17] p-6 sm:p-7">
          <div className="flex gap-4">
            <ShieldCheck
              size={23}
              className="mt-0.5 shrink-0 text-[#C9A227]"
            />

            <div>
              <h2 className="text-sm font-bold text-white">
                How RentSure handles reports
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#E8DDE1]">
                A renter report is a concern submitted for review. It does
                not automatically establish that an allegation is true.
                Reports can help identify listings or interactions that may
                require further investigation.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mt-8 flex gap-3 rounded-xl border border-[#F1CACA] bg-[#FEF2F2] px-5 py-4">
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
          <div className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white px-6 py-16 text-center">
            <Loader2
              size={30}
              className="mx-auto animate-spin text-[#7A1F3D]"
            />

            <p className="mt-4 text-sm font-medium text-[#756970]">
              Loading property reports...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !errorMessage && reports.length === 0 && (
          <div className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F5EC]">
              <ShieldCheck
                size={27}
                className="text-[#15803D]"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#24171C]">
              No reports found
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756970]">
              There are currently no renter reports associated with your
              properties.
            </p>

            <Link
              to="/agent/properties"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
            >
              View My Properties
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {/* Reports */}
        {!loading && reports.length > 0 && (
          <div className="mt-8 space-y-5">
            {reports.map((report) => {
              const status = getStatusDetails(report.status);
              const severity = getSeverityDetails(report.severity);

              return (
                <article
                  key={report.id}
                  className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-7"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
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
                  {report.property && (
                    <div className="mt-6 rounded-xl bg-[#FAF8F9] p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <MapPin
                            size={19}
                            className="mt-0.5 shrink-0 text-[#7A1F3D]"
                          />

                          <div>
                            <p className="text-sm font-semibold text-[#24171C]">
                              {report.property.title}
                            </p>

                            <p className="mt-1 text-sm text-[#756970]">
                              {report.property.location}
                            </p>
                          </div>
                        </div>

                        <Link
                          to={`/properties/${report.property.id}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:underline"
                        >
                          View Property
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Report Description */}
                  <div className="mt-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#756970]">
                      Renter's Concern
                    </p>

                    <p className="mt-2 text-sm leading-7 text-[#24171C]">
                      {report.description}
                    </p>
                  </div>

                  {/* Admin Note */}
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
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function SummaryCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EDEF]">
          <Icon
            size={21}
            className="text-[#7A1F3D]"
          />
        </div>

        <span className="text-2xl font-bold text-[#24171C]">
          {value}
        </span>
      </div>

      <p className="mt-5 text-sm font-medium text-[#756970]">
        {label}
      </p>
    </div>
  );
}

export default Reports;

