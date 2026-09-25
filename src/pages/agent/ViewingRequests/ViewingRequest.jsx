import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../../../services/supabase/client";
import { useAuth } from "../../../context/useAuth";

function StatusBadge({ status }) {
  const config = {
    pending: {
      label: "Pending",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    confirmed: {
      label: "Confirmed",
      className: "border-green-200 bg-green-50 text-green-700",
    },
    completed: {
      label: "Completed",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    cancelled: {
      label: "Cancelled",
      className: "border-slate-200 bg-slate-100 text-slate-700",
    },
  };

  const item =
    config[status] || {
      label: status || "Unknown",
      className: "border-[#E8DDE1] bg-[#FAF8F9] text-[#756970]",
    };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${item.className}`}
    >
      {status === "confirmed" && <CheckCircle2 size={14} />}
      {status === "pending" && <Clock3 size={14} />}
      {status === "completed" && <ShieldCheck size={14} />}
      {status === "cancelled" && <XCircle size={14} />}

      {item.label}
    </span>
  );
}

function AgentViewingRequests() {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadRequests = async () => {
      if (!user?.id) {
        return;
      }

      setError("");

      const { data, error: fetchError } = await supabase
        .from("viewing_requests")
        .select(
          `
            id,
            renter_id,
            property_id,
            requested_date,
            requested_time,
            status,
            renter_notes,
            agent_notes,
            created_at,
            updated_at,
            properties (
              id,
              title,
              location,
              verification_status
            )
          `
        )
        .eq("agent_id", user.id)
        .order("requested_date", {
          ascending: true,
        })
        .order("requested_time", {
          ascending: true,
        });

      if (cancelled) {
        return;
      }

      if (fetchError) {
        console.error(
          "Error loading viewing requests:",
          fetchError
        );

        setError("Unable to load viewing requests right now.");
      } else {
        setRequests(data || []);
      }

      setLoading(false);
    };

    loadRequests();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const stats = useMemo(
    () => ({
      total: requests.length,

      pending: requests.filter(
        (request) => request.status === "pending"
      ).length,

      confirmed: requests.filter(
        (request) => request.status === "confirmed"
      ).length,

      completed: requests.filter(
        (request) => request.status === "completed"
      ).length,
    }),
    [requests]
  );

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch =
        !query ||
        request.properties?.title?.toLowerCase().includes(query) ||
        request.properties?.location?.toLowerCase().includes(query) ||
        request.renter_notes?.toLowerCase().includes(query) ||
        request.agent_notes?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const updateStatus = async (requestId, nextStatus) => {
    const labels = {
      confirmed: "confirm this viewing request",
      completed: "mark this viewing as completed",
      cancelled: "cancel this viewing request",
    };

    const action =
      labels[nextStatus] || `change this request to ${nextStatus}`;

    const confirmed = window.confirm(
      `Are you sure you want to ${action}?`
    );

    if (!confirmed) {
      return;
    }

    setUpdatingId(requestId);
    setError("");

    const updatedAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("viewing_requests")
      .update({
        status: nextStatus,
        updated_at: updatedAt,
      })
      .eq("id", requestId)
      .eq("agent_id", user.id);

    if (updateError) {
      console.error(
        "Error updating viewing request:",
        updateError
      );

      setError("Unable to update this viewing request.");
      setUpdatingId(null);
      return;
    }

    setRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: nextStatus,
              updated_at: updatedAt,
            }
          : request
      )
    );

    setUpdatingId(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F9]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-72 rounded bg-[#E8DDE1]" />

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
            Viewing requests
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970]">
            Review and manage renters&apos; requests to view your properties.
          </p>
        </section>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        )}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total", stats.total, CalendarDays],
            ["Pending", stats.pending, Clock3],
            ["Confirmed", stats.confirmed, CheckCircle2],
            ["Completed", stats.completed, ShieldCheck],
          ].map(([label, value, Icon]) => (
            <div
              key={label}
              className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#756970]">{label}</p>

                <Icon size={19} className="text-[#7A1F3D]" />
              </div>

              <p className="mt-3 text-3xl font-bold text-[#24171C]">
                {value}
              </p>
            </div>
          ))}
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
                placeholder="Search by property or notes"
                className="w-full rounded-xl border border-[#E8DDE1] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-[#E8DDE1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#7A1F3D] sm:w-48"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <p className="mt-4 border-t border-[#E8DDE1] pt-4 text-sm text-[#756970]">
            Showing{" "}
            <span className="font-semibold text-[#24171C]">
              {filteredRequests.length}
            </span>{" "}
            of {requests.length} requests
          </p>
        </section>

        <section className="mt-6 space-y-4">
          {filteredRequests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-bold text-[#24171C]">
                      {request.properties?.title || "Property"}
                    </h2>

                    <StatusBadge status={request.status} />
                  </div>

                  <p className="mt-1 text-sm text-[#756970]">
                    {request.properties?.location || "Location unavailable"}
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-[#FAF8F9] p-4">
                      <p className="text-xs font-medium text-[#756970]">
                        Requested date
                      </p>

                      <p className="mt-1 font-semibold text-[#24171C]">
                        {request.requested_date || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#FAF8F9] p-4">
                      <p className="text-xs font-medium text-[#756970]">
                        Requested time
                      </p>

                      <p className="mt-1 font-semibold text-[#24171C]">
                        {request.requested_time || "—"}
                      </p>
                    </div>
                  </div>

                  {request.renter_notes && (
                    <div className="mt-4 rounded-xl border border-[#E8DDE1] bg-[#FAF8F9] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                        Renter note
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#24171C]">
                        {request.renter_notes}
                      </p>
                    </div>
                  )}

                  {request.agent_notes && (
                    <div className="mt-4 rounded-xl border border-[#E8DDE1] bg-[#FAF8F9] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                        Agent note
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#24171C]">
                        {request.agent_notes}
                      </p>
                    </div>
                  )}

                  {request.properties?.verification_status !== "verified" && (
                    <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <ShieldCheck
                        size={17}
                        className="mt-0.5 shrink-0 text-amber-700"
                      />

                      <p className="text-xs leading-5 text-amber-800">
                        This property is not currently marked as verified.
                        RentSure verification is an evidence-review process and
                        does not guarantee legal ownership or transaction
                        safety.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                  <Link
                    to={`/properties/${request.property_id}`}
                    className="rounded-lg border border-[#E8DDE1] px-4 py-2.5 text-sm font-semibold text-[#24171C] transition hover:border-[#7A1F3D] hover:text-[#7A1F3D]"
                  >
                    View property
                  </Link>

                  {request.status === "pending" && (
                    <>
                      <button
                        type="button"
                        disabled={updatingId === request.id}
                        onClick={() =>
                          updateStatus(request.id, "confirmed")
                        }
                        className="rounded-lg bg-[#7A1F3D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4A1025] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Confirm
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === request.id}
                        onClick={() =>
                          updateStatus(request.id, "cancelled")
                        }
                        className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {request.status === "confirmed" && (
                    <button
                      type="button"
                      disabled={updatingId === request.id}
                      onClick={() =>
                        updateStatus(request.id, "completed")
                      }
                      className="rounded-lg bg-[#15803D] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Mark completed
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}

          {!filteredRequests.length && (
            <div className="rounded-2xl border border-dashed border-[#E8DDE1] bg-white px-6 py-16 text-center">
              <CalendarDays
                size={28}
                className="mx-auto text-[#7A1F3D]"
              />

              <h2 className="mt-4 text-lg font-bold text-[#24171C]">
                No viewing requests found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756970]">
                There are no requests matching your current search or status
                filter.
              </p>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-5 sm:p-6">
          <div className="flex gap-3">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-[#7A1F3D]"
            />

            <div>
              <h2 className="text-sm font-bold text-[#24171C]">
                RentSure safety reminder
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#756970]">
                Viewing requests are scheduling records. They do not establish
                ownership, tenancy, or payment rights.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AgentViewingRequests;