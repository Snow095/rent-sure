import { Link } from "react-router-dom";
import { MapPin, BedDouble, Bath, ArrowRight, ShieldCheck } from "lucide-react";

function FeaturedProperties() {
    const properties = [
        {
            id: 1,
            title: "Modern 3-Bedroom Apartment",
            location: "Lekki Phase 1, Lagos",
            price: "₦2.5m",
            type: "Apartment",
            beds: 3,
            baths: 3,
        },
        {
            id: 2,
            title: "Contemporary Family Home",
            location: "GRA, Port Harcourt",
            price: "₦3.2m",
            type: "House",
            beds: 4,
            baths: 4,
        },
        {
            id: 3,
            title: "Cozy 2-Bedroom Apartment",
            location: "Yaba, Lagos",
            price: "₦1.8m",
            type: "Apartment",
            beds: 2,
            baths: 2,
        },
    ];

    return (
        <section className="bg-[#FAF8F9]">
            <div
                style={{
                    padding: '0 20px',
                    margin: '0 0 20px 0',

                }}
                className=" w-full max-w-7xl sm:px-8 sm:py-28 lg:px-10 lg:py-32 xl:px-12 xl:py-36">


                {/* SECTION HEADER */}
                <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                    <div
                        style={{
                            margin: '0 0 10px 0',

                        }}
                        className="max-w-2xl">
                        <span
                            style={{
                                padding: '10px',

                            }}
                            className="inline-flex items-center rounded-full bg-[#F8EDEF] px-4 py-2 text-sm font-semibold text-[#7A1F3D]">
                            Featured Properties
                        </span>

                        <h2 className="mt-7 text-3xl font-bold leading-tight tracking-tight text-[#2D0A17] sm:text-4xl lg:text-5xl">
                            Find a place that feels like home.
                        </h2>

                        <p className="mt-6 max-w-xl text-base leading-8 text-[#756970] sm:text-lg">
                            Explore selected rental properties with verification information
                            to help you make more informed decisions.
                        </p>
                    </div>

                    <Link
                        style={{
                            padding: '10px',
                            margin: '0 0 10px 0',

                        }}
                        to="/properties"
                        className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#E8DDE1] bg-white px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition hover:border-[#7A1F3D] hover:bg-[#F8EDEF]"
                    >
                        View all properties
                        <ArrowRight size={17} />
                    </Link>
                </div>

                {/* PROPERTY GRID */}
                <div
                    style={{
                        padding: '0 50px',

                    }}
                    className="w-full grid grid-cols-1 gap-8 sm:mt-20 md:grid-cols-2 lg:mt-24 lg:grid-cols-3 lg:gap-9">

                    {properties.map((property) => (
                        <article
                            key={property.id}
                            className="overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >
                            {/* IMAGE AREA */}
                            <div className="relative h-64 bg-[#4A1025] sm:h-72">

                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative h-36 w-48 rounded-t-xl bg-white shadow-lg">
                                        <div className="absolute -top-10 left-1/2 h-16 w-52 -translate-x-1/2 rotate-45 rounded-tl-xl bg-[#7A1F3D]" />

                                        <div className="absolute bottom-0 left-1/2 h-20 w-11 -translate-x-1/2 rounded-t-md bg-[#7A1F3D]" />

                                        <div className="absolute left-4 top-9 h-9 w-9 rounded-md border-4 border-[#7A1F3D] bg-[#F8EDEF]" />

                                        <div className="absolute right-4 top-9 h-9 w-9 rounded-md border-4 border-[#7A1F3D] bg-[#F8EDEF]" />
                                    </div>
                                </div>

                                {/* TYPE BADGE */}
                                <div
                                    style={{
                                        padding: '5px 10px',

                                    }}
                                    className="absolute left-5 top-5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#4A1025] shadow-sm">
                                    {property.type}
                                </div>

                                {/* VERIFIED BADGE */}
                                <div
                                    style={{
                                        padding: '5px 10px',

                                    }}
                                    className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-[#E8F5EC] px-3 py-1.5 text-xs font-semibold text-[#15803D] shadow-sm">
                                    <ShieldCheck size={14} />
                                    Verified
                                </div>
                            </div>

                            {/* CARD CONTENT */}
                            <div
                                style={{
                                    padding: '5px 10px',

                                }}
                                className="p-6 sm:p-7">

                                <h3 className="text-lg font-bold leading-7 text-[#24171C]">
                                    {property.title}
                                </h3>

                                <div className="mt-3 flex items-start gap-2 text-sm text-[#756970]">
                                    <MapPin
                                        size={17}
                                        className="mt-0.5 shrink-0 text-[#7A1F3D]"
                                    />
                                    <span>{property.location}</span>
                                </div>

                                {/* PROPERTY FEATURES */}
                                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-[#E8DDE1] py-5">
                                    <div className="flex items-center gap-2 text-sm text-[#756970]">
                                        <BedDouble size={17} className="text-[#7A1F3D]" />
                                        <span>{property.beds} Beds</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-[#756970]">
                                        <Bath size={17} className="text-[#7A1F3D]" />
                                        <span>{property.baths} Baths</span>
                                    </div>
                                </div>

                                {/* PRICE + BUTTON */}
                                <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-[#756970]">
                                            Annual rent
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-[#24171C]">
                                            {property.price}
                                            <span className="ml-1 text-xs font-medium text-[#756970]">
                                                / year
                                            </span>
                                        </p>
                                    </div>

                                    <Link
                                        style={{
                                            padding: '5px 10px',

                                        }}
                                        to={`/properties/${property.id}`}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                                    >
                                        View Property
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}

                </div>
            </div>
        </section>

    );
}

export default FeaturedProperties;
