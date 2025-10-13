"use client";

import React from 'react';
import LandingNavbar from './LandingNavbar';
import LandingHero from './LandingHero';
import LandingFeatures from './LandingFeatures';
import LandingProblemSolution from './LandingProblemSolution';
import LandingHowItWorks from './LandingHowItWorks';
import LandingSuccessStories from './LandingSuccessStories';
import LandingPricing from './LandingPricing';
import LandingFAQ from './LandingFAQ';
import LandingAbout from './LandingAbout';
import LandingSignup from './LandingSignup';
import LandingFooter from './LandingFooter';

const LandingPage: React.FC = () => (
  <div className="bg-white text-gray-800 min-h-screen" aria-label="Akada landing page">
    <LandingNavbar />
    <main>
      <LandingHero />
      <LandingFeatures />
      <LandingProblemSolution />
      <LandingHowItWorks />
      <LandingSuccessStories />
      <LandingPricing />
      <LandingFAQ />
      <LandingAbout />
      <LandingSignup />
    </main>
    <LandingFooter />
  </div>
);

export default LandingPage;