
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "../../services/supabase/client";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccess(false);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        {
          redirectTo,
        }
      );

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccess(true);
    } catch (error) {
      console.error("Password reset error:", error);
      setErrorMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F9] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full">
          {/* Back */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
          >
            <ArrowLeft size={17} />
            Back to Login
          </Link>

          {/* Card */}
          <div className="mt-6 rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
            {/* Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8EDEF] text-[#7A1F3D]">
              <ShieldCheck size={28} />
            </div>

            {!success ? (
              <>
                <h1 className="mt-6 text-2xl font-bold tracking-tight text-[#24171C]">
                  Forgot your password?
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#756970]">
                  Enter the email address associated with your RentSure
                  account and we'll send you a password reset link.
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
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#756970]"
                      />

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={loading}
                        className="w-full rounded-lg border border-[#E8DDE1] bg-white py-3 pl-10 pr-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#756970]/70 focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF] disabled:cursor-not-allowed disabled:bg-[#FAF8F9]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Sending Reset Link...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="mt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-[#15803D]">
                  <CheckCircle2 size={27} />
                </div>

                <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#24171C]">
                  Check your email
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#756970]">
                  If an account exists for this email address, RentSure has
                  sent a password reset link.
                </p>

                <p className="mt-3 text-sm leading-6 text-[#756970]">
                  Check your inbox and spam folder. The link will take you
                  to the page where you can create a new password.
                </p>

                <Link
                  to="/login"
                  className="mt-7 flex w-full items-center justify-center rounded-lg border border-[#E8DDE1] px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                >
                  Return to Login
                </Link>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-5 rounded-xl border border-[#E8DDE1] bg-white p-4">
            <p className="text-center text-xs leading-5 text-[#756970]">
              RentSure will never ask you to share your password or password
              reset code with another person.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ForgotPassword;

