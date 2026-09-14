
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  FileWarning,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../services/supabase/client";

function ReportProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [property, setProperty] = useState(null);

  const [formData, setFormData] = useState({
    category: "",
    severity: "medium",
    description: "",
  });

  const [loadingProperty, setLoadingProperty] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const categories = [
    "Suspicious Payment Request",
    "Suspicious Listing",
    "Property Information",
    "Payment Concern",
    "Agent Conduct",
    "Other",
  ];

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setErrorMessage("Property could not be identified.");
        setLoadingProperty(false);
        return;
      }

      const { data, error } = await supabase
        .from("properties")
        .select(`
          id,
          title,
          location,
          property_type,
          annual_rent,
          verification_status
        `)
        .eq("id", id)
        .eq("property_status", "active")
        .single();

      if (error) {
        console.error("Error loading property:", error);
        setErrorMessage(
          "We couldn't load this property. It may no longer be available."
        );
        setProperty(null);
      } else {
        setProperty(data);
      }

      setLoadingProperty(false);
    };

    fetchProperty();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");

    if (!user?.id) {
      navigate("/login", {
        state: {
          from: `/properties/${id}/report`,
        },
      });
      return;
    }

    if (!formData.category) {
      setErrorMessage("Please select a report category.");
      return;
    }

    if (!formData.description.trim()) {
      setErrorMessage("Please describe the issue you want to report.");
      return;
    }

    if (formData.description.trim().length < 20) {
      setErrorMessage(
        "Please provide a little more detail about the issue."
      );
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("reports")
      .insert({
        reporter_id: user.id,
        property_id: Number(id),
        category: formData.category,
        description: formData.description.trim(),
        severity: formData.severity,
        status: "under_review",
      });

    setSubmitting(false);

    if (error) {
      console.error("Error submitting report:", error);
      setErrorMessage(
        "We couldn't submit your report. Please try again."
      );
      return;
    }

    navigate("/renter/reports");
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) {
      return "Rent unavailable";
    }

    return `₦${Number(amount).toLocaleString("en-NG")}/year`;
  };

  if (loadingProperty) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F9] px-5">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-[#7A1F3D]"
          />

          <p className="mt-4 text-sm font-medium text-[#756970]">
            Loading property information...
          </p>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-[#FAF8F9] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-lg rounded-2xl border border-[#E8DDE1] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2]">
            <AlertCircle
              size={26}
              className="text-[#B91C1C]"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[#24171C]">
            Property unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#756970]">
            We couldn't find this active property listing.
          </p>

          <Link
            to="/properties"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
          >
            Browse Properties
            <ArrowRight size={17} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      {/* Header */}
      <section className="border-b border-[#E8DDE1] bg-white">
        <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
          <Link
            to={`/properties/${property.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Property
          </Link>

          <div className="mt-7 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF]">
              <FileWarning
                size={23}
                className="text-[#7A1F3D]"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#7A1F3D]">
                Safety Report
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                Report a Concern
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#756970] sm:text-base">
            If something about this rental listing or your interaction with
            the agent seems suspicious, let RentSure know so the issue can be
            reviewed.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
        {/* Property Summary */}
        <div className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#756970]">
                Property Being Reported
              </p>

              <h2 className="mt-2 text-xl font-bold text-[#24171C]">
                {property.title}
              </h2>

              <div className="mt-3 flex items-center gap-2 text-sm text-[#756970]">
                <MapPin
                  size={17}
                  className="shrink-0 text-[#7A1F3D]"
                />
                {property.location}
              </div>
            </div>

            <div className="shrink-0">
              <span className="rounded-full bg-[#F8EDEF] px-3 py-1.5 text-xs font-semibold text-[#7A1F3D]">
                {property.property_type}
              </span>

              <p className="mt-3 text-sm font-bold text-[#24171C] sm:text-right">
                {formatAmount(property.annual_rent)}
              </p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-6 rounded-2xl border border-[#F3D8A3] bg-[#FFF9ED] p-5 sm:p-6">
          <div className="flex gap-4">
            <AlertTriangle
              size={21}
              className="mt-0.5 shrink-0 text-[#B45309]"
            />

            <div>
              <h2 className="text-sm font-bold text-[#7A4A03]">
                Please provide factual information
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#8A641F]">
                Describe what you observed or experienced. Avoid submitting
                information you know to be false. Reports help RentSure
                identify potential issues, but submitting a report does not
                automatically mean that the allegation will be confirmed.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mt-6 flex gap-3 rounded-xl border border-[#F1CACA] bg-[#FEF2F2] px-5 py-4">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-[#B91C1C]"
            />

            <p className="text-sm leading-6 text-[#B91C1C]">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8"
        >
          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="text-sm font-semibold text-[#24171C]"
            >
              What would you like to report?
            </label>

            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-3 min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
            >
              <option value="">Select a category</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div className="mt-7">
            <label
              htmlFor="severity"
              className="text-sm font-semibold text-[#24171C]"
            >
              How serious is the concern?
            </label>

            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="mt-3 min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <p className="mt-2 text-xs leading-5 text-[#756970]">
              Choose the level that best represents the potential impact or
              urgency of the issue.
            </p>
          </div>

          {/* Description */}
          <div className="mt-7">
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="description"
                className="text-sm font-semibold text-[#24171C]"
              >
                Describe the concern
              </label>

              <span className="text-xs text-[#756970]">
                {formData.description.length}/1000
              </span>
            </div>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(event) => {
                if (event.target.value.length <= 1000) {
                  handleChange(event);
                }
              }}
              rows={7}
              placeholder="Explain what happened, what you noticed, or why you believe the listing or interaction may be unsafe..."
              className="mt-3 w-full resize-y rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 text-sm leading-6 text-[#24171C] outline-none transition placeholder:text-[#A3979D] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
            />

            <p className="mt-2 text-xs leading-5 text-[#756970]">
              Please provide at least 20 characters so the review team has
              enough context to understand the concern.
            </p>
          </div>

          {/* Submit */}
          <div className="mt-8 border-t border-[#E8DDE1] pt-7">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Submitting Report...
                </>
              ) : (
                <>
                  Submit Report
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <Link
              to={`/properties/${property.id}`}
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-[#E8DDE1] px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF] sm:ml-3 sm:mt-0 sm:w-auto"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Bottom Trust Message */}
        <div className="mt-8 flex gap-4 rounded-2xl bg-[#2D0A17] p-6 sm:p-7">
          <ShieldCheck
            size={23}
            className="mt-0.5 shrink-0 text-[#C9A227]"
          />

          <div>
            <h2 className="text-sm font-bold text-white">
              Your report supports safer renting
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#E8DDE1]">
              RentSure uses submitted reports as part of its broader safety
              and review process. A report is an alert for review, not proof
              that wrongdoing has occurred.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ReportProperty;

