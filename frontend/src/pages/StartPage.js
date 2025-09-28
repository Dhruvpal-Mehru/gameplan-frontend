import React, { useState, useEffect } from "react";

const StartPage = ({ onNavigate }) => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const handleNavigation = (path) => {
    // Use the callback function instead of window.location.href
    if (onNavigate) {
      onNavigate(path);
    } else {
      // Fallback to window.location.href if no callback provided
      window.location.href = path;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerStyle = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
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

  const contentStyle = {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0 24px',
    maxWidth: '1024px',
    margin: '0 auto'
  };

  const logoStyle = {
    marginBottom: '32px',
    opacity: 0,
    animation: 'fadeInScale 0.8s ease-out 0.2s forwards'
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    fontSize: '24px',
    fontWeight: 'bold'
  };

  const logoTextStyle = {
    fontSize: '30px',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #f59e0b, #ef4444)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const headlineStyle = {
    fontSize: window.innerWidth < 768 ? '48px' : '80px',
    fontWeight: '800',
    lineHeight: '1.1',
    marginBottom: '24px',
    opacity: 0,
    animation: 'fadeInUp 1s ease-out 0.4s forwards'
  };

  const gradientText1Style = {
    background: 'linear-gradient(to right, #ffffff, #fbbf24, #f59e0b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    display: 'block'
  };

  const gradientText2Style = {
    background: 'linear-gradient(to right, #f59e0b, #ef4444, #dc2626)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    display: 'block'
  };

  const subtitleStyle = {
    fontSize: window.innerWidth < 768 ? '20px' : '24px',
    color: '#cbd5e1',
    maxWidth: '512px',
    lineHeight: '1.6',
    marginBottom: '48px',
    opacity: 0,
    animation: 'fadeInUp 1s ease-out 0.7s forwards'
  };

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '64px',
    opacity: 0,
    animation: 'fadeInUp 1s ease-out 1s forwards'
  };

  const primaryButtonStyle = {
    padding: '16px 32px',
    background: 'linear-gradient(to right, #f59e0b, #ef4444)',
    border: 'none',
    borderRadius: '16px',
    fontWeight: '600',
    color: 'white',
    cursor: 'pointer',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    transition: 'all 0.3s ease',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const featuresStyle = {
    display: 'grid',
    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)',
    gap: '24px',
    width: '100%',
    maxWidth: '768px',
    opacity: 0,
    animation: 'fadeInUp 1s ease-out 1.3s forwards'
  };

  const featureCardStyle = {
    padding: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(4px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const features = [
    { icon: "🏆", title: "Performance Analytics", desc: "Track your financial wins" },
    { icon: "🎯", title: "Goal Achievement", desc: "Hit your money targets" },
    { icon: "🔒", title: "Elite Security", desc: "Pro-level protection" }
  ];

  return (
    <div style={containerStyle}>
      <div style={backgroundStyle} />
      
      <div style={contentStyle}>
        <div style={logoStyle}>
          <div style={logoContainerStyle}>
            <div style={logoIconStyle}>
              <span>G</span>
            </div>
            <span style={logoTextStyle}>GamePlan</span>
          </div>
        </div>

        <h1 style={headlineStyle}>
          <span style={gradientText1Style}>Financial</span>
          <span style={gradientText2Style}>Champion</span>
        </h1>

        <p style={subtitleStyle}>
          Train your finances like a <strong>champion athlete</strong>. 
          Master your money game with <span style={{color: '#fbbf24', fontWeight: '600'}}>precision tracking</span>, 
          <span style={{color: '#f59e0b', fontWeight: '600'}}> winning strategies</span>, and 
          <span style={{color: '#ef4444', fontWeight: '600'}}> championship-level</span> performance analytics
        </p>

        <div style={buttonContainerStyle}>
          <button
            style={primaryButtonStyle}
            onClick={() => handleNavigation("signin")}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 25px 50px -12px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
            }}
          >
            <span>Get Started</span>
            <span>→</span>
          </button>
        </div>

        <div style={featuresStyle}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={featureCardStyle}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                e.target.style.transform = 'translateY(-8px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <div style={{fontSize: '32px', marginBottom: '12px'}}>{feature.icon}</div>
              <h3 style={{fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px'}}>
                {feature.title}
              </h3>
              <p style={{fontSize: '14px', color: '#94a3b8'}}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          0% { 
            opacity: 0; 
            transform: scale(0.8); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        
        @keyframes fadeInUp {
          0% { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
      `}</style>
    </div>
  );
};

export default StartPage;