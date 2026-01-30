import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

const BASE_URL = "https://loan-server-seven.vercel.app";

const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true); // ✅ keep true until init done
  const [user, setUser] = useState(null);

  const logout = () => {
    localStorage.removeItem("loan-user");
    setUser(null);
  };

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const loadUser = async () => {
      setLoading(true);

      const phone = localStorage.getItem("loan-user");

      // ✅ no session => init done
      if (!phone) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/user-list/${phone}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        const data = await res.json();
        const userObj = data?.user || data?.data || data;

        if (!userObj || typeof userObj !== "object") {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        // ✅ set user first, then stop loading
        if (mounted) {
          setUser(userObj);
          setLoading(false);
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const authInfo = { user, loading, setUser, logout };

  return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
