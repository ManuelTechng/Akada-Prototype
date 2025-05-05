import React, { useEffect } from 'react';
import LandingHero from './LandingHero';
import LandingProblemSolution from './LandingProblemSolution';
import LandingFeatures from './LandingFeatures';
import LandingHowItWorks from './LandingHowItWorks';
import LandingSuccessStories from './LandingSuccessStories';
import LandingPricing from './LandingPricing';
import LandingFAQ from './LandingFAQ';
import LandingAbout from './LandingAbout';
import LandingSignup from './LandingSignup';
import LandingFooter from './LandingFooter';
import LandingNavbar from './LandingNavbar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("LandingPage: Auth state:", { user: !!user, loading });
    // This redirect is now handled at the route level in App.tsx
  }, [user, loading, navigate]);

  console.log("LandingPage: Rendering");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 relative">
      <LandingNavbar />
      <LandingHero />
      <LandingProblemSolution />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingSuccessStories />
      <LandingPricing />
      <LandingFAQ />
      <LandingAbout />
      <LandingSignup />
      <LandingFooter />
      
      {/* Bottom padding to prevent footer overlap */}
      <div className="pb-12"></div>
    </div>
  );
};

export default LandingPage;