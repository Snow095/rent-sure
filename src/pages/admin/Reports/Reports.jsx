
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileWarning,
  Loader2,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../../services/supabase/client";

const REPORT_STATUSES = [
  "all",
  "under_review",
  "resolved",
  "dismissed",
];

const SEVERITIES = [
  "all",
  "low",
  "medium",
  "high",
];

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [severityFilter, setSeverityFilter] =
    useState("all");

  const [savingId, setSavingId] = useState(null);
  const [notes, setNotes] = useState({});

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadReports = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          id,
          reporter_id,
          property_id,
          category,
          description,
          severity,
          status,
          admin_notes,
          created_at,
          updated_at,
          properties (
            id,
            title,
            location
          )
        `)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setReports(data ?? []);

      const initialNotes = {};

      (data ?? []).forEach((report) => {
        initialNotes[report.id] =
          report.admin_notes || "";
      });

      setNotes(initialNotes);
    } catch (error) {
      console.error(
        "Error loading reports:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filteredReports = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !search ||
        report.category
          ?.toLowerCase()
          .includes(search) ||
        report.description
          ?.toLowerCase()
          .includes(search) ||
        report.properties?.title
          ?.toLowerCase()
          .includes(search) ||
        report.property_id
          ?.toString()
          .includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        report.status === statusFilter;

      const matchesSeverity =
        severityFilter === "all" ||
        report.severity === severityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSeverity
      );
    });
  }, [
    reports,
    searchTerm,
    statusFilter,
    severityFilter,
  ]);

  const statistics = useMemo(
    () => ({
      total: reports.length,
      underReview: reports.filter(
        (report) =>
          report.status === "under_review"
      ).length,
      high: reports.filter(
        (report) => report.severity === "high"
      ).length,
      resolved: reports.filter(
        (report) => report.status === "resolved"
      ).length,
    }),
    [reports]
  );

  const handleStatusChange = async (
    report,
    newStatus
  ) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (
      !["under_review", "resolved", "dismissed"].includes(
        newStatus
      )
    ) {
      setErrorMessage("Invalid report status.");
      return;
    }

    if (
      newStatus === "dismissed" ||
      newStatus === "resolved"
    ) {
      const confirmed = window.confirm(
        `Are you sure you want to mark this report as ${newStatus}?`
      );

      if (!confirmed) {
        return;
      }
    }

    setSavingId(report.id);

    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status: newStatus,
          admin_notes:
            notes[report.id]?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", report.id);

      if (error) {
        throw error;
      }

      setReports((current) =>
        current.map((item) =>
          item.id === report.id
            ? {
                ...item,
                status: newStatus,
                admin_notes:
                  notes[report.id]?.trim() || null,
              }
            : item
        )
      );

      setSuccessMessage(
        `Report #${report.id} marked as ${formatStatus(
          newStatus
        )}.`
      );
    } catch (error) {
      console.error(
        "Error updating report:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to update the report."
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-3 py-1.5 text-xs font-bold text-[#7A1F3D]">
            <FileWarning size={14} />
            Safety & Reports
          </div>

          <h1 className="text-2xl font-bold text-[#24171C] sm:text-3xl">
            Report Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970]">
            Review renter reports, record findings,
            and resolve or dismiss submitted concerns.
          </p>
        </header>

        {errorMessage && (
          <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle size={18} />
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Reports"
            value={statistics.total}
          />

          <StatCard
            label="Under Review"
            value={statistics.underReview}
          />

          <StatCard
            label="High Severity"
            value={statistics.high}
          />

          <StatCard
            label="Resolved"
            value={statistics.resolved}
          />
        </section>

        <section className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#24171C]">
                Search
              </label>

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
                />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search reports..."
                  className="w-full rounded-lg border border-[#E8DDE1] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                />
              </div>
            </div>

            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={REPORT_STATUSES}
            />

            <FilterSelect
              label="Severity"
              value={severityFilter}
              onChange={setSeverityFilter}
              options={SEVERITIES}
            />
          </div>
        </section>

        <section className="mt-6 space-y-4">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2
                size={32}
                className="animate-spin text-[#7A1F3D]"
              />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="rounded-2xl border border-[#E8DDE1] bg-white px-6 py-16 text-center">
              <FileWarning
                size={34}
                className="mx-auto text-[#7A1F3D]"
              />

              <h2 className="mt-4 font-bold text-[#24171C]">
                No reports found
              </h2>
            </div>
          ) : (
            filteredReports.map((report) => (
              <article
                key={report.id}
                className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#24171C]">
                        Report #{report.id}
                      </span>

                      <StatusBadge
                        status={report.status}
                      />

                      <SeverityBadge
                        severity={report.severity}
                      />
                    </div>

                    <h2 className="mt-3 text-lg font-bold text-[#24171C]">
                      {report.category}
                    </h2>

                    {report.properties && (
                      <Link
                        to={`/properties/${report.properties.id}`}
                        className="mt-2 inline-block text-sm font-semibold text-[#7A1F3D] hover:underline"
                      >
                        {report.properties.title}
                      </Link>
                    )}

                    <p className="mt-1 text-xs text-[#756970]">
                      Submitted{" "}
                      {formatDate(report.created_at)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-[#FAF8F9] p-4">
                  <p className="text-sm leading-6 text-[#24171C]">
                    {report.description}
                  </p>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor={`notes-${report.id}`}
                    className="mb-2 block text-sm font-semibold text-[#24171C]"
                  >
                    Admin Notes
                  </label>

                  <textarea
                    id={`notes-${report.id}`}
                    rows="4"
                    value={notes[report.id] || ""}
                    onChange={(event) =>
                      setNotes((current) => ({
                        ...current,
                        [report.id]:
                          event.target.value,
                      }))
                    }
                    placeholder="Record investigation findings..."
                    className="w-full resize-y rounded-lg border border-[#E8DDE1] px-4 py-3 text-sm leading-6 outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  />
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={
                      savingId === report.id
                    }
                    onClick={() =>
                      handleStatusChange(
                        report,
                        "under_review"
                      )
                    }
                    className="rounded-lg border border-[#E8DDE1] px-4 py-3 text-sm font-semibold text-[#7A1F3D] hover:bg-[#F8EDEF] disabled:opacity-60"
                  >
                    Keep Under Review
                  </button>

                  <button
                    type="button"
                    disabled={
                      savingId === report.id
                    }
                    onClick={() =>
                      handleStatusChange(
                        report,
                        "dismissed"
                      )
                    }
                    className="rounded-lg border border-[#E8DDE1] px-4 py-3 text-sm font-semibold text-[#756970] hover:bg-[#FAF8F9] disabled:opacity-60"
                  >
                    Dismiss
                  </button>

                  <button
                    type="button"
                    disabled={
                      savingId === report.id
                    }
                    onClick={() =>
                      handleStatusChange(
                        report,
                        "resolved"
                      )
                    }
                    className="rounded-lg bg-[#7A1F3D] px-4 py-3 text-sm font-semibold text-white hover:bg-[#4A1025] disabled:opacity-60"
                  >
                    {savingId === report.id
                      ? "Saving..."
                      : "Resolve Report"}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
      <p className="text-sm text-[#756970]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#24171C]">
        {value}
      </p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#24171C]">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full appearance-none rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {formatStatus(option)}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#756970]"
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className="rounded-full bg-[#F8EDEF] px-3 py-1.5 text-xs font-bold text-[#7A1F3D]">
      {formatStatus(status)}
    </span>
  );
}

function SeverityBadge({ severity }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
      {severity?.toUpperCase()}
    </span>
  );
}

function formatStatus(value) {
  if (value === "all") return "All";

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

export default AdminReports;

