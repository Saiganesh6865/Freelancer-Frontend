import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper: extract CSRF token from cookies
  const getCsrfToken = () => {
    const match = document.cookie.match(/(^|;)\s*csrf_access_token=([^;]+)/);
    return match ? match[2] : null;
  };

  // ---------------- Force Logout ----------------
  const forceLogout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("csrf_token");
    document.cookie =
      "csrf_access_token=; Max-Age=0; path=/; Secure; SameSite=None";
    document.cookie =
      "csrf_refresh_token=; Max-Age=0; path=/; Secure; SameSite=None";

    // ✅ Redirect only if not already on Home, Login, or Signup
    const currentPath = window.location.pathname;
    if (!["/", "/login", "/signup"].includes(currentPath)) {
      navigate("/login");
    }
  }, [navigate]);

  // ---------------- Initialize Session ----------------
  const initSession = useCallback(async () => {
    setLoading(true);
    try {
      const sessionData = await api.getSession();

      if (sessionData?.user) {
        setUser(sessionData.user);
        const csrfToken = sessionData.csrf_token || getCsrfToken();
        if (csrfToken) sessionStorage.setItem("csrf_token", csrfToken);
      } else {
        // No active session — clear stored tokens, but don't redirect
        forceLogout();
      }
    } catch (err) {
      console.error("❌ Session fetch failed:", err);
      forceLogout();
    } finally {
      setLoading(false);
    }
  }, [forceLogout]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // ---------------- Handle Login ----------------
  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login({ email: email.toLowerCase(), password });

      if (data?.user) {
        setUser(data.user);
        const csrfToken = data.csrf_token || getCsrfToken();
        if (csrfToken) sessionStorage.setItem("csrf_token", csrfToken);

        switch (data.user.role) {
          case "admin":
            navigate("/admin");
            break;
          case "manager":
            navigate("/manager");
            break;
          default:
            navigate("/dashboard");
        }

        return { success: true, user: data.user };
      }

      return { success: false, error: data?.error || "Invalid credentials" };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Unable to connect to server" };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Handle Logout ----------------
  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      forceLogout();
      setLoading(false);
    }
  };

  // ---------------- Context Provider ----------------
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        handleLogin,
        logout,
        loading,
        initSession,
      }}
    >
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
