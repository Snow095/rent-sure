
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Loader2,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../../services/supabase/client";

function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    const loadAgents = async () => {
      try {
        const { data: agentData, error: agentError } = await supabase
          .from("profiles")
          .select("id, full_name, role, created_at")
          .eq("role", "agent")
          .order("created_at", {
            ascending: false,
          });

        if (agentError) {
          throw agentError;
        }

        const agentIds = (agentData ?? []).map((agent) => agent.id);

        let propertyData = [];

        if (agentIds.length > 0) {
          const { data, error } = await supabase
            .from("properties")
            .select(
              "id, agent_id, property_status, verification_status"
            )
            .in("agent_id", agentIds);

          if (error) {
            throw error;
          }

          propertyData = data ?? [];
        }

        const enrichedAgents = (agentData ?? []).map((agent) => {
          const properties = propertyData.filter(
            (property) => property.agent_id === agent.id
          );

          return {
            ...agent,
            propertyCount: properties.length,
            activeCount: properties.filter(
              (property) => property.property_status === "active"
            ).length,
            verifiedCount: properties.filter(
              (property) => property.verification_status === "verified"
            ).length,
            pendingCount: properties.filter(
              (property) => property.verification_status === "pending"
            ).length,
            rejectedCount: properties.filter(
              (property) => property.verification_status === "rejected"
            ).length,
          };
        });

        if (!cancelled) {
          setAgents(enrichedAgents);
        }
      } catch (error) {
        console.error("Error loading agents:", error);

        if (!cancelled) {
          setAgents([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAgents();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredAgents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return agents.filter((agent) => {
      const matchesSearch =
        !search ||
        agent.full_name?.toLowerCase().includes(search) ||
        agent.id?.toLowerCase().includes(search);

      let matchesFilter = true;

      if (filter === "active") {
        matchesFilter = agent.activeCount > 0;
      }

      if (filter === "verified") {
        matchesFilter = agent.verifiedCount > 0;
      }

      if (filter === "pending") {
        matchesFilter = agent.pendingCount > 0;
      }

      if (filter === "rejected") {
        matchesFilter = agent.rejectedCount > 0;
      }

      return matchesSearch && matchesFilter;
    });
  }, [agents, searchTerm, filter]);

  const stats = useMemo(
    () => ({
      total: agents.length,
      active: agents.filter((agent) => agent.activeCount > 0).length,
      verified: agents.filter((agent) => agent.verifiedCount > 0).length,
      pending: agents.filter((agent) => agent.pendingCount > 0).length,
    }),
    [agents]
  );

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-3 py-1.5 text-xs font-bold text-[#7A1F3D]">
            <ShieldCheck size={14} />
            Agent Management
          </div>

          <h1 className="text-2xl font-bold text-[#24171C] sm:text-3xl">
            Agents
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970]">
            Monitor agent activity and the verification state of their
            property listings.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Agents" value={stats.total} />

          <StatCard
            label="With Active Listings"
            value={stats.active}
          />

          <StatCard
            label="With Verified Listings"
            value={stats.verified}
          />

          <StatCard
            label="With Pending Reviews"
            value={stats.pending}
          />
        </section>

        <section className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#24171C]">
                Search Agents
              </label>

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
                />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search agent name or ID..."
                  className="w-full rounded-lg border border-[#E8DDE1] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#24171C]">
                Listing Filter
              </label>

              <div className="relative">
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="w-full appearance-none rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                >
                  <option value="all">All Agents</option>
                  <option value="active">Active Listings</option>
                  <option value="verified">Verified Listings</option>
                  <option value="pending">Pending Reviews</option>
                  <option value="rejected">Rejected Listings</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#756970]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2
                size={32}
                className="animate-spin text-[#7A1F3D]"
              />
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="rounded-2xl border border-[#E8DDE1] bg-white px-6 py-16 text-center">
              <UserRound
                size={34}
                className="mx-auto text-[#7A1F3D]"
              />

              <h2 className="mt-4 font-bold text-[#24171C]">
                No agents found
              </h2>

              <p className="mt-2 text-sm text-[#756970]">
                Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredAgents.map((agent) => (
                <article
                  key={agent.id}
                  className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
                      <UserRound size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold text-[#24171C]">
                        {agent.full_name || "Unnamed Agent"}
                      </h2>

                      <p className="mt-1 break-all text-xs text-[#756970]">
                        {agent.id}
                      </p>

                      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#F8EDEF] px-3 py-1.5 text-xs font-bold text-[#7A1F3D]">
                        <ShieldCheck size={13} />
                        RentSure Agent
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <MiniStat
                      label="Properties"
                      value={agent.propertyCount}
                    />

                    <MiniStat
                      label="Active"
                      value={agent.activeCount}
                    />

                    <MiniStat
                      label="Verified"
                      value={agent.verifiedCount}
                    />

                    <MiniStat
                      label="Pending"
                      value={agent.pendingCount}
                    />
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to={`/agents/${agent.id}`}
                      className="flex-1 rounded-lg border border-[#E8DDE1] px-4 py-3 text-center text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                    >
                      View Public Profile
                    </Link>

                    <Link
                      to={`/admin/properties?agent=${agent.id}`}
                      className="flex-1 rounded-lg bg-[#7A1F3D] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                    >
                      View Properties
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
      <p className="text-sm text-[#756970]">{label}</p>

      <p className="mt-2 text-2xl font-bold text-[#24171C]">
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl bg-[#FAF8F9] p-3">
      <p className="text-xs text-[#756970]">{label}</p>

      <p className="mt-1 text-lg font-bold text-[#24171C]">
        {value}
      </p>
    </div>
  );
}

export default AdminAgents;

