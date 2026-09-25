
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Flag,
  Home,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../../context/useAuth";
import { supabase } from "../../../services/supabase/client";

const REPORT_REASONS = [
  {
    value: "suspected_scam",
    label: "Suspected scam",
  },
  {
    value: "fake_listing",
    label: "Fake or misleading listing",
  },
  {
    value: "payment_request",
    label: "Suspicious payment request",
  },
  {
    value: "false_information",
    label: "False property information",
  },
  {
    value: "agent_concern",
    label: "Concern about the agent",
  },
  {
    value: "duplicate_listing",
    label: "Duplicate listing",
  },
  {
    value: "other",
    label: "Other concern",
  },
];

function ReportProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("properties")
        .select(
          `
            id,
            title,
            location,
            property_type,
            verification_status,
            risk_score,
            property_status
          `
        )
        .eq("id", id)
        .eq("property_status", "active")
        .maybeSingle();

      if (error) {
        console.error("Error fetching property:", error);
        setErrorMessage(
          "We couldn't load this property. Please try again."
        );
        setProperty(null);
      } else if (!data) {
        setErrorMessage(
          "This property is unavailable or is no longer active."
        );
        setProperty(null);
      } else {
        setProperty(data);
      }

      setLoading(false);
    };

    fetchProperty();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!user) {
      navigate("/login", {
        state: {
          from: {
            pathname: `/properties/${id}/report`,
          },
        },
      });

      return;
    }

    if (!reason) {
      setErrorMessage("Please select a reason for your report.");
      return;
    }

    if (description.trim().length < 20) {
      setErrorMessage(
        "Please provide at least 20 characters describing your concern."
      );
      return;
    }

    if (description.trim().length > 2000) {
      setErrorMessage(
        "Your description cannot be longer than 2,000 characters."
      );
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("reports").insert({
      property_id: property.id,
      reporter_id: user.id,
      reason,
      description: description.trim(),
      status: "under_review",
    });

    if (error) {
      console.error("Error submitting report:", error);

      if (error.code === "23505") {
        setErrorMessage(
          "You have already submitted a report for this property."
        );
      } else {
        setErrorMessage(
          "We couldn't submit your report. Please try again."
        );
      }

      setSubmitting(false);
      return;
    }

    setSuccessMessage(
      "Your report has been submitted and is now under review."
    );

    setReason("");
    setDescription("");
    setSubmitting(false);

    setTimeout(() => {
      navigate("/renter/reports", { replace: true });
    }, 1600);
  };

  const getVerificationLabel = (status) => {
    switch (status) {
      case "verified":
        return "Verified";

      case "pending":
        return "Awaiting review";

      case "needs_information":
        return "More information needed";

      case "rejected":
        return "Rejected";

      default:
        return "Not verified";
    }
  };

  const getRiskLabel = (riskScore) => {
    if (riskScore === null || riskScore === undefined) {
      return {
        label: "Not scored yet",
        className: "text-[#756970]",
      };
    }

    if (riskScore >= 60) {
      return {
        label: "High risk",
        className: "text-[#B91C1C]",
      };
    }

    if (riskScore >= 30) {
      return {
        label: "Moderate risk",
        className: "text-[#B45309]",
      };
    }

    return {
      label: "Low risk",
      className: "text-[#15803D]",
    };
  };

  const risk = getRiskLabel(property?.risk_score);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F9]">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#7A1F3D]" />
            <p className="text-sm text-[#756970]">
              Loading property information...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-[#FAF8F9]">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-[#E8DDE1] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-7 w-7 text-[#B91C1C]" />
            </div>

            <h1 className="mt-5 text-xl font-bold text-[#24171C]">
              Property unavailable
            </h1>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#756970]">
              {errorMessage ||
                "This property could not be found or is no longer active."}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] bg-white px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </button>

              <Link
                to="/properties"
                className="inline-flex items-center justify-center rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
              >
                Browse Properties
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        {/* Back Link */}
        <Link
          to={`/properties/${property.id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Property
        </Link>

        {/* Header */}
        <section className="mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EDEF]">
            <Flag className="h-6 w-6 text-[#7A1F3D]" />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#24171C] sm:text-3xl">
            Report Property
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
            Tell us about a concern with this property. Your report will be
            reviewed by the RentSure team.
          </p>
        </section>

        {/* Property Summary */}
        <section className="mb-8 overflow-hidden rounded-xl border border-[#E8DDE1] bg-white shadow-sm">
          <div className="border-b border-[#E8DDE1] bg-[#FAF8F9] px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
              Property being reported
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF]">
                  <Home className="h-5 w-5 text-[#7A1F3D]" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#24171C]">
                    {property.title}
                  </h2>

                  <div className="mt-2 flex items-start gap-2 text-sm text-[#756970]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{property.location}</span>
                  </div>

                  {property.property_type && (
                    <p className="mt-2 text-sm capitalize text-[#756970]">
                      {property.property_type.replace(/_/g, " ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:items-end">
                <span className="text-xs text-[#756970]">
                  Verification
                </span>

                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    property.verification_status === "verified"
                      ? "border border-green-200 bg-green-50 text-green-700"
                      : property.verification_status === "rejected"
                      ? "border border-red-200 bg-red-50 text-red-700"
                      : "border border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {getVerificationLabel(property.verification_status)}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-[#E8DDE1] pt-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[#756970]">
                  Current risk assessment
                </p>

                <p className={`mt-1 text-sm font-semibold ${risk.className}`}>
                  {risk.label}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#756970]">
                  Property status
                </p>

                <p className="mt-1 text-sm font-semibold capitalize text-[#24171C]">
                  {property.property_status?.replace(/_/g, " ") || "Active"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Safety Notice */}
        <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex gap-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#B45309]" />

            <div>
              <h2 className="text-sm font-semibold text-[#24171C]">
                Report only what you can describe accurately
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#756970]">
                A report is a request for investigation. Avoid submitting
                information that you know to be false or misleading. RentSure
                will assess the report using the information available to the
                review team.
              </p>
            </div>
          </div>
        </section>

        {/* Report Form */}
        <section className="rounded-xl border border-[#E8DDE1] bg-white shadow-sm">
          <div className="border-b border-[#E8DDE1] px-5 py-5 sm:px-6">
            <h2 className="text-lg font-bold text-[#24171C]">
              Report details
            </h2>

            <p className="mt-1 text-sm text-[#756970]">
              Provide enough information to help us understand your concern.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-5 sm:p-6"
          >
            {/* Error */}
            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#B91C1C]" />

                  <p className="text-sm leading-6 text-red-700">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Success */}
            {successMessage && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#15803D]" />

                  <p className="text-sm leading-6 text-green-700">
                    {successMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <label
                htmlFor="report-reason"
                className="block text-sm font-semibold text-[#24171C]"
              >
                What is your concern?
                <span className="ml-1 text-[#B91C1C]">*</span>
              </label>

              <p className="mt-1 text-xs text-[#756970]">
                Select the option that best describes the issue.
              </p>

              <select
                id="report-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                disabled={submitting}
                className="mt-3 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#7A1F3D]/10 disabled:cursor-not-allowed disabled:bg-[#FAF8F9]"
              >
                <option value="">Select a reason</option>

                {REPORT_REASONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-end justify-between gap-3">
                <label
                  htmlFor="report-description"
                  className="block text-sm font-semibold text-[#24171C]"
                >
                  Describe the concern
                  <span className="ml-1 text-[#B91C1C]">*</span>
                </label>

                <span className="text-xs text-[#9A8D93]">
                  {description.length}/2000
                </span>
              </div>

              <p className="mt-1 text-xs text-[#756970]">
                Include relevant details such as what happened, what you
                noticed, or why the listing appears concerning.
              </p>

              <textarea
                id="report-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={submitting}
                maxLength={2000}
                rows={7}
                placeholder="Describe what you noticed..."
                className="mt-3 w-full resize-y rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 text-sm leading-6 text-[#24171C] outline-none transition placeholder:text-[#9A8D93] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#7A1F3D]/10 disabled:cursor-not-allowed disabled:bg-[#FAF8F9]"
              />

              <p className="mt-2 text-xs text-[#9A8D93]">
                Minimum 20 characters.
              </p>
            </div>

            {/* Submission Notice */}
            <div className="rounded-lg border border-[#E8DDE1] bg-[#FAF8F9] p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#7A1F3D]" />

                <div>
                  <h3 className="text-sm font-semibold text-[#24171C]">
                    What happens after you submit?
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[#756970]">
                    Your report will be placed under review. You can monitor
                    its status from your Reports page. The review team may
                    investigate the property using available verification and
                    report information.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-[#E8DDE1] pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate(`/properties/${property.id}`)}
                disabled={submitting}
                className="rounded-lg border border-[#E8DDE1] bg-white px-5 py-3 text-sm font-semibold text-[#756970] transition hover:bg-[#FAF8F9] hover:text-[#24171C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Flag className="h-4 w-4" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Bottom Disclaimer */}
        <section className="mt-8 rounded-xl border border-[#E8DDE1] bg-white p-5 sm:p-6">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#B45309]" />

            <div>
              <h2 className="text-sm font-semibold text-[#24171C]">
                Important
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#756970]">
                RentSure is a verification and fraud-awareness platform. A
                submitted report does not automatically mean that a property,
                agent, or listing is fraudulent. Reports are reviewed based on
                available information.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ReportProperty;

