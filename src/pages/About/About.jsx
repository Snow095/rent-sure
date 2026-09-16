
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Search,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

const principles = [
  {
    icon: ShieldCheck,
    title: "Verification-first",
    description:
      "RentSure provides a structured process for submitting and reviewing property information and supporting documents.",
  },
  {
    icon: TriangleAlert,
    title: "Fraud awareness",
    description:
      "Renters receive practical warnings about suspicious payment requests, misleading listings and other common rental risks.",
  },
  {
    icon: Search,
    title: "Better decisions",
    description:
      "The platform brings property information, verification status and risk indicators together before renters make important decisions.",
  },
];

const workflow = [
  "Search for available rental properties.",
  "Review property information and verification indicators.",
  "Check the agent and property details.",
  "Request a viewing when appropriate.",
  "Report suspicious or concerning activity.",
];

function About() {
  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      {/* Hero */}
      <section className="border-b border-[#E8DDE1] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#F8EDEF] px-4 py-2 text-sm font-semibold text-[#7A1F3D]">
              <ShieldCheck size={17} />
              About RentSure
            </span>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl lg:text-5xl">
              Rent smarter. Rent safer.
            </h1>

            <p className="mt-5 text-base leading-7 text-[#756970] sm:text-lg">
              RentSure is a web-based rental property verification and
              fraud-awareness platform designed to help renters make
              more informed rental decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-[#7A1F3D]">
              Our purpose
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#24171C] sm:text-3xl">
              Making rental decisions more transparent.
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#756970] sm:text-base">
              Finding a rental property can involve significant financial
              and personal risk. Fake listings, misleading property
              information, suspicious payment requests and unverified
              agents can make the process difficult for renters.
            </p>

            <p className="mt-4 text-sm leading-7 text-[#756970] sm:text-base">
              RentSure addresses this challenge by bringing property
              discovery, verification workflows, risk awareness,
              reporting and viewing requests into one structured
              platform.
            </p>

            <div className="mt-7">
              <Link
                to="/properties"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
              >
                Explore Properties
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E8DDE1] bg-white p-7 shadow-sm sm:p-9">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8EDEF] text-[#7A1F3D]">
              <ShieldCheck size={29} />
            </div>

            <h3 className="mt-6 text-xl font-bold text-[#24171C]">
              What RentSure provides
            </h3>

            <div className="mt-6 space-y-4">
              {[
                "Structured property verification",
                "Risk and verification indicators",
                "Rental fraud-awareness guidance",
                "Suspicious listing reporting",
                "Viewing request management",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-[#15803D]"
                  />

                  <p className="text-sm leading-6 text-[#756970]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-y border-[#E8DDE1] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-[#7A1F3D]">
              Our principles
            </p>

            <h2 className="mt-3 text-2xl font-bold text-[#24171C] sm:text-3xl">
              Built around trust and awareness.
            </h2>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {principles.map((principle) => {
              const Icon = principle.icon;

              return (
                <article
                  key={principle.title}
                  className="rounded-2xl border border-[#E8DDE1] bg-[#FAF8F9] p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
                    <Icon size={23} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#24171C]">
                    {principle.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#756970]">
                    {principle.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-[#7A1F3D]">
            The RentSure approach
          </p>

          <h2 className="mt-3 text-2xl font-bold text-[#24171C] sm:text-3xl">
            A clearer rental decision process.
          </h2>
        </div>

        <div className="mt-8 grid gap-4">
          {workflow.map((item, index) => (
            <div
              key={item}
              className="flex items-start gap-4 rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7A1F3D] text-sm font-bold text-white">
                {index + 1}
              </div>

              <p className="pt-1 text-sm leading-6 text-[#24171C]">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-[#2D0A17]">
        <div className="mx-auto max-w-5xl px-5 py-12 text-center sm:px-8 lg:py-16">
          <TriangleAlert
            size={30}
            className="mx-auto text-[#C9A227]"
          />

          <h2 className="mt-5 text-2xl font-bold text-white">
            Verification is not a legal guarantee.
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/75 sm:text-base">
            RentSure verification means that a property has gone through
            the platform's defined review process based on the available
            information and supporting documentation. It does not
            guarantee ownership, legal title, physical condition,
            availability or the outcome of a rental transaction.
          </p>

          <div className="mt-7">
            <Link
              to="/properties"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
            >
              Start Exploring
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default About;

