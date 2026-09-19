
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * Load the authenticated user's profile role.
   */
  const loadUserProfile = async (currentUser) => {
    if (!currentUser) {
      setRole(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();

      if (error) {
        console.error("Error loading user profile:", error);
        setRole(null);
        return;
      }

      setRole(data?.role ?? "renter");
    } catch (error) {
      console.error("Unexpected profile loading error:", error);
      setRole(null);
    }
  };

  /*
   * Initialize the current authentication session.
   */
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);

          if (mounted) {
            setUser(null);
            setRole(null);
          }

          return;
        }

        if (!mounted) {
          return;
        }

        const currentUser = session?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          await loadUserProfile(currentUser);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("Unexpected authentication error:", error);

        if (mounted) {
          setUser(null);
          setRole(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    /*
     * Listen for login/logout/session changes.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) {
        return;
      }

      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        await loadUserProfile(currentUser);
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * Register a new user.
   */
  const signUp = async ({
    email,
    password,
    fullName,
    role: requestedRole,
  }) => {
    const redirectUrl = `${window.location.origin}/confirm-email`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: requestedRole,
        },
      },
    });

    return { data, error };
  };

  /*
   * Login.
   */
  const signIn = async ({ email, password }) => {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    return { data, error };
  };

  /*
   * Logout.
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      setUser(null);
      setRole(null);
    }

    return { error };
  };

  /*
   * Get the correct dashboard based on the user's role.
   */
  const getDashboardPath = () => {
    if (role === "admin") {
      return "/admin/dashboard";
    }

    if (role === "agent") {
      return "/agent/dashboard";
    }

    return "/renter/dashboard";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        signUp,
        signIn,
        signOut,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}

