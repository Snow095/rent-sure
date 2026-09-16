
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  Eye,
  Loader2,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../../services/supabase/client";

const STATUSES = [
  "all",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

function AdminViewingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const loadRequests = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("viewing_requests")
        .select(`
          id,
          renter_id,
          property_id,
          requested_date,
          requested_time,
          status,
          renter_notes,
          agent_notes,
          created_at,
          properties (
            id,
            title,
            location,
            agent_id
          )
        `)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      const rows = data ?? [];

      const renterIds = [
        ...new Set(
          rows.map(
            (request) => request.renter_id
          )
        ),
      ];

      let profiles = [];

      if (renterIds.length > 0) {
        const { data: profileData, error: profileError } =
          await supabase
            .from("profiles")
            .select("id, full_name, role")
            .in("id", renterIds);

        if (profileError) {
          throw profileError;
        }

        profiles = profileData ?? [];
      }

      const profileMap = Object.fromEntries(
        profiles.map((profile) => [
          profile.id,
          profile,
        ])
      );

      setRequests(
        rows.map((request) => ({
          ...request,
          renter:
            profileMap[request.renter_id] || null,
        }))
      );
    } catch (error) {
      console.error(
        "Error loading viewing requests:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch =
        !search ||
        request.renter?.full_name
          ?.toLowerCase()
          .includes(search) ||
        request.properties?.title
          ?.toLowerCase()
          .includes(search) ||
        request.properties?.location
          ?.toLowerCase()
          .includes(search) ||
        request.property_id
          ?.toString()
          .includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter(
        (item) => item.status === "pending"
      ).length,
      confirmed: requests.filter(
        (item) => item.status === "confirmed"
      ).length,
      completed: requests.filter(
        (item) => item.status === "completed"
      ).length,
    }),
    [requests]
  );

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-3 py-1.5 text-xs font-bold text-[#7A1F3D]">
            <CalendarDays size={14} />
            Platform Monitoring
          </div>

          <h1 className="text-2xl font-bold text-[#24171C] sm:text-3xl">
            Viewing Requests
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970]">
            Monitor viewing activity across RentSure's
            properties.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Requests"
            value={stats.total}
          />

          <StatCard
            label="Pending"
            value={stats.pending}
          />

          <StatCard
            label="Confirmed"
            value={stats.confirmed}
          />

          <StatCard
            label="Completed"
            value={stats.completed}
          />
        </section>

        <section className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-2">
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
                  placeholder="Search renter, property, or location..."
                  className="w-full rounded-lg border border-[#E8DDE1] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#24171C]">
                Status
              </label>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="w-full appearance-none rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                >
                  {STATUSES.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#756970]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2
                size={32}
                className="animate-spin text-[#7A1F3D]"
              />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <CalendarDays
                size={34}
                className="mx-auto text-[#7A1F3D]"
              />

              <h2 className="mt-4 font-bold text-[#24171C]">
                No viewing requests found
              </h2>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full">
                  <thead className="bg-[#FAF8F9]">
                    <tr className="border-b border-[#E8DDE1]">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                        Renter
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                        Property
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                        Requested
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-[#756970]">
                        View
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E8DDE1]">
                    {filteredRequests.map(
                      (request) => (
                        <tr key={request.id}>
                          <td className="px-6 py-5">
                            <p className="font-semibold text-[#24171C]">
                              {request.renter
                                ?.full_name ||
                                "Renter"}
                            </p>

                            <p className="mt-1 text-xs text-[#756970]">
                              {request.renter_id}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            {request.properties ? (
                              <Link
                                to={`/properties/${request.properties.id}`}
                                className="font-semibold text-[#7A1F3D] hover:underline"
                              >
                                {
                                  request
                                    .properties
                                    .title
                                }
                              </Link>
                            ) : (
                              "Property unavailable"
                            )}

                            <p className="mt-1 text-xs text-[#756970]">
                              {
                                request.properties
                                  ?.location
                              }
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <p className="flex items-center gap-2 text-sm text-[#24171C]">
                              <CalendarDays
                                size={15}
                              />
                              {formatDateOnly(
                                request.requested_date
                              )}
                            </p>

                            <p className="mt-1 flex items-center gap-2 text-xs text-[#756970]">
                              <Clock3 size={14} />
                              {formatTime(
                                request.requested_time
                              )}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <StatusBadge
                              status={request.status}
                            />
                          </td>

                          <td className="px-6 py-5 text-right">
                            <Link
                              to={`/properties/${request.property_id}`}
                              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#7A1F3D] hover:bg-[#F8EDEF]"
                            >
                              <Eye size={15} />
                              Property
                            </Link>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-[#E8DDE1] md:hidden">
                {filteredRequests.map(
                  (request) => (
                    <article
                      key={request.id}
                      className="p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-[#756970]">
                            Request #{request.id}
                          </p>

                          <h2 className="mt-2 font-bold text-[#24171C]">
                            {request.renter
                              ?.full_name ||
                              "Renter"}
                          </h2>
                        </div>

                        <StatusBadge
                          status={request.status}
                        />
                      </div>

                      <div className="mt-4">
                        <p className="font-semibold text-[#7A1F3D]">
                          {
                            request.properties
                              ?.title
                          }
                        </p>

                        <p className="mt-1 text-sm text-[#756970]">
                          {
                            request.properties
                              ?.location
                          }
                        </p>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-[#24171C]">
                        <p className="flex items-center gap-2">
                          <CalendarDays size={16} />
                          {formatDateOnly(
                            request.requested_date
                          )}
                        </p>

                        <p className="flex items-center gap-2">
                          <Clock3 size={16} />
                          {formatTime(
                            request.requested_time
                          )}
                        </p>
                      </div>

                      <Link
                        to={`/properties/${request.property_id}`}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#7A1F3D] px-4 py-3 text-sm font-semibold text-white"
                      >
                        <Eye size={15} />
                        View Property
                      </Link>
                    </article>
                  )
                )}
              </div>
            </>
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

function StatusBadge({ status }) {
  return (
    <span className="inline-flex rounded-full bg-[#F8EDEF] px-3 py-1.5 text-xs font-bold text-[#7A1F3D]">
      {formatStatus(status)}
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

function formatDateOnly(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(
    new Date(`${value}T00:00:00`)
  );
}

function formatTime(value) {
  if (!value) return "—";

  const [hours, minutes] = value.split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default AdminViewingRequests;

