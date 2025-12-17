import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Filter, X, Search, MapPin, DollarSign, BookOpen, Clock } from 'lucide-react';
import { formatNGN, convertUSDToNGN } from '../../utils/currency';
import { useIsMobile, useReducedData } from '../../hooks/useResponsive';
import { useDarkMode } from '../../hooks/useDarkMode';

// ======================================
// TYPES AND INTERFACES
// ======================================

export interface FilterOptions {
  countries: string[];
  budgetRange: [number, number]; // USD amounts
  specializations: string[];
  degreeTypes: string[];
  duration: string[];
  startDate?: string;
  scholarshipOnly: boolean;
}

interface SearchFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  isLoading?: boolean;
  resultCount?: number;
  className?: string;
}

// ======================================
// CONSTANTS AND DATA
// ======================================

// Cached filter data for offline capability
const COUNTRIES_DATA = [
  { code: 'US', name: 'United States', flag: '🇺🇸', count: 2847 },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', count: 1923 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', count: 1456 },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', count: 892 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', count: 743 },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', count: 512 },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', count: 389 },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', count: 267 },
  { code: 'FR', name: 'France', flag: '🇫🇷', count: 654 },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', count: 198 }
];

const SPECIALIZATIONS_DATA = [
  { name: 'Computer Science', count: 1284 },
  { name: 'Engineering', count: 956 },
  { name: 'Business Administration', count: 834 },
  { name: 'Data Science', count: 723 },
  { name: 'Medicine', count: 567 },
  { name: 'Finance', count: 445 },
  { name: 'Marketing', count: 389 },
  { name: 'Psychology', count: 334 },
  { name: 'Education', count: 278 },
  { name: 'Law', count: 234 }
];

const DEGREE_TYPES = [
  { value: 'bachelor', label: 'Bachelor\'s Degree', count: 2145 },
  { value: 'master', label: 'Master\'s Degree', count: 3267 },
  { value: 'phd', label: 'PhD/Doctorate', count: 892 }
];

const DURATION_OPTIONS = [
  { value: '1 year', label: '1 Year', count: 1234 },
  { value: '2 years', label: '2 Years', count: 2156 },
  { value: '3 years', label: '3 Years', count: 1567 },
  { value: '4 years', label: '4 Years', count: 945 }
];

// Budget ranges in USD
const BUDGET_RANGES = [
  { min: 0, max: 10000, label: 'Under $10K' },
  { min: 10000, max: 25000, label: '$10K - $25K' },
  { min: 25000, max: 50000, label: '$25K - $50K' },
  { min: 50000, max: 100000, label: '$50K - $100K' },
  { min: 100000, max: 200000, label: '$100K+' }
];

// ======================================
// MAIN COMPONENT
// ======================================

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  isLoading = false,
  resultCount = 0,
  className = ''
}) => {
  const isMobile = useIsMobile();
  const { shouldDisableAnimations, maxResults } = useReducedData();
  const { isDark } = useDarkMode();

  // Local state for UI
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [searchQueries, setSearchQueries] = useState({
    country: '',
    specialization: ''
  });

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!searchQueries.country) return COUNTRIES_DATA;
    return COUNTRIES_DATA.filter(country =>
      country.name.toLowerCase().includes(searchQueries.country.toLowerCase())
    );
  }, [searchQueries.country]);

  // Filter specializations based on search
  const filteredSpecializations = useMemo(() => {
    if (!searchQueries.specialization) return SPECIALIZATIONS_DATA;
    return SPECIALIZATIONS_DATA.filter(spec =>
      spec.name.toLowerCase().includes(searchQueries.specialization.toLowerCase())
    );
  }, [searchQueries.specialization]);

  // Handle filter updates
  const updateFilters = useCallback((updates: Partial<FilterOptions>) => {
    onFiltersChange({ ...filters, ...updates });
  }, [filters, onFiltersChange]);

  // Handle country selection
  const handleCountryToggle = useCallback((countryName: string) => {
    const newCountries = filters.countries.includes(countryName)
      ? filters.countries.filter(c => c !== countryName)
      : [...filters.countries, countryName];
    updateFilters({ countries: newCountries });
  }, [filters.countries, updateFilters]);

  // Handle specialization selection
  const handleSpecializationToggle = useCallback((specialization: string) => {
    const newSpecs = filters.specializations.includes(specialization)
      ? filters.specializations.filter(s => s !== specialization)
      : [...filters.specializations, specialization];
    updateFilters({ specializations: newSpecs });
  }, [filters.specializations, updateFilters]);

  // Handle degree type selection
  const handleDegreeTypeToggle = useCallback((degreeType: string) => {
    const newTypes = filters.degreeTypes.includes(degreeType)
      ? filters.degreeTypes.filter(t => t !== degreeType)
      : [...filters.degreeTypes, degreeType];
    updateFilters({ degreeTypes: newTypes });
  }, [filters.degreeTypes, updateFilters]);

  // Handle duration selection
  const handleDurationToggle = useCallback((duration: string) => {
    const newDurations = filters.duration.includes(duration)
      ? filters.duration.filter(d => d !== duration)
      : [...filters.duration, duration];
    updateFilters({ duration: newDurations });
  }, [filters.duration, updateFilters]);

  // Handle budget range change
  const handleBudgetChange = useCallback((range: [number, number]) => {
    updateFilters({ budgetRange: range });
  }, [updateFilters]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      countries: [],
      budgetRange: [0, 200000],
      specializations: [],
      degreeTypes: [],
      duration: [],
      scholarshipOnly: false
    });
    setSearchQueries({ country: '', specialization: '' });
  }, [onFiltersChange]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.countries.length > 0) count++;
    if (filters.specializations.length > 0) count++;
    if (filters.degreeTypes.length > 0) count++;
    if (filters.duration.length > 0) count++;
    if (filters.budgetRange[0] > 0 || filters.budgetRange[1] < 200000) count++;
    if (filters.scholarshipOnly) count++;
    return count;
  }, [filters]);

  // Convert budget to NGN for display
  const budgetNGN = useMemo(() => [
    convertUSDToNGN(filters.budgetRange[0]) as number,
    convertUSDToNGN(filters.budgetRange[1]) as number
  ], [filters.budgetRange]);

  return (
    <div className={`bg-card rounded-lg border border-border ${className}`}>
      {/* Mobile Header */}
      {isMobile && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
          aria-expanded={isExpanded}
          aria-label="Toggle search filters"
        >
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <span className="font-medium text-foreground">
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </span>
          </div>
          <div className="flex items-center">
            {resultCount > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                {resultCount.toLocaleString()} results
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </button>
      )}

      {/* Filter Content */}
      <div className={`${isMobile && !isExpanded ? 'hidden' : 'block'}`}>
        <div className="p-4 space-y-6">
          {/* Desktop Header */}
          {!isMobile && (
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Search Filters
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium focus:outline-none"
                  aria-label="Clear all filters"
                >
                  Clear all ({activeFilterCount})
                </button>
              )}
            </div>
          )}

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Country
            </label>
            <div className="space-y-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchQueries.country}
                  onChange={(e) => setSearchQueries(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredCountries.slice(0, maxResults).map((country) => (
                  <label key={country.code} className="flex items-center p-2 hover:bg-muted dark:hover:bg-gray-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.countries.includes(country.name)}
                      onChange={() => handleCountryToggle(country.name)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <span className="ml-2 text-sm text-foreground dark:text-gray-300">
                      <span className="mr-2">{country.flag}</span>
                      {country.name}
                      <span className="text-gray-500 dark:text-gray-400 ml-1">({country.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Budget Range Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Budget Range (Annual Tuition)
            </label>
            <div className="space-y-3">
              {/* Current Range Display */}
              <div className="text-sm text-muted-foreground p-3 bg-muted dark:bg-gray-700 rounded">
                <div className="font-medium text-indigo-600 dark:text-indigo-400">
                  {formatNGN(budgetNGN[0], { compact: isMobile, decimals: 0 })} - {formatNGN(budgetNGN[1], { compact: isMobile, decimals: 0 })}
                </div>
                <div className="text-xs">
                  ≈ ${filters.budgetRange[0].toLocaleString()} - ${filters.budgetRange[1].toLocaleString()} USD
                </div>
              </div>

              {/* Quick Budget Ranges */}
              <div className="grid grid-cols-1 gap-1">
                {BUDGET_RANGES.map((range) => (
                  <button
                    key={`${range.min}-${range.max}`}
                    onClick={() => handleBudgetChange([range.min, range.max])}
                    className={`text-left p-2 text-sm rounded transition-colors ${
                      filters.budgetRange[0] === range.min && filters.budgetRange[1] === range.max
                        ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'hover:bg-muted dark:hover:bg-gray-700 text-foreground dark:text-gray-300'
                    }`}
                  >
                    {range.label}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNGN(convertUSDToNGN(range.min) as number, { compact: true, decimals: 0 })} - {formatNGN(convertUSDToNGN(range.max) as number, { compact: true, decimals: 0 })}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Specialization Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-2">
              <BookOpen className="h-4 w-4 inline mr-1" />
              Specialization
            </label>
            <div className="space-y-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search specializations..."
                  value={searchQueries.specialization}
                  onChange={(e) => setSearchQueries(prev => ({ ...prev, specialization: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredSpecializations.slice(0, maxResults).map((spec) => (
                  <label key={spec.name} className="flex items-center p-2 hover:bg-muted dark:hover:bg-gray-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.specializations.includes(spec.name)}
                      onChange={() => handleSpecializationToggle(spec.name)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <span className="ml-2 text-sm text-foreground dark:text-gray-300">
                      {spec.name}
                      <span className="text-gray-500 dark:text-gray-400 ml-1">({spec.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Degree Type Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-2">
              Degree Type
            </label>
            <div className="space-y-1">
              {DEGREE_TYPES.map((degree) => (
                <label key={degree.value} className="flex items-center p-2 hover:bg-muted dark:hover:bg-gray-700 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.degreeTypes.includes(degree.value)}
                    onChange={() => handleDegreeTypeToggle(degree.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <span className="ml-2 text-sm text-foreground dark:text-gray-300">
                    {degree.label}
                    <span className="text-gray-500 dark:text-gray-400 ml-1">({degree.count})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              Duration
            </label>
            <div className="space-y-1">
              {DURATION_OPTIONS.map((duration) => (
                <label key={duration.value} className="flex items-center p-2 hover:bg-muted dark:hover:bg-gray-700 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.duration.includes(duration.value)}
                    onChange={() => handleDurationToggle(duration.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <span className="ml-2 text-sm text-foreground dark:text-gray-300">
                    {duration.label}
                    <span className="text-gray-500 dark:text-gray-400 ml-1">({duration.count})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Scholarship Filter */}
          <div>
            <label className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <input
                type="checkbox"
                checked={filters.scholarshipOnly}
                onChange={(e) => updateFilters({ scholarshipOnly: e.target.checked })}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <span className="ml-2 text-sm font-medium text-green-700 dark:text-green-300">
                Show only programs with scholarships
              </span>
            </label>
          </div>

          {/* Mobile Clear All Button */}
          {isMobile && activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="w-full py-2 px-4 bg-muted dark:bg-gray-700 text-foreground dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
            >
              Clear all filters ({activeFilterCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;