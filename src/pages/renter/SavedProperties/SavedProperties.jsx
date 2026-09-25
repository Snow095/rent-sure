import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Bath,
  CheckCircle2,
  Heart,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { useAuth } from "../../../context/useAuth";
import { supabase } from "../../../services/supabase/client";

function SavedProperties() {
  const { user } = useAuth();

  const [savedProperties, setSavedProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadSavedProperties = async () => {
      if (!user) {
        if (!cancelled) {
          setSavedProperties([]);
          setLoading(false);
        }
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("saved_properties")
        .select(`
          id,
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
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (fetchError) {
        console.error("Saved properties error:", fetchError);
        setError("Unable to load your saved properties. Please try again.");
        setSavedProperties([]);
      } else {
        setError("");
        setSavedProperties(data || []);
      }

      setLoading(false);
    };

    loadSavedProperties();

    return () => {
      cancelled = true;
    };
  }, [user]);

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

  const getVerificationLabel = (status) => {
    if (status === "verified") {
      return "Verified";
    }

    if (status === "pending") {
      return "Under review";
    }

    if (status === "needs_information") {
      return "Needs information";
    }

    if (status === "rejected") {
      return "Rejected";
    }

    return "Not verified";
  };

  const getVerificationClasses = (status) => {
    if (status === "verified") {
      return "bg-green-50 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-700";
    }

    if (status === "needs_information") {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-[#F8EDEF] text-[#7A1F3D]";
  };

  const getRiskLabel = (score) => {
    if (score === null || score === undefined) {
      return null;
    }

    if (score <= 29) {
      return "Low risk";
    }

    if (score <= 59) {
      return "Moderate risk";
    }

    return "High risk";
  };

  const getRiskClasses = (score) => {
    if (score === null || score === undefined) {
      return "";
    }

    if (score <= 29) {
      return "bg-green-50 text-green-700";
    }

    if (score <= 59) {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-red-50 text-red-700";
  };

  const filteredProperties = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return savedProperties.filter((saved) => {
      const property = saved.property;

      if (!property) {
        return false;
      }

      const matchesSearch =
        !normalizedSearch ||
        property.title?.toLowerCase().includes(normalizedSearch) ||
        property.location?.toLowerCase().includes(normalizedSearch) ||
        property.property_type?.toLowerCase().includes(normalizedSearch);

      const matchesVerification =
        verificationFilter === "all" ||
        property.verification_status === verificationFilter;

      return matchesSearch && matchesVerification;
    });
  }, [savedProperties, searchTerm, verificationFilter]);

  const handleRemove = async (savedId) => {
    if (!user) return;

    setRemovingId(savedId);
    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("saved_properties")
      .delete()
      .eq("id", savedId)
      .eq("renter_id", user.id);

    if (deleteError) {
      console.error("Remove saved property error:", deleteError);
      setError("Unable to remove this property from your saved list.");
      setRemovingId(null);
      return;
    }

    setSavedProperties((current) =>
      current.filter((saved) => saved.id !== savedId)
    );

    setSuccess("Property removed from your saved properties.");
    setRemovingId(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F9] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded-lg bg-[#E8DDE1]" />
            <div className="h-36 rounded-2xl bg-white" />
            <div className="h-16 rounded-xl bg-white" />

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-96 rounded-2xl bg-white"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F9] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Back */}
        <Link
          to="/renter/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <section className="rounded-2xl bg-[#2D0A17] px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
                <Heart size={14} />
                Saved Properties
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Properties you saved
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                Revisit properties you are considering and review their
                verification information before making rental decisions.
              </p>
            </div>

            <Link
              to="/properties"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
            >
              <Search size={17} />
              Find More Properties
            </Link>
          </div>
        </section>

        {/* Messages */}
        {success && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <section className="mt-6 rounded-2xl border border-[#E8DDE1] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search saved properties..."
                className="w-full rounded-lg border border-[#E8DDE1] bg-white py-3 pl-10 pr-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#9B9095] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="verificationFilter"
                className="text-sm font-semibold text-[#24171C]"
              >
                Verification
              </label>

              <select
                id="verificationFilter"
                value={verificationFilter}
                onChange={(event) =>
                  setVerificationFilter(event.target.value)
                }
                className="rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
              >
                <option value="all">All statuses</option>
                <option value="verified">Verified</option>
                <option value="pending">Under review</option>
                <option value="needs_information">
                  Needs information
                </option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#756970]">
              Showing{" "}
              <span className="font-semibold text-[#24171C]">
                {filteredProperties.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#24171C]">
                {savedProperties.length}
              </span>{" "}
              saved properties
            </p>

            {(searchTerm || verificationFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setVerificationFilter("all");
                }}
                className="text-sm font-semibold text-[#7A1F3D] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Empty State */}
        {savedProperties.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-[#E8DDE1] bg-white px-5 py-14 text-center shadow-sm sm:px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8EDEF]">
              <Heart size={27} className="text-[#7A1F3D]" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#24171C]">
              You have no saved properties
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#756970]">
              When you find a property you are interested in, save it from the
              property details page so you can easily come back to it.
            </p>

            <Link
              to="/properties"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
            >
              Browse Properties
              <ArrowRight size={17} />
            </Link>
          </section>
        ) : filteredProperties.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-[#E8DDE1] bg-white px-5 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8EDEF]">
              <Search size={24} className="text-[#7A1F3D]" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#24171C]">
              No matching properties
            </h2>

            <p className="mt-2 text-sm text-[#756970]">
              Try changing your search term or verification filter.
            </p>
          </section>
        ) : (
          /* Property Grid */
          <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProperties.map((saved) => {
              const property = saved.property;

              if (!property) {
                return null;
              }

              const riskLabel = getRiskLabel(property.risk_score);

              return (
                <article
                  key={saved.id}
                  className="overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Property Visual */}
                  <div className="relative flex h-52 items-center justify-center bg-[#F8EDEF]">
                    <Home
                      size={52}
                      strokeWidth={1.4}
                      className="text-[#7A1F3D]"
                    />

                    <div className="absolute left-4 top-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getVerificationClasses(
                          property.verification_status
                        )}`}
                      >
                        {property.verification_status === "verified" && (
                          <>
                            <CheckCircle2 size={14} />
                            <ShieldCheck size={14} />
                          </>
                        )}

                        {getVerificationLabel(
                          property.verification_status
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(saved.id)}
                      disabled={removingId === saved.id}
                      aria-label={`Remove ${property.title} from saved properties`}
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#B91C1C] shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {removingId === saved.id ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#B91C1C] border-t-transparent" />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>

                  {/* Property Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                          {property.property_type || "Property"}
                        </p>

                        <h2 className="mt-1 line-clamp-2 text-lg font-bold text-[#24171C]">
                          {property.title}
                        </h2>

                        <p className="mt-2 flex items-start gap-1.5 text-sm text-[#756970]">
                          <MapPin
                            size={16}
                            className="mt-0.5 shrink-0"
                          />

                          <span className="line-clamp-2">
                            {property.location}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="text-lg font-bold text-[#7A1F3D]">
                        {formatCurrency(property.annual_rent)}
                      </p>

                      <p className="mt-0.5 text-xs text-[#756970]">
                        Annual rent
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 border-y border-[#E8DDE1] py-4">
                      <div className="flex items-center gap-2 text-sm text-[#756970]">
                        <BedDouble size={17} />
                        <span>
                          {property.bedrooms ?? 0}{" "}
                          {property.bedrooms === 1
                            ? "Bedroom"
                            : "Bedrooms"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-[#756970]">
                        <Bath size={17} />
                        <span>
                          {property.bathrooms ?? 0}{" "}
                          {property.bathrooms === 1 ? "Bath" : "Baths"}
                        </span>
                      </div>
                    </div>

                    {riskLabel && (
                      <div className="mt-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getRiskClasses(
                            property.risk_score
                          )}`}
                        >
                          {riskLabel}
                        </span>
                      </div>
                    )}

                    <Link
                      to={`/properties/${property.id}`}
                      className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                    >
                      View Property
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Safety Note */}
        <div className="mt-8 rounded-xl border border-[#E8DDE1] bg-white px-5 py-4">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={18}
              className="mt-0.5 shrink-0 text-[#7A1F3D]"
            />

            <p className="text-xs leading-5 text-[#756970]">
              <span className="font-semibold text-[#24171C]">
                Remember:
              </span>{" "}
              A verification status or risk indicator is intended to support
              your assessment. It does not guarantee that a property, agent,
              landlord, or transaction is legitimate. Perform appropriate
              independent checks before making payments.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SavedProperties;