
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileWarning,
  Search,
  ShieldAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../../services/supabase/client";
import { useAuth } from "../../../context/useAuth";

function StatusBadge({ status }) {
  const config = {
    pending: {
      label: "Under review",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    under_review: {
      label: "Under review",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    resolved: {
      label: "Resolved",
      className: "border-green-200 bg-green-50 text-green-700",
    },
    dismissed: {
      label: "Dismissed",
      className: "border-slate-200 bg-slate-100 text-slate-700",
    },
  };

  const item = config[status] || {
    label: status?.replaceAll("_", " ") || "Unknown",
    className: "border-[#E8DDE1] bg-[#FAF8F9] text-[#756970]",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${item.className}`}
    >
      {item.label}
    </span>
  );
}

function AgentReports() {
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const loadReports = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
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
              verification_status,
              property_status
            )
          `
        )
        .eq("agent_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setReports(data || []);
      }

      setLoading(false);
    };

    loadReports();
  }, [user?.id]);

  const stats = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter(
        (report) =>
          report.status === "pending" || report.status === "under_review"
      ).length,
      resolved: reports.filter((report) => report.status === "resolved")
        .length,
      dismissed: reports.filter((report) => report.status === "dismissed")
        .length,
    }),
    [reports]
  );

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !query ||
        report.reason?.toLowerCase().includes(query) ||
        report.description?.toLowerCase().includes(query) ||
        report.properties?.title?.toLowerCase().includes(query) ||
        report.properties?.location?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F9]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 rounded bg-[#E8DDE1]" />

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl bg-white"
                />
              ))}
            </div>

            <div className="h-96 rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section>
          <p className="text-sm font-semibold text-[#7A1F3D]">
            Agent workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
            Property reports
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
            Monitor reports submitted by renters about properties associated
            with your account.
          </p>
        </section>

        {error && (
          <div className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#756970]">Total reports</p>
              <FileWarning size={19} className="text-[#7A1F3D]" />
            </div>

            <p className="mt-3 text-3xl font-bold text-[#24171C]">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#756970]">Under review</p>
              <Clock3 size={19} className="text-amber-600" />
            </div>

            <p className="mt-3 text-3xl font-bold text-[#24171C]">
              {stats.pending}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#756970]">Resolved</p>
              <CheckCircle2 size={19} className="text-green-600" />
            </div>

            <p className="mt-3 text-3xl font-bold text-[#24171C]">
              {stats.resolved}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#756970]">Dismissed</p>
              <ShieldAlert size={19} className="text-slate-600" />
            </div>

            <p className="mt-3 text-3xl font-bold text-[#24171C]">
              {stats.dismissed}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reports or properties"
                className="w-full rounded-xl border border-[#E8DDE1] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-[#E8DDE1] bg-white px-4 py-3 text-sm outline-none focus:border-[#7A1F3D] sm:w-48"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under review</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <p className="mt-4 border-t border-[#E8DDE1] pt-4 text-sm text-[#756970]">
            Showing{" "}
            <span className="font-semibold text-[#24171C]">
              {filteredReports.length}
            </span>{" "}
            of {reports.length} reports
          </p>
        </section>

        <section className="mt-6 space-y-4">
          {filteredReports.map((report) => (
            <article
              key={report.id}
              className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-bold text-[#24171C]">
                      {report.properties?.title || "Property report"}
                    </h2>

                    <StatusBadge status={report.status} />
                  </div>

                  <p className="mt-1 text-sm text-[#756970]">
                    {report.properties?.location || "Location unavailable"}
                  </p>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                      Report reason
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#24171C]">
                      {report.reason || "No reason provided"}
                    </p>
                  </div>

                  {report.description && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                        Description
                      </p>

                      <p className="mt-1 max-w-3xl text-sm leading-6 text-[#756970]">
                        {report.description}
                      </p>
                    </div>
                  )}

                  {report.admin_notes && (
                    <div className="mt-4 rounded-xl border border-[#E8DDE1] bg-[#FAF8F9] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                        Administrator note
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#24171C]">
                        {report.admin_notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  {report.property_id && (
                    <Link
                      to={`/properties/${report.property_id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-[#E8DDE1] px-4 py-2.5 text-sm font-semibold text-[#24171C] hover:border-[#7A1F3D] hover:text-[#7A1F3D]"
                    >
                      View property
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-5 border-t border-[#E8DDE1] pt-4 text-xs text-[#756970]">
                Submitted{" "}
                {report.created_at
                  ? new Date(report.created_at).toLocaleString()
                  : "—"}
              </div>
            </article>
          ))}

          {filteredReports.length === 0 && (
            <div className="rounded-2xl border border-[#E8DDE1] bg-white p-10 text-center shadow-sm">
              <FileWarning
                size={38}
                className="mx-auto text-[#7A1F3D]"
                strokeWidth={1.5}
              />

              <h2 className="mt-4 font-bold text-[#24171C]">
                {reports.length === 0
                  ? "No reports"
                  : "No matching reports"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#756970]">
                {reports.length === 0
                  ? "Reports associated with your properties will appear here."
                  : "Try changing your search or status filter."}
              </p>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <ShieldAlert
              size={20}
              className="mt-0.5 shrink-0 text-[#7A1F3D]"
            />

            <p className="text-sm leading-6 text-[#756970]">
              Reports are reviewed through the RentSure administrative
              workflow. A report represents a renter's submission and is not,
              by itself, a determination that a property or agent has acted
              improperly.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AgentReports;

