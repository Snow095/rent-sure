
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  User,
  Building2,
  Mail,
  Lock,
  UserRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";


function PasswordRequirement({ met, text }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-4 w-4 items-center justify-center rounded-full ${met ? "bg-[#15803D]" : "border border-[#E8DDE1] bg-white"
          }`}
      >
        {met && (
          <CheckCircle2
            size={12}
            className="text-white"
          />
        )}
      </div>

      <span
        className={`text-xs ${met ? "text-[#15803D]" : "text-[#756970]"
          }`}
      >
        {text}
      </span>
    </div>
  );
}


function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "renter",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getPasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (!password) {
      return {
        score: 0,
        label: "",
        width: "0%",
      };
    }

    if (score <= 2) {
      return {
        score,
        label: "Weak",
        width: "40%",
      };
    }

    if (score <= 4) {
      return {
        score,
        label: "Medium",
        width: "75%",
      };
    }

    return {
      score,
      label: "Strong",
      width: "100%",
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);


  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleRoleChange = (role) => {
    setFormData((previous) => ({
      ...previous,
      role,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    // Full name validation
    if (!formData.fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    // Email validation
    if (!formData.email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    // Password validation
    if (!formData.password) {
      setErrorMessage("Please create a password.");
      return;
    }


    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setErrorMessage(
        "Password must contain at least one uppercase letter."
      );
      return;
    }

    if (!/[a-z]/.test(formData.password)) {
      setErrorMessage(
        "Password must contain at least one lowercase letter."
      );
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      setErrorMessage(
        "Password must contain at least one number."
      );
      return;
    }

    if (!/[^A-Za-z0-9]/.test(formData.password)) {
      setErrorMessage(
        "Password must contain at least one special character."
      );
      return;
    }



    // Confirm password validation
    if (!formData.confirmPassword) {
      setErrorMessage("Please confirm your password.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    // Terms validation
    if (!agreeToTerms) {
      setErrorMessage(
        "Please agree to the terms before creating your account."
      );
      return;
    }

    setLoading(true);

    const { data, error } = await signUp({
      email: formData.email.trim(),
      password: formData.password,
      fullName: formData.fullName.trim(),
      role: formData.role,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data?.user && !data?.session) {
      setSuccessMessage(
        "Account created successfully. Please check your email to confirm your account."
      );

      return;
    }

    if (data?.session) {
      navigate("/");
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F9] px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-[#E8DDE1] bg-white shadow-sm lg:grid-cols-2">
        {/* Left Information Panel */}
        <section className="hidden bg-[#4A1025] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck size={26} />
              </div>

              <div>
                <p className="text-lg font-bold">RentSure</p>
                <p className="text-xs text-white/70">
                  Rent smarter. Rent safer.
                </p>
              </div>
            </div>

            <div className="mt-16">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#C9A227]">
                Join RentSure
              </p>

              <h1 className="mt-5 text-4xl font-bold leading-tight xl:text-5xl">
                Make safer rental decisions.
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-white/75">
                Create your RentSure account and get access to rental
                properties, verification information, and fraud-awareness
                tools.
              </p>
            </div>
          </div>

          <div className="mt-12 space-y-5">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <p className="font-semibold">Verified rental information</p>
                <p className="mt-1 text-sm leading-6 text-white/65">
                  Review available verification and risk information before
                  making rental decisions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                <ShieldCheck size={18} />
              </div>

              <div>
                <p className="font-semibold">Fraud awareness</p>
                <p className="mt-1 text-sm leading-6 text-white/65">
                  Stay informed about common rental fraud warning signs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Registration Form */}
        <section className="p-6 sm:p-9 lg:p-10 xl:p-14">
          <div className="mx-auto w-full max-w-xl">
            <div>
              <p className="text-sm font-semibold text-[#7A1F3D]">
                Create your account
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#24171C]">
                Get started with RentSure
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#756970]">
                Choose your account type and enter your details below.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-7 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-[#B91C1C]"
                />

                <p className="text-sm leading-6 text-[#B91C1C]">
                  {errorMessage}
                </p>
              </div>
            )}

            
            {/* Success Message */}
            {successMessage && (
              <div className="mt-7 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-[#15803D]"
                />

                <div>
                  <p className="text-sm font-semibold text-[#15803D]">
                    Account created successfully!
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#15803D]">
                    {successMessage}
                  </p>
                </div>
              </div>
            )}




            <form onSubmit={handleSubmit} className="mt-8">
              {/* Account Type */}
              <div>
                <label className="text-sm font-semibold text-[#24171C]">
                  I want to register as
                </label>

                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {/* Renter */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange("renter")}
                    className={`rounded-xl border p-5 text-left transition ${formData.role === "renter"
                      ? "border-[#7A1F3D] bg-[#F8EDEF]"
                      : "border-[#E8DDE1] bg-white hover:border-[#7A1F3D]"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7A1F3D] text-white">
                        <User size={19} />
                      </div>

                      <div
                        className={`h-4 w-4 rounded-full border-2 ${formData.role === "renter"
                          ? "border-[#7A1F3D] bg-[#7A1F3D]"
                          : "border-[#E8DDE1]"
                          }`}
                      />
                    </div>

                    <p className="mt-4 font-semibold text-[#24171C]">
                      Renter
                    </p>

                    <p className="mt-1 text-sm leading-5 text-[#756970]">
                      Find and evaluate rental properties.
                    </p>
                  </button>

                  {/* Agent */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange("agent")}
                    className={`rounded-xl border p-5 text-left transition ${formData.role === "agent"
                      ? "border-[#7A1F3D] bg-[#F8EDEF]"
                      : "border-[#E8DDE1] bg-white hover:border-[#7A1F3D]"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4A1025] text-white">
                        <Building2 size={19} />
                      </div>

                      <div
                        className={`h-4 w-4 rounded-full border-2 ${formData.role === "agent"
                          ? "border-[#7A1F3D] bg-[#7A1F3D]"
                          : "border-[#E8DDE1]"
                          }`}
                      />
                    </div>

                    <p className="mt-4 font-semibold text-[#24171C]">
                      Agent
                    </p>

                    <p className="mt-1 text-sm leading-5 text-[#756970]">
                      List properties and manage rentals.
                    </p>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="mt-7">
                <label
                  htmlFor="fullName"
                  className="text-sm font-semibold text-[#24171C]"
                >
                  Full name
                </label>

                <div className="relative mt-2">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#756970]"
                  />

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="h-12 w-full rounded-lg border border-[#E8DDE1] bg-white pl-11 pr-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#9B9095] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mt-6">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-[#24171C]"
                >
                  Email address
                </label>

                <div className="relative mt-2">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#756970]"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="h-12 w-full rounded-lg border border-[#E8DDE1] bg-white pl-11 pr-4 text-sm text-[#24171C] outline-none transition placeholder:text-[#9B9095] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mt-6">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-[#24171C]"
                >
                  Create password
                </label>

                <div className="relative mt-2">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#756970]"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    className="h-12 w-full rounded-lg border border-[#E8DDE1] bg-white pl-11 pr-12 text-sm text-[#24171C] outline-none transition placeholder:text-[#9B9095] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-[#756970] transition hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <div className="mt-4">
                    {/* Strength Header */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-[#756970]">
                        Password strength
                      </p>

                      <p
                        className={`text-xs font-bold ${passwordStrength.label === "Weak"
                          ? "text-[#B91C1C]"
                          : passwordStrength.label === "Medium"
                            ? "text-[#B45309]"
                            : "text-[#15803D]"
                          }`}
                      >
                        {passwordStrength.label}
                      </p>
                    </div>

                    {/* Strength Bar */}
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E8DDE1]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.label === "Weak"
                          ? "bg-[#B91C1C]"
                          : passwordStrength.label === "Medium"
                            ? "bg-[#B45309]"
                            : "bg-[#15803D]"
                          }`}
                        style={{ width: passwordStrength.width }}
                      />
                    </div>

                    {/* Requirements */}
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <PasswordRequirement
                        met={formData.password.length >= 8}
                        text="At least 8 characters"
                      />

                      <PasswordRequirement
                        met={/[A-Z]/.test(formData.password)}
                        text="One uppercase letter"
                      />

                      <PasswordRequirement
                        met={/[a-z]/.test(formData.password)}
                        text="One lowercase letter"
                      />

                      <PasswordRequirement
                        met={/[0-9]/.test(formData.password)}
                        text="One number"
                      />

                      <PasswordRequirement
                        met={/[^A-Za-z0-9]/.test(formData.password)}
                        text="One special character"
                      />
                    </div>
                  </div>
                )}


              </div>

              {/* Confirm Password */}
              <div className="mt-6">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-[#24171C]"
                >
                  Confirm password
                </label>

                <div className="relative mt-2">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#756970]"
                  />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className={`h-12 w-full rounded-lg border bg-white pl-11 pr-12 text-sm text-[#24171C] outline-none transition placeholder:text-[#9B9095] focus:ring-2 ${formData.confirmPassword &&
                      formData.password !== formData.confirmPassword
                      ? "border-red-300 focus:border-[#B91C1C] focus:ring-red-100"
                      : "border-[#E8DDE1] focus:border-[#7A1F3D] focus:ring-[#F8EDEF]"
                      }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-[#756970] transition hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <CheckCircle2
                          size={15}
                          className="text-[#15803D]"
                        />
                        <p className="text-xs font-medium text-[#15803D]">
                          Passwords match.
                        </p>
                      </>
                    ) : (
                      <>
                        <AlertCircle
                          size={15}
                          className="text-[#B91C1C]"
                        />
                        <p className="text-xs font-medium text-[#B91C1C]">
                          Passwords do not match.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="mt-7 flex items-start gap-3">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(event) =>
                    setAgreeToTerms(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 rounded border-[#E8DDE1] accent-[#7A1F3D]"
                />

                <label
                  htmlFor="terms"
                  className="text-sm leading-6 text-[#756970]"
                >
                  I agree to RentSure's{" "}
                  <span className="font-medium text-[#7A1F3D]">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="font-medium text-[#7A1F3D]">
                    Privacy Policy
                  </span>
                  .
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025] focus:outline-none focus:ring-2 focus:ring-[#7A1F3D] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create Account"}

                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-7 text-center text-sm text-[#756970]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#7A1F3D] hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;

