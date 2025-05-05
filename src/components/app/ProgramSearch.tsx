import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, GraduationCap, DollarSign, Calendar, Star, Share2, X, ChevronDown, ChevronLeft } from 'lucide-react';
import { searchPrograms } from '../../lib/program';
import { convertCurrency, formatCurrency, getCountryCurrency } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import type { Program } from '../../lib/types';

const ProgramSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    country: '',
    degreeType: '',
    maxTuition: 'any',
    field: '',
    scholarshipsOnly: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('match');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await searchPrograms({
          query: searchQuery,
          country: filters.country,
          maxTuition: filters.maxTuition !== 'any' ? parseInt(filters.maxTuition) : undefined,
          degreeType: filters.degreeType !== 'any' ? filters.degreeType : undefined,
          field: filters.field !== 'any' ? filters.field : undefined,
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

    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(fetchPrograms, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, sortBy]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      country: '',
      degreeType: '',
      maxTuition: 'any',
      field: '',
      scholarshipsOnly: false
    });
  };

  const renderProgram = (program: Program) => {
    const countryCurrency = getCountryCurrency(program.country);
    const localAmount = program.tuition_fee;
    const ngnAmount = convertCurrency(localAmount, countryCurrency, 'NGN');

    return (
      <div key={program.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="min-w-0">
              <h3 className="font-heading font-semibold text-lg text-gray-800 break-words">{program.name}</h3>
              <p className="font-sans text-gray-600 break-words">{program.university}</p>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0">
              92% Match
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{program.country}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-indigo-600 font-medium truncate">
                {formatCurrency(localAmount, countryCurrency)}/year
              </span>
              <span className="text-xs text-gray-500 truncate">
                ≈ {formatCurrency(ngnAmount, 'NGN')}/year
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">Sept 2025</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {['Computer Science', 'AI', 'Machine Learning'].map((tag, idx) => (
              <span
                key={idx}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
            {program.has_scholarships && (
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">
                Scholarships Available
              </span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center p-4 pt-3 border-t border-gray-200 bg-gray-50">
          <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors">
            View Details
          </button>
          <div className="flex gap-3">
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Star className="h-5 w-5" />
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 font-heading">Find Your Program</h1>
          <p className="text-gray-600">
            Discover programs that match your profile and preferences
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2 self-start"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Dashboard
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search programs, universities, or countries..."
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-indigo-600" />
            <h2 className="font-heading font-semibold">Filters</h2>
          </div>
          {Object.values(filters).some(Boolean) && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Any country</option>
              <option value="USA">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field of Study
            </label>
            <select
              value={filters.field}
              onChange={(e) => handleFilterChange('field', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Any field</option>
              <option value="cs">Computer Science</option>
              <option value="ai">Artificial Intelligence</option>
              <option value="data">Data Science</option>
              <option value="cyber">Cybersecurity</option>
              <option value="software">Software Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tuition Range
            </label>
            <select
              value={filters.maxTuition}
              onChange={(e) => handleFilterChange('maxTuition', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="any">Any range</option>
              <option value="5000">Under $5,000/year</option>
              <option value="20000">$5,000 - $20,000/year</option>
              <option value="40000">$20,000 - $40,000/year</option>
              <option value="100000">$40,000+/year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Degree Type
            </label>
            <select
              value={filters.degreeType}
              onChange={(e) => handleFilterChange('degreeType', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="any">Any type</option>
              <option value="masters">Master's</option>
              <option value="phd">PhD</option>
              <option value="certificate">Certificate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="font-heading font-semibold">
            {loading ? (
              <span className="text-gray-500">Searching...</span>
            ) : error ? (
              <span className="text-red-600">{error}</span>
            ) : (
              `${programs.length} Programs Found`
            )}
          </h2>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="match">Sort by: Match</option>
            <option value="deadline">Sort by: Deadline</option>
            <option value="tuition-low">Sort by: Tuition (Low to High)</option>
            <option value="tuition-high">Sort by: Tuition (High to Low)</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Searching for programs...</p>
            </div>
          ) : programs.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-600">No programs found matching your criteria.</p>
            </div>
          ) : (
            programs.map(program => renderProgram(program))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramSearch;