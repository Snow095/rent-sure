
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  Loader2,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { supabase } from "../../services/supabase/client";

function formatAmount(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "₦0";
  }

  return `₦${amount.toLocaleString("en-NG")}`;
}

function VerificationBadge({ status }) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5EC] px-3 py-1.5 text-xs font-semibold text-[#15803D]">
        <ShieldCheck size={14} />
        Verified
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-[#B91C1C]">
        Not Verified
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-[#B45309]">
      Under Review
    </span>
  );
}

function AgentProfile() {
  const { agentId } = useParams();

  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchAgentProfile = async () => {
      if (!agentId) {
        setErrorMessage("Agent information could not be found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const { data: agentData, error: agentError } =
        await supabase
          .from("profiles")
          .select("id, full_name, role, created_at")
          .eq("id", agentId)
          .eq("role", "agent")
          .single();

      if (agentError) {
        console.error("Error loading agent:", agentError);
        setErrorMessage(
          "This agent could not be found or is no longer available."
        );
        setLoading(false);
        return;
      }

      const { data: propertyData, error: propertyError } =
        await supabase
          .from("properties")
          .select(`
            id,
            title,
            location,
            property_type,
            annual_rent,
            bedrooms,
            bathrooms,
            verification_status,
            property_status
          `)
          .eq("agent_id", agentId)
          .eq("property_status", "active")
          .order("created_at", { ascending: false });

      if (propertyError) {
        console.error(
          "Error loading agent properties:",
          propertyError
        );
      }

      setAgent(agentData);
      setProperties(propertyData ?? []);
      setLoading(false);
    };

    fetchAgentProfile();
  }, [agentId]);

  const verifiedCount = useMemo(
    () =>
      properties.filter(
        (property) => property.verification_status === "verified"
      ).length,
    [properties]
  );

  const averageRent = useMemo(() => {
    if (!properties.length) {
      return 0;
    }

    const total = properties.reduce(
      (sum, property) => sum + Number(property.annual_rent || 0),
      0
    );

    return total / properties.length;
  }, [properties]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F9] px-5">
        <div className="text-center">
          <Loader2
            size={36}
            className="mx-auto animate-spin text-[#7A1F3D]"
          />

          <p className="mt-4 text-sm font-medium text-[#756970]">
            Loading agent profile...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !agent) {
    return (
      <main className="min-h-screen bg-[#FAF8F9] px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:underline"
          >
            <ArrowLeft size={17} />
            Back to Agents
          </Link>

          <div className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-[#24171C]">
              Agent unavailable
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#756970]">
              {errorMessage ||
                "We couldn't retrieve this agent profile."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      {/* Profile Header */}
      <section className="border-b border-[#E8DDE1] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:underline"
          >
            <ArrowLeft size={17} />
            Back to Agents
          </Link>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#F8EDEF] text-[#7A1F3D]">
              <UserRound size={38} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-[#24171C]">
                  {agent.full_name || "RentSure Agent"}
                </h1>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5EC] px-3 py-1.5 text-xs font-semibold text-[#15803D]">
                  <ShieldCheck size={14} />
                  RentSure Agent
                </span>
              </div>

              <p className="mt-2 text-sm leading-6 text-[#756970]">
                Rental property agent on the RentSure platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-[#756970]">
              <Building2 size={20} />
              <span className="text-sm font-medium">
                Active Listings
              </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-[#24171C]">
              {properties.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-[#756970]">
              <ShieldCheck size={20} />
              <span className="text-sm font-medium">
                Verified Listings
              </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-[#24171C]">
              {verifiedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-[#756970]">
              <Building2 size={20} />
              <span className="text-sm font-medium">
                Average Annual Rent
              </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-[#24171C]">
              {formatAmount(averageRent)}
            </p>
          </div>
        </div>

        {/* Properties */}
        <div className="mt-12">
          <div>
            <h2 className="text-2xl font-bold text-[#24171C]">
              Properties by {agent.full_name || "this agent"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#756970]">
              Browse the agent's currently active rental listings.
            </p>
          </div>

          {properties.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white px-6 py-14 text-center shadow-sm">
              <Building2
                size={34}
                className="mx-auto text-[#7A1F3D]"
              />

              <h3 className="mt-5 text-lg font-bold text-[#24171C]">
                No active properties
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756970]">
                This agent currently has no active rental properties
                listed on RentSure.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <article
                  key={property.id}
                  className="overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm"
                >
                  {/* Visual */}
                  <div className="flex h-44 items-center justify-center bg-[#F8EDEF]">
                    <Building2
                      size={58}
                      strokeWidth={1.4}
                      className="text-[#7A1F3D]"
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="rounded-full bg-[#FAF8F9] px-3 py-1.5 text-xs font-semibold text-[#756970]">
                        {property.property_type}
                      </span>

                      <VerificationBadge
                        status={property.verification_status}
                      />
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-[#24171C]">
                      {property.title}
                    </h3>

                    <div className="mt-3 flex items-start gap-2 text-sm text-[#756970]">
                      <MapPin
                        size={17}
                        className="mt-0.5 shrink-0"
                      />

                      <span>{property.location}</span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-[#756970]">
                        <BedDouble size={17} />
                        {property.bedrooms} Beds
                      </div>

                      <div className="flex items-center gap-2 text-sm text-[#756970]">
                        <Bath size={17} />
                        {property.bathrooms} Baths
                      </div>
                    </div>

                    <div className="mt-6 flex items-end justify-between gap-4 border-t border-[#E8DDE1] pt-5">
                      <div>
                        <p className="text-xs text-[#756970]">
                          Annual Rent
                        </p>

                        <p className="mt-1 text-lg font-bold text-[#7A1F3D]">
                          {formatAmount(property.annual_rent)}
                        </p>
                      </div>

                      <Link
                        to={`/properties/${property.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#7A1F3D] hover:underline"
                      >
                        View
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Safety Notice */}
        <div className="mt-12 rounded-2xl border border-[#E8DDE1] bg-white p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={21}
              className="mt-0.5 shrink-0 text-[#7A1F3D]"
            />

            <div>
              <h3 className="text-sm font-bold text-[#24171C]">
                Rental safety reminder
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#756970]">
                RentSure helps renters assess rental information and
                verification status. Always inspect a property, confirm
                important details and avoid sending money before you are
                confident about the transaction.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AgentProfile;

