
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  MapPin,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../services/supabase/client";

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-[#FFF7E6] text-[#B45309]",
    confirmed: "bg-[#E8F5EC] text-[#15803D]",
    completed: "bg-[#EEF2FF] text-[#4338CA]",
    cancelled: "bg-[#FDECEC] text-[#B91C1C]",
  };

  const labels = {
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-[#F3F4F6] text-[#756970]"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

function ViewingRequests() {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchViewingRequests = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("viewing_requests")
        .select(`
          id,
          property_id,
          requested_date,
          requested_time,
          status,
          renter_notes,
          created_at,
          properties (
            id,
            title,
            location,
            property_type,
            annual_rent
          )
        `)
        .eq("renter_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching viewing requests:", error);
        setErrorMessage(
          error.message || "Unable to load your viewing requests."
        );
        setRequests([]);
      } else {
        setRequests(data || []);
      }

      setLoading(false);
    };

    fetchViewingRequests();
  }, [user]);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-NG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "Time unavailable";

    const [hours, minutes] = time.split(":");

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-NG", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleCancel = async (requestId) => {
    const shouldCancel = window.confirm(
      "Are you sure you want to cancel this viewing request?"
    );

    if (!shouldCancel) return;

    setErrorMessage("");

    const { data, error } = await supabase
      .from("viewing_requests")
      .update({ status: "cancelled" })
      .eq("id", requestId)
      .eq("renter_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error cancelling viewing request:", error);
      setErrorMessage(
        error.message || "Unable to cancel the viewing request."
      );
      return;
    }

    setRequests((previous) =>
      previous.map((request) =>
        request.id === requestId
          ? { ...request, status: data.status }
          : request
      )
    );
  };

  return (
    <main className="min-h-screen bg-[#FAF8F9] px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
      <div className="mx-auto w-full max-w-6xl">

        {/* Header */}
        <div className="mb-10">
          <Link
            to="/renter/dashboard"
            className="text-sm font-semibold text-[#7A1F3D] hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-5">
            <h1 className="text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
              Viewing Requests
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
              Keep track of the property viewings you have requested and their
              current status.
            </p>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-[#F3C7C7] bg-[#FDECEC] p-4 text-sm text-[#B91C1C]">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1 leading-6">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-[#E8DDE1] bg-white px-6 py-16 text-center shadow-sm">
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
        {!loading && requests.length === 0 && !errorMessage && (
          <div className="rounded-2xl border border-[#E8DDE1] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8EDEF]">
              <CalendarDays size={30} className="text-[#7A1F3D]" />
            </div>

            <h2 className="mt-6 text-xl font-bold text-[#24171C]">
              No viewing requests yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756970]">
              When you request a property viewing, it will appear here so you
              can keep track of the request.
            </p>

            <Link
              to="/properties"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
            >
              Explore Properties
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {/* Requests */}
        {!loading && requests.length > 0 && (
          <div className="space-y-6">
            {requests.map((request) => {
              const property = request.properties;

              return (
                <article
                  key={request.id}
                  className="overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm"
                >
                  <div className="p-6 sm:p-7 lg:p-8">

                    {/* Top */}
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <StatusBadge status={request.status} />

                          <span className="text-xs font-medium text-[#756970]">
                            Request #{request.id}
                          </span>
                        </div>

                        <h2 className="mt-4 text-xl font-bold text-[#24171C] sm:text-2xl">
                          {property?.title || "Property unavailable"}
                        </h2>

                        <div className="mt-3 flex items-start gap-2 text-sm text-[#756970]">
                          <MapPin
                            size={18}
                            className="mt-0.5 shrink-0 text-[#7A1F3D]"
                          />

                          <span>
                            {property?.location || "Location unavailable"}
                          </span>
                        </div>
                      </div>

                      {property && (
                        <Link
                          to={`/properties/${property.id}`}
                          className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:underline"
                        >
                          View Property
                          <ArrowRight size={16} />
                        </Link>
                      )}
                    </div>

                    {/* Details */}
                    <div className="mt-7 grid gap-4 border-t border-[#E8DDE1] pt-6 sm:grid-cols-2">
                      <div className="rounded-xl bg-[#FAF8F9] p-5">
                        <div className="flex items-center gap-2 text-[#7A1F3D]">
                          <CalendarDays size={19} />
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Requested Date
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-semibold text-[#24171C]">
                          {formatDate(request.requested_date)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#FAF8F9] p-5">
                        <div className="flex items-center gap-2 text-[#7A1F3D]">
                          <Clock3 size={19} />
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Requested Time
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-semibold text-[#24171C]">
                          {formatTime(request.requested_time)}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {request.renter_notes && (
                      <div className="mt-6 rounded-xl border border-[#E8DDE1] bg-white p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                          Your Notes
                        </p>

                        <p className="mt-2 text-sm leading-6 text-[#24171C]">
                          {request.renter_notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {request.status === "pending" && (
                      <div className="mt-7 flex flex-col gap-3 border-t border-[#E8DDE1] pt-6 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => handleCancel(request.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] px-5 py-3 text-sm font-semibold text-[#B91C1C] transition hover:bg-[#FDECEC]"
                        >
                          <XCircle size={17} />
                          Cancel Request
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Status Message */}
                  <div
                    className={`border-t px-6 py-4 sm:px-7 ${
                      request.status === "confirmed"
                        ? "border-[#CBE7D2] bg-[#E8F5EC]"
                        : request.status === "cancelled"
                          ? "border-[#F3C7C7] bg-[#FDECEC]"
                          : "border-[#E8DDE1] bg-[#FAF8F9]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {request.status === "confirmed" ? (
                        <CheckCircle2
                          size={19}
                          className="mt-0.5 shrink-0 text-[#15803D]"
                        />
                      ) : request.status === "cancelled" ? (
                        <XCircle
                          size={19}
                          className="mt-0.5 shrink-0 text-[#B91C1C]"
                        />
                      ) : (
                        <CalendarDays
                          size={19}
                          className="mt-0.5 shrink-0 text-[#7A1F3D]"
                        />
                      )}

                      <p className="text-sm leading-6 text-[#756970]">
                        {request.status === "confirmed"
                          ? "Your viewing request has been confirmed. Please follow any instructions provided by the agent."
                          : request.status === "completed"
                            ? "This viewing request has been marked as completed."
                            : request.status === "cancelled"
                              ? "This viewing request has been cancelled."
                              : "Your request has been submitted and is waiting for the agent's response."}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Safety Notice */}
        <div className="mt-10 rounded-2xl border border-[#E8DDE1] bg-white p-6 sm:p-7">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={21}
              className="mt-0.5 shrink-0 text-[#7A1F3D]"
            />

            <div>
              <h3 className="text-sm font-bold text-[#24171C]">
                Stay safe during property viewings
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#756970]">
                Avoid making payments simply because a viewing has been
                scheduled. Continue reviewing the property's verification
                status and use RentSure's reporting tools if anything appears
                suspicious.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

export default ViewingRequests;
