import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Database,
  UserCheck,
} from "lucide-react";

function Privacy() {
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
              <ShieldCheck size={25} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#24171C] sm:text-4xl">
                Privacy Policy
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756970] sm:text-base">
                This Privacy Policy explains how RentSure collects, uses,
                protects, and handles information when you use the platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Introduction */}
          <section className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm leading-7 text-[#756970]">
              RentSure is a rental property verification and fraud-awareness
              platform designed to help renters make more informed rental
              decisions. We respect your privacy and aim to handle your
              information responsibly.
            </p>

            <p className="mt-4 text-sm leading-7 text-[#756970]">
              By using RentSure, you acknowledge that information may be
              collected and processed as necessary to provide platform
              functionality, authentication, verification workflows, reporting,
              and security.
            </p>
          </section>

          {/* Information */}
          <PolicySection
            icon={<Database size={21} />}
            title="1. Information We Collect"
          >
            <p>
              Depending on how you use RentSure, we may collect information
              such as:
            </p>

            <ul>
              <li>Your name and email address.</li>
              <li>Your account role, such as renter or agent.</li>
              <li>Property listing information submitted by agents.</li>
              <li>Saved properties and viewing requests.</li>
              <li>Reports submitted about properties or rental concerns.</li>
              <li>
                Verification documents submitted by agents for property review.
              </li>
              <li>
                Information required to maintain platform security and
                functionality.
              </li>
            </ul>
          </PolicySection>

          {/* Usage */}
          <PolicySection
            icon={<UserCheck size={21} />}
            title="2. How We Use Information"
          >
            <p>Information may be used to:</p>

            <ul>
              <li>Create and manage user accounts.</li>
              <li>Provide renter and agent dashboard functionality.</li>
              <li>Display property and agent information.</li>
              <li>Process saved properties and viewing requests.</li>
              <li>Support property verification workflows.</li>
              <li>Review and manage submitted reports.</li>
              <li>Improve platform security and reliability.</li>
            </ul>
          </PolicySection>

          {/* Verification */}
          <PolicySection
            icon={<ShieldCheck size={21} />}
            title="3. Verification Information"
          >
            <p>
              Agents may submit documents to support property verification.
              Verification documents are intended for authorized review and
              should not be treated as publicly accessible property
              information.
            </p>

            <p>
              Access to verification information is restricted through
              application permissions and database security policies.
            </p>
          </PolicySection>

          {/* Security */}
          <PolicySection
            icon={<Lock size={21} />}
            title="4. Data Security"
          >
            <p>
              RentSure uses authentication controls, database access policies,
              role-based permissions, and protected storage mechanisms to help
              safeguard information.
            </p>

            <p>
              However, no online platform can guarantee absolute security.
              Users should also protect their passwords and avoid sharing
              account credentials with others.
            </p>
          </PolicySection>

          {/* Sharing */}
          <PolicySection title="5. Information Sharing">
            <p>
              RentSure does not intend to make private account information or
              verification documents publicly available.
            </p>

            <p>
              Information may be accessible to authorized users where
              necessary for platform functionality, such as displaying public
              agent profiles or property listings, or to administrators
              responsible for platform review and moderation.
            </p>
          </PolicySection>

          {/* User Responsibility */}
          <PolicySection title="6. Your Responsibility">
            <p>
              You are responsible for providing accurate information when
              creating an account or submitting information to RentSure.
            </p>

            <p>
              You should also independently verify important rental
              information before making payments, signing agreements, or
              transferring funds.
            </p>
          </PolicySection>

          {/* Changes */}
          <PolicySection title="7. Changes to This Policy">
            <p>
              RentSure may update this Privacy Policy when platform features,
              security practices, or requirements change. Updated versions
              should be reviewed before continued use of the platform.
            </p>
          </PolicySection>

          {/* Contact */}
          <section className="rounded-2xl bg-[#2D0A17] p-6 text-white sm:p-8">
            <h2 className="text-xl font-bold">
              Questions About Privacy?
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/75">
              If you have questions about this Privacy Policy or how
              information is handled on RentSure, contact the platform
              support team.
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

function PolicySection({ icon, title, children }) {
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

export default Privacy;