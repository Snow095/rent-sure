
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "../../../services/supabase/client";
import { useAuth } from "../../../context/AuthContext";

const propertyTypes = [
  "Apartment",
  "House",
  "Duplex",
  "Self Contain",
];

const propertyStatuses = [
  {
    value: "active",
    label: "Active",
    description: "Property is currently available for renters.",
  },
  {
    value: "inactive",
    label: "Inactive",
    description: "Temporarily hide the property from active listings.",
  },
  {
    value: "rented",
    label: "Rented",
    description: "Property has already been rented.",
  },
];

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    propertyType: "Apartment",
    annualRent: "",
    bedrooms: "0",
    bathrooms: "0",
    description: "",
    propertyStatus: "active",
  });

  useEffect(() => {
    const fetchProperty = async () => {
      if (!user || !id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("properties")
        .select(`
          id,
          title,
          location,
          property_type,
          annual_rent,
          bedrooms,
          bathrooms,
          description,
          property_status,
          verification_status
        `)
        .eq("id", id)
        .eq("agent_id", user.id)
        .single();

      if (error) {
        console.error("Error loading property:", error);
        setErrorMessage(
          "We couldn't load this property. It may not exist or you may not have permission to edit it."
        );
        setLoading(false);
        return;
      }

      setFormData({
        title: data.title ?? "",
        location: data.location ?? "",
        propertyType: data.property_type ?? "Apartment",
        annualRent: data.annual_rent ?? "",
        bedrooms: String(data.bedrooms ?? 0),
        bathrooms: String(data.bathrooms ?? 0),
        description: data.description ?? "",
        propertyStatus: data.property_status ?? "active",
      });

      setLoading(false);
    };

    fetchProperty();
  }, [id, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      return "Please enter a property title.";
    }

    if (!formData.location.trim()) {
      return "Please enter the property location.";
    }

    if (!formData.annualRent || Number(formData.annualRent) < 0) {
      return "Please enter a valid annual rent.";
    }

    if (Number(formData.bedrooms) < 0) {
      return "Bedrooms cannot be negative.";
    }

    if (Number(formData.bathrooms) < 0) {
      return "Bathrooms cannot be negative.";
    }

    if (formData.description.trim().length < 20) {
      return "Please provide a property description of at least 20 characters.";
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

    if (!user || !id) {
      setErrorMessage("Your session could not be verified.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("properties")
      .update({
        title: formData.title.trim(),
        location: formData.location.trim(),
        property_type: formData.propertyType,
        annual_rent: Number(formData.annualRent),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        description: formData.description.trim(),
        property_status: formData.propertyStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("agent_id", user.id);

    if (error) {
      console.error("Error updating property:", error);
      setSaving(false);
      setErrorMessage(
        error.message || "We couldn't update this property."
      );
      return;
    }

    setSaving(false);
    setSuccessMessage("Property updated successfully.");

    setTimeout(() => {
      navigate("/agent/properties");
    }, 1000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F9] px-5 py-12 sm:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <div className="text-center">
            <Loader2
              size={36}
              className="mx-auto animate-spin text-[#7A1F3D]"
            />
            <p className="mt-4 text-sm font-medium text-[#756970]">
              Loading property...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F9] px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/agent/properties"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:underline"
          >
            <ArrowLeft size={17} />
            Back to My Properties
          </Link>

          <div className="mt-6 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
              <Building2 size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#24171C] sm:text-3xl">
                Edit Property
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970]">
                Update your property's information while keeping its
                verification history and security controls intact.
              </p>
            </div>
          </div>
        </div>

        {/* Verification Notice */}
        <div className="mb-6 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={21}
              className="mt-0.5 shrink-0 text-[#7A1F3D]"
            />

            <div>
              <h2 className="text-sm font-bold text-[#24171C]">
                Verification protection
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#756970]">
                Changes to important property information may require the
                property to go through verification again. Agents cannot
                manually mark a property as verified.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8"
        >
          {errorMessage && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0"
              />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-8">
            {/* Basic Information */}
            <section>
              <h2 className="text-lg font-bold text-[#24171C]">
                Basic Information
              </h2>

              <div className="mt-5 grid gap-5">
                <div>
                  <label
                    htmlFor="title"
                    className="text-sm font-semibold text-[#24171C]"
                  >
                    Property Title
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Modern 3 Bedroom Apartment"
                    className="mt-2 min-h-12 w-full rounded-lg border border-[#E8DDE1] px-4 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="text-sm font-semibold text-[#24171C]"
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
                    className="mt-2 min-h-12 w-full rounded-lg border border-[#E8DDE1] px-4 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="propertyType"
                      className="text-sm font-semibold text-[#24171C]"
                    >
                      Property Type
                    </label>

                    <select
                      id="propertyType"
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      className="mt-2 min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                    >
                      {propertyTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="propertyStatus"
                      className="text-sm font-semibold text-[#24171C]"
                    >
                      Listing Status
                    </label>

                    <select
                      id="propertyStatus"
                      name="propertyStatus"
                      value={formData.propertyStatus}
                      onChange={handleChange}
                      className="mt-2 min-h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                    >
                      {propertyStatuses.map((status) => (
                        <option
                          key={status.value}
                          value={status.value}
                        >
                          {status.label}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs leading-5 text-[#756970]">
                      {
                        propertyStatuses.find(
                          (status) =>
                            status.value === formData.propertyStatus
                        )?.description
                      }
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Property Details */}
            <section className="border-t border-[#E8DDE1] pt-8">
              <h2 className="text-lg font-bold text-[#24171C]">
                Property Details
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="annualRent"
                    className="text-sm font-semibold text-[#24171C]"
                  >
                    Annual Rent
                  </label>

                  <div className="mt-2 flex min-h-12 overflow-hidden rounded-lg border border-[#E8DDE1] focus-within:border-[#7A1F3D] focus-within:ring-2 focus-within:ring-[#F8EDEF]">
                    <span className="flex items-center border-r border-[#E8DDE1] bg-[#FAF8F9] px-3 text-sm font-semibold text-[#756970]">
                      ₦
                    </span>

                    <input
                      id="annualRent"
                      name="annualRent"
                      type="number"
                      min="0"
                      value={formData.annualRent}
                      onChange={handleChange}
                      className="min-w-0 flex-1 px-3 text-sm text-[#24171C] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="bedrooms"
                    className="text-sm font-semibold text-[#24171C]"
                  >
                    Bedrooms
                  </label>

                  <input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="mt-2 min-h-12 w-full rounded-lg border border-[#E8DDE1] px-4 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bathrooms"
                    className="text-sm font-semibold text-[#24171C]"
                  >
                    Bathrooms
                  </label>

                  <input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    min="0"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="mt-2 min-h-12 w-full rounded-lg border border-[#E8DDE1] px-4 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  />
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="border-t border-[#E8DDE1] pt-8">
              <h2 className="text-lg font-bold text-[#24171C]">
                Description
              </h2>

              <textarea
                id="description"
                name="description"
                rows={7}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the property, its features, surroundings and other useful information."
                className="mt-5 w-full resize-y rounded-lg border border-[#E8DDE1] px-4 py-3 text-sm leading-6 text-[#24171C] outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
              />

              <p className="mt-2 text-xs text-[#756970]">
                Minimum 20 characters.
              </p>
            </section>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-[#E8DDE1] pt-8 sm:flex-row sm:justify-end">
              <Link
                to="/agent/properties"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#E8DDE1] px-5 py-3 text-sm font-semibold text-[#24171C] transition hover:bg-[#FAF8F9]"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditProperty;

