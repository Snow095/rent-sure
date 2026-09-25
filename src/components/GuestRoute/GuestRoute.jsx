import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

function GuestRoute() {
  const {
    user,
    role,
    loading: authLoading,
    getDashboardPath,
  } = useAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F9] px-5">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F8EDEF]">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#E8DDE1] border-t-[#7A1F3D]" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-[#24171C]">
            Checking your account...
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#756970]">
            Please wait while we check your authentication
            status.
          </p>
        </div>
      </div>
    );
  }

  /*
   * No authenticated user.
   * Allow access to the login/register pages.
   */
  if (!user) {
    return <Outlet />;
  }

  /*
   * The authenticated user exists, but the profile role
   * has not been loaded yet.
   *
   * This is important because AuthProvider sets `user`
   * before it finishes loading `profiles.role`.
   */
  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F9] px-5">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F8EDEF]">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#E8DDE1] border-t-[#7A1F3D]" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-[#24171C]">
            Loading your account...
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#756970]">
            Please wait while we determine your account
            permissions.
          </p>
        </div>
      </div>
    );
  }

  const dashboardPath = getDashboardPath();

  /*
   * Only redirect when a valid role-based destination
   * has been resolved.
   */
  if (dashboardPath) {
    return (
      <Navigate
        to={dashboardPath}
        replace
      />
    );
  }

  /*
   * Protect against an unexpected/invalid role without
   * silently treating the account as a renter.
   */
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8F9] px-5">
      <div className="w-full max-w-md rounded-2xl border border-[#E8DDE1] bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-[#24171C]">
          Account role unavailable
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#756970]">
          We could not determine the permissions for your
          account. Please refresh the page and try again.
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex rounded-xl bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A1025]"
        >
          Refresh page
        </button>
      </div>
    </div>
  );
}

export default GuestRoute;