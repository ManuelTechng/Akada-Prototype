import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  GraduationCap, 
  DollarSign, 
  Calendar, 
  Star, 
  Share2, 
  X, 
  ChevronDown, 
  ChevronUp,
  ChevronRight,
  ArrowLeft,
  BookmarkIcon,
  Sliders,
  Calculator,
  ExternalLink,
  Info,
  Globe,
  Clock,
  BookOpen,
  Award,
  Menu
} from 'lucide-react';
import { searchPrograms } from '../lib/program';
import { convertCurrency, formatCurrency, getCountryCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import type { Program } from '../lib/types';

const ProgramSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    country: '',
    degreeType: '',
    maxTuition: 'any',
    field: '',
    scholarshipsOnly: false
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('match');
  const [error, setError] = useState<string | null>(null);
  const [savedPrograms, setSavedPrograms] = useState<string[]>([]);
  const [showUniversityDetails, setShowUniversityDetails] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await searchPrograms({
          query: searchQuery,
          country: filters.country || undefined,
          maxTuition: filters.maxTuition !== 'any' ? parseInt(filters.maxTuition) : undefined,
          degreeType: filters.degreeType || undefined,
          field: filters.field || undefined,
          scholarshipsOnly: filters.scholarshipsOnly,
          sortBy
        });
        
        setPrograms(results);
      } catch (error) {
        console.error('Error fetching programs:', error);
        setError('Failed to fetch programs. Please try again.');
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    // Update active filters
    const newActiveFilters: string[] = [];
    if (filters.country) newActiveFilters.push(`Country: ${filters.country}`);
    if (filters.degreeType) newActiveFilters.push(`Degree: ${filters.degreeType}`);
    if (filters.maxTuition !== 'any') {
      const tuitionLabels: { [key: string]: string } = {
        '0': 'Free (₦0)',
        '10000000': 'Under ₦10M',
        '25000000': '₦10M - ₦25M',
        '50000000': '₦25M - ₦50M', 
        '75000000': '₦50M - ₦75M',
        '100000000': '₦75M+'
      };
      newActiveFilters.push(`Tuition: ${tuitionLabels[filters.maxTuition] || filters.maxTuition}`);
    }
    if (filters.field) newActiveFilters.push(`Specialization: ${filters.field}`);
    if (filters.scholarshipsOnly) newActiveFilters.push('Scholarships Available');
    setActiveFilters(newActiveFilters);

    const debounceTimer = setTimeout(fetchPrograms, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters, sortBy]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRemoveFilter = (filter: string) => {
    const filterPrefix = filter.split(':')[0].trim();
    
    switch (filterPrefix) {
      case 'Country':
        handleFilterChange('country', '');
        break;
      case 'Degree':
        handleFilterChange('degreeType', '');
        break;
      case 'Tuition':
        handleFilterChange('maxTuition', 'any');
        break;
      case 'Specialization':
        handleFilterChange('field', '');
        break;
      case 'Scholarships Available':
        handleFilterChange('scholarshipsOnly', false);
        break;
    }
  };

  const clearAllFilters = () => {
    setFilters({
      country: '',
      degreeType: '',
      maxTuition: 'any',
      field: '',
      scholarshipsOnly: false
    });
    setSearchQuery('');
  };

  const toggleSaveProgram = (programId: string) => {
    setSavedPrograms(prev => 
      prev.includes(programId) 
        ? prev.filter(id => id !== programId) 
        : [...prev, programId]
    );
  };
  
  const toggleUniversityDetails = (programId: string) => {
    setShowUniversityDetails(prevId => prevId === programId ? null : programId);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.country) count++;
    if (filters.degreeType) count++;
    if (filters.maxTuition !== 'any') count++;
    if (filters.field) count++;
    if (filters.scholarshipsOnly) count++;
    return count;
  };

  // Desktop Sidebar Filters Component
  const DesktopFilters = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6 sticky top-6 z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Filters</h2>
        </div>
        {activeFilters.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active filters display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {activeFilters.map((filter) => (
            <div 
              key={filter} 
              className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full text-sm"
            >
              <span>{filter}</span>
              <button 
                onClick={() => handleRemoveFilter(filter)}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Country
          </label>
          <select
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-white text-gray-900 dark:text-gray-900"
          >
            <option value="">Any country</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="United States">United States</option>
            <option value="Australia">Australia</option>
            <option value="Germany">Germany</option>
            <option value="Norway">Norway</option>
            <option value="Singapore">Singapore</option>
            <option value="South Africa">South Africa</option>
            <option value="Nigeria">Nigeria</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Degree Type
          </label>
          <select
            value={filters.degreeType}
            onChange={(e) => handleFilterChange('degreeType', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-white text-gray-900 dark:text-gray-900"
          >
            <option value="">Any type</option>
            <option value="Master">Master's</option>
            <option value="Bachelor">Bachelor's</option>
            <option value="PhD">PhD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tuition Range (NGN)
          </label>
          <select
            value={filters.maxTuition}
            onChange={(e) => handleFilterChange('maxTuition', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-white text-gray-900 dark:text-gray-900"
          >
            <option value="any">Any range</option>
            <option value="0">Free (₦0)</option>
            <option value="10000000">Under ₦10 million</option>
            <option value="25000000">₦10M - ₦25M</option>
            <option value="50000000">₦25M - ₦50M</option>
            <option value="75000000">₦50M - ₦75M</option>
            <option value="100000000">₦75M+</option>
          </select>
        </div>

        {showAdvancedFilters && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Specialization
              </label>
              <select
                value={filters.field}
                onChange={(e) => handleFilterChange('field', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-white text-gray-900 dark:text-gray-900"
              >
                <option value="">Any specialization</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="scholarshipsOnly"
                checked={filters.scholarshipsOnly}
                onChange={(e) => handleFilterChange('scholarshipsOnly', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 bg-white dark:bg-gray-700"
              />
              <label htmlFor="scholarshipsOnly" className="text-sm text-gray-700 dark:text-gray-300">
                Only show programs with scholarships
              </label>
            </div>
          </>
        )}

        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-800 dark:hover:text-indigo-300"
        >
          {showAdvancedFilters ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Less filters
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              More filters
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Mobile Filters Modal
  const MobileFilters = () => (
    <div className={`fixed inset-0 z-50 ${showMobileFilters ? 'block' : 'hidden'} lg:hidden`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
            <button 
              onClick={() => setShowMobileFilters(false)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country
              </label>
              <select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 dark:text-gray-100"
              >
                <option value="">Any country</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Germany">Germany</option>
                <option value="Norway">Norway</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="Australia">Australia</option>
                <option value="Singapore">Singapore</option>
                <option value="South Africa">South Africa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget (Annual Tuition)
              </label>
              <select
                value={filters.maxTuition}
                onChange={(e) => handleFilterChange('maxTuition', e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 dark:text-gray-100"
              >
                <option value="any">Any budget</option>
                <option value="0">Free (NGN 0)</option>
                <option value="10000000">Under NGN 10M</option>
                <option value="25000000">NGN 10M - 25M</option>
                <option value="50000000">NGN 25M - 50M</option>
                <option value="75000000">NGN 50M - 75M</option>
                <option value="100000000">NGN 75M+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Degree Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Bachelor', 'Master', 'PhD'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleFilterChange('degreeType', filters.degreeType === type ? '' : type)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      filters.degreeType === type
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.scholarshipsOnly}
                  onChange={(e) => handleFilterChange('scholarshipsOnly', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 bg-white dark:bg-gray-800"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Funding Available</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Show programs with scholarships or financial aid</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={clearAllFilters}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="flex-1 py-3 px-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Desktop Program Card
  const DesktopProgramCard = (program: Program) => {
    const countryCurrency = getCountryCurrency(program.country);
    const localAmount = program.tuition_fee;
    const ngnAmount = convertCurrency(localAmount, countryCurrency, 'NGN');
    const isSaved = savedPrograms.includes(program.id);
    const isExpanded = showUniversityDetails === program.id;

    return (
      <div 
        key={program.id} 
        className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 overflow-hidden"
      >
        {/* Header Section */}
        <div className="p-8 pb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                  {program.degree_type}
                </span>
                {program.has_scholarships && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                    <Award className="h-3 w-3" />
                    Funding Available
                  </span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {program.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">{program.university}</p>
              {program.location && (
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">{program.location}</p>
              )}
            </div>
            <button
              onClick={() => toggleSaveProgram(program.id)}
              className={`p-3 rounded-xl transition-all ${
                isSaved 
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800' 
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-600'
              }`}
            >
              <Star className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Tuition Highlight */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700 dark:to-gray-600/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Annual Tuition</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(ngnAmount, 'NGN')}
                  </span>
                  {program.country !== 'Nigeria' && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ≈ {formatCurrency(localAmount, countryCurrency)}
                    </span>
                  )}
                </div>
              </div>
              {ngnAmount <= 10000000 && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300">
                  Affordable
                </span>
              )}
            </div>
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Country</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{program.country}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Duration</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{program.duration || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Specialization */}
          {program.specialization && (
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-100 dark:border-blue-800">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">{program.specialization}</span>
              </div>
            </div>
          )}

          {/* Requirements Preview */}
          {program.requirements && program.requirements.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Requirements</p>
              <div className="flex flex-wrap gap-2">
                {program.requirements.slice(0, 3).map((req: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                  >
                    <GraduationCap className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                    {req}
                  </span>
                ))}
                {program.requirements.length > 3 && (
                  <span className="inline-flex items-center px-3 py-1.5 text-gray-500 dark:text-gray-400 text-sm">
                    +{program.requirements.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Expanded Details */}
          {isExpanded && program.website && (
            <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">University Information</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{program.description}</p>
              <a 
                href={program.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-sm font-medium"
              >
                Visit Official Website
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
        
        {/* Action Footer */}
        <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleUniversityDetails(program.id)} 
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-medium"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Less Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    More Details
                  </>
                )}
              </button>
              <button className="inline-flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm">
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
            <button className="px-6 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium text-sm">
              View Program
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Mobile Program Card
  const MobileProgramCard = (program: Program) => {
    const countryCurrency = getCountryCurrency(program.country);
    const localAmount = program.tuition_fee;
    const ngnAmount = convertCurrency(localAmount, countryCurrency, 'NGN');
    const isSaved = savedPrograms.includes(program.id);
    const isAffordable = ngnAmount <= 10000000;
    const hasFunding = program.has_scholarships;

    return (
      <div 
        key={program.id} 
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 overflow-hidden"
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {program.degree_type}
                </span>
                {hasFunding && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Award className="h-3 w-3" />
                    Funding
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-1">
                {program.name}
              </h3>
              <p className="text-gray-600 text-sm font-medium">{program.university}</p>
            </div>
            <button
              onClick={() => toggleSaveProgram(program.id)}
              className={`p-2.5 rounded-xl transition-all ${
                isSaved 
                  ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' 
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 border border-gray-200'
              }`}
            >
              <Star className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Key Info */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-white rounded-lg">
                <Globe className="h-3.5 w-3.5 text-gray-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Country</p>
                <p className="text-sm font-medium text-gray-900 truncate">{program.country}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-white rounded-lg">
                <Clock className="h-3.5 w-3.5 text-gray-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-medium text-gray-900 truncate">{program.duration || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Specialization */}
          {program.specialization && (
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                <BookOpen className="h-3.5 w-3.5" />
                <span className="text-sm font-medium">{program.specialization}</span>
              </div>
            </div>
          )}

          {/* Tuition */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Annual Tuition</p>
                <div className="space-y-0.5">
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(ngnAmount, 'NGN')}
                  </p>
                  {program.country !== 'Nigeria' && (
                    <p className="text-xs text-gray-500">
                      Approx {formatCurrency(localAmount, countryCurrency)}
                    </p>
                  )}
                </div>
              </div>
              {isAffordable && (
                <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Affordable
                </span>
              )}
            </div>
          </div>

          {/* Requirements Preview */}
          {program.requirements && program.requirements.length > 0 && (
            <div className="mb-5">
              <p className="text-xs text-gray-500 mb-2">Key Requirements</p>
              <div className="flex flex-wrap gap-1.5">
                {program.requirements.slice(0, 2).map((req, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs">
                    <GraduationCap className="h-3 w-3 text-gray-400" />
                    {req}
                  </span>
                ))}
                {program.requirements.length > 2 && (
                  <span className="inline-flex items-center px-2.5 py-1 text-gray-500 text-xs">
                    +{program.requirements.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            View Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 -m-6">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Find Programs</h1>
              <p className="text-sm text-gray-500">Discover your perfect study abroad match</p>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search programs, universities, countries..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Mobile Filter Bar */}
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Filters
                {getActiveFilterCount() > 0 && (
                  <span className="ml-1 bg-indigo-600 text-white px-2 py-0.5 rounded-full text-xs">
                    {getActiveFilterCount()}
                  </span>
                )}
              </span>
            </button>
            
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block p-6">
        {/* Desktop Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <button 
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-heading">Find Your Program</h1>
            <p className="text-gray-500 dark:text-gray-400">Discover programs that match your profile and preferences</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/dashboard/calculator')} 
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
            >
              <Calculator className="h-5 w-5" />
              <span>Cost Calculator</span>
            </button>
            <button className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors inline-flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <span>Match Filters</span>
            </button>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search for programs, universities, or keywords..."
            className="block w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-white shadow-sm text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Desktop Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="xl:col-span-1">
            <DesktopFilters />
            
            {/* Tools section */}
            <div className="bg-indigo-600 dark:bg-indigo-700 rounded-xl shadow-sm p-6 text-white sticky top-[calc(100vh-200px)] z-10">
              <h2 className="font-semibold mb-4 text-lg">Need Help Finding Programs?</h2>
              <p className="text-indigo-100 dark:text-indigo-200 mb-4">
                Our AI assistant can help you discover programs that match your profile, preferences, and career goals.
              </p>
              <button className="w-full bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 mb-4">
                <Search className="h-5 w-5" />
                Get Personalized Suggestions
              </button>
              <button 
                onClick={() => navigate('/dashboard/calculator')}
                className="w-full bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Calculator className="h-5 w-5" />
                Calculate Education Costs
              </button>
            </div>
          </div>

          {/* Results Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Results Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                        <span>Searching...</span>
                      </div>
                    ) : error ? (
                      <span className="text-red-600 dark:text-red-400">{error}</span>
                    ) : (
                      `${programs.length} Programs Found`
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {programs.length > 0 && !loading && !error 
                      ? `Showing programs matching your criteria`
                      : ''}
                  </p>
                </div>
                
                <div className="flex gap-3 items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 dark:border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-white text-gray-900 dark:text-gray-900"
                  >
                    <option value="match">Best Match</option>
                    <option value="deadline">Deadline (Soonest)</option>
                    <option value="tuition-low">Tuition (Low to High)</option>
                    <option value="tuition-high">Tuition (High to Low)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Desktop Results */}
            {loading ? (
              <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Searching for programs that match your criteria...</p>
              </div>
            ) : error ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
                <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <X className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">Error</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : programs.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No Programs Found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search criteria or removing some filters.
                </p>
                <button 
                  onClick={clearAllFilters}
                  className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {programs.map(program => DesktopProgramCard(program))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden px-4 py-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {loading ? 'Searching...' : `${programs.length} Programs`}
            </h2>
            <p className="text-sm text-gray-500">
              {!loading && programs.length > 0 && 'Sorted by affordability'}
            </p>
          </div>
        </div>

        {/* Mobile Results */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-center">Finding the best programs for you...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-800 font-medium mb-2">Oops! Something went wrong</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && programs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No programs found</h3>
            <p className="text-gray-600 mb-6 px-4">
              Try adjusting your search terms or filters to find more options.
            </p>
            <button 
              onClick={clearAllFilters}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {!loading && !error && programs.length > 0 && (
          <div className="space-y-4">
            {programs.map(program => MobileProgramCard(program))}
          </div>
        )}

        {!loading && !error && programs.length >= 10 && (
          <div className="text-center pt-8">
            <button className="text-indigo-600 hover:text-indigo-700 font-medium">
              Load more programs
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filters Modal */}
      <MobileFilters />

      {/* Bottom Spacing for Mobile */}
      <div className="h-20 lg:hidden"></div>
    </div>
  );
};

export default ProgramSearchPage;