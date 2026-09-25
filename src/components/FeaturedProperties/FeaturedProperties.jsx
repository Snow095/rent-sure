import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  BedDouble,
  Bath,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { supabase } from "../../services/supabase/client";

const FEATURED_PROPERTY_IDS = [ 2, 3, 4];
const PROPERTY_IMAGE_BUCKET = "property-images";

function FeaturedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchFeaturedProperties = async () => {
    try {
      const {
        data: propertyData,
        error: propertyError,
      } = await supabase
        .from("properties")
        .select(`
          id,
          title,
          location,
          property_type,
          annual_rent,
          bedrooms,
          bathrooms,
          verification_status,
          property_status,
          created_at,
          updated_at
        `)
        .in("id", FEATURED_PROPERTY_IDS)
        .eq("verification_status", "verified")
        .order("id", {
          ascending: true,
        });

      if (propertyError) {
        throw propertyError;
      }

      const verifiedProperties = propertyData || [];

      if (verifiedProperties.length === 0) {
        setProperties([]);
        setErrorMessage("");
        return;
      }

      const propertyIds = verifiedProperties.map(
        (property) => property.id
      );

      const {
        data: imageData,
        error: imageError,
      } = await supabase
        .from("property_images")
        .select(`
          id,
          property_id,
          file_path,
          file_name,
          display_order,
          created_at
        `)
        .in("property_id", propertyIds)
        .order("display_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: true,
        });

      if (imageError) {
        throw imageError;
      }

      const imagesByProperty = {};

      (imageData || []).forEach((image) => {
        const {
          data: publicUrlData,
        } = supabase.storage
          .from(PROPERTY_IMAGE_BUCKET)
          .getPublicUrl(image.file_path);

        if (!imagesByProperty[image.property_id]) {
          imagesByProperty[image.property_id] = [];
        }

        imagesByProperty[image.property_id].push({
          ...image,
          publicUrl:
            publicUrlData?.publicUrl || "",
        });
      });

      const formattedProperties =
        verifiedProperties.map((property) => ({
          ...property,
          images:
            imagesByProperty[property.id] || [],
        }));

      setProperties(formattedProperties);
      setErrorMessage("");
    } catch (error) {
      console.error(
        "Error loading featured properties:",
        error
      );

      setProperties([]);
      setErrorMessage(
        error.message ||
          "Unable to load featured properties."
      );
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadFeaturedProperties = async () => {
      if (!mounted) {
        return;
      }

      setLoading(true);

      await fetchFeaturedProperties();

      if (mounted) {
        setLoading(false);
      }
    };

    loadFeaturedProperties();

    /*
     * Update when a property changes.
     */
    const propertiesChannel = supabase
      .channel("featured-properties")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "properties",
        },
        (payload) => {
          const changedPropertyId =
            payload.new?.id ||
            payload.old?.id;

          if (
            FEATURED_PROPERTY_IDS.includes(
              Number(changedPropertyId)
            )
          ) {
            fetchFeaturedProperties();
          }
        }
      )
      .subscribe();

    /*
     * Update when property images change.
     */
    const propertyImagesChannel = supabase
      .channel("featured-property-images")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "property_images",
        },
        (payload) => {
          const changedPropertyId =
            payload.new?.property_id ||
            payload.old?.property_id;

          if (
            FEATURED_PROPERTY_IDS.includes(
              Number(changedPropertyId)
            )
          ) {
            fetchFeaturedProperties();
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;

      supabase.removeChannel(
        propertiesChannel
      );

      supabase.removeChannel(
        propertyImagesChannel
      );
    };
  }, []);

  return (
    <section className="bg-[#FAF8F9]">
      <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28 xl:px-12 xl:py-32">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-[#F8EDEF] px-4 py-2 text-sm font-semibold text-[#7A1F3D]">
              Featured Properties
            </span>

            <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-[#2D0A17] sm:text-4xl lg:text-5xl">
              Find a place that feels like home.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-8 text-[#756970] sm:text-lg">
              Explore selected rental properties with
              verification information to help you make more
              informed decisions.
            </p>
          </div>

          <Link
            to="/properties"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border border-[#E8DDE1] bg-white px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:border-[#7A1F3D] hover:bg-[#F8EDEF]"
          >
            View all properties
            <ArrowRight size={17} />
          </Link>
        </div>

        {loading && (
          <div className="mt-12 flex min-h-60 items-center justify-center rounded-2xl border border-[#E8DDE1] bg-white sm:mt-14 lg:mt-16">
            <div className="text-center">
              <Loader2
                size={30}
                className="mx-auto animate-spin text-[#7A1F3D]"
              />

              <p className="mt-3 text-sm font-medium text-[#756970]">
                Loading featured properties...
              </p>
            </div>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-6 sm:mt-14 lg:mt-16">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-700"
              />

              <div>
                <p className="font-semibold text-red-800">
                  Unable to load featured properties
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading &&
          !errorMessage &&
          properties.length === 0 && (
            <div className="mt-12 rounded-2xl border border-[#E8DDE1] bg-white p-10 text-center sm:mt-14 lg:mt-16">
              <ShieldCheck
                size={34}
                className="mx-auto text-[#7A1F3D]"
                strokeWidth={1.5}
              />

              <h3 className="mt-4 text-lg font-bold text-[#24171C]">
                No featured properties yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756970]">
                Properties will appear here once they
                have been verified.
              </p>
            </div>
          )}

        {!loading &&
          !errorMessage &&
          properties.length > 0 && (
            <div className="mt-12 grid grid-cols-1 gap-6 sm:mt-14 md:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-7">
              {properties.map((property) => {
                const primaryImage =
                  property.images?.[0]?.publicUrl;

                return (
                  <article
                    key={property.id}
                    className="overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-60 overflow-hidden bg-[#4A1025] sm:h-64">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={property.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative h-36 w-48 rounded-t-xl bg-white shadow-lg">
                            <div className="absolute -top-10 left-1/2 h-16 w-52 -translate-x-1/2 rotate-45 rounded-tl-xl bg-[#7A1F3D]" />

                            <div className="absolute bottom-0 left-1/2 h-20 w-11 -translate-x-1/2 rounded-t-md bg-[#7A1F3D]" />

                            <div className="absolute left-4 top-9 h-9 w-9 rounded-md border-4 border-[#7A1F3D] bg-[#F8EDEF]" />

                            <div className="absolute right-4 top-9 h-9 w-9 rounded-md border-4 border-[#7A1F3D] bg-[#F8EDEF]" />
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                      <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#4A1025] shadow-sm sm:left-5 sm:top-5">
                        {property.property_type}
                      </div>

                      <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[#E8F5EC] px-3 py-1.5 text-xs font-semibold text-[#15803D] shadow-sm sm:right-5 sm:top-5">
                        <ShieldCheck size={14} />
                        Verified
                      </div>
                    </div>

                    <div className="p-6 sm:p-7">
                      <h3 className="text-lg font-bold leading-7 text-[#24171C]">
                        {property.title}
                      </h3>

                      <div className="mt-3 flex items-start gap-2 text-sm text-[#756970]">
                        <MapPin
                          size={17}
                          className="mt-0.5 shrink-0 text-[#7A1F3D]"
                        />

                        <span>
                          {property.location}
                        </span>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-[#E8DDE1] py-5">
                        <div className="flex items-center gap-2 text-sm text-[#756970]">
                          <BedDouble
                            size={17}
                            className="text-[#7A1F3D]"
                          />

                          <span>
                            {property.bedrooms ?? 0} Beds
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[#756970]">
                          <Bath
                            size={17}
                            className="text-[#7A1F3D]"
                          />

                          <span>
                            {property.bathrooms ?? 0} Baths
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs font-medium text-[#756970]">
                            Annual rent
                          </p>

                          <p className="mt-1 text-xl font-bold text-[#24171C]">
                            ₦
                            {formatAmount(
                              property.annual_rent
                            )}

                            <span className="ml-1 text-xs font-medium text-[#756970]">
                              / year
                            </span>
                          </p>
                        </div>

                        <Link
                          to={`/properties/${property.id}`}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                        >
                          View Property
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </div>
    </section>
  );
}

function formatAmount(amount) {
  return new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

export default FeaturedProperties;