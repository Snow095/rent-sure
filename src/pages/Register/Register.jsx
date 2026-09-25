
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";

function Register() {
  const navigate = useNavigate();

  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("renter");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [agreeToTerms, setAgreeToTerms] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const passwordRequirements = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "One uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "One number",
      valid: /\d/.test(password),
    },
    {
      label: "One special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const passwordIsValid =
    passwordRequirements.every(
      (requirement) => requirement.valid
    );

  const passwordsMatch =
    password.length > 0 &&
    password === confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!passwordIsValid) {
      setError(
        "Please make sure your password meets all the requirements."
      );
      return;
    }

    if (!passwordsMatch) {
      setError("Your passwords do not match.");
      return;
    }

    if (!agreeToTerms) {
      setError(
        "Please agree to the Terms & Conditions and Privacy Policy."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data,
        error: signUpError,
      } = await signUp({
        email: trimmedEmail,
        password,
        fullName: trimmedName,
        role,
      });

      if (signUpError) {
        console.error(
          "Registration error:",
          signUpError
        );

        setError(
          signUpError.message ||
            "Unable to create your account. Please try again."
        );

        return;
      }

      /*
       * Supabase returns a session immediately when
       * email confirmation is disabled.
       *
       * When email confirmation is enabled, the user
       * is created but session is null.
       */
      if (data?.session) {
        setSuccess(
          "Your account has been created successfully. Redirecting..."
        );

        setTimeout(() => {
          navigate("/");
        }, 900);

        return;
      }

      /*
       * No session means email confirmation is required.
       */
      setSuccess(
        "Your account has been created. Please check your email to confirm your account before logging in."
      );

      setTimeout(() => {
        navigate("/confirm-email", {
          replace: true,
          state: {
            email: trimmedEmail,
          },
        });
      }, 900);
    } catch (error) {
      console.error(
        "Unexpected registration error:",
        error
      );

      setError(
        "Something went wrong while creating your account. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#FAF8F9] px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm lg:grid-cols-2">

        {/* Information Panel */}
        <section className="hidden bg-[#2D0A17] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white"
            >
              <ArrowLeft size={17} />
              Back to RentSure
            </Link>

            <div className="mt-16 max-w-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#7A1F3D]">
                <ShieldCheck size={29} />
              </div>

              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
                Create an account
              </p>

              <h1 className="mt-3 text-4xl font-bold leading-tight">
                Rent smarter.
                <br />
                Rent safer.
              </h1>

              <p className="mt-6 text-sm leading-7 text-white/70">
                Create your RentSure account to save
                properties, request viewings, report
                concerns, or manage rental listings.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <p className="text-xs leading-5 text-white/55">
              RentSure verification is designed to support
              informed rental decisions. It does not
              guarantee legal ownership, availability, or
              the absence of fraud.
            </p>
          </div>
        </section>

        {/* Registration Form */}
        <section className="px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
          <div className="mx-auto w-full max-w-md">

            {/* Mobile Back */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025] lg:hidden"
            >
              <ArrowLeft size={17} />
              Back to RentSure
            </Link>

            <div className="mt-8 lg:mt-0">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]">
                Get Started
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#24171C]">
                Create your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#756970]">
                Join RentSure and make more informed rental
                decisions.
              </p>
            </div>

            {/* Success */}
            {success && (
              <div
                role="status"
                className="mt-7 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-800"
              >
                {success}
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mt-7 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6"
            >
              {/* Full Name */}
              <div>
                <label
                  htmlFor="register-name"
                  className="mb-2 block text-sm font-semibold text-[#24171C]"
                >
                  Full name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
                  />

                  <input
                    id="register-name"
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    placeholder="Enter your full name"
                    autoComplete="name"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-[#E8DDE1] bg-white py-3 pl-10 pr-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#A79BA0] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF] disabled:cursor-not-allowed disabled:bg-[#FAF8F9]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="register-email"
                  className="mb-2 block text-sm font-semibold text-[#24171C]"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
                  />

                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-[#E8DDE1] bg-white py-3 pl-10 pr-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#A79BA0] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF] disabled:cursor-not-allowed disabled:bg-[#FAF8F9]"
                  />
                </div>
              </div>

              {/* Account Type */}
              <div>
                <p className="mb-3 text-sm font-semibold text-[#24171C]">
                  Account type
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setRole("renter")}
                    disabled={isSubmitting}
                    className={`rounded-xl border p-4 text-left transition ${
                      role === "renter"
                        ? "border-[#7A1F3D] bg-[#F8EDEF]"
                        : "border-[#E8DDE1] bg-white hover:bg-[#FAF8F9]"
                    }`}
                  >
                    <p className="text-sm font-bold text-[#24171C]">
                      Renter
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#756970]">
                      Find and evaluate rental properties.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("agent")}
                    disabled={isSubmitting}
                    className={`rounded-xl border p-4 text-left transition ${
                      role === "agent"
                        ? "border-[#7A1F3D] bg-[#F8EDEF]"
                        : "border-[#E8DDE1] bg-white hover:bg-[#FAF8F9]"
                    }`}
                  >
                    <p className="text-sm font-bold text-[#24171C]">
                      Agent
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#756970]">
                      Manage properties and verification.
                    </p>
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="register-password"
                  className="mb-2 block text-sm font-semibold text-[#24171C]"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
                  />

                  <input
                    id="register-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-[#E8DDE1] bg-white py-3 pl-10 pr-12 text-sm text-[#24171C] outline-none transition placeholder:text-[#A79BA0] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF] disabled:cursor-not-allowed disabled:bg-[#FAF8F9]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    disabled={isSubmitting}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#756970] transition hover:bg-[#F8EDEF] hover:text-[#7A1F3D] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {passwordRequirements.map(
                    (requirement) => (
                      <div
                        key={requirement.label}
                        className="flex items-center gap-2"
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                            requirement.valid
                              ? "bg-green-100 text-green-700"
                              : "bg-[#FAF8F9] text-[#A79BA0]"
                          }`}
                        >
                          <Check size={10} />
                        </span>

                        <span className="text-xs text-[#756970]">
                          {requirement.label}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="mb-2 block text-sm font-semibold text-[#24171C]"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
                  />

                  <input
                    id="register-confirm-password"
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
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-[#E8DDE1] bg-white py-3 pl-10 pr-12 text-sm text-[#24171C] outline-none transition placeholder:text-[#A79BA0] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF] disabled:cursor-not-allowed disabled:bg-[#FAF8F9]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) => !previous
                      )
                    }
                    disabled={isSubmitting}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#756970] transition hover:bg-[#F8EDEF] hover:text-[#7A1F3D] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={
                      showConfirmPassword
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {confirmPassword.length > 0 && (
                  <p
                    className={`mt-2 text-xs font-medium ${
                      passwordsMatch
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {passwordsMatch
                      ? "Passwords match."
                      : "Passwords do not match."}
                  </p>
                )}
              </div>

              {/* Terms */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(event) =>
                    setAgreeToTerms(
                      event.target.checked
                    )
                  }
                  disabled={isSubmitting}
                  className="mt-1 h-4 w-4 rounded border-[#E8DDE1] accent-[#7A1F3D]"
                />

                <span className="text-xs leading-5 text-[#756970]">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="font-semibold text-[#7A1F3D] hover:text-[#4A1025]"
                  >
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="font-semibold text-[#7A1F3D] hover:text-[#4A1025]"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Creating account..."
                  : "Create Account"}
              </button>
            </form>

            {/* Login */}
            <div className="mt-8 text-center">
              <p className="text-sm text-[#756970]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
                >
                  Login
                </Link>
              </p>
            </div>

            {/* Security Notice */}
            <div className="mt-8 rounded-xl border border-[#E8DDE1] bg-[#FAF8F9] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-[#7A1F3D]"
                />

                <div>
                  <p className="text-sm font-semibold text-[#24171C]">
                    Account safety
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#756970]">
                    Use an email address you control and
                    never share your RentSure password with
                    another person.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;

