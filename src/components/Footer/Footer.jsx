import { Link } from "react-router-dom";
import {
    ShieldCheck,
    Mail,
    MapPin,
    ArrowUpRight,
} from "lucide-react";

function Footer() {
    return (<footer className="bg-[#2D0A17] text-white"> <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24 xl:px-12">


        {/* MAIN FOOTER */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-16">

            {/* BRAND */}
            <div className="max-w-sm">
                <Link
                    to="/"
                    className="inline-flex items-center gap-3"
                >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7A1F3D]">
                        <ShieldCheck size={24} strokeWidth={1.8} />
                    </span>

                    <span>
                        <span className="block text-xl font-bold">
                            RentSure
                        </span>
                        <span className="mt-0.5 block text-xs text-white/50">
                            Rent smarter. Rent safer.
                        </span>
                    </span>
                </Link>

                <p className="mt-7 text-sm leading-7 text-white/60">
                    A rental property verification and fraud-awareness platform
                    designed to help renters make more informed decisions.
                </p>

                <p className="mt-6 text-xs leading-6 text-white/40">
                    Verification information provided by RentSure is intended to
                    support decision-making and does not constitute a legal guarantee
                    of ownership, availability, or complete freedom from fraud.
                </p>
            </div>

            {/* PLATFORM */}
            <div>
                <h3 className="text-sm font-semibold text-white">
                    Platform
                </h3>

                <ul className="mt-6 space-y-4">
                    <li>
                        <Link
                            to="/"
                            className="text-sm text-white/60 transition hover:text-white"
                        >
                            Home
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/properties"
                            className="text-sm text-white/60 transition hover:text-white"
                        >
                            Properties
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/agents"
                            className="text-sm text-white/60 transition hover:text-white"
                        >
                            Agents
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/about"
                            className="text-sm text-white/60 transition hover:text-white"
                        >
                            About RentSure
                        </Link>
                    </li>
                </ul>
            </div>

            {/* ACCOUNT */}
            <div>
                <h3 className="text-sm font-semibold text-white">
                    Account
                </h3>

                <ul className="mt-6 space-y-4">
                    <li>
                        <Link
                            to="/login"
                            className="text-sm text-white/60 transition hover:text-white"
                        >
                            Login
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/register"
                            className="text-sm text-white/60 transition hover:text-white"
                        >
                            Create Account
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/register?role=agent"
                            className="text-sm text-white/60 transition hover:text-white"
                        >
                            Become an Agent
                        </Link>
                    </li>
                </ul>
            </div>

            {/* CONTACT */}
            <div>
                <h3 className="text-sm font-semibold text-white">
                    Contact
                </h3>

                <div className="mt-6 space-y-5">
                    <div className="flex items-start gap-3">
                        <Mail
                            size={18}
                            className="mt-0.5 shrink-0 text-[#C9A227]"
                        />

                        <span className="text-sm leading-6 text-white/60">
                            support@rentsure.com
                        </span>
                    </div>

                    <div className="flex items-start gap-3">
                        <MapPin
                            size={18}
                            className="mt-0.5 shrink-0 text-[#C9A227]"
                        />

                        <span className="text-sm leading-6 text-white/60">
                            Nigeria
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* DIVIDER */}
        <div className="my-12 h-px bg-white/10 sm:my-14" />

        {/* BOTTOM FOOTER */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-xs leading-6 text-white/40">
                © {new Date().getFullYear()} RentSure. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-5">
                <Link
                    to="/privacy"
                    className="text-xs text-white/40 transition hover:text-white"
                >
                    Privacy
                </Link>

                <Link
                    to="/terms"
                    className="text-xs text-white/40 transition hover:text-white"
                >
                    Terms
                </Link>

                <Link
                    to="/safety"
                    className="inline-flex items-center gap-1 text-xs text-white/40 transition hover:text-white"
                >
                    Safety Tips
                    <ArrowUpRight size={13} />
                </Link>
            </div>
        </div>
    </div>
    </footer>


    );
}

export default Footer;
