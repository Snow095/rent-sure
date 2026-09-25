import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Edit3,
  Image as ImageIcon,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../../services/supabase/client";
import { useAuth } from "../../../context/useAuth";

function VerificationBadge({ status }) {
  const config = {
    verified: {
      label: "Verified",
      className: "border-green-200 bg-green-50 text-green-700",
    },
    pending: {
      label: "Pending",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    needs_information: {
      label: "Needs information",
      className: "border-orange-200 bg-orange-50 text-orange-700",
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${item.className}`}
    >
      <ShieldCheck size={13} />
      {item.label}
    </span>
  );
}

function PropertyImage({ property }) {
  if (property.image_url) {
    return (
      <img
        src={property.image_url}
        alt={property.title || "Property"}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-[#F8EDEF] text-[#7A1F3D]">
      <Building2 size={48} strokeWidth={1.3} />
    </div>
  );
}

function AgentProperties() {
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState("");
  const [verificationFilter, setVerificationFilter] =
    useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    let cancelled = false;

    const loadProperties = async () => {
      const { data, error: fetchError } = await supabase
        .from("properties")
        .select(
          "id, title, location, property_type, annual_rent, bedrooms, bathrooms, verification_status, property_status, risk_score, created_at"
        )
        .eq("agent_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) {
        return;
      }

      if (fetchError) {
        console.error(
          "Error loading agent properties:",
          fetchError
        );

        setError(
          "We couldn't load your properties. Please try again."
        );
        setProperties([]);
        setLoading(false);

        return;
      }

      const propertyRows = data || [];
      const propertyIds = propertyRows.map(
        (property) => property.id
      );

      let imageRows = [];

      if (propertyIds.length > 0) {
        const { data: images, error: imageError } =
          await supabase
            .from("property_images")
            .select(
              "id, property_id, file_path, file_name, display_order, created_at"
            )
            .in("property_id", propertyIds)
            .order("display_order", {
              ascending: true,
            })
            .order("created_at", {
              ascending: true,
            });

        if (imageError) {
          console.error(
            "Error loading property images:",
            imageError
          );
        } else {
          imageRows = images || [];
        }
      }

      if (cancelled) {
        return;
      }

      const firstImageByProperty = {};

      imageRows.forEach((image) => {
        if (
          firstImageByProperty[image.property_id] ||
          !image.file_path
        ) {
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("property-images")
          .getPublicUrl(image.file_path);

        if (publicUrlData?.publicUrl) {
          firstImageByProperty[image.property_id] =
            publicUrlData.publicUrl;
        }
      });

      const enrichedProperties = propertyRows.map(
        (property) => ({
          ...property,
          image_url:
            firstImageByProperty[property.id] || null,
        })
      );

      setProperties(enrichedProperties);
      setError("");
      setLoading(false);
    };

    loadProperties();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesSearch =
        !query ||
        property.title
          ?.toLowerCase()
          .includes(query) ||
        property.location
          ?.toLowerCase()
          .includes(query) ||
        property.property_type
          ?.toLowerCase()
          .includes(query);

      const matchesVerification =
        verificationFilter === "all" ||
        property.verification_status ===
          verificationFilter;

      const matchesStatus =
        statusFilter === "all" ||
        property.property_status === statusFilter;

      return (
        matchesSearch &&
        matchesVerification &&
        matchesStatus
      );
    });
  }, [
    properties,
    search,
    verificationFilter,
    statusFilter,
  ]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F9]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 rounded-lg bg-[#E8DDE1]" />

            <div className="h-20 rounded-2xl bg-white" />

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-64 rounded-2xl bg-white shadow-sm"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#7A1F3D]">
              Agent workspace
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
              My properties
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
              Manage your listings and monitor their
              verification status.
            </p>
          </div>

          <Link
            to="/agent/add-property"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025]"
          >
            <Plus size={18} />
            Add property
          </Link>
        </section>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by property name, location, or type"
                className="w-full rounded-xl border border-[#E8DDE1] bg-white py-3 pl-10 pr-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#9A8E94] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <SlidersHorizontal
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
                />

                <select
                  value={verificationFilter}
                  onChange={(event) =>
                    setVerificationFilter(
                      event.target.value
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-[#E8DDE1] bg-white py-3 pl-9 pr-9 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D] sm:w-48"
                >
                  <option value="all">
                    All verification
                  </option>
                  <option value="verified">
                    Verified
                  </option>
                  <option value="pending">
                    Pending
                  </option>
                  <option value="needs_information">
                    Needs information
                  </option>
                  <option value="rejected">
                    Rejected
                  </option>
                </select>
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="rounded-xl border border-[#E8DDE1] bg-white px-4 py-3 text-sm text-[#24171C] outline-none focus:border-[#7A1F3D] sm:w-40"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="inactive">
                  Inactive
                </option>
                <option value="rented">Rented</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#E8DDE1] pt-4">
            <p className="text-sm text-[#756970]">
              Showing{" "}
              <span className="font-semibold text-[#24171C]">
                {filteredProperties.length}
              </span>{" "}
              of {properties.length} properties
            </p>
          </div>
        </section>

        {filteredProperties.length > 0 ? (
          <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProperties.map((property) => (
              <article
                key={property.id}
                className="overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-48 overflow-hidden bg-[#F8EDEF]">
                  <PropertyImage property={property} />

                  {property.image_url && (
                    <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                      <ImageIcon size={13} />
                      Photos
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-bold text-[#24171C]">
                        {property.title}
                      </h2>

                      <p className="mt-1 truncate text-sm text-[#756970]">
                        {property.location}
                      </p>
                    </div>

                    <VerificationBadge
                      status={
                        property.verification_status
                      }
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-[#FAF8F9] p-3">
                      <p className="text-xs text-[#756970]">
                        Rent
                      </p>

                      <p className="mt-1 font-bold text-[#7A1F3D]">
                        ₦
                        {Number(
                          property.annual_rent || 0
                        ).toLocaleString("en-NG")}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#FAF8F9] p-3">
                      <p className="text-xs text-[#756970]">
                        Type
                      </p>

                      <p className="mt-1 font-semibold capitalize text-[#24171C]">
                        {property.property_type || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-[#756970]">
                    <span>
                      {property.bedrooms || 0} bed •{" "}
                      {property.bathrooms || 0} bath
                    </span>

                    <span className="capitalize">
                      {property.property_status || "—"}
                    </span>
                  </div>

                  <Link
                    to={`/agent/properties/${property.id}/edit`}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#7A1F3D] px-4 py-2.5 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                  >
                    <Edit3 size={16} />
                    Manage property
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-6 rounded-2xl border border-[#E8DDE1] bg-white p-10 text-center shadow-sm">
            <Building2
              size={38}
              className="mx-auto text-[#7A1F3D]"
              strokeWidth={1.5}
            />

            <h2 className="mt-4 text-lg font-bold text-[#24171C]">
              {properties.length === 0
                ? "No properties yet"
                : "No matching properties"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756970]">
              {properties.length === 0
                ? "Create your first rental property listing to begin the verification process."
                : "Try changing your search or filters to find another property."}
            </p>

            {properties.length === 0 && (
              <Link
                to="/agent/add-property"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white"
              >
                <Plus size={17} />
                Add property
              </Link>
            )}
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <ShieldCheck
              className="mt-0.5 shrink-0 text-[#7A1F3D]"
              size={20}
            />

            <div>
              <h2 className="font-semibold text-[#24171C]">
                Verification reminder
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#756970]">
                Keep your property information and
                supporting documents accurate. Verification
                status may change when important property
                details are edited.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AgentProperties;