import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

function Terms() {
  return (
    <main className="min-h-screen bg-[#FAF8F9]">
      {/* Header */}
      <section className="border-b border-[#E8DDE1] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
          >
            <ArrowLeft size={17} />
            Back to RentSure
          </Link>

          <div className="mt-8 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#7A1F3D]">
              <FileText size={25} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                Terms & Conditions
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
                These terms describe the rules and responsibilities that apply
                when using the RentSure platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-5xl space-y-8">
          <TermsSection
            icon={<UserCheck size={21} />}
            title="1. Acceptance of Terms"
          >
            <p>
              By creating an account or using RentSure, you agree to use the
              platform responsibly and in accordance with these Terms &
              Conditions.
            </p>

            <p>
              If you do not agree with these terms, you should not use the
              platform.
            </p>
          </TermsSection>

          <TermsSection title="2. About RentSure">
            <p>
              RentSure is a web-based rental property verification and
              fraud-awareness platform.
            </p>

            <p>
              The platform provides tools for property discovery, agent
              information, verification workflows, risk awareness, reporting,
              saved properties, and viewing requests.
            </p>
          </TermsSection>

          <TermsSection
            icon={<ShieldCheck size={21} />}
            title="3. Verification Disclaimer"
          >
            <p>
              A property marked as verified has passed the verification
              requirements and review process implemented by RentSure.
            </p>

            <p>
              Verification does not constitute a legal guarantee of ownership,
              title, property condition, availability, agent authority,
              transaction outcome, or absence of fraud.
            </p>

            <p className="font-semibold text-[#7A1F3D]">
              Users must independently verify important rental information
              before making financial or contractual commitments.
            </p>
          </TermsSection>

          <TermsSection title="4. User Accounts">
            <p>
              Users are responsible for maintaining the confidentiality of
              their account credentials.
            </p>

            <p>
              You should provide accurate information when registering and
              should not impersonate another person or create an account for
              fraudulent purposes.
            </p>
          </TermsSection>

          <TermsSection title="5. Agent Responsibilities">
            <p>
              Agents are responsible for ensuring that property information
              submitted to RentSure is accurate to the best of their knowledge.
            </p>

            <p>
              Agents must not knowingly submit fraudulent listings, misleading
              property information, unauthorized documents, or information
              intended to deceive renters.
            </p>
          </TermsSection>

          <TermsSection title="6. Renter Responsibilities">
            <p>
              Renters should review property information carefully and use
              available verification and safety information before making
              rental decisions.
            </p>

            <p>
              RentSure does not replace personal due diligence, physical
              property inspection, legal advice, or independent verification
              of ownership and payment details.
            </p>
          </TermsSection>

          <TermsSection
            icon={<AlertTriangle size={21} />}
            title="7. Prohibited Activities"
          >
            <p>Users must not use RentSure to:</p>

            <ul>
              <li>Submit knowingly false property information.</li>
              <li>Impersonate another person or organization.</li>
              <li>Upload fraudulent or misleading documents.</li>
              <li>Harass, threaten, or abuse other users.</li>
              <li>Attempt to bypass security or access controls.</li>
              <li>Use the platform for unlawful activities.</li>
              <li>Manipulate reports or verification processes.</li>
            </ul>
          </TermsSection>

          <TermsSection title="8. Reports and Moderation">
            <p>
              Users may submit reports about suspicious listings, payment
              concerns, agent conduct, or other rental-related issues.
            </p>

            <p>
              Reports may be reviewed by authorized administrators. Submission
              of a report does not automatically establish that an allegation
              is true.
            </p>
          </TermsSection>

          <TermsSection title="9. Platform Availability">
            <p>
              RentSure aims to provide reliable access to its services but
              cannot guarantee uninterrupted availability.
            </p>

            <p>
              Features may occasionally be unavailable because of maintenance,
              technical issues, security updates, or third-party service
              interruptions.
            </p>
          </TermsSection>

          <TermsSection title="10. Limitation of Responsibility">
            <p>
              RentSure provides information and tools intended to support
              informed rental decisions. Users remain responsible for their
              own rental decisions, payments, agreements, inspections, and
              independent verification.
            </p>

            <p>
              RentSure should not be treated as a party to a rental agreement
              between users, agents, property owners, or other parties.
            </p>
          </TermsSection>

          <TermsSection title="11. Changes to These Terms">
            <p>
              RentSure may update these Terms & Conditions when platform
              features, operational requirements, or applicable requirements
              change.
            </p>

            <p>
              Continued use of the platform after an updated version is
              published indicates that the user has reviewed the updated terms.
            </p>
          </TermsSection>

          {/* Important Notice */}
          <section className="rounded-2xl border border-[#E8DDE1] bg-[#F8EDEF] p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={22}
                className="mt-0.5 shrink-0 text-[#7A1F3D]"
              />

              <div>
                <h2 className="font-bold text-[#24171C]">
                  Important Rental Safety Notice
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#756970]">
                  Never rely solely on a RentSure verification badge before
                  transferring money or signing a rental agreement. Confirm
                  property details, inspect the property where possible, verify
                  the relevant parties, and be cautious of unusual payment
                  requests.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-[#2D0A17] p-6 text-white sm:p-8">
            <h2 className="text-xl font-bold">
              Need Help?
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/75">
              For questions about these Terms & Conditions or the RentSure
              platform, contact the support team.
            </p>

            <p className="mt-4 text-sm font-semibold text-[#C9A227]">
              support@rentsure.com
            </p>
          </section>

          <p className="text-center text-xs text-[#756970]">
            Last updated: September 2026
          </p>
        </div>
      </section>
    </main>
  );
}

function TermsSection({ icon, title, children }) {
  return (
    <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8EDEF] text-[#7A1F3D]">
            {icon}
          </div>
        )}

        <h2 className="text-xl font-bold text-[#24171C]">
          {title}
        </h2>
      </div>

      <div className="mt-5 space-y-4 text-sm leading-7 text-[#756970]">
        {children}
      </div>
    </section>
  );
}

export default Terms;