
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

import { supabase } from "../../../services/supabase/client";
import { useAuth } from "../../../context/AuthContext";

function VerificationReview() {
  const { verificationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [verification, setVerification] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [reviewNotes, setReviewNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [openingDocumentId, setOpeningDocumentId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchVerification = async () => {
      if (!verificationId) {
        setErrorMessage("Verification could not be identified.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
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
              reviewed_by,
              reviewed_at,
              created_at,
              updated_at,
              properties (
                id,
                title,
                location,
                property_type,
                annual_rent,
                bedrooms,
                bathrooms,
                verification_status,
                property_status,
                agent_id
              )
            `)
            .eq("id", verificationId)
            .single();

        if (verificationError) {
          throw verificationError;
        }

        if (!verificationData) {
          throw new Error("Verification not found.");
        }

        setVerification(verificationData);
        setReviewNotes(verificationData.review_notes || "");

        const { data: documentData, error: documentError } =
          await supabase
            .from("verification_documents")
            .select(`
              id,
              verification_id,
              uploaded_by,
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
            .order("created_at", { ascending: false });

        if (documentError) {
          throw documentError;
        }

        setDocuments(documentData || []);
      } catch (error) {
        console.error(
          "Error loading verification review:",
          error
        );

        setErrorMessage(
          "We couldn't load this verification submission."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [verificationId]);

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) {
      return "Rent unavailable";
    }

    return `₦${Number(amount).toLocaleString("en-NG")}/year`;
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
          className: "bg-[#E8F5EC] text-[#15803D]",
          icon: CheckCircle2,
        };

      case "rejected":
        return {
          label: "Rejected",
          className: "bg-[#FEF2F2] text-[#B91C1C]",
          icon: XCircle,
        };

      case "needs_information":
        return {
          label: "Needs Information",
          className: "bg-[#FFF7E6] text-[#B45309]",
          icon: AlertCircle,
        };

      case "under_review":
        return {
          label: "Under Review",
          className: "bg-[#FFF7E6] text-[#B45309]",
          icon: Clock3,
        };

      default:
        return {
          label: "Pending",
          className: "bg-[#F3F4F6] text-[#4B5563]",
          icon: Clock3,
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
          label: "Pending",
          className: "bg-[#F3F4F6] text-[#4B5563]",
        };
    }
  };

  const handleViewDocument = async (document) => {
    setErrorMessage("");
    setSuccessMessage("");
    setOpeningDocumentId(document.id);

    try {
      const { data, error } = await supabase.storage
        .from("verification-documents")
        .createSignedUrl(document.file_path, 60 * 10);

      if (error) {
        throw error;
      }

      if (!data?.signedUrl) {
        throw new Error(
          "Unable to generate document access link."
        );
      }

      window.open(
        data.signedUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error(
        "Unable to open verification document:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to open this verification document."
      );
    } finally {
      setOpeningDocumentId(null);
    }
  };

  const handleDocumentReview = async (
    documentId,
    reviewStatus
  ) => {
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("verification_documents")
      .update({
        review_status: reviewStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    if (error) {
      console.error(
        "Error reviewing document:",
        error
      );

      setErrorMessage(
        "We couldn't update this document's review status."
      );

      return;
    }

    setDocuments((previous) =>
      previous.map((document) =>
        document.id === documentId
          ? {
              ...document,
              review_status: reviewStatus,
            }
          : document
      )
    );

    setSuccessMessage(
      "Document review status updated."
    );
  };

  const handleFinalDecision = async (decision) => {
    if (!verification) return;

    setErrorMessage("");
    setSuccessMessage("");

    if (!user) {
      setErrorMessage(
        "Your admin session could not be identified. Please log in again."
      );
      return;
    }

    if (!reviewNotes.trim() && decision !== "verified") {
      setErrorMessage(
        "Please provide review notes when rejecting a submission or requesting more information."
      );
      return;
    }

    setProcessing(true);

    try {
      const reviewedAt = new Date().toISOString();

      const { error: verificationError } =
        await supabase
          .from("property_verifications")
          .update({
            status: decision,
            review_notes: reviewNotes.trim() || null,
            reviewed_by: user.id,
            reviewed_at: reviewedAt,
            updated_at: reviewedAt,
          })
          .eq("id", verification.id);

      if (verificationError) {
        throw verificationError;
      }

      let verificationStatus = "pending";

      if (decision === "verified") {
        verificationStatus = "verified";
      } else if (decision === "rejected") {
        verificationStatus = "rejected";
      } else if (decision === "needs_information") {
        verificationStatus = "needs_information";
      }

      const { error: propertyError } = await supabase
        .from("properties")
        .update({
          verification_status: verificationStatus,
          updated_at: reviewedAt,
        })
        .eq("id", verification.property_id);

      if (propertyError) {
        throw propertyError;
      }

      setVerification((previous) => ({
        ...previous,
        status: decision,
        review_notes: reviewNotes.trim() || null,
        reviewed_by: user.id,
        reviewed_at: reviewedAt,
        updated_at: reviewedAt,
      }));

      setSuccessMessage(
        "Verification decision saved successfully."
      );

      setTimeout(() => {
        navigate("/admin/verification");
      }, 1200);
    } catch (error) {
      console.error(
        "Error saving verification decision:",
        error
      );

      setErrorMessage(
        "We couldn't save the verification decision. Please try again."
      );
    } finally {
      setProcessing(false);
    }
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
            Loading verification submission...
          </p>
        </div>
      </main>
    );
  }

  if (!verification) {
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
            Verification not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#756970]">
            The requested verification submission could not be
            found.
          </p>

          <Link
            to="/admin/verification"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
          >
            <ArrowLeft size={17} />
            Back to Verification Queue
          </Link>
        </div>
      </main>
    );
  }

  const property = verification.properties;
  const status = getStatusDetails(verification.status);
  const StatusIcon = status.icon;

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      {/* Header */}
      <section className="border-b border-[#E8DDE1] bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-12">
          <Link
            to="/admin/verification"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Verification Queue
          </Link>

          <div className="mt-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#7A1F3D]">
                Admin Review
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                {property?.title || "Property Verification"}
              </h1>

              {property?.location && (
                <div className="mt-3 flex items-center gap-2 text-sm text-[#756970]">
                  <MapPin
                    size={17}
                    className="shrink-0 text-[#7A1F3D]"
                  />
                  {property.location}
                </div>
              )}
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${status.className}`}
            >
              <StatusIcon size={17} />
              {status.label}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-12">
        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 flex gap-3 rounded-xl border border-[#F1CACA] bg-[#FEF2F2] px-5 py-4">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-[#B91C1C]"
            />

            <p className="text-sm leading-6 text-[#B91C1C]">
              {errorMessage}
            </p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex gap-3 rounded-xl border border-[#C8E6D0] bg-[#E8F5EC] px-5 py-4">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-[#15803D]"
            />

            <p className="text-sm leading-6 text-[#15803D]">
              {successMessage}
            </p>
          </div>
        )}

        {/* Property Summary */}
        <div className="grid gap-5 lg:grid-cols-3">
          <InfoCard
            label="Property Type"
            value={property?.property_type || "Not available"}
            icon={ShieldCheck}
          />

          <InfoCard
            label="Annual Rent"
            value={formatAmount(property?.annual_rent)}
            icon={CalendarDays}
          />

          <InfoCard
            label="Submitted"
            value={formatDate(verification.created_at)}
            icon={Clock3}
          />
        </div>

        {/* Agent */}
        <div className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EDEF]">
              <UserRound
                size={22}
                className="text-[#7A1F3D]"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#24171C]">
                Submitting Agent
              </h2>

              <p className="mt-1 text-sm text-[#756970]">
                Agent ID: {verification.submitted_by}
              </p>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
          <div>
            <h2 className="text-xl font-bold text-[#24171C]">
              Verification Documents
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#756970]">
              Review each submitted document before making the
              overall verification decision.
            </p>
          </div>

          {documents.length === 0 ? (
            <div className="mt-7 rounded-xl bg-[#FAF8F9] px-5 py-10 text-center">
              <FileText
                size={28}
                className="mx-auto text-[#756970]"
              />

              <p className="mt-3 text-sm font-semibold text-[#24171C]">
                No documents submitted
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
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
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
                            {formatDocumentType(
                              document.document_type
                            )}
                            {" • "}
                            {formatFileSize(
                              document.file_size
                            )}
                          </p>

                          <p className="mt-1 text-xs text-[#756970]">
                            Uploaded{" "}
                            {formatDate(document.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${documentStatus.className}`}
                        >
                          {documentStatus.label}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleViewDocument(document)
                          }
                          disabled={
                            openingDocumentId === document.id
                          }
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] px-4 py-2.5 text-xs font-semibold text-[#7A1F3D] transition hover:border-[#7A1F3D] hover:bg-[#F8EDEF] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {openingDocumentId === document.id ? (
                            <>
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                              Opening...
                            </>
                          ) : (
                            <>
                              <ExternalLink size={15} />
                              View Document
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDocumentReview(
                              document.id,
                              "approved"
                            )
                          }
                          disabled={processing}
                          className="rounded-lg border border-[#C8E6D0] px-3 py-2 text-xs font-semibold text-[#15803D] transition hover:bg-[#E8F5EC] disabled:opacity-50"
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDocumentReview(
                              document.id,
                              "rejected"
                            )
                          }
                          disabled={processing}
                          className="rounded-lg border border-[#F1CACA] px-3 py-2 text-xs font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2] disabled:opacity-50"
                        >
                          Reject
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDocumentReview(
                              document.id,
                              "needs_information"
                            )
                          }
                          disabled={processing}
                          className="rounded-lg border border-[#F3D8A3] px-3 py-2 text-xs font-semibold text-[#B45309] transition hover:bg-[#FFF7E6] disabled:opacity-50"
                        >
                          More Info
                        </button>
                      </div>
                    </div>

                    {document.review_notes && (
                      <div className="mt-4 rounded-lg bg-[#FAF8F9] p-4">
                        <p className="text-xs font-semibold text-[#756970]">
                          Existing Review Note
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

        {/* Decision */}
        <div className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-[#24171C]">
            Verification Decision
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#756970]">
            Record the final outcome of this verification review.
          </p>

          <div className="mt-6">
            <label
              htmlFor="reviewNotes"
              className="text-sm font-semibold text-[#24171C]"
            >
              Review Notes
            </label>

            <textarea
              id="reviewNotes"
              value={reviewNotes}
              onChange={(event) =>
                setReviewNotes(event.target.value)
              }
              rows={6}
              maxLength={1500}
              placeholder="Explain the reason for your decision or identify any additional information required..."
              className="mt-3 w-full resize-y rounded-lg border border-[#E8DDE1] px-4 py-3 text-sm leading-6 text-[#24171C] outline-none transition placeholder:text-[#A3979D] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
            />

            <p className="mt-2 text-xs text-[#756970]">
              {reviewNotes.length}/1500 characters
            </p>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              disabled={processing}
              onClick={() =>
                handleFinalDecision("verified")
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#15803D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 size={18} />
              Verify Property
            </button>

            <button
              type="button"
              disabled={processing}
              onClick={() =>
                handleFinalDecision("needs_information")
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#F3D8A3] px-5 py-3 text-sm font-semibold text-[#B45309] transition hover:bg-[#FFF7E6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <AlertCircle size={18} />
              Request Information
            </button>

            <button
              type="button"
              disabled={processing}
              onClick={() =>
                handleFinalDecision("rejected")
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#B91C1C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#991B1B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle size={18} />
              Reject Property
            </button>
          </div>

          {processing && (
            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-[#756970]">
              <Loader2
                size={17}
                className="animate-spin text-[#7A1F3D]"
              />
              Saving verification decision...
            </div>
          )}
        </div>

        {/* Admin Guidance */}
        <div className="mt-8 rounded-2xl bg-[#2D0A17] p-6 sm:p-7">
          <div className="flex gap-4">
            <ShieldCheck
              size={23}
              className="mt-0.5 shrink-0 text-[#C9A227]"
            />

            <div>
              <h2 className="text-sm font-bold text-white">
                Review carefully
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#E8DDE1]">
                RentSure verification is an evidence-review workflow,
                not a legal determination. Review the submitted
                information carefully and use review notes to explain
                decisions or identify missing information.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EDEF]">
        <Icon
          size={21}
          className="text-[#7A1F3D]"
        />
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

export default VerificationReview;

