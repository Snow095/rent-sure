import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../../context/useAuth";
import { supabase } from "../../../services/supabase/client";

function ViewingRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [requestedDate, setRequestedDate] = useState("");
  const [requestedTime, setRequestedTime] = useState("");
  const [renterNotes, setRenterNotes] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProperty = async () => {
      if (!user?.id || !id) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      const propertyId = Number(id);

      if (!Number.isInteger(propertyId)) {
        if (!cancelled) {
          setError("Invalid property ID.");
          setLoading(false);
        }
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("properties")
        .select(
          `
            id,
            agent_id,
            title,
            location,
            property_type,
            annual_rent,
            bedrooms,
            bathrooms,
            verification_status,
            risk_score,
            property_status
          `
        )
        .eq("id", propertyId)
        .eq("property_status", "active")
        .single();

      if (cancelled) {
        return;
      }

      if (fetchError) {
        console.error("Viewing property error:", fetchError);
        setError("Unable to load this property.");
        setLoading(false);
        return;
      }

      setProperty(data);
      setLoading(false);
    };

    loadProperty();

    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

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

  const getMinimumDate = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      navigate("/login", {
        state: {
          from: {
            pathname: `/properties/${id}/viewing`,
          },
        },
      });

      return;
    }

    if (!property) {
      return;
    }

    setError("");
    setSuccess("");

    if (!requestedDate) {
      setError("Please select a preferred viewing date.");
      return;
    }

    if (!requestedTime) {
      setError("Please select a preferred viewing time.");
      return;
    }

    const selectedDateTime = new Date(
      `${requestedDate}T${requestedTime}`
    );

    if (Number.isNaN(selectedDateTime.getTime())) {
      setError("Please provide a valid viewing date and time.");
      return;
    }

    if (selectedDateTime <= new Date()) {
      setError("Please choose a future viewing date and time.");
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase
      .from("viewing_requests")
      .insert({
        renter_id: user.id,
        agent_id: property.agent_id,
        property_id: property.id,
        requested_date: requestedDate,
        requested_time: requestedTime,
        renter_notes: renterNotes.trim() || null,
        status: "pending",
      });

    if (insertError) {
      console.error(
        "Create viewing request error:",
        insertError
      );

      if (
        insertError.code === "23505" ||
        insertError.message
          ?.toLowerCase()
          .includes("duplicate")
      ) {
        setError(
          "You already have a viewing request for this property."
        );
      } else {
        setError(
          "Unable to submit your viewing request. Please try again."
        );
      }

      setSubmitting(false);
      return;
    }

    setSuccess(
      "Your viewing request has been submitted successfully."
    );

    setTimeout(() => {
      navigate("/renter/viewing-requests");
    }, 1200);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F9]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-40 rounded bg-[#E8DDE1]" />
            <div className="h-40 rounded-2xl bg-white" />
            <div className="h-[500px] rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-[#FAF8F9]">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[#24171C]">
            Property unavailable
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#756970]">
            We could not find an active property matching this
            request.
          </p>

          <Link
            to="/properties"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
          >
            <ArrowLeft size={16} />
            Browse properties
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Link
          to={`/properties/${property.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
        >
          <ArrowLeft size={17} />
          Back to property
        </Link>

        <section className="mt-7">
          <p className="text-sm font-semibold text-[#7A1F3D]">
            Viewing request
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
            Request a property viewing
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
            Choose a preferred date and time. Your request will be
            sent to the property's agent for review.
          </p>
        </section>

        {error && (
          <div className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />
            <p>{success}</p>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <section className="h-fit rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
                <CalendarDays size={21} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                  Selected property
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#24171C]">
                  {property.title}
                </h2>

                <div className="mt-2 flex items-start gap-2 text-sm text-[#756970]">
                  <MapPin
                    size={16}
                    className="mt-0.5 shrink-0 text-[#7A1F3D]"
                  />
                  <span>{property.location}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#FAF8F9] p-4">
                <p className="text-xs text-[#756970]">
                  Annual rent
                </p>
                <p className="mt-1 font-bold text-[#24171C]">
                  {formatCurrency(property.annual_rent)}
                </p>
              </div>

              <div className="rounded-xl bg-[#FAF8F9] p-4">
                <p className="text-xs text-[#756970]">
                  Property type
                </p>
                <p className="mt-1 font-bold capitalize text-[#24171C]">
                  {property.property_type || "—"}
                </p>
              </div>

              <div className="rounded-xl bg-[#FAF8F9] p-4">
                <p className="text-xs text-[#756970]">
                  Bedrooms
                </p>
                <p className="mt-1 font-bold text-[#24171C]">
                  {property.bedrooms ?? "—"}
                </p>
              </div>

              <div className="rounded-xl bg-[#FAF8F9] p-4">
                <p className="text-xs text-[#756970]">
                  Bathrooms
                </p>
                <p className="mt-1 font-bold text-[#24171C]">
                  {property.bathrooms ?? "—"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#E8DDE1] bg-[#FAF8F9] p-4">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-[#7A1F3D]"
              />

              <div>
                <p className="text-sm font-semibold text-[#24171C]">
                  Verification reminder
                </p>

                <p className="mt-1 text-xs leading-5 text-[#756970]">
                  {property.verification_status === "verified"
                    ? "This property currently has a verified status."
                    : "Review the property's verification and risk information before making financial decisions."}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
                <Clock3 size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#24171C]">
                  Viewing details
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#756970]">
                  Select a future date and preferred time.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="requested-date"
                  className="mb-2 block text-sm font-semibold text-[#24171C]"
                >
                  Preferred date
                </label>

                <input
                  id="requested-date"
                  type="date"
                  min={getMinimumDate()}
                  value={requestedDate}
                  onChange={(event) =>
                    setRequestedDate(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#E8DDE1] bg-white px-4 py-3 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="requested-time"
                  className="mb-2 block text-sm font-semibold text-[#24171C]"
                >
                  Preferred time
                </label>

                <input
                  id="requested-time"
                  type="time"
                  value={requestedTime}
                  onChange={(event) =>
                    setRequestedTime(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#E8DDE1] bg-white px-4 py-3 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="renter-notes"
                  className="mb-2 block text-sm font-semibold text-[#24171C]"
                >
                  Note for the agent{" "}
                  <span className="font-normal text-[#756970]">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="renter-notes"
                  rows={5}
                  value={renterNotes}
                  onChange={(event) =>
                    setRenterNotes(event.target.value)
                  }
                  placeholder="Add any useful information about your viewing request..."
                  className="w-full resize-none rounded-xl border border-[#E8DDE1] bg-white px-4 py-3 text-sm leading-6 text-[#24171C] outline-none transition placeholder:text-[#A69CA0] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                />
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-700"
                  />

                  <p className="text-xs leading-5 text-amber-800">
                    A viewing request does not establish ownership,
                    tenancy, or payment rights. Do not send money
                    simply because a viewing has been scheduled or
                    confirmed.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || Boolean(success)}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Submitting request...
                  </>
                ) : (
                  <>
                    <CalendarDays size={18} />
                    Submit Viewing Request
                  </>
                )}
              </button>

              <Link
                to={`/properties/${property.id}`}
                className="flex min-h-11 items-center justify-center rounded-xl border border-[#E8DDE1] px-5 py-3 text-sm font-semibold text-[#24171C] transition hover:border-[#7A1F3D] hover:text-[#7A1F3D]"
              >
                Cancel
              </Link>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default ViewingRequest;