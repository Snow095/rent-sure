import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileCheck2,
  FileText,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../../services/supabase/client";
import { useAuth } from "../../../context/useAuth";

function StatusBadge({ status }) {
  const config = {
    pending: {
      label: "Pending review",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    needs_information: {
      label: "Needs information",
      className: "border-orange-200 bg-orange-50 text-orange-700",
    },
    verified: {
      label: "Verified",
      className: "border-green-200 bg-green-50 text-green-700",
    },
    rejected: {
      label: "Rejected",
      className: "border-red-200 bg-red-50 text-red-700",
    },
  };

  const item = config[status] || {
    label: "Not reviewed",
    className: "border-[#E8DDE1] bg-[#FAF8F9] text-[#756970]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${item.className}`}
    >
      <ShieldCheck size={14} />
      {item.label}
    </span>
  );
}

function AgentVerification() {
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    let cancelled = false;

    const loadVerification = async () => {
      const { data: propertyData, error: propertyError } =
        await supabase
          .from("properties")
          .select(
            "id, title, location, verification_status, property_status, risk_score, created_at"
          )
          .eq("agent_id", user.id)
          .order("created_at", {
            ascending: false,
          });

      if (cancelled) {
        return;
      }

      if (propertyError) {
        console.error(
          "Error loading agent properties:",
          propertyError
        );

        setError(
          "We couldn't load your properties. Please try again."
        );
        setProperties([]);
        setLoading(false);
        return;
      }

      const propertyRows = propertyData || [];
      const propertyIds = propertyRows.map(
        (property) => property.id
      );

      if (propertyIds.length === 0) {
        setProperties([]);
        setError("");
        setLoading(false);
        return;
      }

      const { data: verificationData, error: verificationError } =
        await supabase
          .from("property_verifications")
          .select(
            "id, property_id, submitted_by, status, document_count, review_notes, reviewed_by, reviewed_at, created_at, updated_at"
          )
          .in("property_id", propertyIds)
          .order("created_at", {
            ascending: false,
          });

      if (cancelled) {
        return;
      }

      if (verificationError) {
        console.error(
          "Error loading property verifications:",
          verificationError
        );
      }

      const verificationRows = verificationData || [];
      const latestVerificationByProperty = {};

      verificationRows.forEach((verification) => {
        if (
          !latestVerificationByProperty[
            verification.property_id
          ]
        ) {
          latestVerificationByProperty[
            verification.property_id
          ] = verification;
        }
      });

      const verificationIds = verificationRows.map(
        (verification) => verification.id
      );

      let documentCounts = {};

      if (verificationIds.length > 0) {
        const {
          data: documentData,
          error: documentError,
        } = await supabase
          .from("verification_documents")
          .select("id, verification_id")
          .in("verification_id", verificationIds);

        if (cancelled) {
          return;
        }

        if (documentError) {
          console.error(
            "Error loading verification documents:",
            documentError
          );
        } else {
          documentCounts = (documentData || []).reduce(
            (counts, document) => {
              counts[document.verification_id] =
                (counts[document.verification_id] || 0) + 1;

              return counts;
            },
            {}
          );
        }
      }

      const enrichedProperties = propertyRows.map(
        (property) => {
          const verification =
            latestVerificationByProperty[property.id] || null;

          const documentCount = verification
            ? documentCounts[verification.id] ??
              verification.document_count ??
              0
            : 0;

          return {
            ...property,
            verification,
            effectiveVerificationStatus:
              verification?.status ||
              property.verification_status ||
              null,
            documentCount,
          };
        }
      );

      setProperties(enrichedProperties);
      setError("");
      setLoading(false);
    };

    loadVerification();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F9]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 rounded bg-[#E8DDE1]" />
            <div className="h-20 rounded-2xl bg-white" />
            <div className="h-96 rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Link
          to="/agent/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:text-[#4A1025]"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <section className="mt-6">
          <p className="text-sm font-semibold text-[#7A1F3D]">
            Property verification
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
            Verification center
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
            Review the verification status of your properties
            and provide supporting documents where required.
          </p>
        </section>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
              <FileCheck2 size={21} />
            </div>

            <div>
              <h2 className="font-bold text-[#24171C]">
                How verification works
              </h2>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-[#756970]">
                Submit the requested supporting documents for
                each property. Administrators review the
                submitted information before a property receives
                verified status.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          {properties.map((property) => {
            const verificationStatus =
              property.effectiveVerificationStatus;

            const verification =
              property.verification;

            return (
              <article
                key={property.id}
                className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-[#24171C]">
                        {property.title}
                      </h2>

                      <StatusBadge
                        status={verificationStatus}
                      />
                    </div>

                    <p className="mt-1 text-sm text-[#756970]">
                      {property.location}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#756970]">
                      <span>
                        Property status:{" "}
                        <strong className="capitalize text-[#24171C]">
                          {property.property_status ||
                            "Not specified"}
                        </strong>
                      </span>

                      <span>
                        Risk score:{" "}
                        <strong className="text-[#24171C]">
                          {property.risk_score ??
                            "Not scored"}
                        </strong>
                      </span>

                      <span>
                        Documents:{" "}
                        <strong className="text-[#24171C]">
                          {property.documentCount}
                        </strong>
                      </span>
                    </div>

                    {verification?.review_notes && (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <p className="text-xs font-semibold text-amber-900">
                          Review note
                        </p>

                        <p className="mt-1 text-sm leading-5 text-amber-800">
                          {verification.review_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link
                      to={`/agent/verification/${property.id}/details`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8DDE1] px-4 py-2.5 text-sm font-semibold text-[#24171C] hover:border-[#7A1F3D] hover:text-[#7A1F3D]"
                    >
                      View details
                      <ArrowRight size={16} />
                    </Link>

                    {verificationStatus !== "verified" && (
                      <Link
                        to={`/agent/verification/${property.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7A1F3D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4A1025]"
                      >
                        <Upload size={16} />
                        Documents
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {properties.length === 0 && (
            <div className="rounded-2xl border border-[#E8DDE1] bg-white p-10 text-center shadow-sm">
              <FileText
                size={38}
                className="mx-auto text-[#7A1F3D]"
                strokeWidth={1.5}
              />

              <h2 className="mt-4 font-bold text-[#24171C]">
                No properties to verify
              </h2>

              <p className="mt-2 text-sm text-[#756970]">
                Add a property first, then submit its supporting
                information.
              </p>

              <Link
                to="/agent/add-property"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white"
              >
                Add property
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-[#7A1F3D]"
            />

            <p className="text-sm leading-6 text-[#756970]">
              RentSure verification is a structured review and
              fraud-awareness mechanism. A verified status does
              not guarantee legal ownership, title validity, or
              transaction safety.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AgentVerification;