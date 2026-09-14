
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
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

function AgentViewingRequests() {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
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
          renter_id,
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
          ),
          profiles:renter_id (
            id,
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching viewing requests:", error);
        setErrorMessage(
          error.message || "Unable to load viewing requests."
        );
        setRequests([]);
      } else {
        setRequests(data || []);
      }

      setLoading(false);
    };

    fetchRequests();
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

  const updateRequestStatus = async (requestId, status) => {
    setUpdatingId(requestId);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("viewing_requests")
      .update({ status })
      .eq("id", requestId)
      .select()
      .single();

    if (error) {
      console.error("Error updating viewing request:", error);

      setErrorMessage(
        error.message || "Unable to update the viewing request."
      );

      setUpdatingId(null);
      return;
    }

    setRequests((previous) =>
      previous.map((request) =>
        request.id === requestId
          ? { ...request, status: data.status }
          : request
      )
    );

    setUpdatingId(null);
  };

  const pendingCount = requests.filter(
    (request) => request.status === "pending"
  ).length;

  const confirmedCount = requests.filter(
    (request) => request.status === "confirmed"
  ).length;

  const completedCount = requests.filter(
    (request) => request.status === "completed"
  ).length;

  return (
    <main className="min-h-screen bg-[#FAF8F9] px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
      <div className="mx-auto w-full max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <Link
            to="/agent/dashboard"
            className="text-sm font-semibold text-[#7A1F3D] hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-5">
            <h1 className="text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
              Viewing Requests
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
              Manage viewing requests submitted by renters for your
              properties.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-10 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-[#756970]">
              Pending Requests
            </p>

            <p className="mt-3 text-3xl font-bold text-[#B45309]">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-[#756970]">
              Confirmed
            </p>

            <p className="mt-3 text-3xl font-bold text-[#15803D]">
              {confirmedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-[#756970]">
              Completed
            </p>

            <p className="mt-3 text-3xl font-bold text-[#4338CA]">
              {completedCount}
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
              Loading viewing requests...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && requests.length === 0 && !errorMessage && (
          <div className="rounded-2xl border border-[#E8DDE1] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8EDEF]">
              <CalendarDays
                size={30}
                className="text-[#7A1F3D]"
              />
            </div>

            <h2 className="mt-6 text-xl font-bold text-[#24171C]">
              No viewing requests yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756970]">
              Viewing requests from renters will appear here when they request
              to visit one of your properties.
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

        {/* Request List */}
        {!loading && requests.length > 0 && (
          <div className="space-y-6">
            {requests.map((request) => {
              const property = request.properties;
              const renter = request.profiles;

              return (
                <article
                  key={request.id}
                  className="overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm"
                >
                  <div className="p-6 sm:p-7 lg:p-8">

                    {/* Request Header */}
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
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
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:underline"
                        >
                          View Property
                          <ArrowRight size={16} />
                        </Link>
                      )}
                    </div>

                    {/* Renter */}
                    <div className="mt-7 rounded-xl bg-[#F8EDEF] p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                        Renter
                      </p>

                      <p className="mt-2 text-base font-bold text-[#24171C]">
                        {renter?.full_name || "Renter"}
                      </p>
                    </div>

                    {/* Viewing Details */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-[#E8DDE1] p-5">
                        <div className="flex items-center gap-2 text-[#7A1F3D]">
                          <CalendarDays size={19} />
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Preferred Date
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-semibold text-[#24171C]">
                          {formatDate(request.requested_date)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#E8DDE1] p-5">
                        <div className="flex items-center gap-2 text-[#7A1F3D]">
                          <Clock3 size={19} />
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Preferred Time
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-semibold text-[#24171C]">
                          {formatTime(request.requested_time)}
                        </p>
                      </div>
                    </div>

                    {/* Renter Notes */}
                    {request.renter_notes && (
                      <div className="mt-6 rounded-xl border border-[#E8DDE1] p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                          Renter Notes
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
                          disabled={updatingId === request.id}
                          onClick={() =>
                            updateRequestStatus(
                              request.id,
                              "cancelled"
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] px-5 py-3 text-sm font-semibold text-[#B91C1C] transition hover:bg-[#FDECEC] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingId === request.id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <XCircle size={17} />
                          )}

                          Decline
                        </button>

                        <button
                          type="button"
                          disabled={updatingId === request.id}
                          onClick={() =>
                            updateRequestStatus(
                              request.id,
                              "confirmed"
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingId === request.id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <CheckCircle2 size={17} />
                          )}

                          Confirm Viewing
                        </button>
                      </div>
                    )}

                    {request.status === "confirmed" && (
                      <div className="mt-7 flex justify-end border-t border-[#E8DDE1] pt-6">
                        <button
                          type="button"
                          disabled={updatingId === request.id}
                          onClick={() =>
                            updateRequestStatus(
                              request.id,
                              "completed"
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#15803D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#11632F] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingId === request.id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <CheckCircle2 size={17} />
                          )}

                          Mark Completed
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Safety Message */}
                  <div className="border-t border-[#E8DDE1] bg-[#FAF8F9] px-6 py-4 sm:px-7">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-[#7A1F3D]"
                      />

                      <p className="text-sm leading-6 text-[#756970]">
                        Keep viewing arrangements on the RentSure platform and
                        avoid requesting or accepting suspicious payments
                        outside the normal rental process.
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}

export default AgentViewingRequests;

