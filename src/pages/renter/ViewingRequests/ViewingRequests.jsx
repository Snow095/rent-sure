import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Home,
  MapPin,
  XCircle,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../../context/useAuth";
import { supabase } from "../../../services/supabase/client";

function ViewingRequests() {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadRequests = async () => {
      if (!user) {
        if (!cancelled) {
          setRequests([]);
          setLoading(false);
        }
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("viewing_requests")
        .select(`
          id,
          requested_date,
          requested_time,
          status,
          created_at,
          property:properties (
            id,
            title,
            location,
            annual_rent,
            bedrooms,
            bathrooms,
            property_type,
            verification_status,
            risk_score,
            property_status
          )
        `)
        .eq("renter_id", user.id)
        .order("requested_date", { ascending: true })
        .order("requested_time", { ascending: true });

      if (cancelled) {
        return;
      }

      if (fetchError) {
        console.error("Viewing requests error:", fetchError);
        setError(
          "Unable to load your viewing requests. Please try again."
        );
        setRequests([]);
        setLoading(false);
        return;
      }

      setError("");
      setRequests(data || []);
      setLoading(false);
    };

    loadRequests();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-NG", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) {
      return "Price unavailable";
    }

    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isPastRequest = (request) => {
    if (!request.requested_date) {
      return false;
    }

    const requestDate = new Date(
      `${request.requested_date}T${
        request.requested_time || "23:59"
      }`
    );

    return requestDate < new Date();
  };

  const getStatusLabel = (status) => {
    if (status === "confirmed") {
      return "Confirmed";
    }

    if (status === "completed") {
      return "Completed";
    }

    if (status === "cancelled") {
      return "Cancelled";
    }

    return "Pending";
  };

  const getStatusClasses = (status) => {
    if (status === "confirmed") {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (status === "completed") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    if (status === "cancelled") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getStatusIcon = (status) => {
    if (status === "confirmed") {
      return <CheckCircle2 size={15} />;
    }

    if (status === "completed") {
      return <CheckCircle2 size={15} />;
    }

    if (status === "cancelled") {
      return <XCircle size={15} />;
    }

    return <Clock3 size={15} />;
  };

  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") {
      return requests;
    }

    return requests.filter(
      (request) => request.status === statusFilter
    );
  }, [requests, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter(
        (request) => request.status === "pending"
      ).length,
      confirmed: requests.filter(
        (request) => request.status === "confirmed"
      ).length,
      completed: requests.filter(
        (request) => request.status === "completed"
      ).length,
      cancelled: requests.filter(
        (request) => request.status === "cancelled"
      ).length,
    };
  }, [requests]);

  const handleCancel = async (requestId) => {
    const shouldCancel = window.confirm(
      "Are you sure you want to cancel this viewing request?"
    );

    if (!shouldCancel) {
      return;
    }

    setCancellingId(requestId);
    setError("");
    setSuccess("");

    const { error: updateError } = await supabase
      .from("viewing_requests")
      .update({
        status: "cancelled",
      })
      .eq("id", requestId)
      .eq("renter_id", user.id)
      .eq("status", "pending");

    if (updateError) {
      console.error("Cancel viewing request error:", updateError);
      setError(
        "Unable to cancel this request. Please try again."
      );
      setCancellingId(null);
      return;
    }

    setRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? { ...request, status: "cancelled" }
          : request
      )
    );

    setSuccess("Viewing request cancelled successfully.");
    setCancellingId(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F9] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-52 rounded-lg bg-[#E8DDE1]" />
            <div className="h-40 rounded-2xl bg-white" />
            <div className="h-20 rounded-xl bg-white" />

            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-56 rounded-2xl bg-white"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F9] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/renter/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <section className="rounded-2xl bg-[#2D0A17] px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
                <CalendarDays size={14} />
                Viewing Requests
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Your property viewings
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                Keep track of requested, confirmed, completed, and
                cancelled property viewings.
              </p>
            </div>

            <Link
              to="/properties"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
            >
              Find Properties
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        {success && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              key: "all",
              label: "All requests",
              count: counts.all,
            },
            {
              key: "pending",
              label: "Pending",
              count: counts.pending,
            },
            {
              key: "confirmed",
              label: "Confirmed",
              count: counts.confirmed,
            },
            {
              key: "completed",
              label: "Completed",
              count: counts.completed,
            },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatusFilter(item.key)}
              className={`rounded-2xl border p-5 text-left shadow-sm transition ${
                statusFilter === item.key
                  ? "border-[#7A1F3D] bg-[#F8EDEF]"
                  : "border-[#E8DDE1] bg-white hover:border-[#7A1F3D]/30"
              }`}
            >
              <p className="text-2xl font-bold text-[#24171C]">
                {item.count}
              </p>

              <p className="mt-1 text-sm text-[#756970]">
                {item.label}
              </p>
            </button>
          ))}
        </section>

        <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#E8DDE1] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-sm font-semibold text-[#24171C]">
              Filter requests
            </p>

            <p className="mt-1 text-xs text-[#756970]">
              Choose a status to narrow your viewing list.
            </p>
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
          >
            <option value="all">All requests ({counts.all})</option>
            <option value="pending">
              Pending ({counts.pending})
            </option>
            <option value="confirmed">
              Confirmed ({counts.confirmed})
            </option>
            <option value="completed">
              Completed ({counts.completed})
            </option>
            <option value="cancelled">
              Cancelled ({counts.cancelled})
            </option>
          </select>
        </section>

        <section className="mt-6 space-y-5">
          {filteredRequests.length === 0 ? (
            <div className="rounded-2xl border border-[#E8DDE1] bg-white px-5 py-14 text-center shadow-sm sm:px-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8EDEF]">
                <CalendarDays
                  size={25}
                  className="text-[#7A1F3D]"
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-[#24171C]">
                {requests.length === 0
                  ? "No viewing requests yet"
                  : "No matching requests"}
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#756970]">
                {requests.length === 0
                  ? "When you request to view a property, your viewing details and status will appear here."
                  : "Try selecting another status to see your other viewing requests."}
              </p>

              {requests.length === 0 && (
                <Link
                  to="/properties"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                >
                  Browse Properties
                  <ArrowRight size={17} />
                </Link>
              )}
            </div>
          ) : (
            filteredRequests.map((request) => {
              const property = request.property;
              const isPast = isPastRequest(request);
              const canCancel =
                request.status === "pending" && !isPast;

              return (
                <article
                  key={request.id}
                  className="overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 flex-1 gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF]">
                          <Home
                            size={29}
                            className="text-[#7A1F3D]"
                          />
                        </div>

                        <div className="min-w-0">
                          <Link
                            to={
                              property?.id
                                ? `/properties/${property.id}`
                                : "#"
                            }
                            className="line-clamp-2 text-lg font-bold text-[#24171C] transition hover:text-[#7A1F3D]"
                          >
                            {property?.title || "Property"}
                          </Link>

                          <p className="mt-2 flex items-start gap-1.5 text-sm text-[#756970]">
                            <MapPin
                              size={16}
                              className="mt-0.5 shrink-0"
                            />

                            <span>
                              {property?.location ||
                                "Location unavailable"}
                            </span>
                          </p>

                          {property?.annual_rent !== null &&
                            property?.annual_rent !== undefined && (
                              <p className="mt-2 text-sm font-semibold text-[#7A1F3D]">
                                {formatCurrency(property.annual_rent)}
                                <span className="ml-1 font-normal text-[#756970]">
                                  / year
                                </span>
                              </p>
                            )}
                        </div>
                      </div>

                      <span
                        className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                          request.status
                        )}`}
                      >
                        {getStatusIcon(request.status)}
                        {getStatusLabel(request.status)}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-4 border-y border-[#E8DDE1] py-5 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8EDEF]">
                          <CalendarDays
                            size={17}
                            className="text-[#7A1F3D]"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                            Viewing Date
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#24171C]">
                            {formatDate(request.requested_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8EDEF]">
                          <Clock3
                            size={17}
                            className="text-[#7A1F3D]"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                            Requested Time
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#24171C]">
                            {request.requested_time ||
                              "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8EDEF]">
                          <Home
                            size={17}
                            className="text-[#7A1F3D]"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                            Property Type
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#24171C]">
                            {property?.property_type ||
                              "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {property && (
                      <div className="mt-5 flex flex-col gap-3 rounded-xl bg-[#FAF8F9] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <ShieldCheck
                            size={18}
                            className="mt-0.5 shrink-0 text-[#7A1F3D]"
                          />

                          <div>
                            <p className="text-sm font-semibold text-[#24171C]">
                              Property verification
                            </p>

                            <p className="mt-1 text-xs text-[#756970]">
                              {property.verification_status ===
                              "verified"
                                ? "This property has been marked as verified by RentSure."
                                : property.verification_status ===
                                    "pending"
                                  ? "Verification is currently under review."
                                  : "Review the property's verification information before making decisions."}
                            </p>
                          </div>
                        </div>

                        <Link
                          to={`/properties/${property.id}`}
                          className="shrink-0 text-sm font-semibold text-[#7A1F3D] hover:underline"
                        >
                          View details
                        </Link>
                      </div>
                    )}

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-[#756970]">
                        Request submitted{" "}
                        {formatDate(request.created_at)}
                      </p>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        {property?.id && (
                          <Link
                            to={`/properties/${property.id}`}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] px-4 py-2.5 text-sm font-semibold text-[#24171C] transition hover:bg-[#FAF8F9]"
                          >
                            View Property
                            <ArrowRight size={16} />
                          </Link>
                        )}

                        {canCancel && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCancel(request.id)
                            }
                            disabled={cancellingId === request.id}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-[#B91C1C] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {cancellingId === request.id ? (
                              <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#B91C1C] border-t-transparent" />
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <XCircle size={16} />
                                Cancel Request
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-[#7A1F3D]"
            />

            <div>
              <h2 className="text-sm font-bold text-[#24171C]">
                Viewing safety reminder
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#756970]">
                A viewing request does not establish ownership,
                tenancy, or legal legitimacy. Meet in appropriate
                circumstances, inspect the property where possible,
                and avoid making payments solely because a viewing
                has been scheduled or confirmed.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ViewingRequests;