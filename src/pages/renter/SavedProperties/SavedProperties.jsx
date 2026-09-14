
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MapPin,
  BedDouble,
  Bath,
  ArrowRight,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../services/supabase/client";

function SavedProperties() {
  const { user } = useAuth();

  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchSavedProperties = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("saved_properties")
        .select(`
          id,
          property_id,
          created_at,
          properties (
            id,
            title,
            location,
            property_type,
            annual_rent,
            bedrooms,
            bathrooms,
            verification_status,
            property_status
          )
        `)
        .eq("renter_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching saved properties:", error);

        setErrorMessage(
          error.message || "Unable to load your saved properties."
        );

        setSavedProperties([]);
      } else {
        setSavedProperties(
          (data || []).filter(
            (item) =>
              item.properties &&
              item.properties.property_status === "active"
          )
        );
      }

      setLoading(false);
    };

    fetchSavedProperties();
  }, [user]);

  const handleRemove = async (savedId) => {
    setRemovingId(savedId);
    setErrorMessage("");

    const { error } = await supabase
      .from("saved_properties")
      .delete()
      .eq("id", savedId)
      .eq("renter_id", user.id);

    if (error) {
      console.error("Error removing saved property:", error);

      setErrorMessage(
        error.message || "Unable to remove the saved property."
      );

      setRemovingId(null);
      return;
    }

    setSavedProperties((previous) =>
      previous.filter((item) => item.id !== savedId)
    );

    setRemovingId(null);
  };

  const formatRent = (rent) => {
    if (rent === null || rent === undefined) {
      return "Rent unavailable";
    }

    return `₦${Number(rent).toLocaleString("en-NG")}/year`;
  };

  return (
    <main className="min-h-screen bg-[#FAF8F9] px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
      <div className="mx-auto w-full max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <Link
            to="/renter/dashboard"
            className="text-sm font-semibold text-[#7A1F3D] hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EDEF]">
                <Heart
                  size={24}
                  className="text-[#7A1F3D]"
                />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                  Saved Properties
                </h1>

                <p className="mt-1 text-sm text-[#756970]">
                  Properties you've saved for later.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-[#F3C7C7] bg-[#FDECEC] p-4 text-sm text-[#B91C1C]">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-1 leading-6">
                {errorMessage}
              </p>
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
              Loading your saved properties...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          savedProperties.length === 0 &&
          !errorMessage && (
            <div className="rounded-2xl border border-[#E8DDE1] bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8EDEF]">
                <Heart
                  size={30}
                  className="text-[#7A1F3D]"
                />
              </div>

              <h2 className="mt-6 text-xl font-bold text-[#24171C]">
                No saved properties
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756970]">
                When you find a property you're interested in,
                save it so you can easily come back to it later.
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

        {/* Property Grid */}
        {!loading && savedProperties.length > 0 && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-medium text-[#756970]">
                {savedProperties.length}{" "}
                {savedProperties.length === 1
                  ? "saved property"
                  : "saved properties"}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {savedProperties.map((saved) => {
                const property = saved.properties;

                return (
                  <article
                    key={saved.id}
                    className="overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* Property Visual */}
                    <div className="relative flex h-48 items-center justify-center bg-[#F8EDEF]">
                      <div className="text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
                          <MapPin
                            size={27}
                            className="text-[#7A1F3D]"
                          />
                        </div>

                        <p className="mt-3 text-xs font-medium text-[#756970]">
                          Property Preview
                        </p>
                      </div>

                      <div className="absolute right-4 top-4 rounded-full bg-white p-2 shadow-sm">
                        <Heart
                          size={18}
                          className="fill-[#7A1F3D] text-[#7A1F3D]"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <span className="rounded-full bg-[#F8EDEF] px-3 py-1 text-xs font-semibold text-[#7A1F3D]">
                          {property.property_type}
                        </span>

                        {property.verification_status ===
                          "verified" && (
                          <span className="rounded-full bg-[#E8F5EC] px-3 py-1 text-xs font-semibold text-[#15803D]">
                            Verified
                          </span>
                        )}
                      </div>

                      <h2 className="mt-4 line-clamp-2 text-lg font-bold leading-7 text-[#24171C]">
                        {property.title}
                      </h2>

                      <div className="mt-3 flex items-start gap-2 text-sm text-[#756970]">
                        <MapPin
                          size={17}
                          className="mt-0.5 shrink-0 text-[#7A1F3D]"
                        />

                        <span>{property.location}</span>
                      </div>

                      <div className="mt-5 flex items-center gap-5 border-y border-[#E8DDE1] py-4 text-sm text-[#756970]">
                        <span className="flex items-center gap-2">
                          <BedDouble
                            size={17}
                            className="text-[#7A1F3D]"
                          />
                          {property.bedrooms} beds
                        </span>

                        <span className="flex items-center gap-2">
                          <Bath
                            size={17}
                            className="text-[#7A1F3D]"
                          />
                          {property.bathrooms} baths
                        </span>
                      </div>

                      <div className="mt-5">
                        <p className="text-xs font-medium uppercase tracking-wide text-[#756970]">
                          Annual Rent
                        </p>

                        <p className="mt-1 text-xl font-bold text-[#7A1F3D]">
                          {formatRent(property.annual_rent)}
                        </p>
                      </div>

                      <div className="mt-6 flex flex-col gap-3">
                        <Link
                          to={`/properties/${property.id}`}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                        >
                          View Property
                          <ArrowRight size={16} />
                        </Link>

                        <button
                          type="button"
                          disabled={removingId === saved.id}
                          onClick={() => handleRemove(saved.id)}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] px-4 py-3 text-sm font-semibold text-[#B91C1C] transition hover:bg-[#FDECEC] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {removingId === saved.id ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}

                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
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
                Saving a property is not a verification
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#756970]">
                A saved property is simply one you're interested in.
                Always review its verification status, property
                details, and risk information before making rental
                decisions or payments.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

export default SavedProperties;

