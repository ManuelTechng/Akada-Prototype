import React, { useState, useMemo } from 'react';
import { DollarSign, Home, Plane, FileText, Download, Calculator, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { formatNGN, convertUSDToNGN, formatCompactCurrency } from '../../utils/currency';
import { useIsMobile, useReducedData } from '../../hooks/useResponsive';
import { useDarkMode } from '../../hooks/useDarkMode';

// ======================================
// TYPES AND INTERFACES
// ======================================

export interface CostBreakdown {
  tuition: number;           // Annual tuition in USD
  livingExpenses: number;    // Monthly living expenses in USD
  visaFees: number;         // One-time visa fees in USD
  applicationFees: number;   // Application fees in USD
  insurance: number;         // Annual insurance in USD
  books: number;            // Annual books/supplies in USD
  transport: number;        // Monthly transport in USD
  miscellaneous: number;    // Monthly miscellaneous in USD
}

export interface CostCalculatorProps {
  initialCosts?: Partial<CostBreakdown>;
  programDuration?: number; // Duration in years
  country?: string;
  city?: string;
  onCostsChange?: (costs: CostBreakdown, totalNGN: number) => void;
  className?: string;
}

// ======================================
// CONSTANTS AND DEFAULT VALUES
// ======================================

const DEFAULT_COSTS: CostBreakdown = {
  tuition: 25000,
  livingExpenses: 1200,
  visaFees: 350,
  applicationFees: 100,
  insurance: 800,
  books: 1000,
  transport: 100,
  miscellaneous: 300
};

// Cost data by country for realistic estimates
const COUNTRY_COSTS: Record<string, Partial<CostBreakdown>> = {
  'United States': {
    tuition: 35000,
    livingExpenses: 1500,
    visaFees: 350,
    insurance: 1200,
    transport: 120
  },
  'United Kingdom': {
    tuition: 28000,
    livingExpenses: 1300,
    visaFees: 400,
    insurance: 600,
    transport: 80
  },
  'Canada': {
    tuition: 22000,
    livingExpenses: 1100,
    visaFees: 230,
    insurance: 800,
    transport: 90
  },
  'Australia': {
    tuition: 30000,
    livingExpenses: 1400,
    visaFees: 450,
    insurance: 650,
    transport: 110
  },
  'Germany': {
    tuition: 500, // Very low tuition fees
    livingExpenses: 900,
    visaFees: 75,
    insurance: 400,
    transport: 70
  },
  'Netherlands': {
    tuition: 18000,
    livingExpenses: 1000,
    visaFees: 200,
    insurance: 450,
    transport: 75
  }
};

// ======================================
// MAIN COMPONENT
// ======================================

const CostCalculator: React.FC<CostCalculatorProps> = ({
  initialCosts = {},
  programDuration = 2,
  country = 'United States',
  city = '',
  onCostsChange,
  className = ''
}) => {
  const isMobile = useIsMobile();
  const { shouldDisableAnimations } = useReducedData();
  const { isDark } = useDarkMode();

  // Merge initial costs with defaults and country-specific data
  const [costs, setCosts] = useState<CostBreakdown>(() => {
    const countryCosts = COUNTRY_COSTS[country] || {};
    return {
      ...DEFAULT_COSTS,
      ...countryCosts,
      ...initialCosts
    };
  });

  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'calculator' | 'breakdown'>('calculator');

  // Calculate totals
  const totals = useMemo(() => {
    const annualLiving = (costs.livingExpenses + costs.transport + costs.miscellaneous) * 12;
    const totalAnnualUSD = costs.tuition + annualLiving + costs.insurance + costs.books;
    const totalProgramUSD = (totalAnnualUSD * programDuration) + costs.visaFees + costs.applicationFees;
    
    const totalAnnualNGN = convertUSDToNGN(totalAnnualUSD) as number;
    const totalProgramNGN = convertUSDToNGN(totalProgramUSD) as number;

    return {
      annualUSD: totalAnnualUSD,
      programUSD: totalProgramUSD,
      annualNGN: totalAnnualNGN,
      programNGN: totalProgramNGN,
      monthlyLivingUSD: costs.livingExpenses + costs.transport + costs.miscellaneous,
      monthlyLivingNGN: convertUSDToNGN(costs.livingExpenses + costs.transport + costs.miscellaneous) as number
    };
  }, [costs, programDuration]);

  // Update costs and notify parent
  const updateCosts = (updates: Partial<CostBreakdown>) => {
    const newCosts = { ...costs, ...updates };
    setCosts(newCosts);
    if (onCostsChange) {
      const totalNGN = convertUSDToNGN(
        (newCosts.tuition + 
         (newCosts.livingExpenses + newCosts.transport + newCosts.miscellaneous) * 12 + 
         newCosts.insurance + newCosts.books) * programDuration + 
        newCosts.visaFees + newCosts.applicationFees
      ) as number;
      onCostsChange(newCosts, totalNGN);
    }
  };

  // Cost input component
  const CostInput: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    icon: React.ReactNode;
    isMonthly?: boolean;
    placeholder?: string;
  }> = ({ label, value, onChange, icon, isMonthly = false, placeholder }) => (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
        {icon}
        <span className="ml-2">{label} {isMonthly && '(Monthly)'}</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          placeholder={placeholder}
          className="w-full pl-8 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          ≈ {formatNGN(convertUSDToNGN(value) as number, { compact: isMobile, decimals: 0 })}
          {isMonthly && '/month'}
        </div>
      </div>
    </div>
  );

  // Export functionality (placeholder)
  const handleExport = () => {
    const exportData = {
      country,
      city,
      programDuration,
      costs,
      totals,
      generatedAt: new Date().toISOString()
    };
    
    // Create downloadable JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cost-calculation-${country.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calculator className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Cost Calculator
            </h3>
            {city && (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                • {city}, {country}
              </span>
            )}
          </div>
          {!isMobile && (
            <button
              onClick={handleExport}
              className="flex items-center px-3 py-1.5 text-sm bg-indigo-600 dark:bg-indigo-500 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              aria-label="Export cost calculation"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          )}
        </div>

        {/* Program Duration Selector */}
        <div className="mt-3 flex items-center space-x-4">
          <label className="text-sm text-gray-600 dark:text-gray-400">Program Duration:</label>
          <select
            value={programDuration}
            onChange={(e) => {
              const duration = Number(e.target.value);
              // Trigger recalculation with new duration
              updateCosts({});
            }}
            className="text-sm border border-gray-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={1}>1 Year</option>
            <option value={2}>2 Years</option>
            <option value={3}>3 Years</option>
            <option value={4}>4 Years</option>
          </select>
        </div>
      </div>

      {/* Mobile Tabs */}
      {isMobile && (
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'calculator'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'breakdown'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Breakdown
          </button>
        </div>
      )}

      <div className="p-4">
        {/* Calculator Section */}
        {(!isMobile || activeTab === 'calculator') && (
          <div className="space-y-6">
            {/* Cost Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CostInput
                label="Annual Tuition"
                value={costs.tuition}
                onChange={(value) => updateCosts({ tuition: value })}
                icon={<DollarSign className="h-4 w-4" />}
                placeholder="25000"
              />
              
              <CostInput
                label="Living Expenses"
                value={costs.livingExpenses}
                onChange={(value) => updateCosts({ livingExpenses: value })}
                icon={<Home className="h-4 w-4" />}
                isMonthly
                placeholder="1200"
              />
              
              <CostInput
                label="Visa Application"
                value={costs.visaFees}
                onChange={(value) => updateCosts({ visaFees: value })}
                icon={<Plane className="h-4 w-4" />}
                placeholder="350"
              />
              
              <CostInput
                label="Application Fees"
                value={costs.applicationFees}
                onChange={(value) => updateCosts({ applicationFees: value })}
                icon={<FileText className="h-4 w-4" />}
                placeholder="100"
              />
              
              <CostInput
                label="Health Insurance"
                value={costs.insurance}
                onChange={(value) => updateCosts({ insurance: value })}
                icon={<Info className="h-4 w-4" />}
                placeholder="800"
              />
              
              <CostInput
                label="Books & Supplies"
                value={costs.books}
                onChange={(value) => updateCosts({ books: value })}
                icon={<FileText className="h-4 w-4" />}
                placeholder="1000"
              />
              
              <CostInput
                label="Transportation"
                value={costs.transport}
                onChange={(value) => updateCosts({ transport: value })}
                icon={<Plane className="h-4 w-4" />}
                isMonthly
                placeholder="100"
              />
              
              <CostInput
                label="Miscellaneous"
                value={costs.miscellaneous}
                onChange={(value) => updateCosts({ miscellaneous: value })}
                icon={<DollarSign className="h-4 w-4" />}
                isMonthly
                placeholder="300"
              />
            </div>
          </div>
        )}

        {/* Breakdown Section */}
        {(!isMobile || activeTab === 'breakdown') && (
          <div className="space-y-6">
            {/* Total Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Annual Costs */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Annual Costs</h4>
                <div className="space-y-1">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {formatNGN(totals.annualNGN, { compact: isMobile, decimals: 0 })}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    ≈ ${totals.annualUSD.toLocaleString()}/year
                  </div>
                </div>
              </div>

              {/* Total Program Costs */}
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2">
                  Total Program ({programDuration} year{programDuration > 1 ? 's' : ''})
                </h4>
                <div className="space-y-1">
                  <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {formatNGN(totals.programNGN, { compact: isMobile, decimals: 0 })}
                  </div>
                  <div className="text-sm text-indigo-700 dark:text-indigo-300">
                    ≈ ${totals.programUSD.toLocaleString()} total
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Cost Breakdown</h4>
              
              {/* Academic Costs */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Academic Costs</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tuition ({programDuration} years)</span>
                    <span className="font-medium">
                      {formatNGN(convertUSDToNGN(costs.tuition * programDuration) as number, { compact: isMobile })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Books & Supplies ({programDuration} years)</span>
                    <span className="font-medium">
                      {formatNGN(convertUSDToNGN(costs.books * programDuration) as number, { compact: isMobile })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Application Fees</span>
                    <span className="font-medium">
                      {formatNGN(convertUSDToNGN(costs.applicationFees) as number, { compact: isMobile })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Living Costs */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Living Costs</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Accommodation (monthly)</span>
                    <span className="font-medium">
                      {formatNGN(convertUSDToNGN(costs.livingExpenses) as number, { compact: isMobile })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Transportation (monthly)</span>
                    <span className="font-medium">
                      {formatNGN(convertUSDToNGN(costs.transport) as number, { compact: isMobile })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Miscellaneous (monthly)</span>
                    <span className="font-medium">
                      {formatNGN(convertUSDToNGN(costs.miscellaneous) as number, { compact: isMobile })}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-700 dark:text-gray-300">Total Monthly Living</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {formatNGN(totals.monthlyLivingNGN, { compact: isMobile })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* One-time Costs */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3">One-time Costs</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Visa Fees</span>
                    <span className="font-medium">
                      {formatNGN(convertUSDToNGN(costs.visaFees) as number, { compact: isMobile })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Health Insurance ({programDuration} years)</span>
                    <span className="font-medium">
                      {formatNGN(convertUSDToNGN(costs.insurance * programDuration) as number, { compact: isMobile })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Export Button */}
            {isMobile && (
              <button
                onClick={handleExport}
                className="w-full py-3 px-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Calculation
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CostCalculator;