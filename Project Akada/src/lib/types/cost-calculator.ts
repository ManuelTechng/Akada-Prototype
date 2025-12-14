/**
 * Enhanced Cost Calculator Types for Phase 2
 * Comprehensive cost breakdown for international student planning
 */

export interface EnhancedCostBreakdown {
  // User context
  homeCountry: string;
  destinationCountry: string;
  destinationCity: string;
  programId?: string;

  // Pre-Departure (one-time costs before leaving home country)
  visaFees: number;
  medicalExams: number;
  languageTests: number;
  documentAttestation: number;
  initialFlightTicket: number;

  // Setup (one-time costs in first month at destination)
  securityDeposit: number;
  furniture: number;
  initialGroceries: number;
  textbooks: number;

  // Recurring (monthly costs)
  tuition: number; // annual tuition / 12 for monthly display
  accommodation: number;
  food: number;
  transport: number;
  utilities: number;
  phoneInternet: number;
  healthInsurance: number; // annual insurance / 12
  entertainment: number;

  // Annual costs
  annualReturnFlights: number;

  // Calculated totals
  totalPreDeparture: number;
  totalSetup: number;
  totalMonthlyRecurring: number;
  totalFirstYear: number;
  emergencyFund: number; // 10% buffer
  grandTotal: number;

  // Display currencies
  displayCurrency: string; // destination country currency
  homeCurrency: string; // user's home country currency
  exchangeRate: number;
}

export interface CostCategory {
  id: string;
  name: string;
  icon: string;
  amount: number;
  frequency: 'one-time' | 'monthly' | 'annual';
  description?: string;
  breakdown?: Array<{
    item: string;
    amount: number;
  }>;
}

export interface PaymentTimeline {
  month: number;
  monthName: string;
  payments: Array<{
    category: string;
    amount: number;
    dueDate?: string;
  }>;
  monthlyTotal: number;
  cumulativeTotal: number;
}

export interface CostOptimizationTip {
  category: 'accommodation' | 'food' | 'transport' | 'utilities' | 'entertainment';
  tip: string;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'high' | 'medium' | 'low';
}

export interface CostComparisonData {
  programId: string;
  universityName: string;
  totalCost: number;
  costPerMonth: number;
  breakdown: {
    tuition: number;
    living: number;
    other: number;
  };
}

export interface CityLivingCostData {
  cityId: string;
  cityName: string;
  tier: 'major' | 'mid' | 'small';
  accommodation: {
    min: number;
    max: number;
    average: number;
  };
  food: number;
  transport: number;
  utilities: number;
  entertainment: number;
  currency: string;
  studentFriendlyRating: number;
}

export interface CountryVisaData {
  countryCode: string;
  countryName: string;
  visaType: string;
  visaFee: number;
  processingDays: number;
  requiresBiometrics: boolean;
  requiresMedical: boolean;
  languageRequirements?: string;
  workPermitHours: number;
  postStudyWorkDuration: string;
}

/**
 * Cost calculator configuration
 */
export interface CostCalculatorConfig {
  programDuration: number; // in years
  includeFlights: boolean;
  includeSummer: boolean; // include summer costs or just academic year
  emergencyFundPercentage: number; // default 10%
  currencyPreference: 'destination' | 'home' | 'both';
}
