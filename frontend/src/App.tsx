import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";
import UploadPage from "./pages/UploadPage.tsx";
import MyNotes from "./pages/MyNotes.tsx";
import DisplayNote from "./pages/DisplayNote.tsx";
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SignupPage from "./pages/SignUpPage.tsx";
import Profile from "./pages/Profile";
import LandingPage from "./pages/LandingPage.tsx";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./context/ProtectedRoute.tsx";

function App() {
  const { isLoggedIn, isAuthInitialized } = useAuth();
  if (!isAuthInitialized) return null;
  return (
    <Router>
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