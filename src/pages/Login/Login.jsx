
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";

function Login() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: signInError } = await signIn({
        email: trimmedEmail,
        password,
      });

      if (signInError) {
        if (
          signInError.message
            ?.toLowerCase()
            .includes("email not confirmed")
        ) {
          setError(
            "Please confirm your email address before logging in."
          );
        } else {
          setError(
            signInError.message ||
              "Unable to log in. Please check your credentials."
          );
        }

        return;
      }

      /*
       * Do not navigate here.
       *
       * AuthContext receives the Supabase authentication
       * event, loads the user's profile/role, and then
       * GuestRoute redirects the user to the appropriate
       * destination.
       *
       * This also preserves protected-route redirects:
       *
       * /protected-page
       *       ↓
       *     /login
       *       ↓
       * successful login
       *       ↓
       * /protected-page
       */
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Something went wrong while logging in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#FAF8F9] px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm lg:grid-cols-2">

        {/* Left Information Panel */}
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
                Welcome back
              </p>

              <h1 className="mt-3 text-4xl font-bold leading-tight">
                Rent smarter.
                <br />
                Rent safer.
              </h1>

              <p className="mt-6 text-sm leading-7 text-white/70">
                Sign in to manage your saved properties,
                viewing requests, reports, and other
                RentSure activities.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <p className="text-xs leading-5 text-white/55">
              RentSure provides property verification and
              fraud-awareness information to help renters
              make more informed decisions.
            </p>
          </div>
        </section>

        {/* Login Form */}
        <section className="px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
          <div className="mx-auto w-full max-w-md">

            {/* Mobile Back Link */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025] lg:hidden"
            >
              <ArrowLeft size={17} />
              Back to RentSure
            </Link>

            <div className="mt-8 lg:mt-0">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]">
                Account Login
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#24171C]">
                Welcome back
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#756970]">
                Enter your details to access your RentSure
                account.
              </p>
            </div>

            {/* Error Message */}
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
              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
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
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-[#E8DDE1] bg-white py-3 pl-10 pr-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#A69CA0] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF] disabled:bg-[#FAF8F9]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="login-password"
                    className="text-sm font-semibold text-[#24171C]"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
                  />

                  <input
                    id="login-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-[#E8DDE1] bg-white py-3 pl-10 pr-12 text-sm text-[#24171C] outline-none transition placeholder:text-[#A69CA0] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF] disabled:bg-[#FAF8F9]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    disabled={isSubmitting}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#756970] transition hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
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

              {/* Remember Me */}
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-[#E8DDE1] accent-[#7A1F3D]"
                />

                <span className="text-sm text-[#756970]">
                  Remember me
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Signing in..."
                  : "Sign In"}
              </button>
            </form>

            {/* Register */}
            <p className="mt-8 text-center text-sm text-[#756970]">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#7A1F3D] hover:text-[#4A1025]"
              >
                Create an account
              </Link>
            </p>

            {/* Security Notice */}
            <div className="mt-8 flex gap-3 rounded-xl border border-[#E8DDE1] bg-[#FAF8F9] p-4">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-[#7A1F3D]"
              />

              <p className="text-xs leading-5 text-[#756970]">
                Keep your RentSure password private. RentSure
                will never ask you to share your password or
                authentication code with another person.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;

