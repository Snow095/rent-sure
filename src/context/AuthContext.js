import {
  createContext,
  createElement,
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "../services/supabase/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = useCallback(
    async (currentUser) => {
      if (!currentUser?.id) {
        return {
          role: null,
          error: null,
        };
      }

      try {
        const {
          data,
          error,
        } = await supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (error) {
          console.error(
            "Error loading user profile:",
            {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint,
            }
          );

          return {
            role: null,
            error,
          };
        }

        if (!data) {
          const profileError = new Error(
            "No profile was found for the authenticated user."
          );

          console.error(
            "No profile found for authenticated user."
          );

          return {
            role: null,
            error: profileError,
          };
        }

        const resolvedRole = data.role
          ?.trim()
          .toLowerCase();

        if (!resolvedRole) {
          const roleError = new Error(
            "Your profile does not have an assigned role."
          );

          console.error(
            "Authenticated user's profile has no role."
          );

          return {
            role: null,
            error: roleError,
          };
        }

        return {
          role: resolvedRole,
          error: null,
        };
      } catch (profileError) {
        console.error(
          "Unexpected profile loading error:",
          profileError
        );

        return {
          role: null,
          error: profileError,
        };
      }
    },
    []
  );

  const syncSession = useCallback(
    async (session) => {
      const currentUser = session?.user ?? null;

      if (!currentUser) {
        setUser(null);
        setRole(null);
        return;
      }

      const {
        role: resolvedRole,
        error: profileError,
      } = await loadUserProfile(currentUser);

      if (profileError || !resolvedRole) {
        setUser(null);
        setRole(null);
        return;
      }

      setRole(resolvedRole);
      setUser(currentUser);
    },
    [loadUserProfile]
  );

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            "Error getting session:",
            {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint,
            }
          );

          if (mounted) {
            setUser(null);
            setRole(null);
            setLoading(false);
          }

          return;
        }

        if (!mounted) {
          return;
        }

        await syncSession(session);

        if (mounted) {
          setLoading(false);
        }
      } catch (authError) {
        console.error(
          "Unexpected authentication initialization error:",
          authError
        );

        if (mounted) {
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) {
          return;
        }

        setLoading(true);

        setTimeout(async () => {
          if (!mounted) {
            return;
          }

          await syncSession(session);

          if (mounted) {
            setLoading(false);
          }
        }, 0);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncSession]);

  const signUp = async ({
    email,
    password,
    fullName,
    role: selectedRole,
  }) => {
    const redirectUrl =
      `${window.location.origin}/confirm-email`;

    const {
      data,
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: selectedRole,
        },
      },
    });

    return {
      data,
      error,
    };
  };

  const signIn = async ({
    email,
    password,
  }) => {
    const {
      data,
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      data,
      error,
    };
  };

  const signOut = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (!error) {
      setUser(null);
      setRole(null);
    }

    return {
      error,
    };
  };

  const getDashboardPath = () => {
    if (role === "admin") {
      return "/admin/dashboard";
    }

    if (role === "agent") {
      return "/agent/dashboard";
    }

    if (role === "renter") {
      return "/renter/dashboard";
    }

    return null;
  };

  const refreshProfile = async () => {
    if (!user) {
      setRole(null);
      return null;
    }

    const {
      role: resolvedRole,
      error,
    } = await loadUserProfile(user);

    if (error || !resolvedRole) {
      setRole(null);
      return null;
    }

    setRole(resolvedRole);

    return resolvedRole;
  };

  const contextValue = {
    user,
    role,
    loading,
    signUp,
    signIn,
    signOut,
    getDashboardPath,
    refreshProfile,
  };

  return createElement(
    AuthContext.Provider,
    {
      value: contextValue,
    },
    children
  );
}