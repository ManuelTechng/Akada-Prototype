"use client";

console.log('LandingPage loaded');

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
  <main className="flex flex-col min-h-screen bg-white text-gray-800" aria-label="Akada landing page">
    <LandingNavbar />
    <LandingHero />
    <LandingFeatures />
    <LandingProblemSolution />
    <LandingHowItWorks />
    <LandingSuccessStories />
    <LandingPricing />
    <LandingFAQ />
    <LandingAbout />
    <LandingSignup />
    <LandingFooter />
  </main>
);

export default LandingPage;