import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../../services/supabase/client";
import { useAuth } from "../../../context/useAuth";

const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const propertyTypeOptions = [
  "Apartment",
  "House",
  "Duplex",
  "Self Contain",
];

function EditProperty() {
  const { id } = useParams();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    property_type: "Apartment",
    annual_rent: "",
    bedrooms: "",
    bathrooms: "",
  });

  const [original, setOriginal] = useState(null);
  const [images, setImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id || !user?.id) {
      return undefined;
    }

    let cancelled = false;

    const loadProperty = async () => {
      const { data, error: fetchError } = await supabase
        .from("properties")
        .select(
          "id, title, description, location, property_type, annual_rent, bedrooms, bathrooms, verification_status, property_status, risk_score"
        )
        .eq("id", id)
        .eq("agent_id", user.id)
        .single();

      if (cancelled) {
        return;
      }

      if (fetchError) {
        console.error(
          "Error loading property:",
          fetchError
        );

        setError(
          "We couldn't load this property. Please try again."
        );
        setLoading(false);
        return;
      }

      const property = {
        ...data,
        annual_rent: data.annual_rent ?? "",
        bedrooms: data.bedrooms ?? "",
        bathrooms: data.bathrooms ?? "",
      };

      const { data: imageData, error: imageError } =
        await supabase
          .from("property_images")
          .select(
            "id, property_id, file_path, file_name, file_type, file_size, display_order, created_at"
          )
          .eq("property_id", id)
          .order("display_order", {
            ascending: true,
          })
          .order("created_at", {
            ascending: true,
          });

      if (cancelled) {
        return;
      }

      if (imageError) {
        console.error(
          "Error loading property images:",
          imageError
        );
      }

      const existingImages = (imageData || []).map(
        (image) => {
          const { data: publicUrlData } =
            supabase.storage
              .from("property-images")
              .getPublicUrl(image.file_path);

          return {
            ...image,
            publicUrl:
              publicUrlData?.publicUrl || "",
          };
        }
      );

      setOriginal(property);

      setForm({
        title: property.title || "",
        description: property.description || "",
        location: property.location || "",
        property_type:
          propertyTypeOptions.includes(
            property.property_type
          )
            ? property.property_type
            : "Apartment",
        annual_rent: property.annual_rent,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
      });

      setImages(existingImages);
      setLoading(false);
    };

    loadProperty();

    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [newImagePreviews]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleImageSelection = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    setError("");
    setSuccess("");

    const availableSlots =
      MAX_IMAGES -
      images.length -
      newImageFiles.length;

    if (availableSlots <= 0) {
      setError(
        `A property can have a maximum of ${MAX_IMAGES} images.`
      );
      event.target.value = "";
      return;
    }

    const filesToAdd = selectedFiles.slice(
      0,
      availableSlots
    );

    const invalidType = filesToAdd.find(
      (file) => !allowedImageTypes.includes(file.type)
    );

    if (invalidType) {
      setError(
        "Only JPG, PNG and WebP images are allowed."
      );
      event.target.value = "";
      return;
    }

    const oversizedFile = filesToAdd.find(
      (file) => file.size > MAX_IMAGE_SIZE
    );

    if (oversizedFile) {
      setError(
        "Each image must be 5MB or smaller."
      );
      event.target.value = "";
      return;
    }

    const previews = filesToAdd.map((file) =>
      URL.createObjectURL(file)
    );

    setNewImageFiles((current) => [
      ...current,
      ...filesToAdd,
    ]);

    setNewImagePreviews((current) => [
      ...current,
      ...previews,
    ]);

    event.target.value = "";
  };

  const removeNewImage = (index) => {
    const preview = newImagePreviews[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setNewImageFiles((current) =>
      current.filter((_, currentIndex) => currentIndex !== index)
    );

    setNewImagePreviews((current) =>
      current.filter((_, currentIndex) => currentIndex !== index)
    );

    setError("");
    setSuccess("");
  };

  const uploadNewImages = async () => {
    if (newImageFiles.length === 0) {
      return;
    }

    setImageUploading(true);

    const uploadedPaths = [];
    const imageRows = [];

    try {
      const startingOrder = images.length;

      for (let index = 0; index < newImageFiles.length; index += 1) {
        const file = newImageFiles[index];

        const extension =
          file.name.split(".").pop()?.toLowerCase() ||
          "jpg";

        const filePath = `${user.id}/${id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("property-images")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type,
            });

        if (uploadError) {
          throw uploadError;
        }

        uploadedPaths.push(filePath);

        imageRows.push({
          property_id: Number(id),
          uploaded_by: user.id,
          file_path: filePath,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          display_order: startingOrder + index,
        });
      }

      const { data, error: metadataError } =
        await supabase
          .from("property_images")
          .insert(imageRows)
          .select(
            "id, property_id, file_path, file_name, file_type, file_size, display_order, created_at"
          );

      if (metadataError) {
        throw metadataError;
      }

      const uploadedImages = (data || []).map(
        (image) => {
          const { data: publicUrlData } =
            supabase.storage
              .from("property-images")
              .getPublicUrl(image.file_path);

          return {
            ...image,
            publicUrl:
              publicUrlData?.publicUrl || "",
          };
        }
      );

      setImages((current) => [
        ...current,
        ...uploadedImages,
      ]);

      setNewImageFiles([]);
      setNewImagePreviews([]);

      setSuccess(
        "New property images uploaded successfully."
      );
    } catch (uploadError) {
      console.error(
        "Error uploading property images:",
        uploadError
      );

      if (uploadedPaths.length > 0) {
        const { error: cleanupError } =
          await supabase.storage
            .from("property-images")
            .remove(uploadedPaths);

        if (cleanupError) {
          console.error(
            "Error cleaning up uploaded images:",
            cleanupError
          );
        }
      }

      throw uploadError;
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Property title is required.");
      return;
    }

    if (!form.location.trim()) {
      setError("Property location is required.");
      return;
    }

    if (!form.description.trim()) {
      setError("Property description is required.");
      return;
    }

    if (!propertyTypeOptions.includes(form.property_type)) {
      setError("Select a valid property type.");
      return;
    }

    if (
      !form.annual_rent ||
      Number(form.annual_rent) <= 0
    ) {
      setError("Enter a valid annual rent.");
      return;
    }

    if (
      Number(form.bedrooms) < 0 ||
      Number(form.bathrooms) < 0
    ) {
      setError(
        "Bedrooms and bathrooms cannot be negative."
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const changedVerificationFields =
        form.title.trim() !==
          (original?.title || "") ||
        form.location.trim() !==
          (original?.location || "") ||
        form.property_type !==
          (original?.property_type || "") ||
        Number(form.annual_rent) !==
          Number(original?.annual_rent || 0) ||
        Number(form.bedrooms) !==
          Number(original?.bedrooms || 0) ||
        Number(form.bathrooms) !==
          Number(original?.bathrooms || 0) ||
        form.description.trim() !==
          (original?.description || "");

      const { error: updateError } =
        await supabase
          .from("properties")
          .update({
            title: form.title.trim(),
            description: form.description.trim(),
            location: form.location.trim(),
            property_type: form.property_type,
            annual_rent: Number(form.annual_rent),
            bedrooms: Number(form.bedrooms),
            bathrooms: Number(form.bathrooms),
          })
          .eq("id", id)
          .eq("agent_id", user.id);

      if (updateError) {
        throw updateError;
      }

      if (newImageFiles.length > 0) {
        await uploadNewImages();
      }

      setSuccess(
        changedVerificationFields
          ? "Property updated. Its verification may need to be reviewed again because important information changed."
          : "Property updated successfully."
      );

      setOriginal((current) => ({
        ...current,
        ...form,
        annual_rent: Number(form.annual_rent),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
      }));
    } catch (updateError) {
      console.error(
        "Error updating property:",
        updateError
      );

      setError(
        updateError?.message ||
          "We couldn't update this property. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const totalImageCount =
    images.length + newImageFiles.length;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F9]">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-40 rounded bg-[#E8DDE1]" />
            <div className="h-10 w-64 rounded bg-[#E8DDE1]" />
            <div className="h-[620px] rounded-2xl bg-white shadow-sm" />
          </div>
        </div>
      </main>
    );
  }

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

        <div className="mt-6">
          <p className="text-sm font-semibold text-[#7A1F3D]">
            Property management
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
            Edit property
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#756970] sm:text-base">
            Keep your property information accurate and up to
            date.
          </p>
        </div>

        {error && (
          <div className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle
              className="mt-0.5 shrink-0"
              size={18}
            />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2
              className="mt-0.5 shrink-0"
              size={18}
            />
            <span>{success}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >
          <section className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-[#24171C]">
              Property information
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="property-title"
                  className="text-sm font-semibold text-[#24171C]"
                >
                  Property title
                </label>

                <input
                  id="property-title"
                  value={form.title}
                  onChange={(event) =>
                    updateField(
                      "title",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[#E8DDE1] px-4 py-3 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                />
              </div>

              <div>
                <label
                  htmlFor="property-description"
                  className="text-sm font-semibold text-[#24171C]"
                >
                  Description
                </label>

                <textarea
                  id="property-description"
                  rows={6}
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full resize-y rounded-xl border border-[#E8DDE1] px-4 py-3 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                />
              </div>

              <div>
                <label
                  htmlFor="property-location"
                  className="text-sm font-semibold text-[#24171C]"
                >
                  Location
                </label>

                <input
                  id="property-location"
                  value={form.location}
                  onChange={(event) =>
                    updateField(
                      "location",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[#E8DDE1] px-4 py-3 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-[#24171C]">
              Rental details
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="property-type"
                  className="text-sm font-semibold text-[#24171C]"
                >
                  Property type
                </label>

                <select
                  id="property-type"
                  value={form.property_type}
                  onChange={(event) =>
                    updateField(
                      "property_type",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[#E8DDE1] bg-white px-4 py-3 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D] sm:max-w-sm"
                >
                  {propertyTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="annual-rent"
                  className="text-sm font-semibold text-[#24171C]"
                >
                  Annual rent (₦)
                </label>

                <input
                  id="annual-rent"
                  type="number"
                  min="0"
                  value={form.annual_rent}
                  onChange={(event) =>
                    updateField(
                      "annual_rent",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[#E8DDE1] px-4 py-3 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D]"
                />
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
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={(event) =>
                    updateField(
                      "bedrooms",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[#E8DDE1] px-4 py-3 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D]"
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
                  type="number"
                  min="0"
                  value={form.bathrooms}
                  onChange={(event) =>
                    updateField(
                      "bathrooms",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[#E8DDE1] px-4 py-3 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D]"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#24171C]">
                  Property images
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#756970]">
                  Keep your listing photos up to date. You can
                  have up to {MAX_IMAGES} images, with a maximum
                  size of 5MB each.
                </p>
              </div>

              <p className="text-sm font-semibold text-[#7A1F3D]">
                {totalImageCount}/{MAX_IMAGES} images
              </p>
            </div>

            {images.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                  Current images
                </p>

                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[#E8DDE1] bg-[#F8EDEF]"
                    >
                      {image.publicUrl ? (
                        <img
                          src={image.publicUrl}
                          alt={
                            image.file_name ||
                            "Property"
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#7A1F3D]">
                          <ImagePlus size={30} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newImagePreviews.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                  New images
                </p>

                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {newImagePreviews.map(
                    (preview, index) => (
                      <div
                        key={`${preview}-${index}`}
                        className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#E8DDE1] bg-[#F8EDEF]"
                      >
                        <img
                          src={preview}
                          alt={`New property preview ${
                            index + 1
                          }`}
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeNewImage(index)
                          }
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-black/80"
                          aria-label={`Remove new image ${
                            index + 1
                          }`}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {totalImageCount < MAX_IMAGES && (
              <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E8DDE1] bg-[#FAF8F9] px-5 py-8 text-center transition hover:border-[#7A1F3D] hover:bg-[#F8EDEF]">
                <ImagePlus
                  size={28}
                  className="text-[#7A1F3D]"
                />

                <span className="mt-3 text-sm font-semibold text-[#24171C]">
                  Add property images
                </span>

                <span className="mt-1 text-xs text-[#756970]">
                  JPG, PNG or WebP • Max 5MB each
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageSelection}
                  className="sr-only"
                  disabled={
                    saving || imageUploading
                  }
                />
              </label>
            )}

            {images.length === 0 &&
              newImagePreviews.length === 0 && (
                <p className="mt-4 text-xs text-[#756970]">
                  No property images have been uploaded yet.
                </p>
              )}
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <div>
                <h2 className="font-semibold text-amber-900">
                  Verification notice
                </h2>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Changing important property information can
                  cause the property to require verification
                  again. This helps keep verification information
                  aligned with the current listing.
                </p>
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/agent/properties"
              className="inline-flex items-center justify-center rounded-xl border border-[#E8DDE1] px-5 py-3 text-sm font-semibold text-[#24171C] hover:bg-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || imageUploading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7A1F3D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {imageUploading
                ? "Uploading images..."
                : saving
                  ? "Saving..."
                  : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditProperty;