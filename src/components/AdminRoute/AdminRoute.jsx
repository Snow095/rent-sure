
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldCheck, Loader2 } from "lucide-react";

import { supabase } from "../../services/supabase/client";
import { useAuth } from "../../context/AuthContext";

function AdminRoute() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  const [checkingRole, setCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingRole(false);
        return;
      }

      setCheckingRole(true);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error(
            "Error checking admin role:",
            error
          );

          setIsAdmin(false);
          return;
        }

        setIsAdmin(data?.role === "admin");
      } catch (error) {
        console.error(
          "Unexpected error checking admin role:",
          error
        );

        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    };

    if (!authLoading) {
      checkAdminRole();
    }
  }, [user, authLoading]);

  if (authLoading || checkingRole) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F9] px-5">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8EDEF]">
            <Loader2
              size={27}
              className="animate-spin text-[#7A1F3D]"
            />
          </div>

          <div className="mt-5 flex items-center justify-center gap-2">
            <ShieldCheck
              size={18}
              className="text-[#7A1F3D]"
            />

            <p className="text-sm font-semibold text-[#24171C]">
              Checking administrator access...
            </p>
          </div>

          <p className="mt-2 text-xs text-[#756970]">
            Please wait while RentSure verifies your account.
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;

