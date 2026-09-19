import { ShieldCheck, BadgeCheck, AlertTriangle, Users } from "lucide-react";

function WhyRentSure() {
  const benefits = [
    { icon: ShieldCheck, title: "Safer Rental Decisions", description: "Access verification information and risk indicators before committing to a rental property." },
    { icon: BadgeCheck, title: "Verified Properties", description: "Properties can go through a structured review process to help renters identify listings with verified information." },
    { icon: AlertTriangle, title: "Fraud Awareness", description: "Identify warning signs, suspicious listings, and reported rental activities before making a decision." },
    { icon: Users, title: "Trusted Agents", description: "View agent verification status and relevant information to make it easier to evaluate who you are dealing with." },
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28 xl:px-12 xl:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-[#F8EDEF] px-4 py-2 text-sm font-semibold text-[#7A1F3D]">
            Why RentSure?
          </span>
          <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-[#2D0A17] sm:text-4xl lg:text-5xl">
            Rent with more confidence.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#756970] sm:text-lg">
            RentSure helps renters understand property information, verify important details,
            and become more aware of potential rental risks.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-6">
          {benefits.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-2xl border border-[#E8DDE1] bg-[#FAF8F9] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-7"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
                <Icon size={23} strokeWidth={1.8} />
              </div>
              <h3 className="mt-6 text-lg font-bold leading-7 text-[#24171C]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#756970]">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-[#E8DDE1] bg-[#F8EDEF] px-6 py-7 text-center sm:mt-16 sm:px-10 sm:py-9">
          <p className="text-base font-semibold leading-7 text-[#4A1025] sm:text-lg">
            RentSure gives renters a structured way to evaluate rental information and
            recognize potential risks before taking the next step.
          </p>
        </div>
      </div>
    </section>
  );
}

export default WhyRentSure;
