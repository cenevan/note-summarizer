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
                : <Navigate to="/notes" />
              : null
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthInitialized && isLoggedIn ? (
              <>
                <Header />
                <Dashboard />
                <Footer />
              </>
            ) : (
              isAuthInitialized && <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/upload"
          element={
            isAuthInitialized && isLoggedIn ? (
              <>
                <Header />
                <UploadPage />
                <Footer />
              </>
            ) : (
              isAuthInitialized && <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/notes"
          element={
            isAuthInitialized && isLoggedIn ? (
              <>
                <Header />
                <MyNotes />
                <Footer />
              </>
            ) : (
              isAuthInitialized && <Navigate to="/login" />
            )
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
            isAuthInitialized && isLoggedIn ? (
              <>
                <Header />
                <Profile />
                <Footer />
              </>
            ) : (
              isAuthInitialized && <Navigate to="/login" />
            )
          }
        />
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