import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  FileText,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../../services/supabase/client";
import { useAuth } from "../../../context/useAuth";

function StatusBadge({ status }) {
  const config = {
    pending:
      "border-amber-200 bg-amber-50 text-amber-700",
    needs_information:
      "border-orange-200 bg-orange-50 text-orange-700",
    verified:
      "border-green-200 bg-green-50 text-green-700",
    rejected:
      "border-red-200 bg-red-50 text-red-700",
  };

  const label = status
    ? status.replaceAll("_", " ")
    : "Not reviewed";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        config[status] ||
        "border-[#E8DDE1] bg-[#FAF8F9] text-[#756970]"
      }`}
    >
      {label}
    </span>
  );
}

function createFileId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

function getSupabaseErrorMessage(error, fallback) {
  if (!error) {
    return fallback;
  }

  console.error("Supabase error:", {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  });

  return (
    error.message ||
    error.details ||
    error.hint ||
    fallback
  );
}

function VerificationDetails() {
  const { propertyId } = useParams();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [verification, setVerification] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!propertyId || !user?.id) {
      return undefined;
    }

    let cancelled = false;

    const loadDetails = async () => {
      try {
        const {
          data: propertyData,
          error: propertyError,
        } = await supabase
          .from("properties")
          .select(
            "id, title, location, verification_status, property_status, risk_score"
          )
          .eq("id", propertyId)
          .eq("agent_id", user.id)
          .maybeSingle();

        if (propertyError) {
          throw propertyError;
        }

        if (!propertyData) {
          throw new Error(
            "This property could not be found or does not belong to your account."
          );
        }

        if (cancelled) {
          return;
        }

        const {
          data: verificationRows,
          error: verificationError,
        } = await supabase
          .from("property_verifications")
          .select(
            "id, property_id, submitted_by, status, review_notes, document_count, reviewed_by, reviewed_at, created_at, updated_at"
          )
          .eq("property_id", propertyId)
          .order("created_at", {
            ascending: false,
          })
          .limit(1);

        if (verificationError) {
          throw verificationError;
        }

        const verificationData =
          verificationRows?.[0] || null;

        let documentsData = [];

        if (verificationData?.id) {
          const {
            data,
            error: documentsError,
          } = await supabase
            .from("verification_documents")
            .select(
              "id, verification_id, uploaded_by, document_type, file_name, file_path, file_type, file_size, review_status, review_notes, created_at, updated_at"
            )
            .eq(
              "verification_id",
              verificationData.id
            )
            .order("created_at", {
              ascending: false,
            });

          if (documentsError) {
            throw documentsError;
          }

          documentsData = data || [];
        }

        if (cancelled) {
          return;
        }

        setProperty(propertyData);
        setVerification(verificationData);
        setDocuments(documentsData);
        setError("");
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Error loading verification details:",
          loadError
        );

        setProperty(null);
        setVerification(null);
        setDocuments([]);

        setError(
          getSupabaseErrorMessage(
            loadError,
            "Unable to load verification details."
          )
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [propertyId, user?.id]);

  const handleUpload = async (event) => {
    const input = event.target;
    const file = input.files?.[0];

    if (
      !file ||
      !propertyId ||
      !user?.id ||
      uploading
    ) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please upload a PDF, JPG, PNG, or WebP file."
      );
      input.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("The file must be 10MB or smaller.");
      input.value = "";
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    let filePath = "";
    let metadataInserted = false;

    try {
      const {
        data: ownedProperty,
        error: propertyError,
      } = await supabase
        .from("properties")
        .select("id, verification_status")
        .eq("id", propertyId)
        .eq("agent_id", user.id)
        .maybeSingle();

      if (propertyError) {
        throw propertyError;
      }

      if (!ownedProperty) {
        throw new Error(
          "You are not authorized to upload documents for this property."
        );
      }

      const {
        data: verificationRows,
        error: verificationLookupError,
      } = await supabase
        .from("property_verifications")
        .select(
          "id, property_id, submitted_by, status, review_notes, document_count, reviewed_by, reviewed_at, created_at, updated_at"
        )
        .eq("property_id", propertyId)
        .order("created_at", {
          ascending: false,
        })
        .limit(1);

      if (verificationLookupError) {
        throw verificationLookupError;
      }

      let verificationRecord =
        verificationRows?.[0] || null;

      if (!verificationRecord) {
        const {
          data: createdVerification,
          error: createVerificationError,
        } = await supabase
          .from("property_verifications")
          .insert({
            property_id: Number(propertyId),
            submitted_by: user.id,
            status: "pending",
            document_count: 0,
          })
          .select(
            "id, property_id, submitted_by, status, review_notes, document_count, reviewed_by, reviewed_at, created_at, updated_at"
          )
          .single();

        if (createVerificationError) {
          throw createVerificationError;
        }

        verificationRecord = createdVerification;
      }

      const extension =
        file.name.split(".").pop()?.toLowerCase() ||
        "file";

      filePath = `${user.id}/${propertyId}/${createFileId()}.${extension}`;

      const {
        error: storageError,
      } = await supabase.storage
        .from("verification-documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (storageError) {
        throw new Error(
          `Storage upload failed: ${
            storageError.message ||
            "Unable to upload the file."
          }`
        );
      }

      const {
        data: insertedDocument,
        error: insertError,
      } = await supabase
        .from("verification_documents")
        .insert({
          verification_id: verificationRecord.id,
          uploaded_by: user.id,
          document_type: file.type,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          review_status: "pending",
        })
        .select(
          "id, verification_id, uploaded_by, document_type, file_name, file_path, file_type, file_size, review_status, review_notes, created_at, updated_at"
        )
        .single();

      if (insertError) {
        throw insertError;
      }

      metadataInserted = true;

      const {
        count: documentCount,
        error: countError,
      } = await supabase
        .from("verification_documents")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq(
          "verification_id",
          verificationRecord.id
        );

      if (countError) {
        console.warn(
          "Unable to calculate verification document count:",
          countError
        );
      }

      const nextDocumentCount =
        documentCount ??
        verificationRecord.document_count ??
        0;

      const {
        data: updatedVerification,
        error: updateVerificationError,
      } = await supabase
        .from("property_verifications")
        .update({
          document_count: nextDocumentCount,
          status:
            verificationRecord.status ===
              "rejected" ||
            verificationRecord.status ===
              "needs_information"
              ? "pending"
              : verificationRecord.status ||
                "pending",
        })
        .eq("id", verificationRecord.id)
        .select(
          "id, property_id, submitted_by, status, review_notes, document_count, reviewed_by, reviewed_at, created_at, updated_at"
        )
        .single();

      if (updateVerificationError) {
        console.warn(
          "Unable to update verification record:",
          updateVerificationError
        );
      } else {
        verificationRecord = updatedVerification;
      }

      /*
       * Keep the property verification status aligned with
       * the verification workflow.
       */
      const nextPropertyStatus =
        verificationRecord.status || "pending";

      const { error: propertyStatusError } =
        await supabase
          .from("properties")
          .update({
            verification_status:
              nextPropertyStatus,
          })
          .eq("id", propertyId)
          .eq("agent_id", user.id);

      if (propertyStatusError) {
        console.warn(
          "Unable to synchronize property verification status:",
          propertyStatusError
        );
      } else {
        setProperty((current) =>
          current
            ? {
                ...current,
                verification_status:
                  nextPropertyStatus,
              }
            : current
        );
      }

      setVerification(verificationRecord);

      setDocuments((current) => [
        insertedDocument,
        ...current,
      ]);

      setSuccess(
        "Document uploaded successfully and submitted for review."
      );
    } catch (uploadError) {
      console.error(
        "Error uploading verification document:",
        uploadError
      );

      /*
       * Only remove the Storage file here when the
       * metadata record was not successfully inserted.
       * This prevents accidentally deleting a valid file.
       */
      if (filePath && !metadataInserted) {
        const { error: cleanupError } =
          await supabase.storage
            .from("verification-documents")
            .remove([filePath]);

        if (cleanupError) {
          console.error(
            "Error cleaning up uploaded document:",
            cleanupError
          );
        }
      }

      setError(
        uploadError?.message ||
          "Unable to upload document. Please try again."
      );
    } finally {
      setUploading(false);
      input.value = "";
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F9]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-40 rounded bg-[#E8DDE1]" />
            <div className="h-10 w-72 rounded bg-[#E8DDE1]" />
            <div className="h-48 rounded-2xl bg-white" />
            <div className="h-80 rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-[#FAF8F9]">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-[#24171C]">
            Property not found
          </h1>

          {error && (
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-red-700">
              {error}
            </p>
          )}

          <Link
            to="/agent/verification"
            className="mt-5 inline-flex rounded-xl bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to verification
          </Link>
        </div>
      </main>
    );
  }

  const verificationStatus =
    verification?.status ||
    property.verification_status ||
    null;

  const isVerified =
    verificationStatus === "verified";

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Link
          to="/agent/verification"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:text-[#4A1025]"
        >
          <ArrowLeft size={17} />
          Back to verification
        </Link>

        <section className="mt-6">
          <p className="text-sm font-semibold text-[#7A1F3D]">
            Verification details
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#24171C]">
                {property.title}
              </h1>

              <p className="mt-2 text-sm text-[#756970]">
                {property.location}
              </p>
            </div>

            <StatusBadge
              status={verificationStatus}
            />
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />
            <span>{success}</span>
          </div>
        )}

        <section className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-[#756970]">
              Verification status
            </p>

            <p className="mt-2 font-bold capitalize text-[#24171C]">
              {verificationStatus?.replaceAll(
                "_",
                " "
              ) || "Not reviewed"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-[#756970]">
              Risk score
            </p>

            <p className="mt-2 font-bold text-[#24171C]">
              {property.risk_score ?? "Not scored"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-[#756970]">
              Documents submitted
            </p>

            <p className="mt-2 font-bold text-[#24171C]">
              {documents.length}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <FileCheck2
                  size={21}
                  className="text-[#7A1F3D]"
                />

                <h2 className="text-lg font-bold text-[#24171C]">
                  Supporting documents
                </h2>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970]">
                Upload the documents requested for this
                property. Documents are stored privately and
                reviewed by authorized administrators.
              </p>
            </div>

            {!isVerified && (
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#7A1F3D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]">
                <Upload size={17} />

                {uploading
                  ? "Uploading..."
                  : "Upload document"}

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {isVerified && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800">
              This property is already verified. New
              document uploads are disabled unless the
              verification status changes.
            </div>
          )}

          <div className="mt-7 divide-y divide-[#E8DDE1] rounded-xl border border-[#E8DDE1]">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8EDEF] text-[#7A1F3D]">
                    <FileText size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#24171C]">
                      {document.file_name}
                    </p>

                    <p className="mt-1 text-xs text-[#756970]">
                      {document.document_type}
                    </p>

                    {document.file_size && (
                      <p className="mt-1 text-xs text-[#756970]">
                        {(
                          document.file_size /
                          (1024 * 1024)
                        ).toFixed(2)}{" "}
                        MB
                      </p>
                    )}

                    {document.review_notes && (
                      <p className="mt-2 text-xs leading-5 text-[#756970]">
                        Review note:{" "}
                        {document.review_notes}
                      </p>
                    )}

                    {document.review_status && (
                      <div className="mt-2">
                        <StatusBadge
                          status={
                            document.review_status
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {documents.length === 0 && (
              <div className="p-10 text-center">
                <FileText
                  size={34}
                  className="mx-auto text-[#7A1F3D]"
                  strokeWidth={1.5}
                />

                <h3 className="mt-3 font-semibold text-[#24171C]">
                  No documents uploaded
                </h3>

                <p className="mt-1 text-sm text-[#756970]">
                  Upload the supporting documents requested
                  for verification.
                </p>
              </div>
            )}
          </div>
        </section>

        {verification?.review_notes && (
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <div>
                <h2 className="font-semibold text-amber-900">
                  Administrator review note
                </h2>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  {verification.review_notes}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-[#7A1F3D]"
            />

            <p className="text-sm leading-6 text-[#756970]">
              Verification is a structured review process
              designed to improve transparency and fraud
              awareness. It is not a guarantee of legal
              ownership or transaction safety.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default VerificationDetails;