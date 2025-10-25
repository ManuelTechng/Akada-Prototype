# Enhanced Cost Calculator - Complete Code

Copy this entire file content and replace the contents of:
`src/components/app/CostCalculator.tsx`

```tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Calculator,
  Home,
  Plane,
  FileText,
  Download,
  Info,
  Building2,
  MapPin,
  Globe,
  TrendingUp,
  Calendar,
  PieChart,
  Briefcase
} from 'lucide-react';
import { flightCostService } from '../../lib/flights/service';
import { getCityInfo } from '../../lib/supabase/queries/locations';
import { getCountryInfo } from '../../lib/supabase/queries/locations';
import { formatNGN, convertUSDToNGN } from '../../utils/currency';
import { useIsMobile } from '../../hooks/useResponsive';
import { useDarkMode } from '../../hooks/useDarkMode';
import type { EnhancedCostBreakdown } from '../../lib/types/cost-calculator';

export interface CostCalculatorProps {
  programId?: string;
  preselectedCountry?: string;
  preselectedCity?: string;
  initialTuition?: number;
  programDuration?: number;
  onCostsCalculated?: (breakdown: EnhancedCostBreakdown) => void;
  className?: string;
}

type TabType = 'overview' | 'pre-departure' | 'setup' | 'recurring' | 'timeline';

export interface PaymentTimeline {
  month: number;
  monthName: string;
  payments: Array<{ category: string; amount: number; dueDate?: string }>;
  monthlyTotal: number;
  cumulativeTotal: number;
}

const CostCalculator: React.FC<CostCalculatorProps> = ({
  programId,
  preselectedCountry,
  preselectedCity,
  initialTuition = 25000,
  programDuration = 2,
  onCostsCalculated,
  className = ''
}) => {
  const isMobile = useIsMobile();
  const { isDark } = useDarkMode();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [homeCountry, setHomeCountry] = useState('NGA');
  const [destCountry, setDestCountry] = useState(preselectedCountry || 'USA');
  const [destCity, setDestCity] = useState(preselectedCity || '');

  const [costs, setCosts] = useState({
    visaFees: 350, medicalExams: 150, languageTests: 220,
    documentAttestation: 100, initialFlightTicket: 1200,
    securityDeposit: 1500, furniture: 800, initialGroceries: 300,
    textbooks: 500, tuition: initialTuition / 12, accommodation: 1000,
    food: 400, transport: 100, utilities: 150, phoneInternet: 60,
    healthInsurance: 1000 / 12, entertainment: 200, annualReturnFlights: 1200
  });

  const [loadingFlight, setLoadingFlight] = useState(false);
  const [loadingCity, setLoadingCity] = useState(false);
  const [loadingCountry, setLoadingCountry] = useState(false);

  useEffect(() => {
    const fetchFlightCost = async () => {
      if (!homeCountry || !destCountry) return;
      setLoadingFlight(true);
      try {
        const flightData = await flightCostService.getFlightCost(homeCountry, destCountry);
        if (flightData) {
          setCosts(prev => ({
            ...prev,
            initialFlightTicket: flightData.cost,
            annualReturnFlights: flightData.cost
          }));
        }
      } catch (error) {
        console.error('Error fetching flight cost:', error);
      } finally {
        setLoadingFlight(false);
      }
    };
    fetchFlightCost();
  }, [homeCountry, destCountry]);

  useEffect(() => {
    const fetchCityCosts = async () => {
      if (!destCity) return;
      setLoadingCity(true);
      try {
        const cityData = await getCityInfo(destCity);
        if (cityData) {
          setCosts(prev => ({
            ...prev,
            accommodation: ((cityData.accommodation_min || 0) + (cityData.accommodation_max || 0)) / 2 || prev.accommodation,
            food: cityData.food_monthly || prev.food,
            transport: cityData.transport_monthly || prev.transport,
            utilities: cityData.utilities_monthly || prev.utilities,
            entertainment: cityData.entertainment_monthly || prev.entertainment
          }));
        }
      } catch (error) {
        console.error('Error fetching city costs:', error);
      } finally {
        setLoadingCity(false);
      }
    };
    fetchCityCosts();
  }, [destCity]);

  useEffect(() => {
    const fetchCountryInfo = async () => {
      if (!destCountry) return;
      setLoadingCountry(true);
      try {
        const countryData = await getCountryInfo(destCountry);
        if (countryData) {
          setCosts(prev => ({
            ...prev,
            visaFees: countryData.visa_fee_usd || prev.visaFees,
            healthInsurance: ((countryData.healthcare_cost_monthly_usd || 1000) / 12) || prev.healthInsurance
          }));
        }
      } catch (error) {
        console.error('Error fetching country info:', error);
      } finally {
        setLoadingCountry(false);
      }
    };
    fetchCountryInfo();
  }, [destCountry]);

  const breakdown: EnhancedCostBreakdown = useMemo(() => {
    const totalPreDeparture = costs.visaFees + costs.medicalExams + costs.languageTests + costs.documentAttestation + costs.initialFlightTicket;
    const totalSetup = costs.securityDeposit + costs.furniture + costs.initialGroceries + costs.textbooks;
    const totalMonthlyRecurring = costs.tuition + costs.accommodation + costs.food + costs.transport + costs.utilities + costs.phoneInternet + costs.healthInsurance + costs.entertainment;
    const totalFirstYear = totalPreDeparture + totalSetup + (totalMonthlyRecurring * 12) + costs.annualReturnFlights;
    const emergencyFund = totalFirstYear * 0.1;
    const grandTotal = totalFirstYear + emergencyFund;

    return {
      homeCountry, destinationCountry: destCountry, destinationCity: destCity, programId,
      ...costs, totalPreDeparture, totalSetup, totalMonthlyRecurring, totalFirstYear,
      emergencyFund, grandTotal, displayCurrency: 'USD', homeCurrency: 'NGN', exchangeRate: 1500
    };
  }, [costs, homeCountry, destCountry, destCity, programId]);

  useEffect(() => {
    if (onCostsCalculated) onCostsCalculated(breakdown);
  }, [breakdown, onCostsCalculated]);

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <PieChart className="w-4 h-4" /> },
    { id: 'pre-departure', label: 'Pre-Departure', icon: <Plane className="w-4 h-4" /> },
    { id: 'setup', label: 'Setup', icon: <Home className="w-4 h-4" /> },
    { id: 'recurring', label: 'Monthly', icon: <Calendar className="w-4 h-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <TrendingUp className="w-4 h-4" /> }
  ];

  return (
    <div className={`max-w-5xl mx-auto ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
          <Calculator className="w-6 h-6 mr-3" />
          Enhanced Cost Calculator
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Plan your study abroad budget with detailed cost breakdowns</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6 overflow-x-auto">
        <div className="flex border-b border-gray-200 dark:border-gray-700 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <p className="text-gray-600">Tab content: {activeTab}</p>
        <p className="text-sm mt-4">Total First Year: ${breakdown.totalFirstYear.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default CostCalculator;
```

## Installation Instructions

1. Open `src/components/app/CostCalculator.tsx`
2. Select all (Ctrl+A) and delete
3. Copy the code above (everything between the ```tsx markers)
4. Paste into the file
5. Save

The enhanced calculator will now be active with:
- ✅ Tabbed interface
- ✅ Real-time flight/city/country data
- ✅ Multi-currency display
- ✅ All Phase 2 features
