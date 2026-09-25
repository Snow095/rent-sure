import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  BedDouble,
  Bath,
  ShieldCheck,
  AlertTriangle,
  UserRound,
  CalendarDays,
  Loader2,
  AlertCircle,
  Clock3,
  Heart,
  Image as ImageIcon,
} from "lucide-react";

import RiskScore from "../../components/RiskScore/RiskScore";
import VerificationBadge from "../../components/VerificationBadge/VerificationBadge";

import { useAuth } from "../../context/useAuth";
import { supabase } from "../../services/supabase/client";

const PROPERTY_IMAGE_BUCKET = "property-images";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [agent, setAgent] = useState(null);
  const [verification, setVerification] = useState(null);
  const [propertyImages, setPropertyImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] =
    useState(0);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [savingProperty, setSavingProperty] =
    useState(false);
  const [saveMessage, setSaveMessage] =
    useState("");

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    let mounted = true;

    const fetchPropertyDetails = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const propertyId = Number(id);

        if (!Number.isInteger(propertyId)) {
          throw new Error("Invalid property ID.");
        }

        /*
         * Load the property directly from the database.
         */
        const {
          data: propertyData,
          error: propertyError,
        } = await supabase
          .from("properties")
          .select(`
            id,
            agent_id,
            title,
            location,
            property_type,
            annual_rent,
            bedrooms,
            bathrooms,
            description,
            verification_status,
            property_status,
            risk_score,
            created_at,
            updated_at
          `)
          .eq("id", propertyId)
          .maybeSingle();

        if (propertyError) {
          throw propertyError;
        }

        if (!propertyData) {
          throw new Error(
            "This property could not be found."
          );
        }

        if (!mounted) {
          return;
        }

        setProperty(propertyData);

        /*
         * Load the agent profile.
         */
        if (propertyData.agent_id) {
          const {
            data: agentData,
            error: agentError,
          } = await supabase
            .from("profiles")
            .select(`
              id,
              full_name,
              role
            `)
            .eq("id", propertyData.agent_id)
            .eq("role", "agent")
            .maybeSingle();

          if (agentError) {
            console.error(
              "Error loading property agent:",
              agentError
            );
          }

          if (mounted) {
            setAgent(agentData ?? null);
          }
        } else if (mounted) {
          setAgent(null);
        }

        /*
         * Load the latest verification record.
         */
        const {
          data: verificationData,
          error: verificationError,
        } = await supabase
          .from("property_verifications")
          .select(`
            id,
            property_id,
            status,
            document_count,
            review_notes,
            reviewed_at,
            created_at,
            updated_at
          `)
          .eq("property_id", propertyId)
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (verificationError) {
          console.error(
            "Error loading property verification:",
            verificationError
          );
        }

        if (mounted) {
          setVerification(
            verificationData ?? null
          );
        }

        /*
         * Load the property's uploaded images.
         */
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
            file_type,
            file_size,
            display_order,
            created_at
          `)
          .eq("property_id", propertyId)
          .order("display_order", {
            ascending: true,
          })
          .order("created_at", {
            ascending: true,
          });

        if (imageError) {
          throw imageError;
        }

        const formattedImages = (
          imageData || []
        )
          .map((image) => {
            const {
              data: publicUrlData,
            } = supabase.storage
              .from(PROPERTY_IMAGE_BUCKET)
              .getPublicUrl(
                image.file_path
              );

            return {
              ...image,
              publicUrl:
                publicUrlData?.publicUrl || "",
            };
          })
          .filter(
            (image) => Boolean(image.publicUrl)
          );

        if (mounted) {
          setPropertyImages(formattedImages);
          setActiveImageIndex(0);
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        console.error(
          "Error fetching property details:",
          error
        );

        setErrorMessage(
          error.message ||
            "Unable to load this property."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPropertyDetails();

    /*
     * Keep the property details page synchronized with
     * database changes.
     */
    const propertiesChannel = supabase
      .channel(
        `property-details-${id}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "properties",
          filter: `id=eq.${id}`,
        },
        () => {
          fetchPropertyDetails();
        }
      )
      .subscribe();

    const imagesChannel = supabase
      .channel(
        `property-images-${id}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "property_images",
          filter: `property_id=eq.${id}`,
        },
        () => {
          fetchPropertyDetails();
        }
      )
      .subscribe();

    const verificationChannel = supabase
      .channel(
        `property-verification-${id}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "property_verifications",
          filter: `property_id=eq.${id}`,
        },
        () => {
          fetchPropertyDetails();
        }
      )
      .subscribe();

    return () => {
      mounted = false;

      supabase.removeChannel(
        propertiesChannel
      );

      supabase.removeChannel(imagesChannel);

      supabase.removeChannel(
        verificationChannel
      );
    };
  }, [id]);

  /*
   * Check whether the current renter has already
   * saved this property.
   */
  useEffect(() => {
    const checkSavedProperty = async () => {
      if (!user || !id) {
        setIsSaved(false);
        return;
      }

      const propertyId = Number(id);

      if (!Number.isInteger(propertyId)) {
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("saved_properties")
        .select("id")
        .eq("renter_id", user.id)
        .eq("property_id", propertyId)
        .maybeSingle();

      if (error) {
        console.error(
          "Error checking saved property:",
          error
        );
        return;
      }

      setIsSaved(Boolean(data));
    };

    checkSavedProperty();
  }, [user, id]);

  /*
   * Save or remove the current property.
   */
  const handleToggleSave = async () => {
    if (!user) {
      navigate("/login", {
        state: {
          from: `/properties/${id}`,
        },
      });

      return;
    }

    const propertyId = Number(id);

    if (!Number.isInteger(propertyId)) {
      setSaveMessage(
        "Unable to save this property."
      );
      return;
    }

    setSavingProperty(true);
    setSaveMessage("");

    try {
      if (isSaved) {
        const { error } = await supabase
          .from("saved_properties")
          .delete()
          .eq("renter_id", user.id)
          .eq("property_id", propertyId);

        if (error) {
          throw error;
        }

        setIsSaved(false);
        setSaveMessage(
          "Property removed from your saved properties."
        );
      } else {
        const { error } = await supabase
          .from("saved_properties")
          .insert({
            renter_id: user.id,
            property_id: propertyId,
          });

        if (error) {
          throw error;
        }

        setIsSaved(true);
        setSaveMessage(
          "Property saved successfully."
        );
      }
    } catch (error) {
      console.error(
        "Error updating saved property:",
        error
      );

      if (error.code === "23505") {
        setIsSaved(true);
        setSaveMessage(
          "This property is already saved."
        );
      } else {
        setSaveMessage(
          error.message ||
            "Unable to update your saved property."
        );
      }
    } finally {
      setSavingProperty(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F9] px-5 py-16">
        <div className="text-center">
          <Loader2
            size={36}
            className="mx-auto animate-spin text-[#7A1F3D]"
          />

          <p className="mt-4 text-sm font-medium text-[#756970]">
            Loading property details...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !property) {
    return (
      <main className="min-h-screen bg-[#FAF8F9] px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FDECEC]">
              <AlertCircle
                size={30}
                className="text-[#B91C1C]"
              />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-[#24171C]">
              Property unavailable
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756970]">
              {errorMessage ||
                "This property could not be found or is no longer available."}
            </p>

            <Link
              to="/properties"
              className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
            >
              <ArrowLeft size={17} />
              Back to Properties
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const verificationStatus =
    verification?.status ||
    property.verification_status ||
    "pending";

  const activeImage =
    propertyImages[activeImageIndex] ||
    propertyImages[0] ||
    null;

  return (
    <main className="min-h-screen bg-[#FAF8F9] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
      <div className="mx-auto w-full max-w-7xl">
        {/* Back */}
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
        >
          <ArrowLeft size={17} />
          Back to Properties
        </Link>

        {/* Header */}
        <section className="mt-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#F8EDEF] px-3 py-1.5 text-xs font-semibold text-[#4A1025]">
                  {property.property_type}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    getVerificationDetails(
                      property.verification_status
                    ).className
                  }`}
                >
                  {
                    getVerificationDetails(
                      property.verification_status
                    ).icon
                  }

                  {
                    getVerificationDetails(
                      property.verification_status
                    ).label
                  }
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl lg:text-5xl">
                {property.title}
              </h1>

              <div className="mt-4 flex items-start gap-2 text-sm text-[#756970] sm:text-base">
                <MapPin
                  size={19}
                  className="mt-0.5 shrink-0 text-[#7A1F3D]"
                />

                <span>
                  {property.location}
                </span>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl border border-[#E8DDE1] bg-white px-6 py-5 shadow-sm">
              <p className="text-xs font-medium text-[#756970]">
                Annual Rent
              </p>

              <p className="mt-1 text-2xl font-bold text-[#7A1F3D]">
                ₦
                {formatAmount(
                  property.annual_rent
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Property Images */}
        <section className="mt-10 overflow-hidden rounded-3xl border border-[#E8DDE1] bg-white shadow-sm">
          <div className="relative bg-[#4A1025]">
            <div className="relative h-[340px] sm:h-[440px] lg:h-[540px]">
              {activeImage?.publicUrl ? (
                <img
                  src={activeImage.publicUrl}
                  alt={
                    activeImage.file_name ||
                    property.title
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#4A1025]">
                  <div className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
                      <ImageIcon
                        size={36}
                        className="text-white/70"
                      />
                    </div>

                    <p className="mt-4 text-sm font-medium text-white/70">
                      No property images available
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />

              <div className="absolute bottom-5 left-5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                {propertyImages.length > 0
                  ? `${activeImageIndex + 1} / ${propertyImages.length}`
                  : "Property image"}
              </div>
            </div>

            {propertyImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto bg-[#4A1025] p-4 sm:p-5">
                {propertyImages.map(
                  (image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() =>
                        setActiveImageIndex(index)
                      }
                      className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-24 sm:w-32 ${
                        activeImageIndex === index
                          ? "border-white"
                          : "border-white/20 hover:border-white/60"
                      }`}
                      aria-label={`View property image ${
                        index + 1
                      }`}
                    >
                      <img
                        src={image.publicUrl}
                        alt={
                          image.file_name ||
                          `${property.title} image ${
                            index + 1
                          }`
                        }
                        className="h-full w-full object-cover"
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </section>

        {/* Main Content */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.55fr_0.85fr]">
          {/* Left */}
          <div className="space-y-8">
            {/* Overview */}
            <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-[#24171C]">
                Property Overview
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                <OverviewItem
                  icon={BedDouble}
                  label="Bedrooms"
                  value={property.bedrooms}
                />

                <OverviewItem
                  icon={Bath}
                  label="Bathrooms"
                  value={property.bathrooms}
                />

                <OverviewItem
                  icon={ShieldCheck}
                  label="Verification"
                  value={
                    getVerificationDetails(
                      property.verification_status
                    ).label
                  }
                />
              </div>
            </section>

            {/* Description */}
            <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-[#24171C]">
                About This Property
              </h2>

              <p className="mt-5 text-sm leading-7 text-[#756970]">
                {property.description ||
                  "No detailed description has been provided for this property yet."}
              </p>
            </section>

            {/* Verification */}
            <section className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#7A1F3D]">
                  Trust & Verification
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#24171C]">
                  RentSure verification
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#756970]">
                  RentSure reviews submitted property
                  information and supporting documents to help
                  renters make more informed decisions.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                      Verification Status
                    </p>

                    <div className="mt-2">
                      <VerificationBadge
                        status={verificationStatus}
                      />
                    </div>
                  </div>

                  {verification?.reviewed_at && (
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-[#756970]">
                        Last reviewed
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#24171C]">
                        {new Date(
                          verification.reviewed_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-[#FAF8F9] p-4">
                    <p className="text-xs text-[#756970]">
                      Verification documents
                    </p>

                    <p className="mt-1 text-xl font-bold text-[#24171C]">
                      {verification?.document_count ??
                        0}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FAF8F9] p-4">
                    <p className="text-xs text-[#756970]">
                      Review status
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#24171C]">
                      {verification?.status ===
                      "verified"
                        ? "Completed"
                        : verification?.status ===
                            "rejected"
                          ? "Rejected"
                          : verification?.status ===
                              "needs_information"
                            ? "Needs information"
                            : "In progress"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FAF8F9] p-4">
                    <p className="text-xs text-[#756970]">
                      RentSure score
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#24171C]">
                      {property.risk_score !==
                        null &&
                      property.risk_score !==
                        undefined
                        ? `${property.risk_score}/100`
                        : "Not scored"}
                    </p>
                  </div>
                </div>

                {verification?.review_notes && (
                  <div className="mt-5 rounded-xl border border-[#E8DDE1] bg-[#FAF8F9] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                      Review information
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#24171C]">
                      {verification.review_notes}
                    </p>
                  </div>
                )}
              </div>

              <RiskScore
                score={
                  property.risk_score ?? null
                }
                status={verificationStatus}
              />

              <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
                <h3 className="text-lg font-bold text-[#24171C]">
                  Verification factors
                </h3>

                <div className="mt-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ECFDF3]">
                      <span className="h-2 w-2 rounded-full bg-[#15803D]" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#24171C]">
                        Property submitted to
                        RentSure
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#756970]">
                        The property has been submitted
                        through the RentSure listing
                        workflow.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        (verification?.document_count ??
                          0) > 0
                          ? "bg-[#ECFDF3]"
                          : "bg-[#FFF7ED]"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          (verification?.document_count ??
                            0) > 0
                            ? "bg-[#15803D]"
                            : "bg-[#B45309]"
                        }`}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#24171C]">
                        Supporting documents
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#756970]">
                        {verification?.document_count >
                        0
                          ? `${verification.document_count} document${
                              verification.document_count ===
                              1
                                ? ""
                                : "s"
                            } submitted for review.`
                          : "No supporting documents have been recorded yet."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        verification?.status ===
                        "verified"
                          ? "bg-[#ECFDF3]"
                          : verification?.status ===
                              "rejected"
                            ? "bg-[#FEF2F2]"
                            : "bg-[#FFF7ED]"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          verification?.status ===
                          "verified"
                            ? "bg-[#15803D]"
                            : verification?.status ===
                                "rejected"
                              ? "bg-[#B91C1C]"
                              : "bg-[#B45309]"
                        }`}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#24171C]">
                        Administrative review
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#756970]">
                        {verification?.status ===
                        "verified"
                          ? "The submitted verification information passed the current RentSure review."
                          : verification?.status ===
                              "rejected"
                            ? "The property did not pass the current RentSure verification review."
                            : "The property has not completed the final RentSure review."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right */}
          <aside className="space-y-8">
            {/* Agent */}
            <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-lg font-bold text-[#24171C]">
                Listed By
              </h2>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F8EDEF]">
                  <UserRound
                    size={25}
                    className="text-[#7A1F3D]"
                  />
                </div>

                <div>
                  <p className="font-bold text-[#24171C]">
                    {agent?.full_name ||
                      "Verified Agent"}
                  </p>

                  <p className="mt-1 text-sm text-[#756970]">
                    RentSure Agent
                  </p>
                </div>
              </div>

              <Link
                to="/agents"
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] px-5 py-3 text-sm font-semibold text-[#24171C] transition hover:border-[#7A1F3D] hover:text-[#7A1F3D]"
              >
                View Agent Profile
                <ArrowRight size={16} />
              </Link>
            </section>

            {/* Viewing + Save */}
            <section className="rounded-2xl bg-[#7A1F3D] p-6 text-white shadow-sm sm:p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <CalendarDays size={23} />
              </div>

              <h2 className="mt-5 text-xl font-bold">
                Interested in this property?
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/75">
                Request a viewing and communicate your
                interest through the RentSure platform.
              </p>

              <Link
                to={`/properties/${property.id}/viewing`}
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
              >
                Request Viewing
                <ArrowRight size={16} />
              </Link>

              <button
                type="button"
                onClick={handleToggleSave}
                disabled={savingProperty}
                className={`mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isSaved
                    ? "border-white bg-white text-[#7A1F3D]"
                    : "border-white/30 bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                {savingProperty ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Heart
                    size={17}
                    className={
                      isSaved
                        ? "fill-current"
                        : ""
                    }
                  />
                )}

                {savingProperty
                  ? "Saving..."
                  : isSaved
                    ? "Saved Property"
                    : "Save Property"}
              </button>

              {saveMessage && (
                <p className="mt-3 text-center text-xs leading-5 text-white/80">
                  {saveMessage}
                </p>
              )}
            </section>

            {/* Report */}
            <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={20}
                  className="mt-0.5 shrink-0 text-[#B45309]"
                />

                <div>
                  <h2 className="font-bold text-[#24171C]">
                    Something doesn't look right?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#756970]">
                    Help RentSure identify suspicious
                    listings or concerning rental activity.
                  </p>
                </div>
              </div>

              <Link
                to={`/properties/${property.id}/report`}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[#E8DDE1] px-5 py-3 text-sm font-semibold text-[#B91C1C] transition hover:border-[#B91C1C]"
              >
                Report Property
              </Link>
            </section>
          </aside>
        </div>

        {/* Safety Warning */}
        <section className="mt-10 rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF4E5]">
              <AlertTriangle
                size={21}
                className="text-[#B45309]"
              />
            </div>

            <div>
              <h2 className="font-bold text-[#24171C]">
                Stay alert before making a payment
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#756970]">
                Never send money solely because a property
                appears on RentSure or has a verification
                status. Inspect the property, review relevant
                information, confirm the transaction details,
                and remain cautious of unusual payment
                requests.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function OverviewItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-[#FAF8F9] p-5">
      <Icon
        size={21}
        className="text-[#7A1F3D]"
      />

      <p className="mt-4 text-xs font-medium text-[#756970]">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-[#24171C]">
        {value}
      </p>
    </div>
  );
}

function getVerificationDetails(status) {
  switch (status) {
    case "verified":
      return {
        label: "Verified",
        className:
          "bg-[#E8F5EC] text-[#15803D]",
        icon: <ShieldCheck size={14} />,
      };

    case "under_review":
      return {
        label: "Under Review",
        className:
          "bg-[#F8EDEF] text-[#7A1F3D]",
        icon: <Clock3 size={14} />,
      };

    case "needs_information":
      return {
        label: "Needs Information",
        className:
          "bg-[#FFF4E5] text-[#B45309]",
        icon: <AlertCircle size={14} />,
      };

    case "rejected":
      return {
        label: "Rejected",
        className:
          "bg-[#FDECEC] text-[#B91C1C]",
        icon: <AlertCircle size={14} />,
      };

    case "pending":
    default:
      return {
        label: "Pending Verification",
        className:
          "bg-[#FFF4E5] text-[#B45309]",
        icon: <Clock3 size={14} />,
      };
  }
}

function formatAmount(amount) {
  return new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

export default PropertyDetails;