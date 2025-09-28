import React, { useState, useEffect } from "react";

const SignInPage = ({ onSignInSuccess }) => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setError("");
    
    // Check if Google Identity Services is available
    if (typeof window.google === 'undefined') {
      setError("Google Sign-In is not available. Please try email sign-in.");
      setIsLoading(false);
      return;
    }
    
    try {
      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
        callback: async (response) => {
          try {
            // Send the credential to our backend
            const backendResponse = await fetch('/api/auth/google', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: response.credential }),
            });

            if (!backendResponse.ok) {
              const errorData = await backendResponse.json();
              throw new Error(errorData.message || 'Google sign-in failed');
            }

            const userData = await backendResponse.json();
            
            // Store user data securely
            localStorage.setItem('gameplan_user', JSON.stringify(userData.user));
            localStorage.setItem('gameplan_token', userData.token);
            
            console.log("Google Sign In successful:", userData);
            
            // Notify parent component of successful sign-in
            onSignInSuccess(userData);
            
          } catch (err) {
            setError(err.message || "Google sign-in failed. Please try again.");
            console.error("Google sign-in processing error:", err);
          } finally {
            setIsLoading(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Prompt the user to sign in
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to renderButton if prompt fails
          console.log("Google prompt failed, trying button fallback");
        }
        setIsLoading(false);
      });
    } catch (err) {
      setError("Google sign-in initialization failed. Please try email sign-in.");
      console.error("Google sign-in error:", err);
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `${isSignUp ? 'Sign up' : 'Sign in'} failed`);
      }

      const userData = await response.json();
      
      // Store user data
      localStorage.setItem('gameplan_user', JSON.stringify(userData.user));
      localStorage.setItem('gameplan_token', userData.token);
      
      console.log(`${isSignUp ? 'Sign up' : 'Sign in'} successful:`, userData);
      
      // Notify parent component of successful sign-in
      onSignInSuccess(userData);
      
    } catch (err) {
      // Handle different types of errors
      if (err.message.includes('network') || err.message.includes('fetch')) {
        setError("Network error. Please check your connection and try again.");
      } else if (err.message.includes('invalid') || err.message.includes('credentials')) {
        setError("Invalid email or password. Please try again.");
      } else if (err.message.includes('exists')) {
        setError("An account with this email already exists. Please sign in instead.");
      } else {
        setError(err.message || `${isSignUp ? 'Sign up' : 'Sign in'} failed. Please try again.`);
      }
      console.error(`Email ${isSignUp ? 'signup' : 'signin'} error:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset email');
      }

      alert(`Password reset link sent to ${email}. Please check your inbox.`);
    } catch (err) {
      if (err.message.includes('network') || err.message.includes('fetch')) {
        setError("Network error. Please try again.");
      } else {
        setError(err.message || "Failed to send password reset email. Please try again.");
      }
      console.error("Forgot password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (document.getElementById('google-identity-script')) return;
      
      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    window.addEventListener('mousemove', handleMouseMove);
    loadGoogleScript();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const containerStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const backgroundStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.7,
    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
      rgba(245, 158, 11, 0.3) 0%, 
      rgba(239, 68, 68, 0.2) 25%, 
      rgba(220, 38, 38, 0.1) 50%, 
      rgba(15, 23, 42, 0.8) 100%)`,
    transition: 'all 1s ease-out'
  };

  const cardStyle = {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
    padding: '40px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    opacity: 0,
    animation: 'fadeInScale 0.8s ease-out 0.2s forwards'
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '32px',
    gap: '12px'
  };

  const logoIconStyle = {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(to bottom right, #f59e0b, #ef4444)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold'
  };

  const logoTextStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #f59e0b, #ef4444)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '8px',
    background: 'linear-gradient(to right, #ffffff, #fbbf24)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const subtitleStyle = {
    fontSize: '16px',
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: '32px'
  };

  const googleButtonStyle = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #dadce0',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '24px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#3c4043',
    fontFamily: 'Roboto, sans-serif'
  };

  const dividerStyle = {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
    color: '#64748b'
  };

  const dividerLineStyle = {
    flex: 1,
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  };

  const dividerTextStyle = {
    padding: '0 16px',
    fontSize: '14px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    marginBottom: '16px',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  };

  const signInButtonStyle = {
    width: '100%',
    padding: '12px 16px',
    background: isLoading ? '#9ca3af' : 'linear-gradient(to right, #f59e0b, #ef4444)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const errorStyle = {
    color: '#ef4444',
    fontSize: '14px',
    marginBottom: '16px',
    textAlign: 'center'
  };

  const loadingSpinnerStyle = {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const linkStyle = {
    color: '#fbbf24',
    textDecoration: 'none',
    fontSize: '14px'
  };

  const backButtonStyle = {
    position: 'absolute',
    top: '32px',
    left: '32px',
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    zIndex: 20
  };

  return (
    <div style={containerStyle}>
      <div style={backgroundStyle} />
      
      <button 
        style={backButtonStyle}
        onClick={() => handleNavigation("/")}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
          e.target.style.borderColor = '#f59e0b';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        ← Back to Home
      </button>

      <div style={cardStyle}>
        <div style={logoContainerStyle}>
          <div style={logoIconStyle}>
            <span>G</span>
          </div>
          <span style={logoTextStyle}>GamePlan</span>
        </div>

        <h1 style={titleStyle}>{isSignUp ? "Join the Team" : "Welcome Back"}</h1>
        <p style={subtitleStyle}>
          {isSignUp ? "Start your championship financial journey" : "Continue your winning streak"}
        </p>

        {error && <div style={errorStyle}>{error}</div>}

        {/* Google Sign In Button */}
        <button
          style={{...googleButtonStyle, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1}}
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
              e.target.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.target.style.boxShadow = 'none';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
            {isLoading ? (
              <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <div style={loadingSpinnerStyle}></div>
                Signing in...
              </span>
            ) : (
              <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </span>
            )}
        </button>

        <div style={dividerStyle}>
          <div style={dividerLineStyle}></div>
          <span style={dividerTextStyle}>or {isSignUp ? 'sign up' : 'sign in'} with email</span>
          <div style={dividerLineStyle}></div>
        </div>

        {/* Email Sign In Form */}
        <div>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            disabled={isLoading}
            onFocus={(e) => {
              e.target.style.borderColor = '#f59e0b';
              e.target.style.backgroundColor = 'rgba(245, 158, 11, 0.05)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleEmailSignIn();
              }
            }}
            required
          />
          
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            disabled={isLoading}
            onFocus={(e) => {
              e.target.style.borderColor = '#f59e0b';
              e.target.style.backgroundColor = 'rgba(245, 158, 11, 0.05)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleEmailSignIn();
              }
            }}
            required
          />

          <button
            type="button"
            onClick={handleEmailSignIn}
            style={signInButtonStyle}
            disabled={isLoading}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
              {isLoading ? (
                <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <div style={loadingSpinnerStyle}></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </span>
              ) : (
                isSignUp ? 'Create Your Account' : 'Sign In to Your Account'
              )}
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          {!isSignUp && (
            <span style={{display: 'inline-block'}}>
              <button 
                onClick={handleForgotPassword}
                style={{...linkStyle, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}
              >
                Forgot your password?
              </button>
              <br />
            </span>
          )}
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
            <button 
              onClick={() => {setIsSignUp(!isSignUp); setError(""); setEmail(""); setPassword("");}}
              style={{...linkStyle, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          0% { 
            opacity: 0; 
            transform: scale(0.9) translateY(20px); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SignInPage;