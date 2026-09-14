
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");

    if (!formData.email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setLoading(true);

    const { data,error } = await signIn({
      email: formData.email.trim(),
      password: formData.password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const role = data?.user?.user_metadata?.role; 
    if (role === "agent") { 
      navigate("/agent/dashboard"); 

    } else if (role === "admin") {
      navigate("/admin/dashboard"); 

    } else { navigate("/renter/dashboard"); }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F9] px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">

        {/* LEFT SIDE */}
        <div className="hidden lg:block">
          <div className="max-w-lg">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7A1F3D] text-white shadow-sm">
              <ShieldCheck size={28} />
            </div>

            <h1 className="mt-7 text-4xl font-bold leading-tight text-[#2D0A17] xl:text-5xl">
              Rent smarter.
              <span className="block text-[#7A1F3D]">
                Rent safer.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-[#756970]">
              Sign in to your RentSure account to manage your rental
              activities, save properties, request viewings, and stay
              informed about property verification.
            </p>

            <div className="mt-10 space-y-5">

              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F8EDEF] text-sm font-bold text-[#7A1F3D]">
                  1
                </div>

                <div>
                  <h2 className="text-sm font-bold text-[#24171C]">
                    Discover properties
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-[#756970]">
                    Explore rental listings that provide verification
                    and risk information.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F8EDEF] text-sm font-bold text-[#7A1F3D]">
                  2
                </div>

                <div>
                  <h2 className="text-sm font-bold text-[#24171C]">
                    Review verification
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-[#756970]">
                    Check available verification information before
                    making rental decisions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F8EDEF] text-sm font-bold text-[#7A1F3D]">
                  3
                </div>

                <div>
                  <h2 className="text-sm font-bold text-[#24171C]">
                    Rent with awareness
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-[#756970]">
                    Use RentSure's tools to make more informed rental
                    decisions.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* LOGIN CARD */}
        <div className="mx-auto w-full max-w-md">

          {/* MOBILE HEADER */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7A1F3D] text-white shadow-sm">
              <ShieldCheck size={28} />
            </div>

            <h1 className="mt-5 text-3xl font-bold text-[#2D0A17]">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-[#756970]">
              Sign in to continue to RentSure.
            </p>
          </div>

          {/* CARD */}
          <div className="rounded-2xl border border-[#E8DDE1] bg-white p-6 shadow-sm sm:p-8">

            <div className="hidden lg:block">
              <h2 className="text-2xl font-bold text-[#24171C]">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#756970]">
                Sign in to your RentSure account.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-2.5 block text-sm font-semibold text-[#24171C]"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7A1F3D]"
                  />

                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 pl-11 text-sm text-[#24171C] outline-none transition placeholder:text-[#A39A9F] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <div className="mb-2.5 flex items-center justify-between gap-4">
                  <label
                    htmlFor="login-password"
                    className="text-sm font-semibold text-[#24171C]"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setErrorMessage(
                        "Password recovery will be added in the next authentication step."
                      )
                    }
                    className="text-xs font-semibold text-[#7A1F3D] transition hover:text-[#4A1025]"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7A1F3D]"
                  />

                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-12 w-full rounded-lg border border-[#E8DDE1] bg-white px-4 pl-11 text-sm text-[#24171C] outline-none transition placeholder:text-[#A39A9F] focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#F8EDEF]"
                  />
                </div>
              </div>

              {/* REMEMBER ME */}
              <div className="flex items-center gap-3">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                  className="h-4 w-4 rounded border-[#E8DDE1] accent-[#7A1F3D]"
                />

                <label
                  htmlFor="remember"
                  className="text-sm text-[#756970]"
                >
                  Remember me
                </label>
              </div>

              {/* ERROR */}
              {errorMessage && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-[#B91C1C]"
                  />

                  <p className="text-sm leading-5 text-[#B91C1C]">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025] focus:outline-none focus:ring-2 focus:ring-[#7A1F3D] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Sign In"}

                {!loading && <ArrowRight size={17} />}
              </button>

            </form>

            {/* REGISTER */}
            <div className="mt-7 border-t border-[#E8DDE1] pt-6 text-center">
              <p className="text-sm text-[#756970]">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-[#7A1F3D] hover:text-[#4A1025]"
                >
                  Create one
                </Link>
              </p>
            </div>

          </div>

          <p className="mt-6 text-center text-xs leading-5 text-[#756970]">
            By signing in, you agree to use RentSure responsibly.
            Verification information is provided for rental decision
            support and is not a legal guarantee.
          </p>

        </div>
      </div>
    </main>
  );
}

export default Login;

