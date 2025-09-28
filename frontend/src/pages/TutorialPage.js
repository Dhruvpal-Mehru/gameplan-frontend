import React, { useState, useEffect } from 'react';
import { Play, ArrowRight, BarChart3, PieChart, Target, TrendingUp, Zap, Trophy, SkipForward } from 'lucide-react';

const TutorialPage = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      title: "Welcome to GamePlan!",
      description: "Ready to train your finances like a champion athlete? Let's begin your journey to financial victory.",
      subtitle: "Your championship starts now"
    },
    {
      title: "Set Your Financial Goals",
      description: "Define your money targets with precision. Every champion needs clear objectives to dominate their game.",
      subtitle: "Aim for financial excellence"
    },
    {
      title: "Track Your Performance",
      description: "Monitor every financial move with championship-level analytics. Track your progress like a pro athlete.",
      subtitle: "Performance monitoring at its finest"
    },
    {
      title: "Master Your Categories",
      description: "Organize your spending into winning strategies. Create budget categories that work as hard as you do.",
      subtitle: "Strategic budget management"
    },
    {
      title: "Analyze Your Growth",
      description: "View your wealth trajectory with elite-level insights. Watch your financial performance soar to new heights.",
      subtitle: "Championship-level analytics"
    },
    {
      title: "You're Ready to Win!",
      description: "Time to put your training into action. Step into the arena and dominate your financial future!",
      subtitle: "The champion within awaits"
    }
  ];

  const iconConfig = {
    0: { icon: Play, gradient: 'from-orange-400 to-red-500' },
    1: { icon: Target, gradient: 'from-orange-400 to-red-500' },
    2: { icon: BarChart3, gradient: 'from-orange-400 to-red-500' },
    3: { icon: PieChart, gradient: 'from-orange-400 to-red-500' },
    4: { icon: TrendingUp, gradient: 'from-orange-400 to-red-500' },
    5: { icon: Trophy, gradient: 'from-orange-400 to-red-500' }
  };

  const currentStepData = steps[currentStep];
  const currentConfig = iconConfig[currentStep];
  const IconComponent = currentConfig.icon;

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete?.();
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleSkip = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onComplete?.();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 overflow-hidden">
      {/* GamePlan Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">G</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              GamePlan
            </h1>
          </div>
          
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="group flex items-center space-x-2 px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-300 border border-slate-700 hover:border-slate-600"
          >
            <SkipForward className="w-4 h-4" />
            <span className="text-sm font-medium">Skip Tutorial</span>
          </button>
        </div>
      </div>

      {/* Background Pattern - matching the landing page */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255, 165, 0, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)
          `
        }}></div>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen p-4 pt-24">
        {/* Main Tutorial Card */}
        <div className={`
          relative bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-lg w-full 
          border border-slate-700/50 transform transition-all duration-500 ease-out
          ${isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}
        `}>
          
          {/* Orange Glow Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/10 to-red-500/10 blur-xl -z-10"></div>
          
          {/* Step Counter */}
          <div className="absolute top-6 right-6 text-slate-400 text-sm font-mono">
            {String(currentStep + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
          </div>
          
          {/* Icon Container */}
          <div className="flex justify-center mb-8 mt-4">
            <div className={`
              relative p-6 rounded-full bg-slate-700/50 backdrop-blur-sm 
              border border-slate-600/50 transform transition-all duration-700 ease-out
              hover:scale-110 group
            `}>
              {/* Icon Glow */}
              <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${currentConfig.gradient} blur-lg opacity-30 group-hover:opacity-50 transition-opacity`}></div>
              
              {/* Main Icon */}
              <IconComponent 
                size={64} 
                className={`relative z-10 bg-gradient-to-r ${currentConfig.gradient} bg-clip-text text-transparent drop-shadow-lg`}
              />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-3xl font-black text-white mb-3 leading-tight">
                {currentStepData.title}
              </h2>
              <p className="text-sm font-semibold text-orange-400 uppercase tracking-wider">
                {currentStepData.subtitle}
              </p>
            </div>
            
            <p className="text-slate-300 leading-relaxed text-lg font-light">
              {currentStepData.description}
            </p>
          </div>
          
          {/* Progress and Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-700/50">
            {/* Progress Dots */}
            <div className="flex space-x-3">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`
                    h-3 rounded-full transition-all duration-500 transform
                    ${index === currentStep 
                      ? 'w-8 bg-gradient-to-r from-orange-400 to-red-500 shadow-lg shadow-orange-500/30 scale-110' 
                      : index < currentStep
                        ? 'w-3 bg-orange-400/60 scale-100'
                        : 'w-3 bg-slate-600 scale-90 hover:bg-slate-500'
                    }
                  `}
                />
              ))}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex items-center space-x-3">
              {/* Skip Button (alternative position) */}
              {currentStep < steps.length - 1 && (
                <button
                  onClick={handleSkip}
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-slate-700/50"
                >
                  Skip
                </button>
              )}
              
              {/* Next Button - matching landing page style */}
              <button
                onClick={handleNext}
                className={`
                  group flex items-center space-x-3 px-6 py-3 rounded-2xl font-semibold
                  bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 
                  text-white shadow-lg hover:shadow-xl hover:shadow-orange-500/25
                  transform transition-all duration-300 ease-out
                  hover:scale-105 hover:-translate-y-1 active:scale-95
                `}
              >
                <span className="text-white font-semibold">
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
                </span>
                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Indicator */}
        <div className="mt-8 flex items-center space-x-2">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
          <p className="text-slate-400 text-sm font-medium">
            Swipe or click to continue your training
          </p>
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-500"></div>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;