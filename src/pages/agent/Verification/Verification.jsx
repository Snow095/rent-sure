
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    FileText,
    ShieldCheck,
    Upload,
    AlertCircle,
    Loader2,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../services/supabase/client";

function AgentVerification() {
    const { user } = useAuth();
    const { propertyId } = useParams();
    console.log("Property ID:", propertyId);

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files || []);

        setFiles(selectedFiles);
        setSuccessMessage("");
        setErrorMessage("");
    };

    const handleUpload = async (event) => {
        event.preventDefault();

        setSuccessMessage("");
        setErrorMessage("");

        if (!user) {
            setErrorMessage(
                "You must be logged in to submit verification documents."
            );
            return;
        }

        if (!propertyId) {
            setErrorMessage(
                "No property was selected for verification."
            );
            return;
        }

        if (files.length === 0) {
            setErrorMessage("Please select at least one document.");
            return;
        }

        setLoading(true);

        try {
            // 1. Confirm that the property belongs to the logged-in agent.
            const { data: property, error: propertyError } = await supabase
                .from("properties")
                .select("id, agent_id")
                .eq("id", propertyId)
                .eq("agent_id", user.id)
                .single();

            if (propertyError || !property) {
                throw new Error(
                    "You are not authorized to submit verification documents for this property."
                );
            }

            // 2. Create the verification record.
            const { data: verification, error: verificationError } =
                await supabase
                    .from("property_verifications")
                    .insert({
                        property_id: property.id,
                        submitted_by: user.id,
                        status: "pending",
                        document_count: 0,
                    })
                    .select()
                    .single();

            if (verificationError) {
                throw verificationError;
            }

            const uploadedDocuments = [];

            // 3. Upload each document to Supabase Storage.
            for (const file of files) {
                const fileExtension =
                    file.name.split(".").pop()?.toLowerCase() || "file";

                const safeFileName = `${crypto.randomUUID()}.${fileExtension}`;

                const filePath = `${user.id}/${safeFileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("verification-documents")
                    .upload(filePath, file, {
                        cacheControl: "3600",
                        upsert: false,
                    });

                if (uploadError) {
                    throw uploadError;
                }

                uploadedDocuments.push({
                    verification_id: verification.id,
                    uploaded_by: user.id,
                    document_type: "other",
                    file_name: file.name,
                    file_path: filePath,
                    file_type: file.type,
                    file_size: file.size,
                    review_status: "pending",
                });
            }

            // 4. Save document metadata in the database.
            const { error: documentsError } = await supabase
                .from("verification_documents")
                .insert(uploadedDocuments);

            if (documentsError) {
                throw documentsError;
            }

            // 5. Update the verification record with the document count.
            const { error: countUpdateError } = await supabase
                .from("property_verifications")
                .update({
                    document_count: uploadedDocuments.length,
                })
                .eq("id", verification.id)
                .eq("submitted_by", user.id);

            if (countUpdateError) {
                throw countUpdateError;
            }

            setSuccessMessage(
                `${uploadedDocuments.length} document${uploadedDocuments.length === 1 ? "" : "s"
                } submitted successfully for verification.`
            );

            setFiles([]);
            event.target.reset();
        } catch (error) {
            console.error("Verification submission error:", error);

            setErrorMessage(
                error.message ||
                "Something went wrong while submitting your verification documents."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#FAF8F9]">
            <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
                <Link
                    to="/agent/properties"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:underline"
                >
                    <ArrowLeft size={17} />
                    Back to My Properties
                </Link>

                <div className="mt-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF]">
                            <ShieldCheck
                                size={25}
                                className="text-[#7A1F3D]"
                            />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-[#7A1F3D]">
                                Property Verification
                            </p>

                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                                Submit verification documents
                            </h1>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#756970] sm:text-base">
                                Submit the supporting documents required for
                                RentSure review. Your documents help our
                                verification process assess the information
                                provided with your property listing.
                            </p>
                        </div>
                    </div>
                </div>

                <section className="mt-10 rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:mt-12 sm:p-8">
                    <div>
                        <h2 className="text-xl font-bold text-[#24171C]">
                            Supporting documents
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#756970]">
                            Upload PDF, JPG, or PNG files. Keep each file within
                            the size limit configured for the RentSure
                            verification bucket.
                        </p>
                    </div>

                    <form onSubmit={handleUpload} className="mt-8">
                        <label
                            htmlFor="verification-documents"
                            className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E8DDE1] bg-[#FAF8F9] px-6 py-10 text-center transition hover:border-[#7A1F3D] hover:bg-[#F8EDEF]"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F8EDEF]">
                                <Upload
                                    size={25}
                                    className="text-[#7A1F3D]"
                                />
                            </div>

                            <p className="mt-5 text-sm font-semibold text-[#24171C]">
                                Click to select verification documents
                            </p>

                            <p className="mt-2 text-xs text-[#756970]">
                                PDF, JPG, or PNG
                            </p>

                            <input
                                id="verification-documents"
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="sr-only"
                            />
                        </label>

                        {files.length > 0 && (
                            <div className="mt-6 space-y-3">
                                {files.map((file) => (
                                    <div
                                        key={`${file.name}-${file.size}`}
                                        className="flex items-center gap-3 rounded-xl border border-[#E8DDE1] bg-white p-4"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8EDEF]">
                                            <FileText
                                                size={19}
                                                className="text-[#7A1F3D]"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-[#24171C]">
                                                {file.name}
                                            </p>

                                            <p className="mt-1 text-xs text-[#756970]">
                                                {(
                                                    file.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}{" "}
                                                MB
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {errorMessage && (
                            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                                <AlertCircle
                                    size={19}
                                    className="mt-0.5 shrink-0 text-[#B91C1C]"
                                />

                                <p className="text-sm leading-6 text-[#B91C1C]">
                                    {errorMessage}
                                </p>
                            </div>
                        )}

                        {successMessage && (
                            <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                                <CheckCircle2
                                    size={19}
                                    className="mt-0.5 shrink-0 text-[#15803D]"
                                />

                                <p className="text-sm leading-6 text-[#15803D]">
                                    {successMessage}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />
                                    Submitting documents...
                                </>
                            ) : (
                                <>
                                    Submit Documents
                                    <ArrowRight size={17} />
                                </>
                            )}
                        </button>
                    </form>
                </section>

                <section className="mt-8 rounded-2xl bg-[#2D0A17] p-6 text-white sm:p-8">
                    <div className="flex items-start gap-4">
                        <ShieldCheck
                            size={24}
                            className="mt-0.5 shrink-0 text-[#C9A227]"
                        />

                        <div>
                            <h2 className="text-lg font-bold">
                                RentSure verification standard
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-white/75">
                                Verification is based on the information and
                                supporting evidence submitted for review. A
                                verified status does not guarantee ownership,
                                property availability, or complete freedom
                                from fraud.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default AgentVerification;

