
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="bg-[#FAF8F9]">
      <div 
        style={{padding: '15px'}}
        className="mx-auto w-full max-w-7xl px-8 py-18 sm:px-10 sm:py-18 lg:px-12 lg:py-26 xl:px-15 xl:py-30">

       
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">

          <div className="max-w-xl">

            {/* Badge */}
            <div 
                style={{padding: '6px 10px'}}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E8DDE1] bg-white px-4 py-2 text-sm font-medium text-[#7A1F3D] shadow-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F8EDEF]">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 3L19 6V11.5C19 16.2 16.1 19.9 12 21C7.9 19.9 5 16.2 5 11.5V6L12 3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M8.5 11.5L11 14L15.5 9.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              Safer renting starts here
            </div>

            {/* Heading */}
            <h1 
                style={{margin: '15px 0 0 0'}}
                className="text-4xl font-bold leading-[1.08] tracking-tight text-[#2D0A17] sm:text-5xl md:text-6xl lg:text-[3.75rem] xl:text-[4.25rem]">
              Find a home
              <span className="mt-2 block text-[#7A1F3D]">
                you can trust.
              </span>
            </h1>

            {/* Description */}
            <p 
                style={{margin: '8px 0 0 0'}}
                className="mt-6 max-w-lg text-base leading-7 text-[#756970] sm:mt-7 sm:text-lg sm:leading-8">
              Discover rental properties, verify agents, and identify
              potential risks before making your next rental decision.
            </p>

            {/* Buttons */}
            <div 
            style={{margin: '10px 0 0 0'}}
            className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row">

              <Link
                to="/properties"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025] focus:outline-none focus:ring-2 focus:ring-[#7A1F3D] focus:ring-offset-2"
              >
                Explore Properties

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12H19"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                  <path
                    d="M13 6L19 12L13 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>

              <Link
                to="/register"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#E8DDE1] bg-white px-6 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:border-[#7A1F3D] hover:bg-[#F8EDEF] focus:outline-none focus:ring-2 focus:ring-[#7A1F3D] focus:ring-offset-2"
              >
                Get Started
              </Link>

            </div>

            {/* Trust Indicators */}
            <div 
            style={{margin: '10px 0 0 0'}}
            className="mt-9 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-5">

              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F5EC] text-xs font-bold text-[#15803D]">
                  ✓
                </span>

                <span className="text-sm text-[#756970]">
                  Verified properties
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F5EC] text-xs font-bold text-[#15803D]">
                  ✓
                </span>

                <span className="text-sm text-[#756970]">
                  Trusted agents
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F5EC] text-xs font-bold text-[#15803D]">
                  ✓
                </span>

                <span className="text-sm text-[#756970]">
                  Risk awareness
                </span>
              </div>

            </div>
          </div>

          {/* =========================
              RIGHT SIDE
          ========================== */}
          <div className="w-full">

            {/* Property Card */}
            <div className="rounded-3xl border border-[#E8DDE1] bg-white p-3 shadow-xl sm:p-4">

              {/* Property Visual */}
              <div className="relative h-[320px] overflow-hidden rounded-2xl bg-[#4A1025] sm:h-[380px] lg:h-[400px] xl:h-[430px]">

                {/* Simple architectural illustration */}
                <div className="absolute inset-0 flex items-center justify-center">

                  <div className="relative h-52 w-60 sm:h-60 sm:w-72">

                    {/* House */}
                    <div className="absolute bottom-0 left-1/2 h-36 w-48 -translate-x-1/2 rounded-t-xl bg-white shadow-xl sm:h-40 sm:w-52">

                      {/* Roof */}
                      <div className="absolute -top-14 left-1/2 h-20 w-52 -translate-x-1/2 rotate-45 rounded-tl-xl bg-[#7A1F3D] sm:w-56" />

                      {/* Door */}
                      <div className="absolute bottom-0 left-1/2 h-24 w-14 -translate-x-1/2 rounded-t-lg bg-[#7A1F3D]">
                        <span className="absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#C9A227]" />
                      </div>

                      {/* Windows */}
                      <div className="absolute left-5 top-10 h-11 w-11 rounded-md border-4 border-[#7A1F3D] bg-[#F8EDEF] sm:left-6 sm:h-12 sm:w-12" />

                      <div className="absolute right-5 top-10 h-11 w-11 rounded-md border-4 border-[#7A1F3D] bg-[#F8EDEF] sm:right-6 sm:h-12 sm:w-12" />

                    </div>

                    {/* Ground */}
                    <div className="absolute -bottom-3 left-1/2 h-4 w-64 -translate-x-1/2 rounded-full bg-[#2D0A17]/30 blur-sm" />

                  </div>
                </div>

                {/* Bottom Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#2D0A17]/80 to-transparent" />

                {/* Property Information */}
                <div 
                                
                className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6">

                  <p className="text-xs font-medium text-white/70">
                    Featured rental
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">
                    Modern 3-Bedroom Apartment
                  </h2>

                  <p className="mt-1 text-sm text-white/70">
                    Lekki Phase 1, Lagos
                  </p>

                </div>

              </div>
              

              {/* Property Details */}
              <div className="flex flex-col gap-4 px-2 pb-1 pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">

                <div
                    style={{margin: '15px 0 0 0', padding:'0 0 0 10px'}}
                >
                  <p className="text-xs text-[#756970]">
                    Starting from
                  </p>

                  <p className="mt-1 text-lg font-bold text-[#24171C]">
                    ₦2.5m
                    <span className="ml-1 text-xs font-medium text-[#756970]">
                      / year
                    </span>
                  </p>
                </div>

                <div 
                style={{margin: '0 0 15px 15px', padding:'8px 10px'}}
                className="flex w-fit items-center gap-2 rounded-full bg-[#E8F5EC] px-3 py-1.5 text-xs font-semibold text-[#15803D]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#15803D]" />
                  Verified property
                </div>

              </div>
            </div>
            

            {/* Supporting Cards */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* Verification Card */}
              <div 
              style={{margin: '15px 0 0 0'}}
              className="rounded-xl border border-[#E8DDE1] bg-white p-4 shadow-sm sm:p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8EDEF] text-[#7A1F3D]">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 3L19 6V11.5C19 16.2 16.1 19.9 12 21C7.9 19.9 5 16.2 5 11.5V6L12 3Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M8.5 11.5L11 14L15.5 9.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#24171C]">
                      Verification
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#756970]">
                      Property information reviewed by RentSure.
                    </p>
                  </div>

                </div>
              </div>

              {/* Risk Card */}
              <div 
              style={{margin: '15px 0 20px 0'}}
              className="rounded-xl border border-[#E8DDE1] bg-white p-4 shadow-sm sm:p-5">

                <div className="flex items-center justify-between gap-4">

                  <div
                  style={{padding: '8px 0 8px 5px'}}
                  >
                    <p className="text-xs font-medium text-[#756970]">
                      Risk indicator
                    </p>

                    <p className="mt-1 text-base font-bold text-[#15803D]">
                      Low Risk
                    </p>
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

        {/* =========================
            SEARCH SECTION
        ========================== */}
        <div className="w-full sm:mt-20 ">

          <div 
          style={{padding: '20px',
            margin:'40px'
          }}
          className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-lg sm:p-6 lg:p-7">

            {/* Search Header */}
            <div className="mb-6">

              <h2 className="text-lg font-bold text-[#24171C] sm:text-xl">
                Find your next rental
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#756970]">
                Search properties by location, type, and price.
              </p>

            </div>

            {/* Search Form */}
            <div 
            
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_auto]">

              {/* Location */}
              <div className="md:col-span-2 lg:col-span-1">

                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-semibold text-[#24171C]"
                >
                  Location
                </label>

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7A1F3D]">
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 21C16 17 19 13.7 19 9.5C19 5.9 15.9 3 12 3C8.1 3 5 5.9 5 9.5C5 13.7 8 17 12 21Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />

                      <circle
                        cx="12"
                        cy="9.5"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </span>

                  <input
                    style={{
                      padding: '0 40px',
                      
                    }}
                    id="location"
                    type="text"
                    placeholder="e.g. Lekki, Lagos"
                    className="h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 pl-11 text-sm text-[#24171C] outline-none transition placeholder:text-[#A39A9F] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  />

                </div>
              </div>

              {/* Property Type */}
              <div>

                <label
                  htmlFor="property-type"
                  className="mb-2 block text-sm font-semibold text-[#24171C]"
                >
                  Property Type
                </label>

                <select
                  style={{
                      padding: '0 15px',
                      
                    }}
                  id="property-type"
                  className="h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                >
                  <option>Any type</option>
                  <option>Apartment</option>
                  <option>House</option>
                  <option>Self Contain</option>
                  <option>Duplex</option>
                  <option>Studio</option>
                </select>

              </div>

              {/* Price */}
              <div>

                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-semibold text-[#24171C]"
                >
                  Price Range
                </label>

                <select
                  style={{
                      padding: '0 15px',
                      
                    }}
                  id="price"
                  className="h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 text-sm text-[#24171C] outline-none transition focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                >
                  <option>Any price</option>
                  <option>Under ₦500k</option>
                  <option>₦500k – ₦1m</option>
                  <option>₦1m – ₦2m</option>
                  <option>₦2m – ₦5m</option>
                  <option>Above ₦5m</option>
                </select>

              </div>

              {/* Search Button */}
              <div className="md:col-span-2 lg:col-span-1 lg:flex lg:items-end">

                <button
                  style={{
                      padding: '0 15px',
                      
                    }}
                  type="button"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025] focus:outline-none focus:ring-2 focus:ring-[#7A1F3D] focus:ring-offset-2 lg:w-auto"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="6.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    <path
                      d="M16 16L21 21"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>

                  Search
                </button>

              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;

