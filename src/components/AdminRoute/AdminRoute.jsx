
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminRoute() {
  const {
    user,
    role,
    loading: authLoading,
  } = useAuth();

  const location = useLocation();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F9] px-5">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F8EDEF]">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#E8DDE1] border-t-[#7A1F3D]" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-[#24171C]">
            Checking administrator access...
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#756970]">
            Please wait while we verify your account permissions.
          </p>
        </div>
      </div>
    );
  }

  /*
   * User is not authenticated.
   *
   * Send them to Login and preserve the page they originally
   * attempted to access.
   */
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  /*
   * User is authenticated but does not have the admin role.
   *
   * They are redirected to the public home page instead of
   * allowing access to admin pages.
   */
  if (role !== "admin") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /*
   * Authenticated administrator.
   *
   * Render the nested admin route.
   */
  return <Outlet />;
}

export default AdminRoute;

