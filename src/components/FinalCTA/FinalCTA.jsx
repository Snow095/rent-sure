import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

function FinalCTA() {
    return (
        <section className="bg-white">
            <div
                style={{
                    margin: '10px',
                    padding: '15px',

                }}
                className="mx-auto w-full max-w-full sm:px-8 sm:py-28 lg:px-10 lg:py-32 xl:px-12 xl:py-36"> <div className="overflow-hidden rounded-3xl bg-[#2D0A17] px-7 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-20"> <div className="mx-auto max-w-3xl text-center">

                    {/* ICON */}
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7A1F3D] text-white">
                        <ShieldCheck size={30} strokeWidth={1.7} />
                    </div>

                    {/* CONTENT */}
                    <h2
                        
                        className="text-center text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                        Ready to rent smarter?
                    </h2>

                    <p
                        
                        className="max-w-full text-base leading-8 text-white/70 sm:text-lg">
                        Explore rental properties, check verification information, and
                        make your next rental decision with greater awareness.
                    </p>

                    {/* ACTIONS */}
                    <div className="mt-9 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
                        <Link
                            to="/properties"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#2D0A17]"
                        >
                            Explore Properties
                            <ArrowRight size={17} />
                        </Link>

                        <Link
                            to="/register"
                            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/20 px-7 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#2D0A17]"
                        >
                            Create an Account
                        </Link>
                    </div>

                    {/* SMALL TRUST NOTE */}
                    <p className="mt-8 text-xs leading-6 text-white/50">
                        RentSure provides verification and risk-awareness information to
                        support informed rental decisions.
                    </p>
                </div>
                </div>
            </div>
        </section>


    );
}

export default FinalCTA;
