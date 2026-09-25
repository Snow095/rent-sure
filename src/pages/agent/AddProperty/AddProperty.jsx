import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileImage,
  FileText,
  MapPin,
  ShieldCheck,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../services/supabase/client";
import { useAuth } from "../../../context/useAuth";

const initialForm = {
  title: "",
  description: "",
  location: "",
  property_type: "Apartment",
  annual_rent: "",
  bedrooms: "",
  bathrooms: "",
};

const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const PROPERTY_IMAGE_BUCKET = "property-images";

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

function AddProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    return () => {
      imageFiles.forEach((image) => {
        if (image.previewUrl) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });
    };
  }, [imageFiles]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));

    setSubmitError("");
  };

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    setSubmitError("");

    const nextErrors = {
      ...errors,
      images: "",
    };

    const availableSlots =
      MAX_IMAGES - imageFiles.length;

    if (availableSlots <= 0) {
      nextErrors.images = `You can upload a maximum of ${MAX_IMAGES} images.`;
      setErrors(nextErrors);
      event.target.value = "";
      return;
    }

    const filesToProcess = selectedFiles.slice(
      0,
      availableSlots
    );

    if (selectedFiles.length > availableSlots) {
      nextErrors.images = `Only ${availableSlots} more image${
        availableSlots === 1 ? "" : "s"
      } can be added.`;
    }

    const validFiles = [];

    filesToProcess.forEach((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        nextErrors.images =
          "Only JPG, PNG, and WebP images are allowed.";
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        nextErrors.images =
          "Each image must be 5MB or smaller.";
        return;
      }

      validFiles.push({
        id: createFileId(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    });

    setImageFiles((current) => [
      ...current,
      ...validFiles,
    ]);

    setErrors(nextErrors);
    event.target.value = "";
  };

  const removeImage = (imageId) => {
    setImageFiles((current) => {
      const imageToRemove = current.find(
        (image) => image.id === imageId
      );

      if (imageToRemove?.previewUrl) {
        URL.revokeObjectURL(
          imageToRemove.previewUrl
        );
      }

      return current.filter(
        (image) => image.id !== imageId
      );
    });

    setErrors((current) => ({
      ...current,
      images: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title =
        "Property title is required.";
    }

    if (!form.location.trim()) {
      nextErrors.location =
        "Property location is required.";
    }

    if (!form.description.trim()) {
      nextErrors.description =
        "Please provide a property description.";
    }

    if (
      !form.annual_rent ||
      Number(form.annual_rent) <= 0
    ) {
      nextErrors.annual_rent =
        "Enter a valid annual rent.";
    }

    if (
      form.bedrooms === "" ||
      Number(form.bedrooms) < 0
    ) {
      nextErrors.bedrooms =
        "Enter the number of bedrooms.";
    }

    if (
      form.bathrooms === "" ||
      Number(form.bathrooms) < 0
    ) {
      nextErrors.bathrooms =
        "Enter the number of bathrooms.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const uploadPropertyImages = async (
    propertyId
  ) => {
    if (
      imageFiles.length === 0 ||
      !propertyId ||
      !user?.id
    ) {
      return;
    }

    const uploadedPaths = [];
    const imageRecords = [];

    try {
      for (
        let index = 0;
        index < imageFiles.length;
        index += 1
      ) {
        const image = imageFiles[index];
        const file = image.file;

        const extension =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const filePath = `${user.id}/${propertyId}/${createFileId()}.${extension}`;

        const {
          data: storageData,
          error: storageError,
        } = await supabase.storage
          .from(PROPERTY_IMAGE_BUCKET)
          .upload(filePath, file, {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          });

        if (storageError) {
          throw new Error(
            `Image upload failed for "${file.name}": ${storageError.message}`
          );
        }

        if (!storageData?.path) {
          throw new Error(
            `Image upload failed for "${file.name}".`
          );
        }

        uploadedPaths.push(filePath);

        imageRecords.push({
          property_id: propertyId,
          uploaded_by: user.id,
          file_path: filePath,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          display_order: index,
        });
      }

      const {
        error: imageInsertError,
      } = await supabase
        .from("property_images")
        .insert(imageRecords);

      if (imageInsertError) {
        throw imageInsertError;
      }
    } catch (error) {
      console.error(
        "Error uploading property images:",
        error
      );

      if (uploadedPaths.length > 0) {
        await supabase.storage
          .from(PROPERTY_IMAGE_BUCKET)
          .remove(uploadedPaths);
      }

      throw error;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.id || !validate()) {
      return;
    }

    setSaving(true);
    setSubmitError("");
    setSuccess(false);

    try {
      const {
        data,
        error,
      } = await supabase
        .from("properties")
        .insert({
          agent_id: user.id,
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          property_type: form.property_type,
          annual_rent: Number(form.annual_rent),
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          verification_status: "pending",
          property_status: "active",
          risk_score: null,
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      if (!data?.id) {
        throw new Error(
          "The property was created, but its ID could not be determined."
        );
      }

      if (imageFiles.length > 0) {
        await uploadPropertyImages(data.id);
      }

      setSuccess(true);

      setTimeout(() => {
        navigate(
          `/agent/verification/${data.id}`
        );
      }, 1000);
    } catch (error) {
      console.error(
        "Error creating property:",
        error
      );

      setSubmitError(
        error.message ||
          "Unable to create property. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Link
          to="/agent/properties"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:text-[#4A1025]"
        >
          <ArrowLeft size={17} />
          Back to properties
        </Link>

        <section className="mt-6">
          <p className="text-sm font-semibold text-[#7A1F3D]">
            New property
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
            Add a property
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
            Provide accurate property information. After
            submission, you can continue to the verification
            process.
          </p>
        </section>

        {submitError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {submitError}
          </div>
        )}

        {success && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 size={18} />
            Property created successfully. Opening
            verification...
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >
          <section className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
                <Building2 size={19} />
              </div>

              <div>
                <h2 className="font-bold text-[#24171C]">
                  Property information
                </h2>

                <p className="mt-1 text-sm text-[#756970]">
                  Add the core details renters will see.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-5">
              <div>
                <label className="text-sm font-semibold text-[#24171C]">
                  Property title
                </label>

                <input
                  value={form.title}
                  onChange={(event) =>
                    updateField(
                      "title",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Spacious 3-Bedroom Apartment"
                  className={`mt-2 w-full rounded-xl border ${
                    errors.title
                      ? "border-red-400"
                      : "border-[#E8DDE1]"
                  } px-4 py-3 text-sm outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]`}
                />

                {errors.title && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-[#24171C]">
                  Description
                </label>

                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Describe the property, facilities, access, and other relevant information."
                  className={`mt-2 w-full resize-y rounded-xl border ${
                    errors.description
                      ? "border-red-400"
                      : "border-[#E8DDE1]"
                  } px-4 py-3 text-sm outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]`}
                />

                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#24171C]">
                  <MapPin
                    size={16}
                    className="text-[#7A1F3D]"
                  />
                  Location
                </label>

                <input
                  value={form.location}
                  onChange={(event) =>
                    updateField(
                      "location",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Lekki Phase 1, Lagos"
                  className={`mt-2 w-full rounded-xl border ${
                    errors.location
                      ? "border-red-400"
                      : "border-[#E8DDE1]"
                  } px-4 py-3 text-sm outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]`}
                />

                {errors.location && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.location}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
                <FileText size={19} />
              </div>

              <div>
                <h2 className="font-bold text-[#24171C]">
                  Rental details
                </h2>

                <p className="mt-1 text-sm text-[#756970]">
                  Provide the current rental information.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-[#24171C]">
                  Property type
                </label>

                <select
                  value={form.property_type}
                  onChange={(event) =>
                    updateField(
                      "property_type",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[#E8DDE1] bg-white px-4 py-3 text-sm outline-none focus:border-[#7A1F3D] sm:max-w-sm"
                >
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
                <label className="text-sm font-semibold text-[#24171C]">
                  Annual rent (₦)
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.annual_rent}
                  onChange={(event) =>
                    updateField(
                      "annual_rent",
                      event.target.value
                    )
                  }
                  placeholder="2500000"
                  className={`mt-2 w-full rounded-xl border ${
                    errors.annual_rent
                      ? "border-red-400"
                      : "border-[#E8DDE1]"
                  } px-4 py-3 text-sm outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]`}
                />

                {errors.annual_rent && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.annual_rent}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-[#24171C]">
                  Bedrooms
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={(event) =>
                    updateField(
                      "bedrooms",
                      event.target.value
                    )
                  }
                  placeholder="3"
                  className={`mt-2 w-full rounded-xl border ${
                    errors.bedrooms
                      ? "border-red-400"
                      : "border-[#E8DDE1]"
                  } px-4 py-3 text-sm outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]`}
                />

                {errors.bedrooms && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.bedrooms}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-[#24171C]">
                  Bathrooms
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.bathrooms}
                  onChange={(event) =>
                    updateField(
                      "bathrooms",
                      event.target.value
                    )
                  }
                  placeholder="3"
                  className={`mt-2 w-full rounded-xl border ${
                    errors.bathrooms
                      ? "border-red-400"
                      : "border-[#E8DDE1]"
                  } px-4 py-3 text-sm outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]`}
                />

                {errors.bathrooms && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.bathrooms}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
                <FileImage size={19} />
              </div>

              <div>
                <h2 className="font-bold text-[#24171C]">
                  Property images
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#756970]">
                  Add clear photos of the property so renters
                  can see the listing before requesting a
                  viewing.
                </p>
              </div>
            </div>

            <div className="mt-7">
              <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D8C2C9] bg-[#FAF8F9] px-5 py-8 text-center transition hover:border-[#7A1F3D] hover:bg-[#F8EDEF]">
                <FileImage
                  size={30}
                  className="text-[#7A1F3D]"
                />

                <p className="mt-3 text-sm font-semibold text-[#24171C]">
                  Click to choose property images
                </p>

                <p className="mt-1 text-xs leading-5 text-[#756970]">
                  JPG, PNG, or WebP · Maximum 5MB each · Up
                  to {MAX_IMAGES} images
                </p>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  disabled={
                    saving ||
                    imageFiles.length >= MAX_IMAGES
                  }
                  className="hidden"
                />
              </label>

              {errors.images && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.images}
                </p>
              )}

              {imageFiles.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {imageFiles.map((image) => (
                    <div
                      key={image.id}
                      className="group relative overflow-hidden rounded-xl border border-[#E8DDE1] bg-[#FAF8F9]"
                    >
                      <img
                        src={image.previewUrl}
                        alt={
                          image.file.name ||
                          "Selected property"
                        }
                        className="aspect-square w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(image.id)
                        }
                        disabled={saving}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Remove ${image.file.name}`}
                      >
                        <X size={15} />
                      </button>

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-6">
                        <p className="truncate text-xs font-medium text-white">
                          {image.file.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 shrink-0 text-[#7A1F3D]"
                size={21}
              />

              <div>
                <h2 className="font-bold text-[#24171C]">
                  What happens next?
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#756970]">
                  New properties start with a pending
                  verification status. After creating the
                  property, you will be able to submit
                  supporting documents for review.
                </p>
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/agent/properties"
              className="inline-flex items-center justify-center rounded-xl border border-[#E8DDE1] px-5 py-3 text-sm font-semibold text-[#24171C] transition hover:bg-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || success}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7A1F3D] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Creating..."
                : "Create property"}

              {!saving && <ArrowRight size={17} />}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AddProperty;