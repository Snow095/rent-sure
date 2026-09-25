
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Mail,
  MailCheck,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../../services/supabase/client";

function ConfirmEmail() {
  const location = useLocation();

  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResend = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setIsSending(true);

    try {
      const redirectUrl =
        `${window.location.origin}/confirm-email`;

      const { error: resendError } =
        await supabase.auth.resend({
          type: "signup",
          email: trimmedEmail,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

      if (resendError) {
        console.error(
          "Confirmation email error:",
          resendError
        );

        setError(
          "We could not resend the confirmation email right now. Please wait a moment and try again."
        );

        return;
      }

      setMessage(
        "If the email can receive a confirmation message, a new confirmation link has been sent."
      );
    } catch (error) {
      console.error(
        "Unexpected confirmation email error:",
        error
      );

      setError(
        "Something went wrong while sending the confirmation email. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#FAF8F9] px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center justify-center">
        <section className="w-full rounded-2xl border border-[#E8DDE1] bg-white px-6 py-10 shadow-sm sm:px-10 sm:py-14">

          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8EDEF]">
            <MailCheck
              size={32}
              className="text-[#7A1F3D]"
            />
          </div>

          {/* Heading */}
          <div className="text-center">
            <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">
              Almost there
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
              Check your email
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#756970] sm:text-base">
              Confirm your email address using the link
              sent to your inbox before logging in to
              RentSure.
            </p>
          </div>

          {/* Email */}
          {email && (
            <div className="mx-auto mt-6 max-w-md rounded-xl border border-[#E8DDE1] bg-[#FAF8F9] px-4 py-3 text-center">
              <p className="text-xs font-medium text-[#756970]">
                Confirmation email
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-[#24171C]">
                {email}
              </p>
            </div>
          )}

          {/* Messages */}
          {message && (
            <div
              role="status"
              className="mx-auto mt-6 max-w-md rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-800"
            >
              {message}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mx-auto mt-6 max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
            >
              {error}
            </div>
          )}

          {/* Resend */}
          <div className="mx-auto mt-8 max-w-md rounded-xl border border-[#E8DDE1] bg-white p-5">
            <div className="flex items-start gap-3">
              <Mail
                size={19}
                className="mt-0.5 shrink-0 text-[#7A1F3D]"
              />

              <div>
                <h2 className="text-sm font-bold text-[#24171C]">
                  Didn't receive the email?
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#756970]">
                  Check your spam folder first. If you still
                  cannot find it, you can request another
                  confirmation email.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleResend}
              className="mt-5"
            >
              <label
                htmlFor="confirmation-email"
                className="mb-2 block text-sm font-semibold text-[#24171C]"
              >
                Email address
              </label>

              <input
                id="confirmation-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isSending}
                className="w-full rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 text-sm text-[#24171C] outline-none transition placeholder:text-[#A79BA0] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF] disabled:cursor-not-allowed disabled:bg-[#FAF8F9]"
              />

              <button
                type="submit"
                disabled={isSending}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#7A1F3D] bg-white px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSending ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Sending...
                  </>
                ) : (
                  "Resend Confirmation Email"
                )}
              </button>
            </form>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025]"
            >
              Go to Login
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] bg-white px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
            >
              <ArrowLeft size={17} />
              Back to RentSure
            </Link>
          </div>

          {/* Safety */}
          <div className="mt-10 border-t border-[#E8DDE1] pt-6">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-[#7A1F3D]"
              />

              <p className="text-xs leading-5 text-[#756970]">
                Never share your password or confirmation
                link with another person. Always verify
                rental information independently before
                making payments.
              </p>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}

export default ConfirmEmail;

