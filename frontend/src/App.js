import React, { useState, useEffect } from "react";
import TutorialPage from './pages/TutorialPage';
import Dashboard from './pages/Dashboard';
import SignInPage from './pages/SignInPage';
import StartPage from './pages/StartPage';

// Define the spin animation CSS
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
  const [currentPage, setCurrentPage] = useState("start"); // "start", "signin", "dashboard"
  
  // Use React state instead of localStorage
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const validateAuth = async () => {
      // Simulate auth check without localStorage
      // In a real app, this would check session storage, cookies, or make an API call
      
      // For demo purposes, simulate a quick auth check
      setTimeout(() => {
        // Since we can't persist auth state, start as unauthenticated
        setAuthState("unauthenticated");
        setCurrentPage("start"); // Start with the landing page
      }, 1500);
    };

    validateAuth();
  }, []);

  const handleSignInSuccess = (userData) => {
    setUser(userData.user);
    setAuthState("authenticated");
    setAuthToken(userData.token);
    setCurrentPage("dashboard");
    
    // Show tutorial for new users (since we can't persist this state)
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
    setAuthToken(null);
    setCurrentPage("start");
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
          <div style={{
            width: '24px',
            height: '24px',
            border: '3px solid rgba(245, 158, 11, 0.3)',
            borderTop: '3px solid #f59e0b',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Initializing BankShot...
        </div>
        <style dangerouslySetInnerHTML={{ __html: spinAnimation }} />
      </div>
    );
  }

  // Show tutorial
  if (authState === "authenticated" && showTutorial) {
    return <TutorialPage onComplete={handleTutorialComplete} />;
  }

  const handleNavigation = (path) => {
    if (path === "signin" || path === "/signin") {
      setCurrentPage("signin");
    } else if (path === "start" || path === "/") {
      setCurrentPage("start");
    }
  };

  // Route based on current page
  if (currentPage === "start") {
    return <StartPage onNavigate={handleNavigation} />;
  }
  
  if (currentPage === "signin" && authState === "unauthenticated") {
    return <SignInPage onSignInSuccess={handleSignInSuccess} />;
  }
  
  if (currentPage === "dashboard" && authState === "authenticated") {
    return <Dashboard user={user} onSignOut={handleSignOut} />;
  }

  // Fallback to start page
  return <StartPage />;
}