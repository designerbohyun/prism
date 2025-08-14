import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PrismLogin from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import PasswordReset from "./components/PasswordReset";

const STORAGE_KEY = "prism_login_state";

function App() {
  const hasInitialized = useRef(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      
      try {
        const savedLoginState = localStorage.getItem(STORAGE_KEY);
        if (savedLoginState === "true") {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Failed to read login state:", error);
      }
      
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        setIsLoggedIn(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLoginSuccess = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Failed to save login state:", error);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Failed to remove login state:", error);
      setIsLoggedIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <PrismLogin onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />
        <Route 
          path="/password-reset" 
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <PasswordReset />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isLoggedIn ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
