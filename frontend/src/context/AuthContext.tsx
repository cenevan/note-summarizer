import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext({
  isLoggedIn: false,
  setIsLoggedIn: (_: boolean) => {},
  isAuthInitialized: false,
});

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoggedIn(false);
        setIsAuthInitialized(true);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsLoggedIn(false);
        localStorage.removeItem("token");
      } finally {
        setIsAuthInitialized(true);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, isAuthInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);