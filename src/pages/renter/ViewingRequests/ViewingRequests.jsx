
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  MapPin,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../services/supabase/client";

function ViewingRequests() {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const loadViewingRequests = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const { data, error } = await supabase
          .from("viewing_requests")
          .select(`
            id,
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
              property_type,
              annual_rent,
              verification_status,
              property_status
            )
          `)
          .eq("renter_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setRequests(data || []);
      } catch (error) {
        console.error("Error loading viewing requests:", error);

        setErrorMessage(
          error.message ||
            "Unable to load your viewing requests."
        );
      } finally {
        setLoading(false);
      }
    };

    loadViewingRequests();
  }, [user]);

  const handleCancel = async (requestId) => {
    const shouldCancel = window.confirm(
      "Are you sure you want to cancel this viewing request?"
    );

    if (!shouldCancel) {
      return;
    }

    setCancellingId(requestId);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("viewing_requests")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .eq("renter_id", user.id)
        .select(`
          id,
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
            property_type,
            annual_rent,
            verification_status,
            property_status
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      setRequests((previous) =>
        previous.map((request) =>
          request.id === requestId ? data : request
        )
      );
    } catch (error) {
      console.error("Error cancelling viewing request:", error);

      setErrorMessage(
        error.message ||
          "Unable to cancel this viewing request."
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F9] px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
      <div className="mx-auto w-full max-w-6xl">

        {/* Header */}
        <section>
          <Link
            to="/renter/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:text-[#4A1025]"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-7">
            <p className="text-sm font-semibold text-[#7A1F3D]">
              Viewing Requests
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
              My Property Viewings
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
              Track your property viewing requests and see when agents
              confirm or update your requested viewing.
            </p>
          </div>
        </section>

        {/* Error */}
        {errorMessage && (
          <div className="mt-8 flex gap-3 rounded-xl border border-[#F3C7C7] bg-[#FFF5F5] p-4">
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
          <div className="mt-10 rounded-2xl border border-[#E8DDE1] bg-white p-12 text-center shadow-sm">
            <Loader2
              size={30}
              className="mx-auto animate-spin text-[#7A1F3D]"
            />

            <p className="mt-4 text-sm font-medium text-[#756970]">
              Loading your viewing requests...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && requests.length === 0 && (
          <div className="mt-10 rounded-2xl border border-[#E8DDE1] bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8EDEF]">
              <CalendarDays
                size={27}
                className="text-[#7A1F3D]"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#24171C]">
              No viewing requests yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756970]">
              When you request a property viewing, it will appear here so
              you can track its status.
            </p>

            <Link
              to="/properties"
              className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
            >
              Explore Properties
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {/* Requests */}
        {!loading && requests.length > 0 && (
          <section className="mt-10 space-y-5">
            {requests.map((request) => {
              const property = request.properties;

              return (
                <article
                  key={request.id}
                  className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-7"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                    {/* Property */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={request.status} />

                        {property?.verification_status === "verified" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F5EC] px-3 py-1 text-xs font-semibold text-[#15803D]">
                            <ShieldCheck size={14} />
                            Verified Property
                          </span>
                        )}
                      </div>

                      <h2 className="mt-4 text-xl font-bold text-[#24171C]">
                        {property?.title || "Property"}
                      </h2>

                      <div className="mt-3 flex items-start gap-2 text-sm text-[#756970]">
                        <MapPin
                          size={17}
                          className="mt-0.5 shrink-0 text-[#7A1F3D]"
                        />

                        <span>
                          {property?.location || "Location unavailable"}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-[#756970]">
                        {property?.property_type || "Property"}
                        {property?.annual_rent
                          ? ` • ₦${Number(
                              property.annual_rent
                            ).toLocaleString()}/year`
                          : ""}
                      </div>
                    </div>

                    {/* Requested Date */}
                    <div className="rounded-xl bg-[#FAF8F9] p-5 lg:min-w-[230px]">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                        Requested Viewing
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        <CalendarDays
                          size={18}
                          className="text-[#7A1F3D]"
                        />

                        <span className="text-sm font-semibold text-[#24171C]">
                          {formatDate(request.requested_date)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <Clock3
                          size={18}
                          className="text-[#7A1F3D]"
                        />

                        <span className="text-sm font-semibold text-[#24171C]">
                          {formatTime(request.requested_time)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {request.renter_notes && (
                    <div className="mt-6 rounded-xl border border-[#E8DDE1] bg-[#FAF8F9] p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                        Your Note
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#24171C]">
                        {request.renter_notes}
                      </p>
                    </div>
                  )}

                  {/* Agent Notes */}
                  {request.agent_notes && (
                    <div className="mt-4 rounded-xl bg-[#F8EDEF] p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#4A1025]">
                        Agent Note
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#24171C]">
                        {request.agent_notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-6 flex flex-col gap-3 border-t border-[#E8DDE1] pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      to={`/properties/${request.property_id}`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] px-4 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                    >
                      View Property
                      <ArrowRight size={16} />
                    </Link>

                    {request.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleCancel(request.id)}
                        disabled={cancellingId === request.id}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#F3C7C7] px-4 py-3 text-sm font-semibold text-[#B91C1C] transition hover:bg-[#FFF5F5] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {cancellingId === request.id ? (
                          <>
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle size={17} />
                            Cancel Request
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Safety Notice */}
        <section className="mt-10 rounded-2xl border border-[#E8DDE1] bg-white p-6">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8EDEF]">
              <ShieldCheck
                size={20}
                className="text-[#7A1F3D]"
              />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#24171C]">
                Stay safe during property viewings
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#756970]">
                Confirm viewing details through RentSure and avoid sending
                deposits or other payments simply because a viewing has been
                requested or confirmed.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-[#FFF7E6] text-[#B45309]",
    confirmed: "bg-[#E8F5EC] text-[#15803D]",
    completed: "bg-[#EEF2F7] text-[#475569]",
    cancelled: "bg-[#FFF5F5] text-[#B91C1C]",
  };

  const labels = {
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-[#EEF2F7] text-[#475569]"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

function formatDate(date) {
  if (!date) {
    return "Date unavailable";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-NG",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTime(time) {
  if (!time) {
    return "Time unavailable";
  }

  const [hours, minutes] = time.split(":");
  const date = new Date();

  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default ViewingRequests;

