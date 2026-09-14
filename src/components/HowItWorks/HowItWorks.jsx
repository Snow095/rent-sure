import { Search, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

function HowItWorks() {
    const steps = [
        {
            number: "01",
            icon: Search,
            title: "Search",
            description:
                "Explore rental properties based on your preferred location, property type, and budget.",
        },
        {
            number: "02",
            icon: ShieldCheck,
            title: "Verify",
            description:
                "Review property and agent verification statuses, reports, and risk indicators before proceeding.",
        },
        {
            number: "03",
            icon: CheckCircle2,
            title: "Decide",
            description:
                "Use the available information to make a more informed rental decision with greater confidence.",
        },
    ];

    return (<section className="bg-white"> <div className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-28 lg:px-10 lg:py-32 xl:px-12 xl:py-36">

        {/* SECTION HEADER */}
        <div
            style={{
                padding: '40px 100px',

            }}
            className="mx-auto max-w-full text-center">
            <span
                style={{
                    padding: '15px',

                }}
                className="inline-flex items-center rounded-full bg-[#F8EDEF] px-4 py-2 text-sm font-semibold text-[#7A1F3D]">
                How RentSure Works
            </span>

            <h2 className="mt-7 text-3xl font-bold leading-tight tracking-tight text-[#2D0A17] sm:text-4xl lg:text-5xl">
                A simpler way to rent with confidence.
            </h2>

            <p className="mx-auto mt-6 max-w-full text-base leading-8 text-[#756970] sm:text-lg">
                RentSure gives renters a structured process for finding properties,
                checking important information, and recognizing potential risks.
            </p>
        </div>

        {/* STEPS */}
        <div
            style={{
                padding: '0 50px',
                margin: '0 0 30px 0'

            }}
            className="grid grid-cols-1 gap-10 sm:mt-20 lg:mt-24 lg:grid-cols-3 lg:gap-10">
            {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                    <div key={step.number} className="relative">
                        <article className="h-full rounded-2xl border border-[#E8DDE1] bg-[#FAF8F9] p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-9 lg:p-10">

                            {/* NUMBER + ICON */}
                            <div className="flex items-center justify-between">
                                <span
                                    style={{
                                        padding: '0 10px',

                                    }}
                                    className="text-sm font-bold tracking-widest text-[#C9A227]">
                                    {step.number}
                                </span>

                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
                                    <Icon size={25} strokeWidth={1.8} />
                                </div>
                            </div>

                            <h3
                                style={{
                                    padding: '0 10px',

                                }}
                                className="mt-9 text-xl font-bold text-[#24171C]">
                                {step.title}
                            </h3>

                            <p
                                style={{
                                    padding: '0 10px',

                                }}
                                className="mt-4 text-sm leading-7 text-[#756970]">
                                {step.description}
                            </p>
                        </article>

                        {/* DESKTOP CONNECTOR */}
                        {index < steps.length - 1 && (
                            <div className="absolute -right-7 top-1/2 hidden -translate-y-1/2 lg:block">
                                <ArrowRight
                                    size={22}
                                    strokeWidth={1.7}
                                    className="text-[#C9A227]"
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

        {/* BOTTOM MESSAGE */}
        <div
            style={{

                margin: '40px',

            }}
            className=" max-w-full sm:mt-20">
            <div
                style={{
                    margin: '50px',
                    padding: '15px',

                }}

                className="rounded-2xl border border-[#E8DDE1] bg-[#2D0A17] px-7 py-9 text-center sm:px-10 sm:py-11">
                <p className="text-base font-semibold leading-7 text-white sm:text-lg">
                    Search for a property. Check the available information. Then
                    decide with greater awareness.
                </p>

                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/70">
                    RentSure helps you take a more informed approach to the rental
                    process without claiming to guarantee that a property or agent is
                    completely free from risk.
                </p>
            </div>
        </div>

    </div>
    </section>


    );
}

export default HowItWorks;
