import { SearchCheck, WalletCards, MessageCircleWarning, FileSearch } from "lucide-react";

function SafetyTips() {
  const tips = [
    { icon: SearchCheck, title: "Verify Before You Pay", description: "Review the property's verification status and available information before making any payment." },
    { icon: WalletCards, title: "Be Careful With Payment Requests", description: "Be cautious when someone pressures you to make immediate payments or use unusual payment methods." },
    { icon: MessageCircleWarning, title: "Watch for Red Flags", description: "Unusually low prices, urgent requests, incomplete information, and inconsistent details can be warning signs." },
    { icon: FileSearch, title: "Review the Details", description: "Check the property information, agent details, verification status, and reports before making a decision." },
  ];

  return (
    <section className="bg-[#FAF8F9]">
      <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28 xl:px-12 xl:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-[#F8EDEF] px-4 py-2 text-sm font-semibold text-[#7A1F3D]">
            Stay Rental-Smart
          </span>
          <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-[#2D0A17] sm:text-4xl lg:text-5xl">
            Know the signs before you commit.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#756970] sm:text-lg">
            A little caution can go a long way. Keep these practical tips in mind when
            evaluating a rental property or agent.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-6">
          {tips.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-7"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
                <Icon size={23} strokeWidth={1.8} />
              </div>
              <h3 className="mt-6 text-lg font-bold leading-7 text-[#24171C]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#756970]">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-[#E8DDE1] bg-white px-6 py-7 shadow-sm sm:mt-16 sm:px-10 sm:py-9">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF7E6] text-[#B45309]">
              <MessageCircleWarning size={23} strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#24171C]">Remember: verification is not a guarantee</h3>
              <p className="mt-3 text-sm leading-7 text-[#756970]">
                RentSure verification and risk indicators are designed to support better
                decision-making. They do not guarantee legal ownership, availability, or
                complete freedom from fraud. Always exercise your own judgment before making
                a rental commitment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SafetyTips;
