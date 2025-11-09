import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Globe, Users, Award, Building2, Calendar,
  Mail, ExternalLink, TrendingUp, BookOpen, GraduationCap,
  Filter, Search, ChevronLeft
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProgramCard, { type EnhancedProgram } from '../components/app/ProgramCard';
import { useSavedProgramsContext } from '../contexts/SavedProgramsContext';
import type { Database } from '../lib/database.types';

type University = Database['public']['Tables']['universities']['Row'];
type Program = Database['public']['Tables']['programs']['Row'] & {
  university_name?: string;
};

// Helper function to create slug from university name
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

// Helper function to get country full name from country code
const getCountryName = (code: string | null): string => {
  const countryMap: { [key: string]: string } = {
    'USA': 'United States',
    'CAN': 'Canada',
    'GBR': 'United Kingdom',
    'AUS': 'Australia',
    'NZL': 'New Zealand',
    'DEU': 'Germany',
    'FRA': 'France',
    'ITA': 'Italy',
    'ESP': 'Spain',
    'NLD': 'Netherlands',
    'CHE': 'Switzerland',
    'SWE': 'Sweden',
    'NOR': 'Norway',
    'DNK': 'Denmark',
    'FIN': 'Finland',
    'SGP': 'Singapore',
    'JPN': 'Japan',
    'CHN': 'China',
    'HKG': 'Hong Kong',
    'KOR': 'South Korea',
    'IND': 'India',
    'NGA': 'Nigeria',
    'ZAF': 'South Africa',
    'EGY': 'Egypt',
    'KEN': 'Kenya',
    'GHA': 'Ghana',
    'IRL': 'Ireland',
    'BEL': 'Belgium',
    'AUT': 'Austria',
    'POL': 'Poland',
    'CZE': 'Czech Republic',
    'PRT': 'Portugal',
    'GRC': 'Greece',
    'RUS': 'Russia',
    'BRA': 'Brazil',
    'MEX': 'Mexico',
    'ARG': 'Argentina',
    'CHL': 'Chile',
  };

  return countryMap[code || ''] || code || 'Country';
};

export default function UniversityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { savedPrograms, saveProgram, removeSavedProgram } = useSavedProgramsContext();

  const [university, setUniversity] = useState<University | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countryName, setCountryName] = useState<string>('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [degreeFilter, setDegreeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');

  // Fetch university data
  useEffect(() => {
    const fetchUniversityData = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch all universities with city name and country name joined
        const { data: universities, error: universitiesError } = await supabase
          .from('universities')
          .select('*, cities(name), countries(name)');

        if (universitiesError) throw universitiesError;

        // Find university by matching slug
        const universityData = universities?.find(u => createSlug(u.name) === slug);

        if (!universityData) {
          throw new Error('University not found');
        }

        setUniversity(universityData as any);

        // Set country name from database
        setCountryName((universityData as any).countries?.name || getCountryName(universityData.country_code));

        // Fetch programs for this university
        const { data: programsData, error: programsError } = await supabase
          .from('programs')
          .select('*')
          .eq('university_id', universityData.id)
          .order('name');

        if (programsError) throw programsError;
        setPrograms(programsData || []);
        setFilteredPrograms(programsData || []);

      } catch (err) {
        console.error('Error fetching university data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load university data');
      } finally {
        setLoading(false);
      }
    };

    fetchUniversityData();
  }, [slug]);

  // Apply filters
  useEffect(() => {
    let result = [...programs];

    // Search filter
    if (searchQuery) {
      result = result.filter(program =>
        program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Degree type filter
    if (degreeFilter) {
      result = result.filter(program => program.degree_type === degreeFilter);
    }

    // Sorting
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'tuition-low':
        result.sort((a, b) => (a.tuition_fee || 0) - (b.tuition_fee || 0));
        break;
      case 'tuition-high':
        result.sort((a, b) => (b.tuition_fee || 0) - (a.tuition_fee || 0));
        break;
    }

    setFilteredPrograms(result);
  }, [searchQuery, degreeFilter, sortBy, programs]);

  // Get unique degree types from programs
  const degreeTypes = [...new Set(programs.map(p => p.degree_type).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !university) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400">
            {error || 'University not found'}
          </p>
          <button
            onClick={() => navigate('/app/programs')}
            className="mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Return to Programs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
      >
        <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Programs</span>
      </button>

      {/* University Header */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
        {/* Header with purple gradient */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-start lg:justify-between gap-6">
            <div className="flex items-start space-x-4 sm:space-x-6 flex-1 w-full">
              {university.logo_url && (
                <div className="flex-shrink-0">
                  <img
                    src={university.logo_url}
                    alt={`${university.name} logo`}
                    className="w-16 h-16 sm:w-24 sm:h-24 object-contain rounded-xl bg-white p-2 sm:p-3 shadow-md"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
                  {university.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                  <div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="font-medium">
                      {countryName || getCountryName(university.country_code)}
                    </span>
                  </div>
                  {university.institution_type && (
                    <div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <Building2 className="h-4 w-4 mr-2" />
                      <span className="font-medium">{university.institution_type}</span>
                    </div>
                  )}
                  {university.founded_year && (
                    <div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="font-medium">Founded {university.founded_year}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {university.website && (
              <a
                href={university.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-indigo-600 px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg font-medium w-full lg:w-auto lg:ml-4"
              >
                <Globe className="h-5 w-5" />
                <span>Visit Website</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">

          {/* Description */}
          {university.description && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                {university.description}
              </p>
            </div>
          )}

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {university.total_students && (
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center text-indigo-700 dark:text-indigo-400 mb-2">
                  <Users className="h-5 w-5 mr-2" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Total Students</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {university.total_students.toLocaleString()}
                </p>
              </div>
            )}

            {university.international_students && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center text-purple-700 dark:text-purple-400 mb-2">
                  <Globe className="h-5 w-5 mr-2" />
                  <span className="text-xs font-semibold uppercase tracking-wide">International</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {university.international_students.toLocaleString()}
                </p>
              </div>
            )}

            {university.acceptance_rate && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
                <div className="flex items-center text-green-700 dark:text-green-400 mb-2">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Acceptance Rate</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {university.acceptance_rate < 1
                    ? (university.acceptance_rate * 100).toFixed(0)
                    : university.acceptance_rate.toFixed(0)}%
                </p>
              </div>
            )}

            {(university.ranking_world || university.ranking_national) && (
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-5 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center text-yellow-700 dark:text-yellow-400 mb-3">
                  <Award className="h-5 w-5 mr-2" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Rankings</span>
                </div>
                <div className="flex items-center justify-around gap-4">
                  {university.ranking_world && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        #{university.ranking_world}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">(World)</p>
                    </div>
                  )}
                  {university.ranking_national && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        #{university.ranking_national}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">(National)</p>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>

          {/* Accreditations */}
          {university.accreditations && university.accreditations.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Accreditations & Certifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {university.accreditations.map((accreditation, index) => (
                  <span
                    key={index}
                    className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-600 shadow-sm"
                  >
                    {accreditation}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {university.contact_email && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Contact Information
              </h3>
              <a
                href={`mailto:${university.contact_email}`}
                className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
              >
                <Mail className="h-5 w-5 mr-3" />
                {university.contact_email}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Programs Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-8 pt-8 pb-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <GraduationCap className="h-8 w-8 mr-3 text-indigo-600 dark:text-indigo-400" />
            Programs Offered
            <span className="ml-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-1 rounded-full text-lg font-semibold">
              {filteredPrograms.length}
            </span>
          </h2>
        </div>

        <div className="px-8 pb-8">
          {/* Search and Filters Row */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search programs..."
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Filters Label */}
              <div className="hidden lg:flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg h-fit">
                <Filter className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                Filters
              </div>

              {/* Degree Type Filter */}
              <select
                value={degreeFilter}
                onChange={(e) => setDegreeFilter(e.target.value)}
                className="px-5 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">All Degree Types</option>
                {degreeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-5 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="tuition-low">Tuition: Low to High</option>
                <option value="tuition-high">Tuition: High to Low</option>
              </select>

                {/* Clear Filters */}
                {(searchQuery || degreeFilter) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setDegreeFilter('');
                    }}
                    className="px-5 py-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
            </div>
          </div>

          {/* Programs Grid */}
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Programs Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {searchQuery || degreeFilter
                  ? 'Try adjusting your filters to see more programs'
                  : 'This university doesn\'t have any programs listed yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={{
                    ...program,
                    university: university?.name || program.university,
                  } as any as EnhancedProgram}
                  onSave={saveProgram}
                  onUnsave={removeSavedProgram}
                  isSaved={savedPrograms.some(sp => sp.program_id === program.id)}
                  onViewDetails={(programId) => navigate(`/app/programs/${programId}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
