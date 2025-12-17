"use client";

import React from 'react';
import LandingNavbarMinimalist from './LandingNavbarMinimalist';
import LandingHeroMinimalist from './LandingHeroMinimalist';
import LandingFeaturesMinimalist from './LandingFeaturesMinimalist';
import LandingProblemSolutionMinimalist from './LandingProblemSolutionMinimalist';
import LandingHowItWorksMinimalist from './LandingHowItWorksMinimalist';
import LandingSuccessStoriesMinimalist from './LandingSuccessStoriesMinimalist';
import LandingPricingMinimalist from './LandingPricingMinimalist';
import LandingFAQMinimalist from './LandingFAQMinimalist';
import LandingAboutMinimalist from './LandingAboutMinimalist';
import LandingSignupMinimalist from './LandingSignupMinimalist';
import LandingFooterMinimalist from './LandingFooterMinimalist';

const LandingPage: React.FC = () => (
  <div className="bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 min-h-screen" aria-label="Akada landing page">
    <LandingNavbarMinimalist />
    <main className="pt-20">
      <LandingHeroMinimalist />
      <LandingFeaturesMinimalist />
      <LandingProblemSolutionMinimalist />
      <LandingHowItWorksMinimalist />
      <LandingSuccessStoriesMinimalist />
      <LandingPricingMinimalist />
      <LandingFAQMinimalist />
      <LandingAboutMinimalist />
      <LandingSignupMinimalist />
    </main>
    <LandingFooterMinimalist />
  </div>
);

export default LandingPage;