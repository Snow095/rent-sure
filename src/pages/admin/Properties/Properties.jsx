
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  ChevronDown,
  ExternalLink,
  Flag,
  Loader2,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../../services/supabase/client";

const STATUS_OPTIONS = [
  "active",
  "inactive",
  "rented",
  "flagged",
];

const VERIFICATION_OPTIONS = [
  "all",
  "pending",
  "verified",
  "rejected",
  "needs_information",
];

function AdminProperties() {
  const [searchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("agent") || ""
  );

  const [verificationFilter, setVerificationFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [updatingId, setUpdatingId] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadProperties = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
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
          verification_status,
          property_status,
          risk_score,
          created_at,
          updated_at
        `)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setProperties(data ?? []);
    } catch (error) {
      console.error(
        "Error loading admin properties:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load properties."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesSearch =
        !search ||
        property.title?.toLowerCase().includes(search) ||
        property.location?.toLowerCase().includes(search) ||
        property.id?.toString().includes(search) ||
        property.agent_id?.toLowerCase().includes(search);

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
    searchTerm,
    verificationFilter,
    statusFilter,
  ]);

  const statistics = useMemo(
    () => ({
      total: properties.length,
      verified: properties.filter(
        (item) =>
          item.verification_status === "verified"
      ).length,
      pending: properties.filter(
        (item) =>
          item.verification_status === "pending"
      ).length,
      flagged: properties.filter(
        (item) =>
          item.property_status === "flagged"
      ).length,
    }),
    [properties]
  );

  const handleStatusChange = async (
    property,
    newStatus
  ) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!STATUS_OPTIONS.includes(newStatus)) {
      setErrorMessage("Invalid property status.");
      return;
    }

    if (property.property_status === newStatus) {
      return;
    }

    if (
      newStatus === "flagged" &&
      property.property_status !== "flagged"
    ) {
      const confirmed = window.confirm(
        "Flag this property? Flagged properties should remain unavailable until reviewed."
      );

      if (!confirmed) return;
    }

    setUpdatingId(property.id);

    try {
      const { error } = await supabase
        .from("properties")
        .update({
          property_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", property.id);

      if (error) {
        throw error;
      }

      setProperties((current) =>
        current.map((item) =>
          item.id === property.id
            ? {
                ...item,
                property_status: newStatus,
              }
            : item
        )
      );

      setSuccessMessage(
        `"${property.title}" is now ${formatStatus(
          newStatus
        )}.`
      );
    } catch (error) {
      console.error(
        "Error updating property status:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to update property status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-3 py-1.5 text-xs font-bold text-[#7A1F3D]">
            <Building2 size={14} />
            Administrator Management
          </div>

          <h1 className="text-2xl font-bold text-[#24171C] sm:text-3xl">
            Property Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970]">
            Monitor listings, verification states,
            risk scores, and property availability.
          </p>
        </header>

        <AlertArea
          error={errorMessage}
          success={successMessage}
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Properties"
            value={statistics.total}
          />

          <StatCard
            label="Verified"
            value={statistics.verified}
          />

          <StatCard
            label="Pending"
            value={statistics.pending}
          />

          <StatCard
            label="Flagged"
            value={statistics.flagged}
            icon={<Flag size={20} />}
          />
        </section>

        <section className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <FilterInput
              label="Search"
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Title, location, property ID, agent ID..."
            />

            <FilterSelect
              label="Verification"
              value={verificationFilter}
              onChange={setVerificationFilter}
              options={VERIFICATION_OPTIONS}
              formatOption={formatVerification}
            />

            <FilterSelect
              label="Listing Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={["all", ...STATUS_OPTIONS]}
              formatOption={formatStatus}
            />
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm">
          <div className="border-b border-[#E8DDE1] px-5 py-5">
            <h2 className="font-bold text-[#24171C]">
              Properties
            </h2>

            <p className="mt-1 text-sm text-[#756970]">
              {filteredProperties.length} listing
              {filteredProperties.length === 1
                ? ""
                : "s"} shown
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2
                size={30}
                className="animate-spin text-[#7A1F3D]"
              />
            </div>
          ) : filteredProperties.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full">
                  <thead className="bg-[#FAF8F9]">
                    <tr className="border-b border-[#E8DDE1]">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                        Property
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                        Verification
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                        Risk
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-[#756970]">
                        View
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E8DDE1]">
                    {filteredProperties.map(
                      (property) => (
                        <PropertyRow
                          key={property.id}
                          property={property}
                          updatingId={updatingId}
                          onStatusChange={
                            handleStatusChange
                          }
                        />
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-[#E8DDE1] md:hidden">
                {filteredProperties.map(
                  (property) => (
                    <PropertyMobileCard
                      key={property.id}
                      property={property}
                      updatingId={updatingId}
                      onStatusChange={
                        handleStatusChange
                      }
                    />
                  )
                )}
              </div>
            </>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-[#E8DDE1] bg-white p-5 sm:p-6">
          <div className="flex gap-3">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-[#7A1F3D]"
            />

            <p className="text-sm leading-6 text-[#756970]">
              Administrators can manage listing status.
              Verification status and risk score remain
              controlled by the verification workflow and
              database protections.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function PropertyRow({
  property,
  updatingId,
  onStatusChange,
}) {
  const updating = updatingId === property.id;

  return (
    <tr className="hover:bg-[#FCFAFB]">
      <td className="px-6 py-5">
        <p className="font-semibold text-[#24171C]">
          {property.title}
        </p>

        <p className="mt-1 text-sm text-[#756970]">
          {property.location}
        </p>

        <p className="mt-1 text-xs text-[#9A8F94]">
          ID: {property.id}
        </p>
      </td>

      <td className="px-6 py-5">
        <VerificationBadge
          status={property.verification_status}
        />
      </td>

      <td className="px-6 py-5">
        <RiskBadge score={property.risk_score} />
      </td>

      <td className="px-6 py-5">
        <StatusSelect
          value={property.property_status}
          disabled={updating}
          onChange={(value) =>
            onStatusChange(property, value)
          }
        />
      </td>

      <td className="px-6 py-5 text-right">
        <Link
          to={`/properties/${property.id}`}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#7A1F3D] hover:bg-[#F8EDEF]"
        >
          View
          <ExternalLink size={15} />
        </Link>
      </td>
    </tr>
  );
}

function PropertyMobileCard({
  property,
  updatingId,
  onStatusChange,
}) {
  const updating = updatingId === property.id;

  return (
    <article className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-[#24171C]">
            {property.title}
          </h3>

          <p className="mt-1 text-sm text-[#756970]">
            {property.location}
          </p>

          <p className="mt-1 text-xs text-[#9A8F94]">
            ID: {property.id}
          </p>
        </div>

        <RiskBadge score={property.risk_score} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <VerificationBadge
          status={property.verification_status}
        />
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-xs font-semibold text-[#756970]">
          Listing Status
        </label>

        <StatusSelect
          value={property.property_status}
          disabled={updating}
          onChange={(value) =>
            onStatusChange(property, value)
          }
          fullWidth
        />
      </div>

      <Link
        to={`/properties/${property.id}`}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D]"
      >
        View Property
        <ExternalLink size={15} />
      </Link>
    </article>
  );
}

function StatusSelect({
  value,
  onChange,
  disabled,
  fullWidth = false,
}) {
  return (
    <div
      className={`relative ${
        fullWidth ? "w-full" : "inline-block"
      }`}
    >
      <select
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`appearance-none rounded-lg border border-[#E8DDE1] bg-white py-2.5 pl-3 pr-9 text-sm font-semibold text-[#7A1F3D] outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF] disabled:opacity-60 ${
          fullWidth ? "w-full" : ""
        }`}
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {formatStatus(status)}
          </option>
        ))}
      </select>

      {disabled ? (
        <Loader2
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#7A1F3D]"
        />
      ) : (
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#756970]"
        />
      )}
    </div>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#24171C]">
        {label}
      </label>

      <div className="relative">
        <Search
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
        />

        <input
          type="search"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          className="w-full rounded-lg border border-[#E8DDE1] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
        />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  formatOption,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#24171C]">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full appearance-none rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {formatOption(option)}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#756970]"
        />
      </div>
    </div>
  );
}

function VerificationBadge({ status }) {
  return (
    <span className="inline-flex rounded-full bg-[#F8EDEF] px-3 py-1.5 text-xs font-bold text-[#7A1F3D]">
      {formatVerification(status)}
    </span>
  );
}

function RiskBadge({ score }) {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
        Not scored
      </span>
    );
  }

  let label = "Low";

  if (score >= 60) {
    label = "High";
  } else if (score >= 30) {
    label = "Moderate";
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
      {score} · {label}
    </span>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#756970]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-[#24171C]">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
          {icon || <Building2 size={20} />}
        </div>
      </div>
    </div>
  );
}

function AlertArea({ error, success }) {
  if (!error && !success) return null;

  return (
    <div className="mb-6 space-y-3">
      {error && (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <Check size={18} />
          {success}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <Building2
        size={34}
        className="mx-auto text-[#7A1F3D]"
      />

      <h3 className="mt-4 font-bold text-[#24171C]">
        No properties found
      </h3>

      <p className="mt-2 text-sm text-[#756970]">
        Try adjusting your search or filters.
      </p>
    </div>
  );
}

function formatStatus(status) {
  if (status === "all") return "All Statuses";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function formatVerification(status) {
  if (status === "all") return "All Verification";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

export default AdminProperties;

