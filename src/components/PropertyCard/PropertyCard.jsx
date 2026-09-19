import { Link } from "react-router-dom";
import { MapPin, BedDouble, Bath, ShieldCheck, ArrowRight } from "lucide-react";

function PropertyCard({ property }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#E8DDE1] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-60 overflow-hidden bg-[#4A1025] sm:h-64">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-36 w-48 rounded-t-xl bg-white shadow-lg">
            <div className="absolute -top-10 left-1/2 h-16 w-52 -translate-x-1/2 rotate-45 rounded-tl-xl bg-[#7A1F3D]" />
            <div className="absolute bottom-0 left-1/2 h-20 w-11 -translate-x-1/2 rounded-t-md bg-[#7A1F3D]" />
            <div className="absolute left-4 top-9 h-9 w-9 rounded-md border-4 border-[#7A1F3D] bg-[#F8EDEF]" />
            <div className="absolute right-4 top-9 h-9 w-9 rounded-md border-4 border-[#7A1F3D] bg-[#F8EDEF]" />
          </div>
        </div>

        <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#4A1025] shadow-sm sm:left-5 sm:top-5">
          {property.type}
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[#E8F5EC] px-3 py-1.5 text-xs font-semibold text-[#15803D] shadow-sm sm:right-5 sm:top-5">
          <ShieldCheck size={14} />
          Verified
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <h3 className="text-lg font-bold leading-7 text-[#24171C]">{property.title}</h3>

        <div className="mt-3 flex items-start gap-2 text-sm text-[#756970]">
          <MapPin size={17} className="mt-0.5 shrink-0 text-[#7A1F3D]" />
          <span>{property.location}</span>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 border-y border-[#E8DDE1] py-5">
          <div className="flex items-center gap-2 text-sm text-[#756970]">
            <BedDouble size={17} className="text-[#7A1F3D]" />
            <span>{property.beds} Beds</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#756970]">
            <Bath size={17} className="text-[#7A1F3D]" />
            <span>{property.baths} Baths</span>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium text-[#756970]">Annual rent</p>
          <p className="mt-1 text-xl font-bold text-[#24171C]">
            {property.price}
            <span className="ml-1 text-xs font-medium text-[#756970]">/ year</span>
          </p>
        </div>

        <Link
          to={`/properties/${property.id}`}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025] focus:outline-none focus:ring-2 focus:ring-[#7A1F3D] focus:ring-offset-2"
        >
          View Property
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

export default PropertyCard;
