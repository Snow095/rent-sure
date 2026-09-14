
import { Link } from "react-router-dom";
import {
  Building2,
  PlusCircle,
  ShieldCheck,
  FileWarning,
  ArrowRight,
  ClipboardCheck,
  CalendarDays,
  
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  const userName =
    user?.user_metadata?.full_name || "Agent";

  return (
    <main className="min-h-screen bg-[#FAF8F9] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
      <div className="mx-auto w-full max-w-7xl">
        {/* HEADER */}
        <section>
          <p className="text-sm font-semibold text-[#7A1F3D]">
            Agent Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#24171C] sm:text-4xl">
            Welcome back, {userName}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
            Manage your rental properties, monitor verification status, and
            keep your listings trustworthy for renters.
          </p>
        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/agent/properties"
            className="group rounded-2xl border border-[#E8DDE1] bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
              <Building2 size={21} />
            </div>

            <h2 className="mt-5 font-bold text-[#24171C]">
              My Properties
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#756970]">
              View and manage the properties you have listed.
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#7A1F3D]">
              Manage properties
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </div>
          </Link>

          <Link
            to="/agent/add-property"
            className="group rounded-2xl border border-[#E8DDE1] bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
              <PlusCircle size={21} />
            </div>

            <h2 className="mt-5 font-bold text-[#24171C]">
              Add Property
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#756970]">
              Create a new rental property listing.
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#7A1F3D]">
              Add a listing
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </div>
          </Link>

          <Link
            to="/agent/verification"
            className="group rounded-2xl border border-[#E8DDE1] bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
              <ShieldCheck size={21} />
            </div>

            <h2 className="mt-5 font-bold text-[#24171C]">
              Verification
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#756970]">
              Check the verification status of your listings.
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#7A1F3D]">
              View status
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </div>
          </Link>

          <Link
            to="/agent/reports"
            className="group rounded-2xl border border-[#E8DDE1] bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
              <FileWarning size={21} />
            </div>

            <h2 className="mt-5 font-bold text-[#24171C]">
              Reports
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#756970]">
              Review reports or issues related to your listings.
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#7A1F3D]">
              View reports
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </div>
          </Link>
          <Link
            to="/agent/viewing-requests"
            className="group rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
              <CalendarDays size={24} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#24171C]">
              Viewing Requests
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#756970]">
              Review and manage viewing requests from renters.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D]">
              Manage Requests
              <ArrowRight size={16} />
            </div>
          </Link>
        </section>

        {/* VERIFICATION NOTICE */}
        <section className="mt-10 rounded-2xl bg-[#4A1025] p-7 text-white sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <ClipboardCheck size={23} />
              </div>

              <div>
                <h2 className="font-bold">
                  Build trust with verified listings
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                  Submit the required property information and supporting
                  documentation so your listings can go through RentSure's
                  verification process.
                </p>
              </div>
            </div>

            <Link
              to="/agent/verification"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#4A1025] transition hover:bg-[#F8EDEF]"
            >
              Check Verification
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* SAFETY NOTE */}
        <section className="mt-8 rounded-2xl border border-[#E8DDE1] bg-white p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <ShieldCheck
              size={22}
              className="mt-0.5 shrink-0 text-[#7A1F3D]"
            />

            <div>
              <h2 className="font-bold text-[#24171C]">
                RentSure verification standard
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#756970]">
                A verified listing means the property has passed RentSure's
                defined review requirements. Verification supports renter
                confidence but does not legally guarantee ownership,
                availability, or complete freedom from fraud.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;

