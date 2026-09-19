
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../../services/supabase/client";

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const prepareReset = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (session) {
          setReady(true);
        } else {
          setErrorMessage(
            "This password reset link is invalid or has expired. Please request a new one."
          );
        }
      } catch (error) {
        console.error("Reset session error:", error);

        if (mounted) {
          setErrorMessage(
            "We could not verify this password reset session."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    prepareReset();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) {
          return;
        }

        if (
          event === "PASSWORD_RECOVERY" ||
          session
        ) {
          setReady(true);
          setErrorMessage("");
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const passwordRequirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passwordIsValid =
    passwordRequirements.length &&
    passwordRequirements.uppercase &&
    passwordRequirements.lowercase &&
    passwordRequirements.number &&
    passwordRequirements.special;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");

    if (!passwordIsValid) {
      setErrorMessage(
        "Please meet all password requirements."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccess(true);

      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/login", {
          replace: true,
          state: {
            message:
              "Your password has been updated. You can now log in with your new password.",
          },
        });
      }, 1800);
    } catch (error) {
      console.error("Password update error:", error);

      setErrorMessage(
        "Something went wrong while updating your password."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F9] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
          >
            <ArrowLeft size={17} />
            Back to Login
          </Link>

          <div className="mt-6 rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8EDEF] text-[#7A1F3D]">
              <ShieldCheck size={28} />
            </div>

            {loading ? (
              <div className="py-10 text-center">
                <Loader2
                  size={30}
                  className="mx-auto animate-spin text-[#7A1F3D]"
                />

                <p className="mt-4 text-sm text-[#756970]">
                  Verifying your reset link...
                </p>
              </div>
            ) : success ? (
              <div className="mt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-[#15803D]">
                  <CheckCircle2 size={27} />
                </div>

                <h1 className="mt-5 text-2xl font-bold text-[#24171C]">
                  Password updated
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#756970]">
                  Your password has been changed successfully. Redirecting
                  you to the login page...
                </p>
              </div>
            ) : !ready ? (
              <div className="mt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#B91C1C]">
                  <AlertCircle size={27} />
                </div>

                <h1 className="mt-5 text-2xl font-bold text-[#24171C]">
                  Reset link unavailable
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#756970]">
                  {errorMessage}
                </p>

                <Link
                  to="/forgot-password"
                  className="mt-7 flex w-full items-center justify-center rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                >
                  Request a New Link
                </Link>
              </div>
            ) : (
              <>
                <h1 className="mt-6 text-2xl font-bold tracking-tight text-[#24171C]">
                  Create a new password
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#756970]">
                  Choose a strong password that you do not use for another
                  account.
                </p>

                {errorMessage && (
                  <div
                    role="alert"
                    className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-[#B91C1C]"
                  >
                    {errorMessage}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="mt-7 space-y-5"
                >
                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-[#24171C]"
                    >
                      New Password
                    </label>

                    <div className="relative">
                      <LockKeyhole
                        size={18}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
                      />

                      <input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        autoComplete="new-password"
                        disabled={saving}
                        className="w-full rounded-lg border border-[#E8DDE1] bg-white py-3 pl-10 pr-11 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF] disabled:bg-[#FAF8F9]"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#756970] transition hover:text-[#7A1F3D]"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="rounded-xl bg-[#FAF8F9] p-4">
                    <p className="text-xs font-semibold text-[#24171C]">
                      Password must contain:
                    </p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Requirement
                        valid={passwordRequirements.length}
                        text="At least 8 characters"
                      />

                      <Requirement
                        valid={passwordRequirements.uppercase}
                        text="An uppercase letter"
                      />

                      <Requirement
                        valid={passwordRequirements.lowercase}
                        text="A lowercase letter"
                      />

                      <Requirement
                        valid={passwordRequirements.number}
                        text="A number"
                      />

                      <Requirement
                        valid={passwordRequirements.special}
                        text="A special character"
                      />
                    </div>
                  </div>

                  {/* Confirm */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-semibold text-[#24171C]"
                    >
                      Confirm New Password
                    </label>

                    <div className="relative">
                      <LockKeyhole
                        size={18}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
                      />

                      <input
                        id="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target.value
                          )
                        }
                        autoComplete="new-password"
                        disabled={saving}
                        className="w-full rounded-lg border border-[#E8DDE1] bg-white py-3 pl-10 pr-11 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF] disabled:bg-[#FAF8F9]"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#756970] transition hover:text-[#7A1F3D]"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password confirmation"
                            : "Show password confirmation"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    {confirmPassword && (
                      <p
                        className={`mt-2 text-xs ${
                          password === confirmPassword
                            ? "text-[#15803D]"
                            : "text-[#B91C1C]"
                        }`}
                      >
                        {password === confirmPassword
                          ? "Passwords match."
                          : "Passwords do not match."}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Updating Password...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-[#756970]">
            Your password is securely managed through RentSure's
            authentication system.
          </p>
        </div>
      </div>
    </main>
  );
}

function Requirement({ valid, text }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
          valid
            ? "bg-green-100 text-[#15803D]"
            : "bg-[#E8DDE1] text-[#756970]"
        }`}
      >
        {valid ? "✓" : "•"}
      </span>

      <span
        className={`text-xs ${
          valid ? "text-[#15803D]" : "text-[#756970]"
        }`}
      >
        {text}
      </span>
    </div>
  );
}

export default ResetPassword;

