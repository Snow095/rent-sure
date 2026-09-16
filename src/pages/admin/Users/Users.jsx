
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { supabase } from "../../../services/supabase/client";
import { useAuth } from "../../../context/AuthContext";

function AdminUsers() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, role, created_at, updated_at"
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setUsers(data ?? []);
    } catch (error) {
      console.error("Error loading users:", error);

      setErrorMessage(
        error.message || "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return users.filter((profile) => {
      const matchesSearch =
        !search ||
        profile.full_name?.toLowerCase().includes(search) ||
        profile.id?.toLowerCase().includes(search);

      const matchesRole =
        roleFilter === "all" ||
        profile.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const statistics = useMemo(
    () => ({
      total: users.length,
      renters: users.filter(
        (item) => item.role === "renter"
      ).length,
      agents: users.filter(
        (item) => item.role === "agent"
      ).length,
      admins: users.filter(
        (item) => item.role === "admin"
      ).length,
    }),
    [users]
  );

  const handleRoleChange = async (profile, newRole) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!profile?.id) {
      setErrorMessage("Invalid user selected.");
      return;
    }

    if (!["renter", "agent"].includes(newRole)) {
      setErrorMessage("Invalid role selected.");
      return;
    }

    if (profile.id === user?.id) {
      setErrorMessage(
        "You cannot change your own administrator role."
      );
      return;
    }

    if (profile.role === "admin") {
      setErrorMessage(
        "Administrator roles cannot be changed."
      );
      return;
    }

    if (profile.role === newRole) {
      return;
    }

    const roleLabel =
      newRole === "agent" ? "Agent" : "Renter";

    const confirmed = window.confirm(
      `Change ${
        profile.full_name || "this user"
      }'s role to ${roleLabel}?`
    );

    if (!confirmed) {
      return;
    }

    setUpdatingUserId(profile.id);

    try {
      const { error } = await supabase.rpc(
        "admin_update_user_role",
        {
          target_user_id: profile.id,
          new_role: newRole,
        }
      );

      if (error) {
        throw error;
      }

      setUsers((current) =>
        current.map((item) =>
          item.id === profile.id
            ? {
                ...item,
                role: newRole,
                updated_at: new Date().toISOString(),
              }
            : item
        )
      );

      setSuccessMessage(
        `${profile.full_name || "User"} is now a ${roleLabel.toLowerCase()}.`
      );
    } catch (error) {
      console.error("Error updating role:", error);

      setErrorMessage(
        error.message ||
          "Unable to update the user's role."
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-3 py-1.5 text-xs font-bold text-[#7A1F3D]">
            <ShieldCheck size={14} />
            Administrator Management
          </div>

          <h1 className="text-2xl font-bold text-[#24171C] sm:text-3xl">
            User Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970]">
            Manage renter and agent roles while keeping
            administrator privileges protected.
          </p>
        </header>

        {(errorMessage || successMessage) && (
          <div className="mb-6 space-y-3">
            {errorMessage && (
              <div
                role="alert"
                className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              >
                <AlertCircle className="shrink-0" size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
              >
                <Check className="shrink-0" size={18} />
                <span>{successMessage}</span>
              </div>
            )}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Users"
            value={statistics.total}
            icon={<Users size={20} />}
          />

          <StatCard
            label="Renters"
            value={statistics.renters}
            icon={<UserRound size={20} />}
          />

          <StatCard
            label="Agents"
            value={statistics.agents}
            icon={<ShieldCheck size={20} />}
          />

          <StatCard
            label="Administrators"
            value={statistics.admins}
            icon={<ShieldCheck size={20} />}
          />
        </section>

        <section className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div>
              <label
                htmlFor="user-search"
                className="mb-2 block text-sm font-semibold text-[#24171C]"
              >
                Search
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
                />

                <input
                  id="user-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search by name or user ID..."
                  className="w-full rounded-lg border border-[#E8DDE1] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="role-filter"
                className="mb-2 block text-sm font-semibold text-[#24171C]"
              >
                Role
              </label>

              <div className="relative">
                <select
                  id="role-filter"
                  value={roleFilter}
                  onChange={(event) =>
                    setRoleFilter(event.target.value)
                  }
                  className="w-full appearance-none rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                >
                  <option value="all">All Roles</option>
                  <option value="renter">Renters</option>
                  <option value="agent">Agents</option>
                  <option value="admin">
                    Administrators
                  </option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#756970]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm">
          <div className="border-b border-[#E8DDE1] px-5 py-5">
            <h2 className="font-bold text-[#24171C]">
              Platform Users
            </h2>

            <p className="mt-1 text-sm text-[#756970]">
              {filteredUsers.length} user
              {filteredUsers.length === 1 ? "" : "s"} shown
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2
                size={30}
                className="animate-spin text-[#7A1F3D]"
              />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Users
                size={32}
                className="mx-auto text-[#7A1F3D]"
              />

              <h3 className="mt-4 font-bold text-[#24171C]">
                No users found
              </h3>

              <p className="mt-2 text-sm text-[#756970]">
                Try adjusting your search or role filter.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full">
                  <thead className="bg-[#FAF8F9]">
                    <tr className="border-b border-[#E8DDE1]">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#756970]">
                        Created
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-[#756970]">
                        Management
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E8DDE1]">
                    {filteredUsers.map((profile) => {
                      const isAdmin =
                        profile.role === "admin";

                      const isUpdating =
                        updatingUserId === profile.id;

                      return (
                        <tr
                          key={profile.id}
                          className="hover:bg-[#FCFAFB]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8EDEF] text-[#7A1F3D]">
                                <UserRound size={18} />
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-[#24171C]">
                                  {profile.full_name ||
                                    "Unnamed User"}
                                </p>

                                <p className="mt-1 max-w-xs truncate text-xs text-[#756970]">
                                  {profile.id}
                                </p>

                                {profile.id === user?.id && (
                                  <span className="mt-1 block text-xs font-semibold text-[#7A1F3D]">
                                    Your account
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <RoleBadge role={profile.role} />
                          </td>

                          <td className="px-6 py-5 text-sm text-[#756970]">
                            {formatDate(profile.created_at)}
                          </td>

                          <td className="px-6 py-5 text-right">
                            {isAdmin ? (
                              <span className="inline-flex items-center gap-2 rounded-lg bg-[#F8EDEF] px-3 py-2 text-xs font-bold text-[#7A1F3D]">
                                <ShieldCheck size={14} />
                                Protected
                              </span>
                            ) : (
                              <div className="relative inline-block">
                                <select
                                  value={profile.role}
                                  disabled={isUpdating}
                                  onChange={(event) =>
                                    handleRoleChange(
                                      profile,
                                      event.target.value
                                    )
                                  }
                                  className="appearance-none rounded-lg border border-[#E8DDE1] bg-white py-2.5 pl-3 pr-9 text-sm font-semibold text-[#7A1F3D] outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF] disabled:opacity-60"
                                >
                                  <option value="renter">
                                    Renter
                                  </option>
                                  <option value="agent">
                                    Agent
                                  </option>
                                </select>

                                {isUpdating ? (
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
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-[#E8DDE1] md:hidden">
                {filteredUsers.map((profile) => {
                  const isAdmin =
                    profile.role === "admin";

                  const isUpdating =
                    updatingUserId === profile.id;

                  return (
                    <article
                      key={profile.id}
                      className="p-5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8EDEF] text-[#7A1F3D]">
                          <UserRound size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-[#24171C]">
                            {profile.full_name ||
                              "Unnamed User"}
                          </h3>

                          <p className="mt-1 break-all text-xs text-[#756970]">
                            {profile.id}
                          </p>

                          <div className="mt-3">
                            <RoleBadge role={profile.role} />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-[#E8DDE1] pt-4">
                        <p className="text-xs font-semibold text-[#756970]">
                          Created
                        </p>

                        <p className="mt-1 text-sm text-[#24171C]">
                          {formatDate(profile.created_at)}
                        </p>
                      </div>

                      <div className="mt-4">
                        {isAdmin ? (
                          <div className="rounded-lg bg-[#F8EDEF] px-4 py-3 text-center text-xs font-bold text-[#7A1F3D]">
                            Administrator role protected
                          </div>
                        ) : (
                          <select
                            value={profile.role}
                            disabled={isUpdating}
                            onChange={(event) =>
                              handleRoleChange(
                                profile,
                                event.target.value
                              )
                            }
                            className="w-full rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 text-sm font-semibold text-[#7A1F3D] outline-none focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF] disabled:opacity-60"
                          >
                            <option value="renter">
                              Renter
                            </option>
                            <option value="agent">
                              Agent
                            </option>
                          </select>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-[#E8DDE1] bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-[#7A1F3D]"
            />

            <div>
              <h2 className="font-bold text-[#24171C]">
                Role security
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#756970]">
                Role changes are processed through a
                protected Supabase function. Administrator
                accounts cannot be modified through this
                interface, and administrator privileges
                cannot be assigned from the role selector.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
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
          {icon}
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const config = {
    renter: "bg-slate-100 text-slate-700",
    agent: "bg-[#F8EDEF] text-[#7A1F3D]",
    admin: "bg-[#2D0A17] text-white",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
        config[role] || config.renter
      }`}
    >
      {role === "admin"
        ? "Administrator"
        : role === "agent"
          ? "Agent"
          : "Renter"}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default AdminUsers;

