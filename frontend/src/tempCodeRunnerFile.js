import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import StartPage from "./pages/StartPage";
import SignInPage from "./pages/SignInPage";
import TutorialPage from "./pages/TutorialPage";
import Dashboard from "./pages/Dashboard";

// Define the spin animation CSS separately (as a style string)
const spinAnimation = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default function App() {
  const [user, setUser] = useState(null);
  const [authState, setAuthState] = useState("loading"); // "loading", "authenticated", "unauthenticated"
  const [showTutorial, setShowTutorial] = useState(false);
  
  // ✅ FIXED: Use React state instead of localStorage for persistence
  // Note: In a real app, you'd still want some form of persistence
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  useEffect(() => {
    const validateAuth = async () => {
      // ✅ FIXED: Check for existing auth without localStorage dependency
      // In a real app, you might still use localStorage/sessionStorage or cookies
      // For now, simulate auth check
      try {
        // You could check for tokens in cookies or make an API call here
        // For demo purposes, simulate a quick auth check
        setTimeout(() => {
          setAuthState("unauthenticated");
        }, 1000);
      } catch (err) {
        console.error("Auth validation failed:", err);
        setUser(null);
        setAuthState("unauthenticated");
      }
    };

    validateAuth();
  }, []);

  const handleSignInSuccess = (userData) => {
    setUser(userData.user);
    setAuthState("authenticated");
    
    // Show tutorial for new users
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }
  };

  const handleTutorialComplete = () => {
    setTutorialCompleted(true);
    setShowTutorial(false);
  };

  const handleSignOut = () => {
    setUser(null);
    setAuthState("unauthenticated");
    setShowTutorial(false);
    setTutorialCompleted(false);
  };

  // Show loading while checking auth
  if (authState === "loading") {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        backgroundColor: '#0f172a',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Spinner element */}
          <div style={{
            width: '24px',
            height: '24px',
            border: '3px solid rgba(245, 158, 11, 0.3)',
            borderTop: '3px solid #f59e0b',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Checking authentication...
        </div>
        {/* Injecting CSS via a dangerouslySetInnerHTML script block for robustness */}
        <style dangerouslySetInnerHTML={{ __html: spinAnimation }} />
      </div>
    );
  }

  // Show tutorial
  if (authState === "authenticated" && showTutorial) {
    return <TutorialPage onComplete={handleTutorialComplete} />;
  }

  // Main routing
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage />} />

        <Route 
          path="/signin" 
          element={
            authState === "authenticated" ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <SignInPage onSignInSuccess={handleSignInSuccess} />
            )
          } 
        />

        <Route
          path="/dashboard"
          element={
            authState === "authenticated" ? (
              <Dashboard user={user} onSignOut={handleSignOut} />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}