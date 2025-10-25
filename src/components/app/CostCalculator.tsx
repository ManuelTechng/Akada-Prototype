import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Briefcase,
  Search,
  GraduationCap,
  X
} from 'lucide-react';
import { flightCostService } from '../../lib/flights/service';
import { getCityInfo } from '../../lib/supabase/queries/locations';
import { getCountryInfo } from '../../lib/supabase/queries/locations';
import { formatNGN, convertUSDToNGN } from '../../utils/currency';
import { useIsMobile } from '../../hooks/useResponsive';
import { useDarkMode } from '../../hooks/useDarkMode';
import type { EnhancedCostBreakdown } from '../../lib/types/cost-calculator';
import { CostDistributionPie, OneTimeVsRecurringBar, PaymentTimelineChart } from '../cost-calculator/CostCharts';
import { DualCurrencyDisplay } from '../cost-calculator/DualCurrencyDisplay';
import { supabase } from '../../lib/supabase';

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
  const [loadingProgram, setLoadingProgram] = useState(false);

  // Program search state
  const [programSearch, setProgramSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside handler for search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    if (showSearchDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSearchDropdown]);

  // Program search with debouncing
  useEffect(() => {
    if (!programSearch || programSearch.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const searchPrograms = async () => {
      setLoadingSearch(true);
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('id, name, university, country, city, tuition_fee, duration')
          .or(`name.ilike.%${programSearch}%,university.ilike.%${programSearch}%,country.ilike.%${programSearch}%`)
          .limit(10);

        if (!error && data) {
          setSearchResults(data);
          setShowSearchDropdown(true);
        }
      } catch (error) {
        console.error('Error searching programs:', error);
      } finally {
        setLoadingSearch(false);
      }
    };

    const debounceTimer = setTimeout(searchPrograms, 300);
    return () => clearTimeout(debounceTimer);
  }, [programSearch]);

  // Fetch program tuition if programId is provided
  useEffect(() => {
    const fetchProgramTuition = async () => {
      if (!programId) return;
      setLoadingProgram(true);
      try {
        const { data: program, error } = await import('../../lib/supabase').then(m =>
          m.supabase.from('programs').select('tuition_fee').eq('id', programId).single()
        );

        if (program && !error) {
          setCosts(prev => ({
            ...prev,
            tuition: program.tuition_fee / 12 // Convert annual to monthly
          }));
        }
      } catch (error) {
        console.error('Error fetching program tuition:', error);
      } finally {
        setLoadingProgram(false);
      }
    };
    fetchProgramTuition();
  }, [programId]);

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

  // Handler for selecting a program from search results
  const handleSelectProgram = (program: any) => {
    setSelectedProgram(program);
    setProgramSearch(program.name);
    setShowSearchDropdown(false);

    // Update destination country and city
    if (program.country) {
      setDestCountry(program.country);
    }
    if (program.city) {
      setDestCity(program.city);
    }

    // Update tuition if available
    if (program.tuition_fee) {
      setCosts(prev => ({
        ...prev,
        tuition: program.tuition_fee / 12 // Convert annual to monthly
      }));
    }
  };

  // Handler for clearing selected program
  const handleClearProgram = () => {
    setSelectedProgram(null);
    setProgramSearch('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

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

      {/* Program Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <GraduationCap className="w-4 h-4 mr-2" />
            Search for a Program (Optional)
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Search and select a program to auto-populate tuition and location data
          </p>

          <div className="relative" ref={searchDropdownRef}>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={programSearch}
                onChange={(e) => setProgramSearch(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchDropdown(true);
                }}
                placeholder="Search by program name, university, or country..."
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {selectedProgram && (
                <button
                  onClick={handleClearProgram}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Clear selection"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              {loadingSearch && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {searchResults.map((program) => (
                  <button
                    key={program.id}
                    onClick={() => handleSelectProgram(program)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{program.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {program.university} • {program.country}
                      {program.city && ` • ${program.city}`}
                    </div>
                    {program.tuition_fee && (
                      <div className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                        Tuition: ${program.tuition_fee.toLocaleString()}/year
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Program Display */}
        {selectedProgram && (
          <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                  <GraduationCap className="w-4 h-4 mr-1" />
                  Selected Program
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{selectedProgram.name}</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedProgram.university} • {selectedProgram.country}
                  {selectedProgram.city && ` • ${selectedProgram.city}`}
                </div>
                {selectedProgram.tuition_fee && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    <span className="font-medium">Annual Tuition:</span> ${selectedProgram.tuition_fee.toLocaleString()}
                  </div>
                )}
              </div>
              <button
                onClick={handleClearProgram}
                className="ml-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Clear selection"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Country/City Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Home Country
            </label>
            <select
              value={homeCountry}
              onChange={(e) => setHomeCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="NGA">Nigeria (NGN)</option>
              <option value="GHA">Ghana (GHS)</option>
              <option value="KEN">Kenya (KES)</option>
              <option value="ZAF">South Africa (ZAR)</option>
              <option value="EGY">Egypt (EGP)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Destination Country
            </label>
            <select
              value={destCountry}
              onChange={(e) => setDestCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
              disabled={!!selectedProgram}
            >
              <option value="USA">United States</option>
              <option value="CAN">Canada</option>
              <option value="GBR">United Kingdom</option>
              <option value="AUS">Australia</option>
              <option value="DEU">Germany</option>
            </select>
            {selectedProgram && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Auto-populated from selected program
              </p>
            )}
          </div>
        </div>
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="inline-flex p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mb-3">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">First Year Total</h3>
                <DualCurrencyDisplay
                  amountUSD={breakdown.totalFirstYear}
                  destinationCountry={destCountry}
                  homeCountry={homeCountry}
                  size="xl"
                />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="inline-flex p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 mb-3">
                  <Home className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Monthly Living</h3>
                <DualCurrencyDisplay
                  amountUSD={breakdown.totalMonthlyRecurring}
                  destinationCountry={destCountry}
                  homeCountry={homeCountry}
                  size="xl"
                />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="inline-flex p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 mb-3">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Emergency Fund</h3>
                <DualCurrencyDisplay
                  amountUSD={breakdown.emergencyFund}
                  destinationCountry={destCountry}
                  homeCountry={homeCountry}
                  size="xl"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Cost Distribution
              </h3>
              <div className="space-y-3">
                <CostBar label="Pre-Departure Costs" amount={breakdown.totalPreDeparture} total={breakdown.totalFirstYear} color="bg-blue-500" />
                <CostBar label="Setup Costs" amount={breakdown.totalSetup} total={breakdown.totalFirstYear} color="bg-purple-500" />
                <CostBar label="Tuition (Annual)" amount={costs.tuition * 12} total={breakdown.totalFirstYear} color="bg-green-500" />
                <CostBar label="Living Costs (Annual)" amount={(breakdown.totalMonthlyRecurring - costs.tuition) * 12} total={breakdown.totalFirstYear} color="bg-yellow-500" />
                <CostBar label="Return Flights" amount={costs.annualReturnFlights} total={breakdown.totalFirstYear} color="bg-pink-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Cost Breakdown (Pie Chart)
                </h3>
                <CostDistributionPie breakdown={breakdown} isDark={isDark} />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  One-Time vs Recurring
                </h3>
                <OneTimeVsRecurringBar breakdown={breakdown} isDark={isDark} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                12-Month Payment Timeline
              </h3>
              <PaymentTimelineChart breakdown={breakdown} isDark={isDark} />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <Info className="w-4 h-4 inline mr-2" />
                <strong>Budget Planning Tip:</strong> This estimate includes a 10% emergency fund for unexpected expenses.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'pre-departure' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">One-time costs before leaving your home country.</p>
            <CostInputField label="Visa Application Fees" value={costs.visaFees} onChange={(val) => setCosts(prev => ({ ...prev, visaFees: val }))} icon={<FileText className="w-4 h-4" />} loading={loadingCountry} exchangeRate={breakdown.exchangeRate} />
            <CostInputField label="Medical Examinations" value={costs.medicalExams} onChange={(val) => setCosts(prev => ({ ...prev, medicalExams: val }))} icon={<Building2 className="w-4 h-4" />} description="Required health checks and vaccinations" exchangeRate={breakdown.exchangeRate} />
            <CostInputField label="Language Tests (IELTS/TOEFL)" value={costs.languageTests} onChange={(val) => setCosts(prev => ({ ...prev, languageTests: val }))} icon={<FileText className="w-4 h-4" />} exchangeRate={breakdown.exchangeRate} />
            <CostInputField label="Document Attestation" value={costs.documentAttestation} onChange={(val) => setCosts(prev => ({ ...prev, documentAttestation: val }))} icon={<FileText className="w-4 h-4" />} description="Notarization and certification" exchangeRate={breakdown.exchangeRate} />
            <CostInputField label="Initial Flight Ticket" value={costs.initialFlightTicket} onChange={(val) => setCosts(prev => ({ ...prev, initialFlightTicket: val }))} icon={<Plane className="w-4 h-4" />} loading={loadingFlight} exchangeRate={breakdown.exchangeRate} />

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-white">Total Pre-Departure</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">${breakdown.totalPreDeparture.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">≈ ₦{(breakdown.totalPreDeparture * breakdown.exchangeRate).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">One-time costs in your first month at destination.</p>
            <CostInputField label="Security/Rent Deposit" value={costs.securityDeposit} onChange={(val) => setCosts(prev => ({ ...prev, securityDeposit: val }))} icon={<Home className="w-4 h-4" />} description="Usually 1-2 months rent (refundable)" exchangeRate={breakdown.exchangeRate} />
            <CostInputField label="Furniture & Household Items" value={costs.furniture} onChange={(val) => setCosts(prev => ({ ...prev, furniture: val }))} icon={<Home className="w-4 h-4" />} exchangeRate={breakdown.exchangeRate} />
            <CostInputField label="Initial Groceries & Supplies" value={costs.initialGroceries} onChange={(val) => setCosts(prev => ({ ...prev, initialGroceries: val }))} icon={<Building2 className="w-4 h-4" />} exchangeRate={breakdown.exchangeRate} />
            <CostInputField label="Textbooks & Course Materials" value={costs.textbooks} onChange={(val) => setCosts(prev => ({ ...prev, textbooks: val }))} icon={<FileText className="w-4 h-4" />} exchangeRate={breakdown.exchangeRate} />

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-white">Total Setup Costs</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">${breakdown.totalSetup.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">≈ ₦{(breakdown.totalSetup * breakdown.exchangeRate).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recurring' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Monthly costs throughout your program.</p>
            <CostInputField label="Tuition (Monthly Portion)" value={costs.tuition} onChange={(val) => setCosts(prev => ({ ...prev, tuition: val }))} icon={<Building2 className="w-4 h-4" />} description={`Annual: $${(costs.tuition * 12).toLocaleString()}`} isMonthly exchangeRate={breakdown.exchangeRate} />
            <CostInputField label="Accommodation/Rent" value={costs.accommodation} onChange={(val) => setCosts(prev => ({ ...prev, accommodation: val }))} icon={<Home className="w-4 h-4" />} loading={loadingCity} isMonthly exchangeRate={breakdown.exchangeRate} />
            <CostInputField label="Food & Groceries" value={costs.food} onChange={(val) => setCosts(prev => ({ ...prev, food: val }))} icon={<Building2 className="w-4 h-4" />} loading={loadingCity} isMonthly exchangeRate={breakdown.exchangeRate} />
            <CostInputField label="Transportation" value={costs.transport} onChange={(val) => setCosts(prev => ({ ...prev, transport: val }))} icon={<MapPin className="w-4 h-4" />} loading={loadingCity} isMonthly exchangeRate={breakdown.exchangeRate} />
            <CostInputField label="Utilities" value={costs.utilities} onChange={(val) => setCosts(prev => ({ ...prev, utilities: val }))} icon={<Building2 className="w-4 h-4" />} loading={loadingCity} isMonthly exchangeRate={breakdown.exchangeRate} />
            <CostInputField label="Phone & Internet" value={costs.phoneInternet} onChange={(val) => setCosts(prev => ({ ...prev, phoneInternet: val }))} icon={<Globe className="w-4 h-4" />} isMonthly exchangeRate={breakdown.exchangeRate} />
            <CostInputField label="Health Insurance" value={costs.healthInsurance} onChange={(val) => setCosts(prev => ({ ...prev, healthInsurance: val }))} icon={<Building2 className="w-4 h-4" />} description={`Annual: $${(costs.healthInsurance * 12).toLocaleString()}`} loading={loadingCountry} isMonthly exchangeRate={breakdown.exchangeRate} />
            <CostInputField label="Entertainment & Personal" value={costs.entertainment} onChange={(val) => setCosts(prev => ({ ...prev, entertainment: val }))} icon={<TrendingUp className="w-4 h-4" />} loading={loadingCity} isMonthly exchangeRate={breakdown.exchangeRate} />

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-white">Total Monthly</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">${breakdown.totalMonthlyRecurring.toLocaleString()}/mo</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">≈ ₦{(breakdown.totalMonthlyRecurring * breakdown.exchangeRate).toLocaleString()}/mo</div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Annual Total</span>
                  <span className="font-medium text-gray-900 dark:text-white">${(breakdown.totalMonthlyRecurring * 12).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Month-by-month payment breakdown for your first year.</p>
            <div className="space-y-2">
              {Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                const monthName = new Date(2024, i).toLocaleString('default', { month: 'long' });
                let monthlyTotal = breakdown.totalMonthlyRecurring;
                const payments: Array<{ category: string; amount: number }> = [{ category: 'Monthly Expenses', amount: breakdown.totalMonthlyRecurring }];

                if (month === 1) {
                  payments.push({ category: 'Pre-Departure', amount: breakdown.totalPreDeparture });
                  payments.push({ category: 'Setup', amount: breakdown.totalSetup });
                  monthlyTotal += breakdown.totalPreDeparture + breakdown.totalSetup;
                }
                if (month === 12) {
                  payments.push({ category: 'Return Flight', amount: costs.annualReturnFlights });
                  monthlyTotal += costs.annualReturnFlights;
                }

                return (
                  <div key={month} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">Month {month} - {monthName}</span>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{payments.length} payment{payments.length !== 1 ? 's' : ''}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-white">${monthlyTotal.toLocaleString()}</div>
                      </div>
                    </div>
                    {payments.map((payment, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-1 border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                        <span className="text-gray-600 dark:text-gray-400">{payment.category}</span>
                        <span className="text-gray-900 dark:text-white">${payment.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            const dataStr = JSON.stringify(breakdown, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `cost-estimate-${Date.now()}.json`;
            link.click();
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Estimate
        </button>
      </div>
    </div>
  );
};

const CostBar: React.FC<{ label: string; amount: number; total: number; color: string }> = ({ label, amount, total, color }) => {
  const percentage = (amount / total) * 100;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">${amount.toLocaleString()} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const CostInputField: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  description?: string;
  loading?: boolean;
  isMonthly?: boolean;
  exchangeRate: number;
}> = ({ label, value, onChange, icon, description, loading = false, isMonthly = false, exchangeRate }) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
        {icon}
        <span className="ml-2">{label}</span>
        {loading && <span className="ml-2 text-xs text-gray-500">(updating...)</span>}
      </label>
      {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400 text-base font-medium">$</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
          disabled={loading}
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          ≈ ₦{(value * exchangeRate).toLocaleString()}{isMonthly && '/month'}
        </div>
      </div>
    </div>
  );
};

export default CostCalculator;