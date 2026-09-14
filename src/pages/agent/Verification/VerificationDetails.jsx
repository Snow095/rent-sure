
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  MapPin,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../services/supabase/client";

function VerificationDetails() {
  const { user } = useAuth();
  const { propertyId } = useParams();

  const [property, setProperty] = useState(null);
  const [verification, setVerification] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchVerificationDetails = async () => {
      if (!user?.id || !propertyId) {
        setErrorMessage("Verification information could not be identified.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        // Get the agent's property
        const { data: propertyData, error: propertyError } =
          await supabase
            .from("properties")
            .select(`
              id,
              title,
              location,
              property_type,
              annual_rent,
              verification_status,
              property_status
            `)
            .eq("id", propertyId)
            .eq("agent_id", user.id)
            .single();

        if (propertyError) {
          throw propertyError;
        }

        setProperty(propertyData);

        // Get the latest verification submission
        const { data: verificationData, error: verificationError } =
          await supabase
            .from("property_verifications")
            .select(`
              id,
              property_id,
              submitted_by,
              status,
              document_count,
              review_notes,
              reviewed_at,
              created_at,
              updated_at
            `)
            .eq("property_id", propertyId)
            .eq("submitted_by", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (verificationError) {
          throw verificationError;
        }

        setVerification(verificationData);

        // Get documents belonging to the verification
        if (verificationData?.id) {
          const { data: documentData, error: documentError } =
            await supabase
              .from("verification_documents")
              .select(`
                id,
                document_type,
                file_name,
                file_path,
                file_type,
                file_size,
                review_status,
                review_notes,
                created_at
              `)
              .eq("verification_id", verificationData.id)
              .eq("uploaded_by", user.id)
              .order("created_at", { ascending: false });

          if (documentError) {
            throw documentError;
          }

          setDocuments(documentData || []);
        } else {
          setDocuments([]);
        }
      } catch (error) {
        console.error(
          "Error loading verification details:",
          error
        );

        setErrorMessage(
          "We couldn't load the verification information. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationDetails();
  }, [user?.id, propertyId]);

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case "verified":
        return {
          label: "Verified",
          icon: CheckCircle2,
          className: "bg-[#E8F5EC] text-[#15803D]",
        };

      case "rejected":
        return {
          label: "Rejected",
          icon: XCircle,
          className: "bg-[#FEF2F2] text-[#B91C1C]",
        };

      case "needs_information":
        return {
          label: "Needs Information",
          icon: AlertCircle,
          className: "bg-[#FFF7E6] text-[#B45309]",
        };

      case "under_review":
        return {
          label: "Under Review",
          icon: Clock3,
          className: "bg-[#FFF7E6] text-[#B45309]",
        };

      default:
        return {
          label: "Pending",
          icon: Clock3,
          className: "bg-[#FFF7E6] text-[#B45309]",
        };
    }
  };

  const getDocumentStatus = (status) => {
    switch (status) {
      case "approved":
        return {
          label: "Approved",
          className: "bg-[#E8F5EC] text-[#15803D]",
        };

      case "rejected":
        return {
          label: "Rejected",
          className: "bg-[#FEF2F2] text-[#B91C1C]",
        };

      case "needs_information":
        return {
          label: "Needs Information",
          className: "bg-[#FFF7E6] text-[#B45309]",
        };

      default:
        return {
          label: "Pending Review",
          className: "bg-[#F3F4F6] text-[#4B5563]",
        };
    }
  };

  const formatDocumentType = (type) => {
    const labels = {
      identity: "Identity Document",
      ownership: "Ownership Document",
      authorization: "Authorization Document",
      property: "Property Document",
      other: "Other Document",
    };

    return labels[type] || "Document";
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F9] px-5">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-[#7A1F3D]"
          />

          <p className="mt-4 text-sm font-medium text-[#756970]">
            Loading verification details...
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
              size={27}
              className="text-[#B91C1C]"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[#24171C]">
            Property not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#756970]">
            We couldn't find a property associated with your account.
          </p>

          <Link
            to="/agent/properties"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
          >
            <ArrowLeft size={17} />
            Back to My Properties
          </Link>
        </div>
      </main>
    );
  }

  const verificationStatus = getStatusDetails(
    verification?.status || property.verification_status
  );

  const StatusIcon = verificationStatus.icon;

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      {/* Header */}
      <section className="border-b border-[#E8DDE1] bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-12">
          <Link
            to="/agent/properties"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:underline"
          >
            <ArrowLeft size={16} />
            Back to My Properties
          </Link>

          <div className="mt-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#7A1F3D]">
                Verification Center
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                {property.title}
              </h1>

              <div className="mt-3 flex items-center gap-2 text-sm text-[#756970]">
                <MapPin
                  size={17}
                  className="shrink-0 text-[#7A1F3D]"
                />
                {property.location}
              </div>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${verificationStatus.className}`}
            >
              <StatusIcon size={17} />
              {verificationStatus.label}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-12">
        {errorMessage && (
          <div className="mb-8 flex gap-3 rounded-xl border border-[#F1CACA] bg-[#FEF2F2] px-5 py-4">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-[#B91C1C]"
            />

            <p className="text-sm leading-6 text-[#B91C1C]">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Verification Summary */}
        <div className="grid gap-5 md:grid-cols-3">
          <InfoCard
            label="Verification Status"
            value={verificationStatus.label}
            icon={ShieldCheck}
          />

          <InfoCard
            label="Documents Submitted"
            value={documents.length}
            icon={FileText}
          />

          <InfoCard
            label="Submitted"
            value={
              verification?.created_at
                ? formatDate(verification.created_at)
                : "Not submitted"
            }
            icon={CalendarDays}
          />
        </div>

        {/* Review Notice */}
        <div className="mt-8 rounded-2xl bg-[#2D0A17] p-6 sm:p-7">
          <div className="flex gap-4">
            <ShieldCheck
              size={23}
              className="mt-0.5 shrink-0 text-[#C9A227]"
            />

            <div>
              <h2 className="text-sm font-bold text-white">
                RentSure verification standard
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#E8DDE1]">
                Verification means your submitted information has entered
                RentSure's review workflow. It does not represent a legal
                guarantee of ownership, authority, availability, or complete
                freedom from fraud.
              </p>
            </div>
          </div>
        </div>

        {/* Review Notes */}
        {verification?.review_notes && (
          <div className="mt-8 rounded-2xl border border-[#F3D8A3] bg-[#FFF9ED] p-6 sm:p-7">
            <div className="flex gap-4">
              <AlertCircle
                size={21}
                className="mt-0.5 shrink-0 text-[#B45309]"
              />

              <div>
                <h2 className="text-sm font-bold text-[#7A4A03]">
                  Review team note
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#8A641F]">
                  {verification.review_notes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Documents */}
        <div className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#24171C]">
                Submitted Documents
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#756970]">
                Documents submitted as part of this property's verification
                process.
              </p>
            </div>

            <Link
              to={`/agent/verification/${property.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
            >
              <Upload size={17} />
              Upload More
            </Link>
          </div>

          {documents.length === 0 ? (
            <div className="mt-7 rounded-xl bg-[#FAF8F9] px-5 py-10 text-center">
              <FileText
                size={27}
                className="mx-auto text-[#756970]"
              />

              <p className="mt-3 text-sm font-semibold text-[#24171C]">
                No documents submitted yet
              </p>

              <p className="mt-2 text-sm text-[#756970]">
                Upload the required supporting documents to begin the
                verification review.
              </p>
            </div>
          ) : (
            <div className="mt-7 space-y-4">
              {documents.map((document) => {
                const documentStatus = getDocumentStatus(
                  document.review_status
                );

                return (
                  <div
                    key={document.id}
                    className="rounded-xl border border-[#E8DDE1] p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F8EDEF]">
                          <FileText
                            size={20}
                            className="text-[#7A1F3D]"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#24171C]">
                            {document.file_name}
                          </p>

                          <p className="mt-1 text-xs text-[#756970]">
                            {formatDocumentType(document.document_type)}
                            {" • "}
                            {formatFileSize(document.file_size)}
                          </p>

                          <p className="mt-1 text-xs text-[#756970]">
                            Uploaded {formatDate(document.created_at)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${documentStatus.className}`}
                      >
                        {documentStatus.label}
                      </span>
                    </div>

                    {document.review_notes && (
                      <div className="mt-4 rounded-lg bg-[#FAF8F9] p-4">
                        <p className="text-xs font-semibold text-[#756970]">
                          Review note
                        </p>

                        <p className="mt-1 text-sm leading-6 text-[#24171C]">
                          {document.review_notes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-[#24171C]">
            Verification Timeline
          </h2>

          <div className="mt-7 space-y-6">
            <TimelineItem
              title="Verification submitted"
              description="Your verification request entered the RentSure review workflow."
              date={
                verification?.created_at
                  ? formatDate(verification.created_at)
                  : "Not yet submitted"
              }
              completed={Boolean(verification)}
            />

            <TimelineItem
              title="Documents reviewed"
              description="Submitted documents are reviewed against RentSure's verification requirements."
              date={
                documents.length > 0
                  ? `${documents.length} document${
                      documents.length === 1 ? "" : "s"
                    } submitted`
                  : "Waiting for documents"
              }
              completed={documents.length > 0}
            />

            <TimelineItem
              title="Verification decision"
              description="The review team determines whether the submission is verified, rejected, or requires additional information."
              date={
                verification?.reviewed_at
                  ? formatDate(verification.reviewed_at)
                  : "Pending review"
              }
              completed={
                verification?.status === "verified" ||
                verification?.status === "rejected" ||
                verification?.status === "needs_information"
              }
              last
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EDEF]">
          <Icon
            size={21}
            className="text-[#7A1F3D]"
          />
        </div>
      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[#756970]">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold text-[#24171C]">
        {value}
      </p>
    </div>
  );
}

function TimelineItem({
  title,
  description,
  date,
  completed,
  last = false,
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            completed
              ? "bg-[#E8F5EC] text-[#15803D]"
              : "bg-[#F8EDEF] text-[#7A1F3D]"
          }`}
        >
          {completed ? (
            <CheckCircle2 size={18} />
          ) : (
            <Clock3 size={18} />
          )}
        </div>

        {!last && (
          <div className="mt-2 h-full min-h-8 w-px bg-[#E8DDE1]" />
        )}
      </div>

      <div className="pb-2">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-bold text-[#24171C]">
            {title}
          </h3>

          <span className="text-xs text-[#756970]">
            {date}
          </span>
        </div>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default VerificationDetails;
