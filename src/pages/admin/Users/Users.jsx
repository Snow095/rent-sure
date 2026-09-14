
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import { supabase } from "../../../services/supabase/client";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            role,
            created_at,
            updated_at
          `)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        setUsers(data || []);
      } catch (error) {
        console.error(
          "Error loading admin users:",
          error
        );

        setErrorMessage(
          "We couldn't load the registered users."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.full_name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        user.id
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const totalUsers = users.length;

  const renterCount = users.filter(
    (user) => user.role === "renter"
  ).length;

  const agentCount = users.filter(
    (user) => user.role === "agent"
  ).length;

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getRoleDetails = (role) => {
    switch (role) {
      case "admin":
        return {
          label: "Admin",
          className: "bg-[#F8EDEF] text-[#7A1F3D]",
          icon: ShieldCheck,
        };

      case "agent":
        return {
          label: "Agent",
          className: "bg-[#FFF7E6] text-[#B45309]",
          icon: UserRound,
        };

      default:
        return {
          label: "Renter",
          className: "bg-[#E8F5EC] text-[#15803D]",
          icon: UserRound,
        };
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F9] px-5 py-12 sm:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
          <div className="text-center">
            <Loader2
              size={32}
              className="mx-auto animate-spin text-[#7A1F3D]"
            />

            <p className="mt-4 text-sm font-medium text-[#756970]">
              Loading registered users...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      {/* Header */}
      <section className="border-b border-[#E8DDE1] bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-12">
          <p className="text-sm font-semibold text-[#7A1F3D]">
            Administration
          </p>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                Users
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756970]">
                View registered RentSure users and manage
                user-role visibility from one place.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-[#F8EDEF] px-4 py-3">
              <UsersRound
                size={18}
                className="text-[#7A1F3D]"
              />

              <span className="text-sm font-semibold text-[#4A1025]">
                {totalUsers} registered users
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-12">
        {/* Error */}
        {errorMessage && (
          <div className="mb-7 flex gap-3 rounded-xl border border-[#F1CACA] bg-[#FEF2F2] px-5 py-4">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-[#B91C1C]"
            />

            <p className="text-sm leading-6 text-[#B91C1C]">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total Users"
            value={totalUsers}
            icon={UsersRound}
          />

          <SummaryCard
            label="Renters"
            value={renterCount}
            icon={UserRound}
          />

          <SummaryCard
            label="Agents"
            value={agentCount}
            icon={UserRound}
          />

          <SummaryCard
            label="Admins"
            value={adminCount}
            icon={ShieldCheck}
          />
        </div>

        {/* Filters */}
        <div className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div>
              <label
                htmlFor="userSearch"
                className="text-sm font-semibold text-[#24171C]"
              >
                Search users
              </label>

              <div className="relative mt-2">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#756970]"
                />

                <input
                  id="userSearch"
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search by name or user ID..."
                  className="h-12 w-full rounded-lg border border-[#E8DDE1] bg-white pl-11 pr-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#A3979D] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="roleFilter"
                className="text-sm font-semibold text-[#24171C]"
              >
                Role
              </label>

              <select
                id="roleFilter"
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value)
                }
                className="mt-2 h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
              >
                <option value="all">All roles</option>
                <option value="renter">Renters</option>
                <option value="agent">Agents</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#24171C]">
                Registered Users
              </h2>

              <p className="mt-1 text-sm text-[#756970]">
                Showing {filteredUsers.length} of{" "}
                {users.length} users.
              </p>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-[#E8DDE1] bg-white px-6 py-14 text-center shadow-sm">
              <UsersRound
                size={30}
                className="mx-auto text-[#756970]"
              />

              <h3 className="mt-4 text-lg font-bold text-[#24171C]">
                No users found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756970]">
                No registered users match your current
                search or role filter.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="mt-5 hidden overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-[#E8DDE1] bg-[#FAF8F9] text-left">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-[#756970]">
                          User
                        </th>

                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-[#756970]">
                          Role
                        </th>

                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-[#756970]">
                          Registered
                        </th>

                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-[#756970]">
                          User ID
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map((user) => {
                        const roleDetails =
                          getRoleDetails(user.role);

                        const RoleIcon =
                          roleDetails.icon;

                        return (
                          <tr
                            key={user.id}
                            className="border-b border-[#E8DDE1] last:border-b-0"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8EDEF]">
                                  <UserRound
                                    size={18}
                                    className="text-[#7A1F3D]"
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="font-semibold text-[#24171C]">
                                    {user.full_name ||
                                      "Unnamed User"}
                                  </p>

                                  <p className="mt-1 text-xs text-[#756970]">
                                    RentSure account
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${roleDetails.className}`}
                              >
                                <RoleIcon size={14} />
                                {roleDetails.label}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-sm text-[#756970]">
                              {formatDate(
                                user.created_at
                              )}
                            </td>

                            <td className="px-6 py-5">
                              <span className="block max-w-[220px] truncate font-mono text-xs text-[#756970]">
                                {user.id}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile / Tablet Cards */}
              <div className="mt-5 space-y-4 lg:hidden">
                {filteredUsers.map((user) => {
                  const roleDetails =
                    getRoleDetails(user.role);

                  const RoleIcon = roleDetails.icon;

                  return (
                    <div
                      key={user.id}
                      className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F8EDEF]">
                          <UserRound
                            size={19}
                            className="text-[#7A1F3D]"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="font-bold text-[#24171C]">
                              {user.full_name ||
                                "Unnamed User"}
                            </h3>

                            <span
                              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${roleDetails.className}`}
                            >
                              <RoleIcon size={14} />
                              {roleDetails.label}
                            </span>
                          </div>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-[#756970]">
                              <CalendarDays size={15} />
                              Registered{" "}
                              {formatDate(
                                user.created_at
                              )}
                            </div>

                            <div className="flex items-start gap-2 text-xs text-[#756970]">
                              <span className="font-semibold text-[#24171C]">
                                ID:
                              </span>

                              <span className="break-all font-mono">
                                {user.id}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Admin Notice */}
        <div className="mt-8 rounded-2xl bg-[#2D0A17] p-6 sm:p-7">
          <div className="flex gap-4">
            <ShieldCheck
              size={23}
              className="mt-0.5 shrink-0 text-[#C9A227]"
            />

            <div>
              <h2 className="text-sm font-bold text-white">
                User management
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#E8DDE1]">
                This page provides administrative visibility
                into registered RentSure accounts. Role
                assignment and sensitive account operations
                should remain protected by database-level
                access controls.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EDEF]">
          <Icon
            size={21}
            className="text-[#7A1F3D]"
          />
        </div>

        <CheckCircle2
          size={17}
          className="text-[#15803D]"
        />
      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[#756970]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#24171C]">
        {value}
      </p>
    </div>
  );
}

export default AdminUsers;

