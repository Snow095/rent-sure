import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";

function Navbar() {
  const navigate = useNavigate();

  const {
    user,
    role,
    loading: authLoading,
    signOut,
    getDashboardPath,
  } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsAccountOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const { error } = await signOut();

      if (error) {
        console.error("Logout error:", error);
        return;
      }

      closeMenu();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Unexpected logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getRoleLabel = () => {
    if (role === "admin") {
      return "Administrator";
    }

    if (role === "agent") {
      return "Agent";
    }

    return "Renter";
  };

  const navLinkClass = ({ isActive }) =>
    `relative px-2 py-2 text-sm font-medium transition ${
      isActive
        ? "text-[#7A1F3D]"
        : "text-[#24171C] hover:text-[#7A1F3D]"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `rounded-lg px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-[#F8EDEF] text-[#7A1F3D]"
        : "text-[#24171C] hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
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
              <ShieldCheck
                size={25}
                className="text-white"
              />
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
            {/* Home - hidden for authenticated users */}
            {!user && !authLoading && (
              <NavLink
                to="/"
                end
                className={navLinkClass}
              >
                Home
              </NavLink>
            )}

            <NavLink
              to="/properties"
              className={navLinkClass}
            >
              Properties
            </NavLink>

            <NavLink
              to="/agents"
              className={navLinkClass}
            >
              Agents
            </NavLink>

            <NavLink
              to="/about"
              className={navLinkClass}
            >
              About
            </NavLink>
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Authentication Loading */}
            {authLoading ? (
              <div className="flex items-center gap-3">
                <div className="h-9 w-20 animate-pulse rounded-lg bg-[#F8EDEF]" />
                <div className="h-9 w-28 animate-pulse rounded-lg bg-[#F8EDEF]" />
              </div>
            ) : user ? (
              <>
                {/* Dashboard */}
                <Link
                  to={getDashboardPath()}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                >
                  Dashboard
                </Link>

                {/* Account Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setIsAccountOpen(
                        (previous) => !previous
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-[#E8DDE1] bg-white px-3 py-2.5 text-sm font-semibold text-[#24171C] transition hover:bg-[#FAF8F9]"
                    aria-expanded={isAccountOpen}
                    aria-haspopup="menu"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F8EDEF]">
                      <UserRound
                        size={15}
                        className="text-[#7A1F3D]"
                      />
                    </span>

                    <span className="max-w-28 truncate">
                      {getRoleLabel()}
                    </span>

                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        isAccountOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {isAccountOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-60 rounded-xl border border-[#E8DDE1] bg-white p-2 shadow-lg"
                    >
                      {/* Account Information */}
                      <div className="border-b border-[#E8DDE1] px-3 py-3">
                        <p className="text-xs text-[#756970]">
                          Signed in as
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold text-[#24171C]">
                          {user.email}
                        </p>

                        <p className="mt-1 text-xs font-medium text-[#7A1F3D]">
                          {getRoleLabel()}
                        </p>
                      </div>

                      {/* Account */}
                      <Link
                        to="/account"
                        onClick={() =>
                          setIsAccountOpen(false)
                        }
                        role="menuitem"
                        className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#24171C] transition hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                      >
                        <UserRound size={16} />
                        Account
                      </Link>

                      {/* Dashboard */}
                      <Link
                        to={getDashboardPath()}
                        onClick={() =>
                          setIsAccountOpen(false)
                        }
                        role="menuitem"
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#24171C] transition hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                      >
                        <ShieldCheck size={16} />
                        Dashboard
                      </Link>

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        role="menuitem"
                        className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#B91C1C] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <LogOut size={16} />

                        {isLoggingOut
                          ? "Logging out..."
                          : "Logout"}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Login */}
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
                >
                  Login
                </Link>

                {/* Get Started */}
                <Link
                  to="/register"
                  className="rounded-lg bg-[#7A1F3D] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A1025]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() =>
              setIsMenuOpen(
                (previous) => !previous
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#7A1F3D] transition hover:bg-[#F8EDEF] md:hidden"
            aria-label={
              isMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-[#E8DDE1] py-5 md:hidden">
            <div className="flex flex-col gap-1">
              {/* Public Navigation */}

              {/* Home - hidden for authenticated users */}
              {!user && !authLoading && (
                <NavLink
                  to="/"
                  end
                  onClick={closeMenu}
                  className={mobileNavLinkClass}
                >
                  Home
                </NavLink>
              )}

              <NavLink
                to="/properties"
                onClick={closeMenu}
                className={mobileNavLinkClass}
              >
                Properties
              </NavLink>

              <NavLink
                to="/agents"
                onClick={closeMenu}
                className={mobileNavLinkClass}
              >
                Agents
              </NavLink>

              <NavLink
                to="/about"
                onClick={closeMenu}
                className={mobileNavLinkClass}
              >
                About
              </NavLink>

              {/* Authentication Section */}
              <div className="mt-4 border-t border-[#E8DDE1] pt-5">
                {authLoading ? (
                  <div className="space-y-3 px-4">
                    <div className="h-11 animate-pulse rounded-lg bg-[#F8EDEF]" />
                    <div className="h-11 animate-pulse rounded-lg bg-[#F8EDEF]" />
                  </div>
                ) : user ? (
                  <div className="space-y-2 px-4">
                    {/* Account Header */}
                    <div className="mb-3 rounded-xl bg-[#FAF8F9] px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8EDEF]">
                          <UserRound
                            size={18}
                            className="text-[#7A1F3D]"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-[#756970]">
                            Signed in as
                          </p>

                          <p className="truncate text-sm font-semibold text-[#24171C]">
                            {user.email}
                          </p>

                          <p className="mt-0.5 text-xs font-medium text-[#7A1F3D]">
                            {getRoleLabel()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Account */}
                    <Link
                      to="/account"
                      onClick={closeMenu}
                      className="flex items-center justify-center gap-2 rounded-lg border border-[#E8DDE1] bg-white px-4 py-3 text-sm font-semibold text-[#24171C] transition hover:bg-[#F8EDEF] hover:text-[#7A1F3D]"
                    >
                      <UserRound size={17} />
                      Account
                    </Link>

                    {/* Dashboard */}
                    <Link
                      to={getDashboardPath()}
                      onClick={closeMenu}
                      className="flex items-center justify-center gap-2 rounded-lg bg-[#7A1F3D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
                    >
                      <ShieldCheck size={17} />
                      Dashboard
                    </Link>

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-[#B91C1C] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <LogOut size={17} />

                      {isLoggingOut
                        ? "Logging out..."
                        : "Logout"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 px-4">
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="rounded-lg border border-[#E8DDE1] px-4 py-3 text-center text-sm font-semibold text-[#7A1F3D] transition hover:bg-[#F8EDEF]"
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
                  </div>
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