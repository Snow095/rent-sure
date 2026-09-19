import { Search, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

function HowItWorks() {
  const steps = [
    { number: "01", icon: Search, title: "Search", description: "Explore rental properties based on your preferred location, property type, and budget." },
    { number: "02", icon: ShieldCheck, title: "Verify", description: "Review property and agent verification statuses, reports, and risk indicators before proceeding." },
    { number: "03", icon: CheckCircle2, title: "Decide", description: "Use the available information to make a more informed rental decision with greater confidence." },
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28 xl:px-12 xl:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-[#F8EDEF] px-4 py-2 text-sm font-semibold text-[#7A1F3D]">
            How RentSure Works
          </span>
          <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-[#2D0A17] sm:text-4xl lg:text-5xl">
            A simpler way to rent with confidence.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#756970] sm:text-lg">
            RentSure gives renters a structured process for finding properties, checking
            important information, and recognizing potential risks.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:mt-16 lg:grid-cols-3 lg:gap-8">
          {steps.map(({ number, icon: Icon, title, description }, index) => (
            <div key={number} className="relative">
              <article className="h-full rounded-2xl border border-[#E8DDE1] bg-[#FAF8F9] p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold tracking-widest text-[#C9A227]">{number}</span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
                    <Icon size={23} strokeWidth={1.8} />
                  </div>
                </div>
                <h3 className="mt-7 text-xl font-bold text-[#24171C]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#756970]">{description}</p>
              </article>

              {index < steps.length - 1 && (
                <div className="absolute -right-5 top-1/2 hidden -translate-y-1/2 lg:block">
                  <ArrowRight size={20} strokeWidth={1.7} className="text-[#C9A227]" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-[#E8DDE1] bg-[#2D0A17] px-6 py-8 text-center sm:mt-16 sm:px-10 sm:py-10">
          <p className="text-base font-semibold leading-7 text-white sm:text-lg">
            Search for a property. Check the available information. Then decide with greater awareness.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/70">
            RentSure helps you take a more informed approach to the rental process without
            claiming to guarantee that a property or agent is completely free from risk.
          </p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
