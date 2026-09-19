
import { Link } from "react-router-dom";
import { ArrowLeft, Home, Search, ShieldAlert } from "lucide-react";

function NotFound() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#FAF8F9] px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-2xl border border-[#E8DDE1] bg-white px-6 py-10 text-center shadow-sm sm:px-10 sm:py-14">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8EDEF]">
            <ShieldAlert
              size={32}
              className="text-[#7A1F3D]"
            />
          </div>

          {/* Error Code */}
          <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">
            Error 404
          </p>

          {/* Heading */}
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
            Page not found
          </h1>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#756970] sm:text-base">
            The page you are looking for may have been moved, removed,
            or the address may be incorrect.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025]"
            >
              <Home size={18} />
              Go Home
            </Link>

            <Link
              to="/properties"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] bg-white px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
            >
              <Search size={18} />
              Browse Properties
            </Link>
          </div>

          {/* Back */}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#756970] transition hover:text-[#7A1F3D]"
          >
            <ArrowLeft size={16} />
            Go back
          </button>

          {/* Safety Notice */}
          <div className="mt-10 border-t border-[#E8DDE1] pt-6">
            <p className="text-xs leading-5 text-[#756970]">
              RentSure helps renters make more informed rental
              decisions through property verification and
              fraud-awareness information.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default NotFound;

