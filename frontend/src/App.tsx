import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import MyNotes from "./pages/MyNotes";
import DisplayNote from "./pages/DisplayNote";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignUpPage";
import Profile from "./pages/Profile";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./context/ProtectedRoute";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function AuthRedirectHandler() {
  const navigate = useNavigate();
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            localStorage.removeItem("token");
            navigate("/login", { replace: true });
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
        });
    }
  }, [navigate]);
  return null;
}

function App() {
  const { isLoggedIn, isAuthInitialized } = useAuth();
  if (!isAuthInitialized) return null;
  return (
    <Router>
      <AuthRedirectHandler />
      <Routes>
        <Route
          path="/"
          element={
            isAuthInitialized
              ? !isLoggedIn
                ? <LandingPage />
                : <Navigate to="/dashboard" />
              : null
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <>
                <Header />
                <Dashboard />
                <Footer />
              </>
            }
          />
          <Route
            path="/upload"
            element={
              <>
                <Header />
                <UploadPage />
                <Footer />
              </>
            }
          />
          <Route
            path="/notes"
            element={
              <>
                <Header />
                <MyNotes />
                <Footer />
              </>
            }
          />
          <Route
            path="/notes/:id"
            element={
              <>
                <Header />
                <DisplayNote />
                <Footer />
              </>
            }
          />
          <Route
            path="/profile"
            element={
              <>
                <Header />
                <Profile />
                <Footer />
              </>
            }
          />
        </Route>
        <Route
          path="/login"
          element={
            <>
              <Header />
              <LoginPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/signup"
          element={
            <>
              <Header />
              <SignupPage />
              <Footer />
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;