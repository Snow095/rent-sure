import {
    SearchCheck,
    WalletCards,
    MessageCircleWarning,
    FileSearch,
} from "lucide-react";

function SafetyTips() {
    const tips = [
        {
            icon: SearchCheck,
            title: "Verify Before You Pay",
            description:
                "Review the property's verification status and available information before making any payment.",
        },
        {
            icon: WalletCards,
            title: "Be Careful With Payment Requests",
            description:
                "Be cautious when someone pressures you to make immediate payments or use unusual payment methods.",
        },
        {
            icon: MessageCircleWarning,
            title: "Watch for Red Flags",
            description:
                "Unusually low prices, urgent requests, incomplete information, and inconsistent details can be warning signs.",
        },
        {
            icon: FileSearch,
            title: "Review the Details",
            description:
                "Check the property information, agent details, verification status, and reports before making a decision.",
        },
    ];

    return (<section className="bg-[#FAF8F9]"> <div className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-28 lg:px-10 lg:py-32 xl:px-12 xl:py-36">


        {/* SECTION HEADER */}
        <div
            style={{
                padding: '40px 100px',

            }}
            className="max-w-full text-center">
            <span
                style={{
                    padding: '15px',

                }}
                className="inline-flex items-center rounded-full bg-[#F8EDEF] px-4 py-2 text-sm font-semibold text-[#7A1F3D]">
                Stay Rental-Smart
            </span>

            <h2 className="mt-7 text-3xl font-bold leading-tight tracking-tight text-[#2D0A17] sm:text-4xl lg:text-5xl">
                Know the signs before you commit.
            </h2>

            <p className="mx-auto mt-6 max-w-full text-base leading-8 text-[#756970] sm:text-lg">
                A little caution can go a long way. Keep these practical tips in
                mind when evaluating a rental property or agent.
            </p>
        </div>

        {/* TIPS GRID */}
        <div
            style={{
                padding: '0 50px',

            }}
            className="grid grid-cols-1 gap-7 sm:mt-20 sm:grid-cols-2 sm:gap-8 lg:mt-24 lg:grid-cols-4 lg:gap-8">
            {tips.map((tip) => {
                const Icon = tip.icon;

                return (
                    <article
                        key={tip.title}
                        className="rounded-2xl border border-[#E8DDE1] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-8"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
                            <Icon size={25} strokeWidth={1.8} />
                        </div>

                        <h3
                            style={{
                                padding: '0 10px',

                            }}
                            className="mt-7 text-lg font-bold leading-7 text-[#24171C]">
                            {tip.title}
                        </h3>

                        <p
                            style={{
                                padding: '0 10px',

                            }}
                            className="mt-4 text-sm leading-7 text-[#756970]">
                            {tip.description}
                        </p>
                    </article>
                );
            })}
        </div>

        {/* WARNING MESSAGE */}
        <div
            style={{
                padding: '10px',
                margin: '40px',

            }}
            className="mx-auto mt-16 max-w-full sm:mt-20">
            <div className="rounded-2xl border border-[#E8DDE1] bg-white px-7 py-9 shadow-sm sm:px-10 sm:py-11">
                <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF7E6] text-[#B45309]">
                        <MessageCircleWarning size={23} strokeWidth={1.8} />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#24171C]">
                            Remember: verification is not a guarantee
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-[#756970]">
                            RentSure verification and risk indicators are designed to
                            support better decision-making. They do not guarantee legal
                            ownership, availability, or complete freedom from fraud.
                            Always exercise your own judgment before making a rental
                            commitment.
                        </p>
                    </div>
                </div>
            </div>
        </div>

    </div>
    </section>


    );
}

export default SafetyTips;
