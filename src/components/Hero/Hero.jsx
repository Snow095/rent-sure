import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="bg-[#FAF8F9]">
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24 xl:px-12 xl:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 xl:gap-20">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E8DDE1] bg-white px-4 py-2 text-sm font-medium text-[#7A1F3D] shadow-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F8EDEF]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L19 6V11.5C19 16.2 16.1 19.9 12 21C7.9 19.9 5 16.2 5 11.5V6L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M8.5 11.5L11 14L15.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Safer renting starts here
            </div>

            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-[#2D0A17] sm:text-5xl md:text-6xl lg:text-[3.75rem] xl:text-[4.25rem]">
              Find a home
              <span className="mt-2 block text-[#7A1F3D]">you can trust.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-[#756970] sm:text-lg sm:leading-8">
              Discover rental properties, verify agents, and identify potential
              risks before making your next rental decision.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/properties"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025] focus:outline-none focus:ring-2 focus:ring-[#7A1F3D] focus:ring-offset-2"
              >
                Explore Properties
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M13 6L19 12L13 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <Link
                to="/register"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#E8DDE1] bg-white px-6 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:border-[#7A1F3D] hover:bg-[#F8EDEF] focus:outline-none focus:ring-2 focus:ring-[#7A1F3D] focus:ring-offset-2"
              >
                Get Started
              </Link>
            </div>

            <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
              {["Verified properties", "Trusted agents", "Risk awareness"].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F5EC] text-xs font-bold text-[#15803D]">
                    ✓
                  </span>
                  <span className="text-sm text-[#756970]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full">
            <div className="rounded-3xl border border-[#E8DDE1] bg-white p-3 shadow-xl sm:p-4">
              <div className="relative h-[300px] overflow-hidden rounded-2xl bg-[#4A1025] sm:h-[360px] lg:h-[390px] xl:h-[420px]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-52 w-60 sm:h-60 sm:w-72">
                    <div className="absolute bottom-0 left-1/2 h-36 w-48 -translate-x-1/2 rounded-t-xl bg-white shadow-xl sm:h-40 sm:w-52">
                      <div className="absolute -top-14 left-1/2 h-20 w-52 -translate-x-1/2 rotate-45 rounded-tl-xl bg-[#7A1F3D] sm:w-56" />
                      <div className="absolute bottom-0 left-1/2 h-24 w-14 -translate-x-1/2 rounded-t-lg bg-[#7A1F3D]">
                        <span className="absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#C9A227]" />
                      </div>
                      <div className="absolute left-5 top-10 h-11 w-11 rounded-md border-4 border-[#7A1F3D] bg-[#F8EDEF] sm:left-6 sm:h-12 sm:w-12" />
                      <div className="absolute right-5 top-10 h-11 w-11 rounded-md border-4 border-[#7A1F3D] bg-[#F8EDEF] sm:right-6 sm:h-12 sm:w-12" />
                    </div>
                    <div className="absolute -bottom-3 left-1/2 h-4 w-64 -translate-x-1/2 rounded-full bg-[#2D0A17]/30 blur-sm" />
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#2D0A17]/80 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6">
                  <p className="text-xs font-medium text-white/70">Featured rental</p>
                  <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">
                    Modern 3-Bedroom Apartment
                  </h2>
                  <p className="mt-1 text-sm text-white/70">Lekki Phase 1, Lagos</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 px-2 pb-1 pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div>
                  <p className="text-xs text-[#756970]">Starting from</p>
                  <p className="mt-1 text-lg font-bold text-[#24171C]">
                    ₦2.5m <span className="text-xs font-medium text-[#756970]">/ year</span>
                  </p>
                </div>

                <div className="flex w-fit items-center gap-2 rounded-full bg-[#E8F5EC] px-3 py-1.5 text-xs font-semibold text-[#15803D]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#15803D]" />
                  Verified property
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8EDEF] text-[#7A1F3D]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3L19 6V11.5C19 16.2 16.1 19.9 12 21C7.9 19.9 5 16.2 5 11.5V6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <path d="M8.5 11.5L11 14L15.5 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#24171C]">Verification</p>
                    <p className="mt-1 text-xs leading-5 text-[#756970]">
                      Property information reviewed by RentSure.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E8DDE1] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-[#756970]">Risk indicator</p>
                    <p className="mt-1 text-base font-bold text-[#15803D]">Low Risk</p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-[#15803D]/20 text-xs font-bold text-[#15803D]">
                    92
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E8DDE1]">
                  <div className="h-full w-[92%] rounded-full bg-[#15803D]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
