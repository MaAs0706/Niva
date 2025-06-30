import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Heart, 
  Users, 
  MapPin, 
  Route, 
  Clock, 
  Shield, 
  Camera,
  Settings,
  TestTube,
  Sparkles,
  CheckCircle
} from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Niva! 🛡️",
      description: "I'm your silent safety companion, here to keep you connected and protected wherever you go.",
      icon: Heart,
      color: "from-purple-400 to-pink-500",
      features: [
        "Intelligent location sharing",
        "Gentle check-ins with loved ones", 
        "Smart timing that adapts to you",
        "Complete privacy and control"
      ]
    },
    {
      title: "Build Your Trusted Circle 👥",
      description: "Add the people who care about you most. They'll receive gentle notifications if you need support.",
      icon: Users,
      color: "from-emerald-400 to-teal-500",
      features: [
        "Add family, friends, and loved ones",
        "Include their relationship to you",
        "Multiple contact methods (SMS, email)",
        "They only get notified when needed"
      ]
    },
    {
      title: "Start Companion Sessions 💝",
      description: "When you're out and about, start a session so I can watch over you with care.",
      icon: Shield,
      color: "from-blue-400 to-indigo-500",
      features: [
        "Quick start for any journey",
        "Set optional time limits",
        "Smart check-in frequency",
        "Automatic safety checks"
      ]
    },
    {
      title: "Smart Routes & Places 🗺️",
      description: "Save your regular journeys and mark special places that make you feel safe.",
      icon: Route,
      color: "from-amber-400 to-orange-500",
      features: [
        "Save work commutes and regular trips",
        "Mark safe havens and comfort zones",
        "Route-based companion sessions",
        "Intelligent timing for each journey"
      ]
    },
    {
      title: "Intelligent Timing ⏰",
      description: "I adapt my care based on your journey length, increasing attention as time passes.",
      icon: Clock,
      color: "from-purple-400 to-indigo-500",
      features: [
        "More frequent checks for short trips",
        "Relaxed monitoring for long journeys",
        "Increased attention near session end",
        "Automatic safety checks when time expires"
      ]
    },
    {
      title: "Safety Features 📹",
      description: "Record safety videos, test messaging, and customize your experience.",
      icon: Camera,
      color: "from-rose-400 to-pink-500",
      features: [
        "Record safety videos during sessions",
        "Test location sharing anytime",
        "Customize check-in frequency",
        "Dark mode and accessibility options"
      ]
    }
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300">
        {/* Header */}
        <div className="relative p-6 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/Niva Logo 1024x1024.png" 
                alt="Niva Logo" 
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">Getting Started</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                    index <= currentStep 
                      ? 'bg-gradient-to-r from-purple-400 to-teal-400' 
                      : 'bg-slate-200 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step Icon and Title */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 bg-gradient-to-br ${currentStepData.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 transition-colors duration-300">
              {currentStepData.title}
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-300">
              {currentStepData.description}
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-4 mb-8">
            {currentStepData.features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl transition-colors duration-300"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-700 dark:text-slate-200 font-medium transition-colors duration-300">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Special Message for Last Step */}
          {isLastStep && (
            <div className="bg-gradient-to-r from-purple-50 to-teal-50 dark:from-purple-900/20 dark:to-teal-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 mb-8 transition-colors duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                <h4 className="font-bold text-purple-900 dark:text-purple-100 text-lg transition-colors duration-300">You're all set!</h4>
              </div>
              <p className="text-purple-800 dark:text-purple-200 leading-relaxed transition-colors duration-300">
                Remember, I'm here whenever you need me. Start by adding people to your circle, 
                then begin your first companion session. You're never alone with Niva by your side.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-6 py-3 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentStep 
                      ? 'bg-purple-500 dark:bg-purple-400' 
                      : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-teal-500 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <span>{isLastStep ? 'Get Started' : 'Next'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Skip Option */}
          <div className="text-center mt-6">
            <button
              onClick={onSkip}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-medium transition-colors duration-200"
            >
              Skip tour and explore on my own
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;