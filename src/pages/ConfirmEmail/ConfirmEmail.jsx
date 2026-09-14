
import { Link } from "react-router-dom";
import { ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

function ConfirmEmail() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#FAF8F9] px-5 py-12 sm:px-8">
            <div className="w-full max-w-lg rounded-3xl border border-[#E8DDE1] bg-white p-8 text-center shadow-sm sm:p-10">
                {/* Icon */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5EC]">
                    <CheckCircle2
                        size={32}
                        className="text-[#15803D]"
                    />
                </div>

                {/* Brand */}
                <div className="mt-7 flex items-center justify-center gap-2">
                    <ShieldCheck
                        size={25}
                        className="text-[#7A1F3D]"
                    />

                    <span className="text-lg font-bold text-[#24171C]">
                        RentSure
                    </span>
                </div>

                {/* Heading */}
                <h1 className="mt-7 text-3xl font-bold text-[#24171C]">
                    Check your email
                </h1>

                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#756970]">
                    We've sent a confirmation link to your email address. Please click
                    the link in the email to verify your account and continue using
                    RentSure.
                </p>

                {/* Information */}
                <div className="mt-7 rounded-xl bg-[#F8EDEF] p-5 text-left">
                    <p className="text-sm font-semibold text-[#4A1025]">
                        Didn't receive the email?
                    </p>

                    <ul className="mt-3 space-y-2 text-sm leading-6 text-[#756970]">
                        <li>• Check your spam or junk folder.</li>
                        <li>• Make sure you entered the correct email address.</li>
                        <li>• Give the email a few moments to arrive.</li>
                    </ul>
                </div>

                {/* Login */}
                <Link
                    to="/login"
                    className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025] focus:outline-none focus:ring-2 focus:ring-[#7A1F3D] focus:ring-offset-2"
                >
                    Go to Login
                    <ArrowRight size={17} />
                </Link>

                {/* Back Home */}
                <Link
                    to="/"
                    className="mt-4 inline-block text-sm font-semibold text-[#7A1F3D] hover:underline"
                >
                    Back to RentSure
                </Link>
            </div>
        </main>
    );
}

export default ConfirmEmail;

