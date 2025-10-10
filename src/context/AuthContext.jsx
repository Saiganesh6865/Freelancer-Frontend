import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ---------- Read CSRF token from cookie ----------
  const getCsrfToken = () => {
    const match = document.cookie.match(/(^|;)\s*csrf_access_token=([^;]+)/);
    return match ? match[2] : null;
  };

  // ---------- Force logout ----------
  const forceLogout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("csrf_token");

    document.cookie = "csrf_access_token=; Max-Age=0; path=/; Secure; SameSite=None";
    document.cookie = "csrf_refresh_token=; Max-Age=0; path=/; Secure; SameSite=None";

    navigate("/login");
  }, [navigate]);

  // ---------- Initialize session ----------
  const initSession = useCallback(async () => {
    setLoading(true);
    try {
      const sessionData = await api.getSession();
      if (sessionData?.user) {
        setUser(sessionData.user);

        // Save CSRF token
        const csrfToken = sessionData.csrf_token || getCsrfToken();
        if (csrfToken) sessionStorage.setItem("csrf_token", csrfToken);
      } else {
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

  // ---------- Login ----------
  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login({
        email: email.toLowerCase().trim(),
        password: password.trim()
      });

      if (data?.user) {
        setUser(data.user);

        // Save CSRF token
        const csrfToken = data.csrf_token || getCsrfToken();
        if (csrfToken) sessionStorage.setItem("csrf_token", csrfToken);

        // Redirect based on role
        switch (data.user.role) {
          case "admin": navigate("/admin"); break;
          case "manager": navigate("/manager"); break;
          default: navigate("/dashboard");
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

  // ---------- Logout ----------
  const logout = async () => {
    setLoading(true);
    try { await api.logout(); } 
    catch (err) { console.error("Logout error:", err); }
    finally { forceLogout(); setLoading(false); }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, handleLogin, logout, loading, initSession }}
    >
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
