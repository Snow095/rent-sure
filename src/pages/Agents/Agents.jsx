
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Loader2,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { supabase } from "../../services/supabase/client";

function Agents() {
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      setErrorMessage("");

      const { data: agentProfiles, error: profileError } =
        await supabase
          .from("profiles")
          .select("id, full_name, created_at")
          .eq("role", "agent")
          .order("full_name", { ascending: true });

      if (profileError) {
        console.error("Error loading agents:", profileError);
        setErrorMessage("We couldn't load the agent directory.");
        setLoading(false);
        return;
      }

      if (!agentProfiles?.length) {
        setAgents([]);
        setLoading(false);
        return;
      }

      const agentIds = agentProfiles.map((agent) => agent.id);

      const { data: properties, error: propertyError } =
        await supabase
          .from("properties")
          .select(`
            id,
            agent_id,
            verification_status,
            property_status
          `)
          .in("agent_id", agentIds)
          .eq("property_status", "active");

      if (propertyError) {
        console.error(
          "Error loading agent properties:",
          propertyError
        );
      }

      const propertyRows = properties ?? [];

      const enrichedAgents = agentProfiles.map((agent) => {
        const agentProperties = propertyRows.filter(
          (property) => property.agent_id === agent.id
        );

        const verifiedProperties = agentProperties.filter(
          (property) => property.verification_status === "verified"
        );

        return {
          ...agent,
          propertyCount: agentProperties.length,
          verifiedCount: verifiedProperties.length,
        };
      });

      setAgents(enrichedAgents);
      setLoading(false);
    };

    fetchAgents();
  }, []);

  const filteredAgents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return agents;
    }

    return agents.filter((agent) =>
      agent.full_name?.toLowerCase().includes(query)
    );
  }, [agents, searchTerm]);

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      {/* Hero */}
      <section className="border-b border-[#E8DDE1] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-4 py-2 text-sm font-semibold text-[#7A1F3D]">
              <ShieldCheck size={17} />
              Trusted Agent Directory
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl lg:text-5xl">
              Find rental agents with greater confidence.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[#756970] sm:text-lg">
              Explore agents listing properties on RentSure and review
              their available properties before making a rental decision.
            </p>
          </div>
        </div>
      </section>

      {/* Directory */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#24171C]">
              RentSure Agents
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#756970]">
              Browse agents and view the properties they currently list.
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#756970]"
            />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search agents..."
              className="min-h-12 w-full rounded-xl border border-[#E8DDE1] bg-white pl-11 pr-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#9B8F94] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
            />
          </div>
        </div>

        {loading && (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="text-center">
              <Loader2
                size={34}
                className="mx-auto animate-spin text-[#7A1F3D]"
              />

              <p className="mt-4 text-sm font-medium text-[#756970]">
                Loading agents...
              </p>
            </div>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm leading-6 text-red-700">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && filteredAgents.length === 0 && (
          <div className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8EDEF] text-[#7A1F3D]">
              <UserRound size={26} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-[#24171C]">
              No agents found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756970]">
              We couldn't find an agent matching your search.
              Try another name.
            </p>
          </div>
        )}

        {!loading && !errorMessage && filteredAgents.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
              <article
                key={agent.id}
                className="flex h-full flex-col rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F8EDEF] text-[#7A1F3D]">
                    <UserRound size={27} />
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5EC] px-3 py-1.5 text-xs font-semibold text-[#15803D]">
                    <ShieldCheck size={14} />
                    RentSure Agent
                  </div>
                </div>

                <h3 className="mt-6 text-lg font-bold text-[#24171C]">
                  {agent.full_name || "RentSure Agent"}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#756970]">
                  Rental property agent on the RentSure platform.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#FAF8F9] p-4">
                    <div className="flex items-center gap-2 text-[#756970]">
                      <Building2 size={17} />
                      <span className="text-xs font-medium">
                        Listings
                      </span>
                    </div>

                    <p className="mt-2 text-xl font-bold text-[#24171C]">
                      {agent.propertyCount}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FAF8F9] p-4">
                    <div className="flex items-center gap-2 text-[#756970]">
                      <ShieldCheck size={17} />
                      <span className="text-xs font-medium">
                        Verified
                      </span>
                    </div>

                    <p className="mt-2 text-xl font-bold text-[#24171C]">
                      {agent.verifiedCount}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/agents/${agent.id}`}
                  className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                >
                  View Agent
                  <ArrowRight size={17} />
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-10 rounded-2xl border border-[#E8DDE1] bg-white p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-[#7A1F3D]"
            />

            <p className="text-sm leading-6 text-[#756970]">
              RentSure's platform information is intended to support
              informed rental decisions. Being listed on RentSure does
              not by itself constitute a legal guarantee or endorsement
              of an agent.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Agents;

