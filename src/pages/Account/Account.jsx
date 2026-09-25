
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  LockKeyhole,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { useAuth } from "../../context/useAuth";
import { supabase } from "../../services/supabase/client";

function Account() {
  const navigate = useNavigate();

  const {
    user,
    role,
    signOut,
    refreshProfile,
    getDashboardPath,
  } = useAuth();

  const [profile, setProfile] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, role, created_at, updated_at")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        setError("Unable to load your profile. Please try again.");
        setLoading(false);
        return;
      }

      setProfile(data);
      setFullName(data?.full_name || "");
      setLoading(false);
    };

    loadProfile();
  }, [user]);

  const getRoleLabel = () => {
    if (role === "admin") {
      return "Administrator";
    }

    if (role === "agent") {
      return "Agent";
    }

    return "Renter";
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  const handleStartEditing = () => {
    setError("");
    setSuccess("");
    setFullName(profile?.full_name || "");
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setError("");
    setSuccess("");
    setFullName(profile?.full_name || "");
    setIsEditing(false);
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    const trimmedName = fullName.trim();

    setError("");
    setSuccess("");

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Your name must contain at least 2 characters.");
      return;
    }

    setSaving(true);

    const { data, error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: trimmedName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("full_name, role, created_at, updated_at")
      .single();

    if (updateError) {
      console.error("Profile update error:", updateError);

      setError(
        updateError.message || "Unable to update your profile. Please try again."
      );
      setSaving(false);
      return;
    }

    setProfile(data);
    setFullName(data.full_name);
    setIsEditing(false);
    setSuccess("Your profile has been updated successfully.");

    // Refresh AuthContext profile data if available.
    try {
      await refreshProfile();
    } catch (refreshError) {
      console.error("Profile refresh error:", refreshError);
    }

    setSaving(false);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setError("");
    setSuccess("");

    try {
      const { error: logoutError } = await signOut();

      if (logoutError) {
        setError(logoutError.message || "Unable to log out. Please try again.");
        return;
      }

      navigate("/", { replace: true });
    } catch (logoutError) {
      console.error("Logout error:", logoutError);
      setError("Something went wrong while logging out.");
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F9] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-40 rounded-lg bg-[#E8DDE1]" />
            <div className="h-48 rounded-2xl bg-white shadow-sm" />
            <div className="h-72 rounded-2xl bg-white shadow-sm" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F9] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Back */}
        <Link
          to={getDashboardPath()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#7A1F3D]">
                Account
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                Account Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
                Manage your RentSure profile information and account security.
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={handleStartEditing}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025]"
              >
                <Edit3 size={17} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <section className="overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm">

          {/* Profile Header */}
          <div className="border-b border-[#E8DDE1] bg-[#FAF8F9] px-5 py-6 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F8EDEF]">
                <UserRound
                  size={25}
                  className="text-[#7A1F3D]"
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[#24171C]">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-[#756970]">
                  Your RentSure account information.
                </p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-5 sm:p-8">

            {isEditing ? (
              <form
                onSubmit={handleSaveProfile}
                className="space-y-6"
              >
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-[#24171C]"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
                    />

                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      disabled={saving}
                      className="w-full rounded-lg border border-[#E8DDE1] bg-white py-3 pl-10 pr-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#9B9095] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF] disabled:cursor-not-allowed disabled:bg-[#FAF8F9]"
                    />
                  </div>
                </div>

                {/* Email - Read Only */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#24171C]"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
                    />

                    <input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      className="w-full cursor-not-allowed rounded-lg border border-[#E8DDE1] bg-[#FAF8F9] py-3 pl-10 pr-4 text-sm text-[#756970] outline-none"
                    />
                  </div>

                  <p className="mt-2 text-xs text-[#756970]">
                    Your email address cannot be changed from this page.
                  </p>
                </div>

                {/* Role - Read Only */}
                <div>
                  <label
                    htmlFor="role"
                    className="mb-2 block text-sm font-semibold text-[#24171C]"
                  >
                    Account Type
                  </label>

                  <div className="relative">
                    <ShieldCheck
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
                    />

                    <input
                      id="role"
                      type="text"
                      value={getRoleLabel()}
                      readOnly
                      className="w-full cursor-not-allowed rounded-lg border border-[#E8DDE1] bg-[#FAF8F9] py-3 pl-10 pr-4 text-sm text-[#756970] outline-none"
                    />
                  </div>

                  <p className="mt-2 text-xs text-[#756970]">
                    Account type is managed by RentSure permissions.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 border-t border-[#E8DDE1] pt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCancelEditing}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] px-5 py-3 text-sm font-semibold text-[#24171C] transition hover:bg-[#FAF8F9] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X size={17} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={17} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">

                {/* Full Name */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                    Full Name
                  </p>

                  <p className="mt-2 text-base font-semibold text-[#24171C]">
                    {profile?.full_name || "Not provided"}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                    Email Address
                  </p>

                  <p className="mt-2 break-all text-base font-semibold text-[#24171C]">
                    {user?.email || "Not available"}
                  </p>
                </div>

                {/* Role */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                    Account Type
                  </p>

                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-3 py-1.5 text-sm font-semibold text-[#7A1F3D]">
                    <ShieldCheck size={15} />
                    {getRoleLabel()}
                  </div>
                </div>

                {/* Account Created */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                    Account Created
                  </p>

                  <p className="mt-2 text-base font-semibold text-[#24171C]">
                    {formatDate(profile?.created_at)}
                  </p>
                </div>

                {/* Last Updated */}
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
                    Last Profile Update
                  </p>

                  <p className="mt-2 text-base font-semibold text-[#24171C]">
                    {formatDate(profile?.updated_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Security Section */}
        <section className="mt-6 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF]">
              <LockKeyhole
                size={21}
                className="text-[#7A1F3D]"
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#24171C]">
                Password & Security
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#756970]">
                Keep your account secure by using a strong, unique password.
                If you believe your password may have been compromised, reset it
                immediately.
              </p>

              <Link
                to="/forgot-password"
                className="mt-4 inline-flex items-center justify-center rounded-lg border border-[#7A1F3D] px-4 py-2.5 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
              >
                Reset Password
              </Link>
            </div>
          </div>
        </section>

        {/* Privacy Notice */}
        <section className="mt-6 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF]">
              <ShieldCheck
                size={21}
                className="text-[#7A1F3D]"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#24171C]">
                Privacy & Account Safety
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#756970]">
                RentSure uses account information to provide platform features,
                manage permissions, and support a safer rental experience.
                Never share your password or verification credentials with
                another person.
              </p>

              <div className="mt-4 flex flex-wrap gap-4">
                <Link
                  to="/privacy"
                  className="text-sm font-semibold text-[#7A1F3D] hover:underline"
                >
                  Privacy Policy
                </Link>

                <Link
                  to="/safety"
                  className="text-sm font-semibold text-[#7A1F3D] hover:underline"
                >
                  Safety Guide
                </Link>

                <Link
                  to="/terms"
                  className="text-sm font-semibold text-[#7A1F3D] hover:underline"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Logout */}
        <section className="mt-6 rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#24171C]">
                Sign Out
              </h2>

              <p className="mt-1 text-sm text-[#756970]">
                Sign out of your RentSure account on this device.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-5 py-3 text-sm font-semibold text-[#B91C1C] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={17} />

              {loggingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </section>

      </div>
    </main>
  );
}

export default Account;

