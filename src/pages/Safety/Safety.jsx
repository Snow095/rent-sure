import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Search,
  Home,
  UserCheck,
  AlertTriangle,
  FileText,
  Eye,
} from "lucide-react";

function Safety() {
  const safetyTips = [
    {
      icon: Search,
      title: "Verify the Property",
      description:
        "Review the property's verification status, location, description, rent, and other available information before making a decision.",
    },
    {
      icon: Home,
      title: "Inspect the Property",
      description:
        "Where possible, visit the property physically or arrange a trusted viewing before making financial commitments.",
    },
    {
      icon: CreditCard,
      title: "Be Careful With Payments",
      description:
        "Be cautious when someone pressures you to pay immediately or requests payment through unusual or personal channels.",
    },
    {
      icon: UserCheck,
      title: "Verify the Agent",
      description:
        "Review the agent's profile and available listing information. Do not assume that a profile alone proves legal ownership or authority.",
    },
    {
      icon: FileText,
      title: "Review Documents",
      description:
        "Carefully review relevant rental documents and agreements. Ask questions when important information is missing or unclear.",
    },
    {
      icon: Eye,
      title: "Watch for Red Flags",
      description:
        "Unusually low prices, urgent payment demands, inconsistent property information, and requests to avoid normal verification should receive extra attention.",
    },
  ];

  const redFlags = [
    "The rent is significantly lower than comparable properties without a clear explanation.",
    "You are pressured to transfer money before viewing or verifying the property.",
    "The person refuses reasonable questions about the property or their authority to rent it.",
    "Payment is requested through unusual methods or an account unrelated to the transaction.",
    "Property photos, descriptions, locations, or other details appear inconsistent.",
    "You are told that verification or inspection is unnecessary because of urgency.",
    "Someone asks you to share passwords, verification codes, or sensitive account information.",
  ];

  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      {/* Hero */}
      <section className="bg-[#2D0A17] text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to RentSure
          </Link>

          <div className="mt-10 max-w-3xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck size={28} className="text-[#C9A227]" />
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Rental Safety Tips
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
              Simple steps to help you identify suspicious rental situations,
              verify important information, and make more informed decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
                <AlertTriangle size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#24171C]">
                  Stay alert before you pay
                </h2>

                <p className="mt-3 text-sm leading-7 text-[#756970]">
                  Rental scams can involve fake properties, impersonated
                  agents, misleading information, duplicate listings, or
                  suspicious payment requests. RentSure provides verification
                  and risk-awareness tools, but you should always perform your
                  own checks before making a rental commitment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tips */}
      <section className="px-4 pb-10 sm:px-6 lg:px-8 lg:pb-14">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-[#7A1F3D]">
              Before You Rent
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#24171C] sm:text-3xl">
              Six habits that can reduce rental risk
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#756970]">
              Use these checks together rather than relying on a single
              verification signal.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {safetyTips.map((tip) => {
              const Icon = tip.icon;

              return (
                <article
                  key={tip.title}
                  className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#24171C]">
                    {tip.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#756970]">
                    {tip.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Red Flags */}
      <section className="border-y border-[#E8DDE1] bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#B91C1C]">
                Warning Signs
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#24171C] sm:text-3xl">
                Watch for rental red flags
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#756970]">
                One warning sign does not automatically prove that a listing
                or person is fraudulent. Multiple inconsistencies should,
                however, prompt additional verification and caution.
              </p>
            </div>

            <div className="space-y-3">
              {redFlags.map((flag, index) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-xl border border-[#E8DDE1] bg-[#FAF8F9] p-4"
                >
                  <AlertTriangle
                    size={19}
                    className="mt-0.5 shrink-0 text-[#B91C1C]"
                  />

                  <p className="text-sm leading-6 text-[#756970]">
                    {flag}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* If Something Seems Wrong */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-[#F8EDEF] p-6 sm:p-8 lg:p-10">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-wider text-[#7A1F3D]">
                If Something Seems Wrong
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#24171C] sm:text-3xl">
                Slow down and verify before taking action
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#756970]">
                If you notice suspicious information, avoid rushing into a
                payment or agreement. Review the property details, ask for
                clarification, inspect the property where possible, and use
                RentSure's reporting tools when appropriate.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/properties"
                  className="inline-flex items-center justify-center rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                >
                  Explore Properties
                </Link>

                <Link
                  to="/about"
                  className="inline-flex items-center justify-center rounded-lg border border-[#E8DDE1] bg-white px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#FAF8F9]"
                >
                  Learn About RentSure
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-6 sm:p-8">
            <h2 className="text-lg font-bold text-[#24171C]">
              Important Disclaimer
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#756970]">
              RentSure's verification status and risk information are designed
              to support informed rental decisions. They are not a guarantee of
              legal ownership, property condition, agent authority,
              availability, transaction safety, or the absence of fraud.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#756970]">
              Always perform appropriate independent checks before transferring
              money, signing an agreement, or providing sensitive information.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Safety;