
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    user,
    loading: authLoading,
    signOut,
    getDashboardPath,
  } = useAuth();

  const navigate = useNavigate();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    const { error } = await signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    closeMenu();
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `relative px-2 py-2 text-sm font-medium transition ${
      isActive
        ? "text-[#7A1F3D]"
        : "text-[#24171C] hover:text-[#7A1F3D]"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8DDE1] bg-white/95 backdrop-blur">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Main Navbar */}
        <div className="flex min-h-20 items-center justify-between py-3">

          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7A1F3D] shadow-sm">
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 3L19 6V11.5C19 16.2 16.1 19.9 12 21C7.9 19.9 5 16.2 5 11.5V6L12 3Z"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />

                <path
                  d="M8.5 11.5L11 14L15.5 9.5"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#7A1F3D]">
                RentSure
              </h1>

              <p className="mt-0.5 hidden text-xs text-[#756970] sm:block">
                Rent smarter. Rent safer.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex lg:gap-8">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>

            <NavLink to="/properties" className={navLinkClass}>
              Properties
            </NavLink>

            <NavLink to="/agents" className={navLinkClass}>
              Agents
            </NavLink>

            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 md:flex">

            {authLoading ? (
              /* Authentication is still being checked */
              <div className="h-10 w-36 animate-pulse rounded-lg bg-[#F8EDEF]" />
            ) : !user ? (
              /* Logged Out */
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-lg bg-[#7A1F3D] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025]"
                >
                  Get Started
                </Link>
              </>
            ) : (
              /* Logged In */
              <>
                <Link
                  to={getDashboardPath()}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-[#E8DDE1] px-4 py-2.5 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#7A1F3D] transition hover:bg-[#F8EDEF] md:hidden"
            aria-label={
              isMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M4 7H20M4 12H20M4 17H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-[#E8DDE1] py-5 md:hidden">
            <div className="flex flex-col gap-1">

              {/* Mobile Navigation */}
              <NavLink
                to="/"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 ${
                    isActive
                      ? "bg-[#F8EDEF] text-[#7A1F3D]"
                      : "text-[#24171C] hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                  } text-sm font-medium transition`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/properties"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 ${
                    isActive
                      ? "bg-[#F8EDEF] text-[#7A1F3D]"
                      : "text-[#24171C] hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                  } text-sm font-medium transition`
                }
              >
                Properties
              </NavLink>

              <NavLink
                to="/agents"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 ${
                    isActive
                      ? "bg-[#F8EDEF] text-[#7A1F3D]"
                      : "text-[#24171C] hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                  } text-sm font-medium transition`
                }
              >
                Agents
              </NavLink>

              <NavLink
                to="/about"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 ${
                    isActive
                      ? "bg-[#F8EDEF] text-[#7A1F3D]"
                      : "text-[#24171C] hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                  } text-sm font-medium transition`
                }
              >
                About
              </NavLink>

              {/* Mobile Actions */}
              <div className="mt-4 flex flex-col gap-3 border-t border-[#E8DDE1] pt-5">

                {authLoading ? (
                  <div className="h-11 animate-pulse rounded-lg bg-[#F8EDEF]" />
                ) : !user ? (
                  /* Logged Out */
                  <>
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="rounded-lg px-4 py-3 text-center text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className="rounded-lg bg-[#7A1F3D] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  /* Logged In */
                  <>
                    <Link
                      to={getDashboardPath()}
                      onClick={closeMenu}
                      className="rounded-lg bg-[#F8EDEF] px-4 py-3 text-center text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F3E4E8]"
                    >
                      Dashboard
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-lg border border-[#E8DDE1] px-4 py-3 text-center text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                    >
                      Logout
                    </button>
                  </>
                )}

              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;

