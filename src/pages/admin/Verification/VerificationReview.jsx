import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  ExternalLink,
  ShieldCheck,
  Clock3,
  UserRound,
  MapPin,
  BedDouble,
  Bath,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";

import { supabase } from "../../../services/supabase/client";
import { useAuth } from "../../../context/useAuth";

function VerificationReview() {
  const { verificationId } = useParams();
  const navigate = useNavigate();

  const {
    user,
    role,
    loading: authLoading,
  } = useAuth();

  const [verification, setVerification] =
    useState(null);
  const [property, setProperty] = useState(null);
  const [agent, setAgent] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [openingDocument, setOpeningDocument] =
    useState(null);

  const [riskScore, setRiskScore] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [reviewingDocument, setReviewingDocument] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [documentNotes, setDocumentNotes] =
    useState({});

  useEffect(() => {
    if (
      authLoading ||
      !user?.id ||
      role !== "admin" ||
      !verificationId
    ) {
      return undefined;
    }

    let cancelled = false;

    const loadVerification = async () => {
      setErrorMessage("");

      try {
        const {
          data: verificationData,
          error: verificationError,
        } = await supabase
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
            updated_at
          `)
          .eq("id", verificationId)
          .maybeSingle();

        if (verificationError) {
          throw verificationError;
        }

        if (!verificationData) {
          throw new Error(
            "Verification record could not be found."
          );
        }

        if (cancelled) {
          return;
        }

        setVerification(verificationData);
        setReviewNotes(
          verificationData.review_notes || ""
        );

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
          .eq("id", verificationData.property_id)
          .maybeSingle();

        if (propertyError) {
          throw propertyError;
        }

        if (!propertyData) {
          throw new Error(
            "The property linked to this verification could not be found."
          );
        }

        if (cancelled) {
          return;
        }

        setProperty(propertyData);

        if (propertyData.agent_id) {
          const {
            data: agentData,
            error: agentError,
          } = await supabase
            .from("profiles")
            .select(
              "id, full_name, role, created_at"
            )
            .eq("id", propertyData.agent_id)
            .maybeSingle();

          if (agentError) {
            console.error(
              "Error loading agent profile:",
              agentError
            );
          } else if (!cancelled) {
            setAgent(agentData);
          }
        }

        const {
          data: documentsData,
          error: documentsError,
        } = await supabase
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
            created_at,
            updated_at
          `)
          .eq(
            "verification_id",
            verificationData.id
          )
          .order("created_at", {
            ascending: true,
          });

        if (documentsError) {
          throw documentsError;
        }

        if (cancelled) {
          return;
        }

        const loadedDocuments =
          documentsData || [];

        setDocuments(loadedDocuments);

        const existingNotes = {};

        loadedDocuments.forEach((document) => {
          existingNotes[document.id] =
            document.review_notes || "";
        });

        setDocumentNotes(existingNotes);
      } catch (error) {
        console.error(
          "Error loading verification review:",
          error
        );

        if (!cancelled) {
          setVerification(null);
          setProperty(null);
          setAgent(null);
          setDocuments([]);

          setErrorMessage(
            error?.message ||
              "Unable to load this verification review."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadVerification();

    return () => {
      cancelled = true;
    };
  }, [
    verificationId,
    user?.id,
    role,
    authLoading,
  ]);

  const formatAmount = (amount) => {
    if (
      amount === null ||
      amount === undefined ||
      amount === ""
    ) {
      return "Not specified";
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
      return "Not specified";
    }

    return `₦${numericAmount.toLocaleString("en-NG")}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString(
      "en-NG",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString(
      "en-NG",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "Unknown size";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(
        1
      )} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case "verified":
        return {
          label: "Verified",
          className:
            "bg-green-50 text-green-700 border-green-200",
          icon: CheckCircle2,
        };

      case "rejected":
        return {
          label: "Rejected",
          className:
            "bg-red-50 text-red-700 border-red-200",
          icon: XCircle,
        };

      case "needs_information":
        return {
          label: "Needs Information",
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
          icon: AlertTriangle,
        };

      case "under_review":
        return {
          label: "Under Review",
          className:
            "bg-blue-50 text-blue-700 border-blue-200",
          icon: Clock3,
        };

      case "pending":
      default:
        return {
          label: "Pending",
          className:
            "bg-gray-50 text-gray-700 border-gray-200",
          icon: Clock3,
        };
    }
  };

  const getDocumentStatusDetails = (status) => {
    switch (status) {
      case "approved":
        return {
          label: "Approved",
          className:
            "bg-green-50 text-green-700 border-green-200",
        };

      case "rejected":
        return {
          label: "Rejected",
          className:
            "bg-red-50 text-red-700 border-red-200",
        };

      case "needs_information":
        return {
          label: "Needs Information",
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
        };

      case "pending":
      default:
        return {
          label: "Pending",
          className:
            "bg-gray-50 text-gray-700 border-gray-200",
        };
    }
  };

  const getRiskDetails = (score) => {
    if (
      score === null ||
      score === undefined ||
      score === ""
    ) {
      return {
        label: "Not scored",
        description:
          "A risk score has not yet been assigned to this property.",
        className:
          "bg-gray-50 text-gray-700 border-gray-200",
      };
    }

    const numericScore = Number(score);

    if (!Number.isFinite(numericScore)) {
      return {
        label: "Invalid score",
        description:
          "The stored risk score is not a valid numeric value.",
        className:
          "bg-gray-50 text-gray-700 border-gray-200",
      };
    }

    if (numericScore <= 29) {
      return {
        label: "Low Risk",
        description:
          "The current RentSure review data indicates a lower risk level. Renters should still verify important information independently.",
        className:
          "bg-green-50 text-green-700 border-green-200",
      };
    }

    if (numericScore <= 59) {
      return {
        label: "Moderate Risk",
        description:
          "Some factors require additional attention or verification before a renter proceeds.",
        className:
          "bg-amber-50 text-amber-700 border-amber-200",
      };
    }

    return {
      label: "High Risk",
      description:
        "The available review information indicates that renters should exercise significant caution.",
      className:
        "bg-red-50 text-red-700 border-red-200",
    };
  };

  const openDocument = async (document) => {
    setOpeningDocument(document.id);
    setErrorMessage("");

    try {
      const {
        data,
        error,
      } = await supabase.storage
        .from("verification-documents")
        .createSignedUrl(
          document.file_path,
          60 * 10
        );

      if (error) {
        throw error;
      }

      if (!data?.signedUrl) {
        throw new Error(
          "Unable to generate a secure document link."
        );
      }

      window.open(
        data.signedUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error(
        "Error opening verification document:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to open this verification document."
      );
    } finally {
      setOpeningDocument(null);
    }
  };

  const handleDocumentNoteChange = (
    documentId,
    value
  ) => {
    setDocumentNotes((current) => ({
      ...current,
      [documentId]: value,
    }));

    setSuccessMessage("");
  };

  const handleDocumentReview = async (
    document,
    reviewStatus
  ) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (
      ![
        "approved",
        "rejected",
        "needs_information",
      ].includes(reviewStatus)
    ) {
      setErrorMessage(
        "Invalid document review status."
      );
      return;
    }

    const notes =
      documentNotes[document.id]?.trim() || "";

    if (
      reviewStatus !== "approved" &&
      !notes
    ) {
      setErrorMessage(
        "Please provide review notes when rejecting a document or requesting more information."
      );
      return;
    }

    setReviewingDocument(document.id);

    try {
      const {
        data,
        error,
      } = await supabase
        .from("verification_documents")
        .update({
          review_status: reviewStatus,
          review_notes: notes || null,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", document.id)
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
          created_at,
          updated_at
        `)
        .single();

      if (error) {
        throw error;
      }

      setDocuments((current) =>
        current.map((item) =>
          item.id === document.id
            ? data
            : item
        )
      );

      setSuccessMessage(
        reviewStatus === "approved"
          ? "Document approved successfully."
          : reviewStatus === "rejected"
            ? "Document rejected successfully."
            : "Additional information requested for this document."
      );
    } catch (error) {
      console.error(
        "Error reviewing verification document:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to update this document review."
      );
    } finally {
      setReviewingDocument(null);
    }
  };

  const handleFinalDecision = async (
    decision
  ) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (
      ![
        "verified",
        "rejected",
        "needs_information",
      ].includes(decision)
    ) {
      setErrorMessage(
        "Invalid verification decision."
      );
      return;
    }

    const parsedRiskScore =
      riskScore === ""
        ? null
        : Number(riskScore);

    if (
      parsedRiskScore === null ||
      !Number.isInteger(parsedRiskScore) ||
      parsedRiskScore < 0 ||
      parsedRiskScore > 100
    ) {
      setErrorMessage(
        "Please enter a valid risk score between 0 and 100."
      );
      return;
    }

    const trimmedNotes =
      reviewNotes.trim();

    if (
      decision !== "verified" &&
      !trimmedNotes
    ) {
      setErrorMessage(
        "Please provide review notes for this decision."
      );
      return;
    }

    if (decision === "verified") {
      const rejectedDocument =
        documents.find(
          (document) =>
            document.review_status ===
            "rejected"
        );

      if (rejectedDocument) {
        setErrorMessage(
          "This verification cannot be approved while a submitted document is marked as rejected."
        );
        return;
      }

      const pendingDocument =
        documents.find(
          (document) =>
            document.review_status ===
            "pending"
        );

      if (pendingDocument) {
        setErrorMessage(
          "Please review all submitted documents before approving this verification."
        );
        return;
      }

      const needsInformationDocument =
        documents.find(
          (document) =>
            document.review_status ===
            "needs_information"
        );

      if (needsInformationDocument) {
        setErrorMessage(
          "This verification has a document that requires more information."
        );
        return;
      }
    }

    const decisionLabels = {
      verified:
        "approve this property verification",
      rejected:
        "reject this property verification",
      needs_information:
        "request additional information for this verification",
    };

    const confirmed = window.confirm(
      `Are you sure you want to ${decisionLabels[decision]}?`
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);

    try {
      const now =
        new Date().toISOString();

      const {
        data: updatedVerification,
        error: verificationError,
      } = await supabase
        .from("property_verifications")
        .update({
          status: decision,
          review_notes:
            trimmedNotes || null,
          reviewed_by: user.id,
          reviewed_at: now,
          updated_at: now,
        })
        .eq("id", verification.id)
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
          updated_at
        `)
        .single();

      if (verificationError) {
        throw verificationError;
      }

      const {
        data: updatedProperty,
        error: propertyError,
      } = await supabase
        .from("properties")
        .update({
          verification_status: decision,
          risk_score: parsedRiskScore,
          updated_at: now,
        })
        .eq(
          "id",
          verification.property_id
        )
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
        .single();

      if (propertyError) {
        throw propertyError;
      }

      setVerification(
        updatedVerification
      );

      setProperty(updatedProperty);

      setSuccessMessage(
        decision === "verified"
          ? "Property verification approved successfully."
          : decision === "rejected"
            ? "Property verification rejected successfully."
            : "Additional information has been requested successfully."
      );

      setTimeout(() => {
        navigate("/admin/verification");
      }, 1200);
    } catch (error) {
      console.error(
        "Error completing verification decision:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to complete the verification decision."
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#FAF8F9] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F8EDEF]">
              <Loader2
                className="h-6 w-6 animate-spin text-[#7A1F3D]"
                aria-hidden="true"
              />
            </div>

            <p className="mt-4 text-sm font-medium text-[#756970]">
              Loading verification review...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!user || role !== "admin") {
    return (
      <main className="min-h-screen bg-[#FAF8F9] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-2xl border border-[#E8DDE1] bg-white p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto h-12 w-12 text-red-600" />

            <h1 className="mt-5 text-2xl font-bold text-[#24171C]">
              Access Restricted
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#756970]">
              Only administrators can review property
              verification submissions.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!verificationId) {
    return (
      <main className="min-h-screen bg-[#FAF8F9] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <h1 className="font-semibold text-red-800">
                  Verification ID is missing.
                </h1>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  A valid verification ID is required to
                  open this review.
                </p>
              </div>
            </div>

            <Link
              to="/admin/verification"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Verification
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F9] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F8EDEF]">
              <Loader2
                className="h-6 w-6 animate-spin text-[#7A1F3D]"
                aria-hidden="true"
              />
            </div>

            <p className="mt-4 text-sm font-medium text-[#756970]">
              Loading verification review...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!verification || !property) {
    return (
      <main className="min-h-screen bg-[#FAF8F9] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <h1 className="font-semibold text-red-800">
                  Unable to load verification
                </h1>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {errorMessage ||
                    "The requested verification record could not be found."}
                </p>
              </div>
            </div>

            <Link
              to="/admin/verification"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Verification
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const statusDetails = getStatusDetails(
    verification.status
  );

  const StatusIcon = statusDetails.icon;

  const riskDetails = getRiskDetails(
    property.risk_score
  );

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8">
          <Link
            to="/admin/verification"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Verification
          </Link>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                  Verification Review
                </h1>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusDetails.className}`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusDetails.label}
                </span>
              </div>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756970]">
                Review the submitted documents, assess the
                available information, assign a RentSure risk
                score, and record the final verification
                decision.
              </p>
            </div>

            <div className="rounded-xl border border-[#E8DDE1] bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-[#756970]">
                Verification ID
              </p>

              <p className="mt-1 text-sm font-bold text-[#24171C]">
                #{verification.id}
              </p>
            </div>
          </div>
        </div>

        {(errorMessage || successMessage) && (
          <div className="mb-6">
            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Action could not be completed
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-700">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

                  <p className="text-sm font-medium leading-6 text-green-700">
                    {successMessage}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            {/* Property */}
            <section className="overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm">
              <div className="border-b border-[#E8DDE1] p-6 sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF]">
                    <ShieldCheck className="h-5 w-5 text-[#7A1F3D]" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                      Property Under Review
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-[#24171C]">
                      {property.title}
                    </h2>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#FAF8F9] p-4">
                    <div className="flex items-center gap-2 text-[#756970]">
                      <MapPin className="h-4 w-4" />

                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Location
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-[#24171C]">
                      {property.location}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FAF8F9] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                      Property Type
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#24171C]">
                      {property.property_type}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FAF8F9] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                      Annual Rent
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#24171C]">
                      {formatAmount(
                        property.annual_rent
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FAF8F9] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                      Listing Status
                    </p>

                    <p className="mt-2 text-sm font-semibold capitalize text-[#24171C]">
                      {property.property_status ||
                        "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-lg border border-[#E8DDE1] bg-white px-3 py-2 text-sm font-medium text-[#756970]">
                    <BedDouble className="h-4 w-4" />

                    {property.bedrooms}{" "}
                    {property.bedrooms === 1
                      ? "Bedroom"
                      : "Bedrooms"}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-lg border border-[#E8DDE1] bg-white px-3 py-2 text-sm font-medium text-[#756970]">
                    <Bath className="h-4 w-4" />

                    {property.bathrooms}{" "}
                    {property.bathrooms === 1
                      ? "Bathroom"
                      : "Bathrooms"}
                  </span>
                </div>
              </div>

              {property.description && (
                <div className="p-6 sm:p-7">
                  <h3 className="text-sm font-bold text-[#24171C]">
                    Property Description
                  </h3>

                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#756970]">
                    {property.description}
                  </p>
                </div>
              )}
            </section>

            {/* Agent */}
            <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F8EDEF]">
                  <UserRound className="h-5 w-5 text-[#7A1F3D]" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#24171C]">
                    Submitted By
                  </h2>

                  <p className="text-sm text-[#756970]">
                    Property agent information
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-[#FAF8F9] p-5">
                {agent ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-[#24171C]">
                        {agent.full_name ||
                          "Unnamed agent"}
                      </p>

                      <p className="mt-1 text-xs text-[#756970]">
                        Agent account created{" "}
                        {formatDate(
                          agent.created_at
                        )}
                      </p>
                    </div>

                    <span className="inline-flex w-fit rounded-full border border-[#E8DDE1] bg-white px-3 py-1.5 text-xs font-semibold text-[#7A1F3D]">
                      Agent
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-[#756970]">
                    Agent profile information could not
                    be loaded.
                  </p>
                )}
              </div>
            </section>

            {/* Documents */}
            <section className="rounded-2xl border border-[#E8DDE1] bg-white shadow-sm">
              <div className="border-b border-[#E8DDE1] p-6 sm:p-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[#24171C]">
                      Verification Documents
                    </h2>

                    <p className="mt-1 text-sm text-[#756970]">
                      Review each submitted document before
                      making the final verification decision.
                    </p>
                  </div>

                  <span className="inline-flex w-fit rounded-full bg-[#F8EDEF] px-3 py-1.5 text-xs font-semibold text-[#7A1F3D]">
                    {documents.length}{" "}
                    {documents.length === 1
                      ? "Document"
                      : "Documents"}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-[#E8DDE1]">
                {documents.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="mx-auto h-10 w-10 text-[#756970]" />

                    <p className="mt-3 text-sm font-semibold text-[#24171C]">
                      No documents submitted
                    </p>

                    <p className="mt-1 text-sm text-[#756970]">
                      This verification does not currently
                      have any document records.
                    </p>
                  </div>
                ) : (
                  documents.map((document) => {
                    const documentStatus =
                      getDocumentStatusDetails(
                        document.review_status
                      );

                    const isReviewing =
                      reviewingDocument ===
                      document.id;

                    return (
                      <div
                        key={document.id}
                        className="p-6 sm:p-7"
                      >
                        <div className="flex flex-col gap-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF]">
                                <FileText className="h-5 w-5 text-[#7A1F3D]" />
                              </div>

                              <div className="min-w-0">
                                <p className="break-words font-semibold text-[#24171C]">
                                  {document.file_name}
                                </p>

                                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#756970]">
                                  <span>
                                    Type:{" "}
                                    <strong className="text-[#24171C]">
                                      {document.document_type}
                                    </strong>
                                  </span>

                                  <span>
                                    Size:{" "}
                                    <strong className="text-[#24171C]">
                                      {formatFileSize(
                                        document.file_size
                                      )}
                                    </strong>
                                  </span>

                                  <span>
                                    Submitted:{" "}
                                    <strong className="text-[#24171C]">
                                      {formatDate(
                                        document.created_at
                                      )}
                                    </strong>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <span
                              className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${documentStatus.className}`}
                            >
                              {documentStatus.label}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              openDocument(
                                document
                              )
                            }
                            disabled={
                              openingDocument ===
                              document.id
                            }
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] px-4 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
                          >
                            {openingDocument ===
                            document.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ExternalLink className="h-4 w-4" />
                            )}

                            {openingDocument ===
                            document.id
                              ? "Opening..."
                              : "Open Secure Document"}
                          </button>

                          <div>
                            <label
                              htmlFor={`document-notes-${document.id}`}
                              className="text-sm font-semibold text-[#24171C]"
                            >
                              Document Review Notes
                            </label>

                            <textarea
                              id={`document-notes-${document.id}`}
                              value={
                                documentNotes[
                                  document.id
                                ] || ""
                              }
                              onChange={(event) =>
                                handleDocumentNoteChange(
                                  document.id,
                                  event.target.value
                                )
                              }
                              rows={3}
                              maxLength={1000}
                              placeholder="Add notes about this document if needed..."
                              className="mt-2 w-full resize-y rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 text-sm text-[#24171C] outline-none transition placeholder:text-[#A2989D] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                            />

                            <p className="mt-1 text-right text-xs text-[#756970]">
                              {
                                (
                                  documentNotes[
                                    document.id
                                  ] || ""
                                ).length
                              }
                              /1000
                            </p>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <button
                              type="button"
                              onClick={() =>
                                handleDocumentReview(
                                  document,
                                  "approved"
                                )
                              }
                              disabled={isReviewing}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isReviewing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDocumentReview(
                                  document,
                                  "needs_information"
                                )
                              }
                              disabled={isReviewing}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isReviewing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                              Needs Information
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDocumentReview(
                                  document,
                                  "rejected"
                                )
                              }
                              disabled={isReviewing}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isReviewing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              Reject
                            </button>
                          </div>

                          {document.review_notes && (
                            <div className="rounded-xl border border-[#E8DDE1] bg-[#FAF8F9] p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                                Current Review Notes
                              </p>

                              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#24171C]">
                                {
                                  document.review_notes
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Submission Summary */}
            <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#24171C]">
                Submission Summary
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                    Submitted
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#24171C]">
                    {formatDateTime(
                      verification.created_at
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                    Document Count
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#24171C]">
                    {documents.length}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                    Current Property Verification
                  </p>

                  <p className="mt-1 text-sm font-semibold capitalize text-[#24171C]">
                    {property.verification_status ||
                      "Not reviewed"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                    Current Risk Score
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xl font-bold text-[#24171C]">
                      {property.risk_score ??
                        "Not scored"}
                    </span>

                    {property.risk_score !==
                      null &&
                      property.risk_score !==
                        undefined && (
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${riskDetails.className}`}
                        >
                          {riskDetails.label}
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </section>

            {/* Risk Score */}
            <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF]">
                  <AlertTriangle className="h-5 w-5 text-[#7A1F3D]" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#24171C]">
                    RentSure Risk Score
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-[#756970]">
                    Assign a score from 0 to 100 based on
                    the information available during review.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="risk-score"
                  className="text-sm font-semibold text-[#24171C]"
                >
                  Risk Score
                </label>

                <div className="relative mt-2">
                  <input
                    id="risk-score"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={riskScore}
                    onChange={(event) =>
                      setRiskScore(
                        event.target.value
                      )
                    }
                    placeholder="0 - 100"
                    className="w-full rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 pr-16 text-sm font-semibold text-[#24171C] outline-none transition placeholder:font-normal placeholder:text-[#A2989D] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#756970]">
                    / 100
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-green-50 p-3 text-center">
                    <p className="text-xs font-semibold text-green-700">
                      0–29
                    </p>

                    <p className="mt-1 text-[11px] text-green-600">
                      Low
                    </p>
                  </div>

                  <div className="rounded-lg bg-amber-50 p-3 text-center">
                    <p className="text-xs font-semibold text-amber-700">
                      30–59
                    </p>

                    <p className="mt-1 text-[11px] text-amber-600">
                      Moderate
                    </p>
                  </div>

                  <div className="rounded-lg bg-red-50 p-3 text-center">
                    <p className="text-xs font-semibold text-red-700">
                      60–100
                    </p>

                    <p className="mt-1 text-[11px] text-red-600">
                      High
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Review Notes */}
            <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#24171C]">
                Review Notes
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#756970]">
                Explain the decision clearly. Notes are
                required when rejecting a verification or
                requesting more information.
              </p>

              <textarea
                value={reviewNotes}
                onChange={(event) =>
                  setReviewNotes(
                    event.target.value
                  )
                }
                rows={7}
                maxLength={2000}
                placeholder="Enter the reason for your verification decision..."
                className="mt-5 w-full resize-y rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 text-sm leading-6 text-[#24171C] outline-none transition placeholder:text-[#A2989D] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
              />

              <p className="mt-1 text-right text-xs text-[#756970]">
                {reviewNotes.length}/2000
              </p>
            </section>

            {/* Final Decision */}
            <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#24171C]">
                Final Decision
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#756970]">
                This action will update the verification
                record and the related property's
                verification fields.
              </p>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() =>
                    handleFinalDecision(
                      "verified"
                    )
                  }
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}

                  Approve Verification
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleFinalDecision(
                      "needs_information"
                    )
                  }
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}

                  Request More Information
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleFinalDecision(
                      "rejected"
                    )
                  }
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}

                  Reject Verification
                </button>
              </div>
            </section>

            {/* Security Notice */}
            <section className="rounded-2xl border border-[#E8DDE1] bg-[#2D0A17] p-6 text-white shadow-sm">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#C9A227]" />

                <div>
                  <h2 className="text-sm font-bold">
                    Admin Review Notice
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/75">
                    Verification decisions should be based
                    on the documents and information
                    available through RentSure. A RentSure
                    verification does not constitute a legal
                    guarantee of ownership, title, property
                    condition, availability, or transaction
                    outcome.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default VerificationReview;