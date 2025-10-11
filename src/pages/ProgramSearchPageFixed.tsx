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
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { convertCurrency, formatCurrency, getCountryCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import ProgramCard from '../components/app/ProgramCard';
import { useSavedProgramsContext } from '../contexts/SavedProgramsContext';
import type { Program } from '../lib/types';

const ProgramSearchPageFixed: React.FC = () => {
  const navigate = useNavigate();
  const { savedPrograms, saveProgram, removeSavedProgram } = useSavedProgramsContext();
  const [searchQuery, setSearchQuery] = useState('');
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
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('match');
  const [error, setError] = useState<string | null>(null);

  // Search programs with simplified query
  const searchPrograms = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Starting search with filters:', filters);
      
      // Start with a basic query
      let query = supabase
        .from('programs')
        .select('*')
        .limit(50); // Limit results to prevent timeout

      // Apply filters one by one
      if (searchQuery.trim()) {
        // Use ilike for case-insensitive search
        query = query.or(`name.ilike.%${searchQuery}%,university.ilike.%${searchQuery}%,country.ilike.%${searchQuery}%`);
      }

      if (filters.country) {
        query = query.eq('country', filters.country);
      }

      if (filters.degreeType) {
        query = query.eq('degree_type', filters.degreeType);
      }

      if (filters.maxTuition !== 'any') {
        const maxTuition = parseInt(filters.maxTuition);
        // Convert USD to NGN (1 USD = 1500 NGN approximation)
        const maxTuitionNGN = maxTuition * 1500;
        query = query.lte('tuition_fee', maxTuitionNGN);
      }

      if (filters.field) {
        query = query.or(`specialization.ilike.%${filters.field}%,name.ilike.%${filters.field}%`);
      }

      if (filters.scholarshipsOnly) {
        // Check both possible scholarship fields
        query = query.or('scholarship_available.eq.true,has_scholarships.eq.true');
      }

      // Apply sorting
      switch (sortBy) {
        case 'tuition-low':
          query = query.order('tuition_fee', { ascending: true });
          break;
        case 'tuition-high':
          query = query.order('tuition_fee', { ascending: false });
          break;
        case 'deadline':
          // Use application_deadline if available, otherwise created_at
          query = query.order('application_deadline', { ascending: true, nullsFirst: false });
          break;
        default:
          // Default sort by created_at (newest first)
          query = query.order('created_at', { ascending: false });
      }

      console.log('Executing query...');
      const { data, error: queryError } = await query;

      if (queryError) {
        console.error('Supabase query error:', queryError);
        throw new Error(`Database error: ${queryError.message}`);
      }

      console.log('Query successful, got data:', data);

      if (!data) {
        setPrograms([]);
        return;
      }

      // Map database fields to frontend Program interface
      const mappedPrograms = data.map((program: any) => ({
        id: program.id,
        name: program.name || 'Unnamed Program',
        university: program.university || 'Unknown University',
        abbreviation: program.abbreviation || program.university?.split(' ').map((w: string) => w[0]).join('') || 'N/A',
        country: program.country || 'Unknown',
        location: program.location || `${program.university || 'Unknown'}, ${program.country || 'Unknown'}`,
        tuition_fee: program.tuition_fee || 0,
        degree_type: program.degree_type || 'Unknown',
        created_at: program.created_at,
        has_scholarships: program.scholarship_available || program.has_scholarships || false,
        scholarship_available: program.scholarship_available || program.has_scholarships || false,
        match: program.match || Math.floor(Math.random() * 20) + 80, // Random match 80-100
        requirements: program.requirements || ['Check university website for requirements'],
        fields: program.specialization ? [program.specialization] : [],
        specialization: program.specialization || 'General',
        deadline: program.application_deadline || program.deadline || 'Rolling admissions',
        term: program.term || 'Fall 2025',
        description: program.description || `${program.degree_type || 'Program'} in ${program.specialization || program.name} at ${program.university}`,
        website: program.website || '#',
        logo: program.logo || 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=200',
        faculties: program.faculties || ['Faculty of Science'],
        duration: program.duration || '2 years',
        application_fee: program.application_fee || 0
      }));

      setPrograms(mappedPrograms);
      setError(null);
    } catch (err: any) {
      console.error('Error searching programs:', err);
      setError(err.message || 'Failed to fetch programs. Please try again.');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes with debouncing (includes initial load)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPrograms();
    }, 300); // Debounce by 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, sortBy]);

  // Update active filters display
  useEffect(() => {
    const newActiveFilters: string[] = [];
    if (filters.country) newActiveFilters.push(`Country: ${filters.country}`);
    if (filters.degreeType) newActiveFilters.push(`Degree: ${filters.degreeType}`);
    if (filters.maxTuition !== 'any') newActiveFilters.push(`Max Tuition: $${filters.maxTuition}`);
    if (filters.field) newActiveFilters.push(`Field: ${filters.field}`);
    if (filters.scholarshipsOnly) newActiveFilters.push('Scholarships Available');
    setActiveFilters(newActiveFilters);
  }, [filters]);

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
      case 'Max Tuition':
        handleFilterChange('maxTuition', 'any');
        break;
      case 'Field':
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

  const toggleSaveProgram = async (programId: string, programData?: any) => {
    const isSaved = savedPrograms.some(sp => sp.program_id === programId);
    
    try {
      if (isSaved) {
        await removeSavedProgram(programId);
      } else {
        await saveProgram(programId, programData);
      }
    } catch (error) {
      console.error('Failed to toggle save program:', error);
    }
  };

  const getFilterSection = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-indigo-600" />
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
                className="text-indigo-600 hover:text-indigo-800"
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
            <option value="Nigeria">Nigeria</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Germany">Germany</option>
            <option value="Australia">Australia</option>
            <option value="Netherlands">Netherlands</option>
            <option value="Sweden">Sweden</option>
            <option value="Switzerland">Switzerland</option>
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
            <option value="Masters">Master's</option>
            <option value="PhD">PhD</option>
            <option value="Bachelor">Bachelor's</option>
            <option value="Diploma">Diploma/Certificate</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tuition Range (USD/year)
          </label>
          <select
            value={filters.maxTuition}
            onChange={(e) => handleFilterChange('maxTuition', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-white text-gray-900 dark:text-gray-900"
          >
            <option value="any">Any range</option>
            <option value="5000">Under $5,000</option>
            <option value="20000">$5,000 - $20,000</option>
            <option value="40000">$20,000 - $40,000</option>
            <option value="100000">$40,000+</option>
          </select>
        </div>

        {showAdvancedFilters && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Field of Study
              </label>
              <select
                value={filters.field}
                onChange={(e) => handleFilterChange('field', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-white text-gray-900 dark:text-gray-900"
              >
                <option value="">Any field</option>
                <option value="Computer Science">Computer Science</option>
                <option value="AI">Artificial Intelligence</option>
                <option value="Data Science">Data Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Medicine">Medicine</option>
                <option value="Law">Law</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="scholarshipsOnly"
                checked={filters.scholarshipsOnly}
                onChange={(e) => handleFilterChange('scholarshipsOnly', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-gray-400 rounded focus:ring-indigo-500 bg-white dark:bg-white"
              />
              <label htmlFor="scholarshipsOnly" className="text-sm text-gray-700 dark:text-gray-300">
                Only show programs with scholarships
              </label>
            </div>
          </>
        )}

        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-1 text-indigo-600 text-sm font-medium hover:text-indigo-800"
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

  const renderProgram = (program: any) => {
    const isSaved = savedPrograms.some(sp => sp.program_id === program.id);
    
    return (
      <ProgramCard
        key={program.id}
        program={program}
        isSaved={isSaved}
        onSave={() => toggleSaveProgram(program.id, {
          name: program.name,
          university: program.university,
          country: program.country
        })}
        onUnsave={() => toggleSaveProgram(program.id)}
      />
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <button 
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Find Your Program</h1>
          <p className="text-gray-500">Discover programs that match your profile and preferences</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/dashboard/calculator')} 
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
          >
            <Calculator className="h-5 w-5" />
            <span className="hidden sm:inline">Cost Calculator</span>
          </button>
        </div>
      </div>

      {/* Main search bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for programs, universities, or keywords..."
          className="block w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-white shadow-sm text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Left sidebar with filters */}
        <div className="lg:col-span-1">
          {getFilterSection()}
          
          {/* Tools section */}
          <div className="bg-indigo-600 dark:bg-indigo-700 rounded-xl shadow-sm p-6 text-white">
            <h2 className="font-semibold mb-4 text-lg">Need Help Finding Programs?</h2>
            <p className="text-indigo-100 mb-4">
              Our AI assistant can help you discover programs that match your profile, preferences, and career goals.
            </p>
            <button 
              onClick={() => navigate('/dashboard/assistant')}
              className="w-full bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center gap-2 mb-4"
            >
              <Search className="h-5 w-5" />
              Get Personalized Suggestions
            </button>
            <button 
              onClick={() => navigate('/dashboard/calculator')}
              className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="h-5 w-5" />
              Calculate Education Costs
            </button>
          </div>
        </div>

        {/* Results area */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6">
          {/* Results header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                      <span className="text-gray-900 dark:text-gray-100">Searching...</span>
                    </div>
                  ) : error ? (
                    <span className="text-red-600 dark:text-red-400">Error</span>
                  ) : (
                    `${programs.length} Programs Found`
                  )}
                </h2>
                <p className="text-sm text-gray-500">
                  {programs.length > 0 && !loading && !error 
                    ? `Showing programs matching your criteria`
                    : ''}
                </p>
              </div>
              
              <div className="flex gap-3 items-center">
                <span className="text-sm text-gray-500 hidden sm:inline-block">Sort by:</span>
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

          {/* Results grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
              <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Searching for programs that match your criteria...</p>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
              <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">Unable to Load Programs</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">This might be due to:</p>
                <ul className="text-sm text-gray-500 dark:text-gray-400 text-left inline-block">
                  <li>• Network connectivity issues</li>
                  <li>• Database connection timeout</li>
                  <li>• Server maintenance</li>
                </ul>
              </div>
              <button 
                onClick={searchPrograms}
                className="mt-4 bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : programs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
              <div className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Programs Found</h3>
              <p className="text-gray-600 mb-4">
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
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {programs.map(program => renderProgram(program))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramSearchPageFixed;