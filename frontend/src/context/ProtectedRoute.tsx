import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ProtectedRoute: React.FC = () => {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsValid(false);
      return;
    }
    fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.ok) {
          setIsValid(true);
        } else {
          localStorage.removeItem("token");
          setIsValid(false);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        setIsValid(false);
      });
  }, []);

  if (isValid === null) {
    return null;
  }
  if (!isValid) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
