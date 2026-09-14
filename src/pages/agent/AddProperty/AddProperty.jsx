
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Building2,
    FileText,
    Upload,
    X,
    AlertCircle,
    CheckCircle2,
    Loader2,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../services/supabase/client";

function AddProperty() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        location: "",
        propertyType: "",
        annualRent: "",
        bedrooms: "",
        bathrooms: "",
        description: "",
    });

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrorMessage("");
        setSuccessMessage("");
    };

    const handleDocumentChange = (event) => {
        const selectedFiles = Array.from(
            event.target.files || []
        );

        setDocuments(selectedFiles);
        setErrorMessage("");
    };

    const removeDocument = (indexToRemove) => {
        setDocuments((previous) =>
            previous.filter(
                (_, index) => index !== indexToRemove
            )
        );
    };

    const validateForm = () => {
        if (!user) {
            return "You must be logged in as an agent to add a property.";
        }

        if (!formData.title.trim()) {
            return "Please enter a property title.";
        }

        if (!formData.location.trim()) {
            return "Please enter the property location.";
        }

        if (!formData.propertyType) {
            return "Please select a property type.";
        }

        if (!formData.annualRent) {
            return "Please enter the annual rent.";
        }

        if (Number(formData.annualRent) < 0) {
            return "Annual rent cannot be negative.";
        }

        if (
            formData.bedrooms === "" ||
            Number(formData.bedrooms) < 0
        ) {
            return "Please enter a valid number of bedrooms.";
        }

        if (
            formData.bathrooms === "" ||
            Number(formData.bathrooms) < 0
        ) {
            return "Please enter a valid number of bathrooms.";
        }

        if (!formData.description.trim()) {
            return "Please provide a property description.";
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        const validationError = validateForm();

        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        setLoading(true);

        try {
            /*
             * Insert the property into Supabase
             */
            const { data: property, error } = await supabase
                .from("properties")
                .insert({
                    agent_id: user.id,
                    title: formData.title.trim(),
                    location: formData.location.trim(),
                    property_type: formData.propertyType,
                    annual_rent: Number(formData.annualRent),
                    bedrooms: Number(formData.bedrooms),
                    bathrooms: Number(formData.bathrooms),
                    description: formData.description.trim(),
                    verification_status: "pending",
                    property_status: "active",
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            /*
             * Property has now been created.
             *
             * Documents will be connected to the property
             * verification workflow in the next step.
             */
            console.log("Property created:", property);
            console.log("Selected documents:", documents);

            setSuccessMessage(
                "Property submitted successfully. It is now awaiting verification."
            );

            /*
             * Clear the form
             */
            setFormData({
                title: "",
                location: "",
                propertyType: "",
                annualRent: "",
                bedrooms: "",
                bathrooms: "",
                description: "",
            });

            setDocuments([]);

            /*
             * Give the user a moment to see the success message,
             * then return to My Properties.
             */
            setTimeout(() => {
                navigate("/agent/properties");
            }, 1200);
        } catch (error) {
            console.error(
                "Error creating property:",
                error
            );

            setErrorMessage(
                error.message ||
                "Something went wrong while creating the property."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#FAF8F9] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
            <div className="mx-auto w-full max-w-5xl">

                {/* Back */}
                <Link
                    to="/agent/properties"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
                >
                    <ArrowLeft size={17} />
                    Back to My Properties
                </Link>

                {/* Header */}
                <section className="mt-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7A1F3D]">
                        Agent Portal
                    </p>

                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                        Add a Property
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[#756970] sm:text-base">
                        Submit your property information for RentSure
                        verification. Accurate information and supporting
                        evidence help create a safer rental experience.
                    </p>
                </section>

                {/* Verification Notice */}
                <section className="mt-8 rounded-2xl bg-[#2D0A17] p-6 text-white sm:p-7">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                            <Building2 size={21} />
                        </div>

                        <div>
                            <h2 className="font-bold">
                                Submit accurate property information
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-white/75">
                                Submitted properties start with a pending
                                verification status. RentSure reviews
                                supporting evidence before a property can
                                receive verified status.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Messages */}
                {errorMessage && (
                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-[#B91C1C]">
                        <AlertCircle
                            size={19}
                            className="mt-0.5 shrink-0"
                        />

                        <p>{errorMessage}</p>
                    </div>
                )}

                {successMessage && (
                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-[#15803D]">
                        <CheckCircle2
                            size={19}
                            className="mt-0.5 shrink-0"
                        />

                        <p>{successMessage}</p>
                    </div>
                )}

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="mt-8"
                >
                    {/* Property Information */}
                    <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
                        <div>
                            <h2 className="text-xl font-bold text-[#24171C]">
                                Property Information
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-[#756970]">
                                Provide the basic information renters will
                                see when viewing your listing.
                            </p>
                        </div>

                        <div className="mt-7 grid gap-6">

                            {/* Title */}
                            <div>
                                <label
                                    htmlFor="title"
                                    className="mb-2 block text-sm font-semibold text-[#24171C]"
                                >
                                    Property Title
                                </label>

                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Modern 3-Bedroom Apartment"
                                    className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#9A8D93] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label
                                    htmlFor="location"
                                    className="mb-2 block text-sm font-semibold text-[#24171C]"
                                >
                                    Location
                                </label>

                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Lekki Phase 1, Lagos"
                                    className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#9A8D93] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                                />
                            </div>

                            {/* Type + Rent */}
                            <div className="grid gap-6 sm:grid-cols-2">

                                <div>
                                    <label
                                        htmlFor="propertyType"
                                        className="mb-2 block text-sm font-semibold text-[#24171C]"
                                    >
                                        Property Type
                                    </label>

                                    <select
                                        id="propertyType"
                                        name="propertyType"
                                        value={
                                            formData.propertyType
                                        }
                                        onChange={handleChange}
                                        className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                                    >
                                        <option value="">
                                            Select property type
                                        </option>

                                        <option value="Apartment">
                                            Apartment
                                        </option>

                                        <option value="House">
                                            House
                                        </option>

                                        <option value="Duplex">
                                            Duplex
                                        </option>

                                        <option value="Self Contain">
                                            Self Contain
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="annualRent"
                                        className="mb-2 block text-sm font-semibold text-[#24171C]"
                                    >
                                        Annual Rent (₦)
                                    </label>

                                    <input
                                        id="annualRent"
                                        name="annualRent"
                                        type="number"
                                        min="0"
                                        value={
                                            formData.annualRent
                                        }
                                        onChange={handleChange}
                                        placeholder="2500000"
                                        className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#9A8D93] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                                    />
                                </div>
                            </div>

                            {/* Bedrooms + Bathrooms */}
                            <div className="grid gap-6 sm:grid-cols-2">

                                <div>
                                    <label
                                        htmlFor="bedrooms"
                                        className="mb-2 block text-sm font-semibold text-[#24171C]"
                                    >
                                        Bedrooms
                                    </label>

                                    <input
                                        id="bedrooms"
                                        name="bedrooms"
                                        type="number"
                                        min="0"
                                        value={
                                            formData.bedrooms
                                        }
                                        onChange={handleChange}
                                        placeholder="3"
                                        className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#9A8D93] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="bathrooms"
                                        className="mb-2 block text-sm font-semibold text-[#24171C]"
                                    >
                                        Bathrooms
                                    </label>

                                    <input
                                        id="bathrooms"
                                        name="bathrooms"
                                        type="number"
                                        min="0"
                                        value={
                                            formData.bathrooms
                                        }
                                        onChange={handleChange}
                                        placeholder="3"
                                        className="min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#9A8D93] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label
                                    htmlFor="description"
                                    className="mb-2 block text-sm font-semibold text-[#24171C]"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    rows="6"
                                    value={
                                        formData.description
                                    }
                                    onChange={handleChange}
                                    placeholder="Describe the property, its features, nearby facilities, access, and other relevant information."
                                    className="w-full resize-y rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 text-sm leading-6 text-[#24171C] outline-none transition placeholder:text-[#9A8D93] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Documents */}
                    <section className="mt-7 rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
                        <div>
                            <h2 className="text-xl font-bold text-[#24171C]">
                                Supporting Documents
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-[#756970]">
                                You can select supporting documents now.
                                They will be connected to the verification
                                workflow in the next step.
                            </p>
                        </div>

                        <label
                            htmlFor="documents"
                            className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E8DDE1] bg-[#FAF8F9] px-6 py-10 text-center transition hover:border-[#7A1F3D] hover:bg-[#F8EDEF]"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
                                <Upload
                                    size={22}
                                    className="text-[#7A1F3D]"
                                />
                            </div>

                            <p className="mt-4 text-sm font-semibold text-[#24171C]">
                                Click to select documents
                            </p>

                            <p className="mt-2 text-xs text-[#756970]">
                                PDF, JPG, or PNG files
                            </p>

                            <input
                                id="documents"
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleDocumentChange}
                                className="hidden"
                            />
                        </label>

                        {documents.length > 0 && (
                            <div className="mt-5 space-y-3">
                                {documents.map(
                                    (file, index) => (
                                        <div
                                            key={`${file.name}-${index}`}
                                            className="flex items-center justify-between gap-4 rounded-lg border border-[#E8DDE1] p-4"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <FileText
                                                    size={19}
                                                    className="shrink-0 text-[#7A1F3D]"
                                                />

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-[#24171C]">
                                                        {file.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-[#756970]">
                                                        {(
                                                            file.size /
                                                            1024 /
                                                            1024
                                                        ).toFixed(
                                                            2
                                                        )}{" "}
                                                        MB
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeDocument(
                                                        index
                                                    )
                                                }
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#756970] transition hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                                                aria-label={`Remove ${file.name}`}
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </section>

                    {/* Actions */}
                    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            to="/agent/properties"
                            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#E8DDE1] bg-white px-6 py-3 text-sm font-semibold text-[#24171C] transition hover:border-[#7A1F3D] hover:text-[#7A1F3D]"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />
                                    Saving Property...
                                </>
                            ) : (
                                <>
                                    Submit Property
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default AddProperty;

