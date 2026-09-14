import {
    ShieldCheck,
    BadgeCheck,
    AlertTriangle,
    Users,
} from "lucide-react";

function WhyRentSure() {
    const benefits = [
        {
            icon: ShieldCheck,
            title: "Safer Rental Decisions",
            description:
                "Access verification information and risk indicators before committing to a rental property.",
        },
        {
            icon: BadgeCheck,
            title: "Verified Properties",
            description:
                "Properties can go through a structured review process to help renters identify listings with verified information.",
        },
        {
            icon: AlertTriangle,
            title: "Fraud Awareness",
            description:
                "Identify warning signs, suspicious listings, and reported rental activities before making a decision.",
        },
        {
            icon: Users,
            title: "Trusted Agents",
            description:
                "View agent verification status and relevant information to make it easier to evaluate who you are dealing with.",
        },
    ];

    return (
        <section className="bg-white">
            <div className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-28 lg:px-10 lg:py-32 xl:px-12 xl:py-36">


                {/* SECTION INTRO */}
                <div
                    style={{
                        padding: '40px 100px',

                    }}
                    className="mx-auto max-w-full text-center justify-center">
                    <span
                        style={{
                            padding: '15px',

                        }}
                        className="inline-flex items-center rounded-full bg-[#F8EDEF] px-4 py-2 text-sm font-semibold text-[#7A1F3D]">
                        Why RentSure?
                    </span>

                    <h2 className="mt-7 text-3xl font-bold leading-tight tracking-tight text-[#2D0A17] sm:text-4xl lg:text-5xl">
                        Rent with more confidence.
                    </h2>

                    <p className="mx-auto mt-6 max-w-full text-base text-center justify-center leading-8 text-[#756970] sm:text-lg">
                        RentSure helps renters understand property information, verify
                        important details, and become more aware of potential rental risks.
                    </p>
                </div>

                {/* BENEFIT CARDS */}
                <div
                    style={{
                        padding: '0 50px',

                    }}
                    className=" grid grid-cols-1 gap-7 sm:mt-20 sm:grid-cols-2 sm:gap-8 lg:mt-24 lg:grid-cols-4 lg:gap-8">
                    {benefits.map((benefit) => {
                        const Icon = benefit.icon;

                        return (
                            <article

                                key={benefit.title}
                                className="rounded-2xl border border-[#E8DDE1] bg-[#FAF8F9] p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-8"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
                                    <Icon size={25} strokeWidth={1.8} />
                                </div>

                                <h3
                                    style={{
                                        padding: '0 10px',

                                    }}
                                    className="mt-7 text-lg font-bold text-[#24171C]">
                                    {benefit.title}
                                </h3>

                                <p
                                    style={{
                                        padding: '0 10px',

                                    }}
                                    className="mt-4 text-sm leading-7 text-[#756970]">
                                    {benefit.description}
                                </p>
                            </article>
                        );
                    })}
                </div>

                {/* BOTTOM TRUST MESSAGE */}
                <div
                    style={{
                        padding: '10px',
                        margin:'40px',

                    }}
                    className="max-w-full rounded-2xl border border-[#E8DDE1] bg-[#F8EDEF] px-7 py-8 text-center sm:mt-20 sm:px-10 sm:py-10">
                    <p className="text-base font-semibold leading-7 text-[#4A1025] sm:text-lg">
                        RentSure gives renters a structured way to evaluate rental
                        information and recognize potential risks before taking the next
                        step.
                    </p>
                </div>
            </div>
        </section>


    );
}

export default WhyRentSure;
