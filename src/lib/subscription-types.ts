/**
 * Subscription Tiers and Feature Flags
 *
 * Defines subscription plans and feature access control for the Akada platform
 */

export type SubscriptionTier = 'free' | 'basic' | 'premium';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  displayName: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: SubscriptionFeature[];
  limits: SubscriptionLimits;
  popular?: boolean;
  description: string;
}

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
}

export interface SubscriptionLimits {
  maxSavedPrograms: number;
  maxApplications: number;
  maxDocumentReviews: number;
  aiRecommendations: 'limited' | 'unlimited';
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  studyBuddyMatching: boolean;
  customReports: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  payment_method?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Subscription Plan Definitions
 */
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'free',
    displayName: 'Free',
    price: 0,
    currency: 'NGN',
    interval: 'month',
    description: 'Perfect for exploring the platform',
    features: [
      {
        id: 'search_programs',
        name: 'Search Programs',
        description: 'Search up to 10 programs',
        included: true,
      },
      {
        id: 'basic_tracking',
        name: 'Basic Application Tracking',
        description: 'Track your applications',
        included: true,
      },
      {
        id: 'email_support',
        name: 'Email Support',
        description: 'Get help via email',
        included: true,
      },
      {
        id: 'limited_ai',
        name: 'Limited AI Recommendations',
        description: 'Basic AI-powered suggestions',
        included: true,
      },
    ],
    limits: {
      maxSavedPrograms: 10,
      maxApplications: 5,
      maxDocumentReviews: 0,
      aiRecommendations: 'limited',
      advancedAnalytics: false,
      prioritySupport: false,
      studyBuddyMatching: false,
      customReports: false,
    },
  },
  basic: {
    id: 'basic',
    name: 'basic',
    displayName: 'Basic',
    price: 8000,
    currency: 'NGN',
    interval: 'month',
    description: 'Best for serious applicants',
    popular: true,
    features: [
      {
        id: 'unlimited_search',
        name: 'Unlimited Program Searches',
        description: 'Search as many programs as you want',
        included: true,
      },
      {
        id: 'advanced_tracking',
        name: 'Advanced Application Tracking',
        description: 'Detailed application management',
        included: true,
      },
      {
        id: 'priority_support',
        name: 'Priority Email Support',
        description: 'Get faster responses',
        included: true,
      },
      {
        id: 'unlimited_ai',
        name: 'Unlimited AI Recommendations',
        description: 'AI-powered program matching',
        included: true,
      },
      {
        id: 'document_review',
        name: 'Document Review Assistance',
        description: '5 document reviews per month',
        included: true,
      },
      {
        id: 'deadline_reminders',
        name: 'Deadline Reminders',
        description: 'Never miss a deadline',
        included: true,
      },
    ],
    limits: {
      maxSavedPrograms: 50,
      maxApplications: 20,
      maxDocumentReviews: 5,
      aiRecommendations: 'unlimited',
      advancedAnalytics: false,
      prioritySupport: true,
      studyBuddyMatching: false,
      customReports: false,
    },
  },
  premium: {
    id: 'premium',
    name: 'premium',
    displayName: 'Premium',
    price: 15000,
    currency: 'NGN',
    interval: 'month',
    description: 'For maximum success',
    features: [
      {
        id: 'everything_basic',
        name: 'Everything in Basic',
        description: 'All Basic plan features',
        included: true,
      },
      {
        id: 'consultation',
        name: 'One-on-One Consultation',
        description: 'Monthly video call with advisor',
        included: true,
      },
      {
        id: 'success_manager',
        name: 'Dedicated Success Manager',
        description: 'Personal point of contact',
        included: true,
      },
      {
        id: 'custom_strategy',
        name: 'Custom Application Strategies',
        description: 'Personalized application plan',
        included: true,
      },
      {
        id: 'unlimited_reviews',
        name: 'Unlimited Document Reviews',
        description: 'No limits on document feedback',
        included: true,
      },
      {
        id: 'priority_processing',
        name: 'Priority Application Processing',
        description: 'Fast-track your applications',
        included: true,
      },
      {
        id: 'scholarship_alerts',
        name: 'Exclusive Scholarship Alerts',
        description: 'Be first to know about scholarships',
        included: true,
      },
      {
        id: 'advanced_analytics',
        name: 'Advanced Analytics',
        description: 'Detailed insights and reports',
        included: true,
      },
      {
        id: 'study_buddy',
        name: 'Study Buddy Matching',
        description: 'Connect with similar students',
        included: true,
      },
    ],
    limits: {
      maxSavedPrograms: -1, // unlimited
      maxApplications: -1, // unlimited
      maxDocumentReviews: -1, // unlimited
      aiRecommendations: 'unlimited',
      advancedAnalytics: true,
      prioritySupport: true,
      studyBuddyMatching: true,
      customReports: true,
    },
  },
};

/**
 * Feature Gate IDs for granular access control
 */
export enum FeatureGate {
  // Program Search
  UNLIMITED_PROGRAM_SEARCH = 'unlimited_program_search',
  ADVANCED_FILTERS = 'advanced_filters',

  // Applications
  UNLIMITED_APPLICATIONS = 'unlimited_applications',
  APPLICATION_ANALYTICS = 'application_analytics',

  // AI Features
  UNLIMITED_AI_RECOMMENDATIONS = 'unlimited_ai_recommendations',
  CUSTOM_AI_STRATEGIES = 'custom_ai_strategies',
  AI_DOCUMENT_REVIEW = 'ai_document_review',

  // Analytics
  ADVANCED_ANALYTICS = 'advanced_analytics',
  CUSTOM_REPORTS = 'custom_reports',
  COMPARISON_TOOLS = 'comparison_tools',

  // Support
  PRIORITY_SUPPORT = 'priority_support',
  CONSULTATION_CALLS = 'consultation_calls',
  DEDICATED_MANAGER = 'dedicated_manager',

  // Community
  STUDY_BUDDY_MATCHING = 'study_buddy_matching',
  PREMIUM_COMMUNITY_ACCESS = 'premium_community_access',

  // Documents
  DOCUMENT_TEMPLATES = 'document_templates',
  UNLIMITED_DOCUMENT_REVIEWS = 'unlimited_document_reviews',
}

/**
 * Feature access mapping by tier
 */
export const FEATURE_ACCESS: Record<SubscriptionTier, FeatureGate[]> = {
  free: [
    // Free tier has basic access only
  ],
  basic: [
    FeatureGate.UNLIMITED_PROGRAM_SEARCH,
    FeatureGate.ADVANCED_FILTERS,
    FeatureGate.UNLIMITED_AI_RECOMMENDATIONS,
    FeatureGate.AI_DOCUMENT_REVIEW,
    FeatureGate.PRIORITY_SUPPORT,
    FeatureGate.DOCUMENT_TEMPLATES,
  ],
  premium: [
    // Premium has all features
    ...Object.values(FeatureGate),
  ],
};
