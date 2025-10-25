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
import { checkConnectionHealth, retryWithBackoff, isConnectionError } from '../lib/connectionHealth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProgramCard from '../components/app/ProgramCard';
import { useSavedProgramsContext } from '../contexts/SavedProgramsContext';
import type { Program } from '../lib/types';

const ProgramSearchPageFixed: React.FC = () => {
  const navigate = useNavigate();
  const { savedPrograms, saveProgram, removeSavedProgram } = useSavedProgramsContext();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    country: '',
    degreeType: '',
    maxTuition: 'any',
    field: '',
    institutionType: '',
    scholarshipsOnly: false
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('match');
  const [error, setError] = useState<string | null>(null);

  // Dynamic filter options from database
  const [countries, setCountries] = useState<Array<{ code: string; name: string }>>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [degreeTypes, setDegreeTypes] = useState<string[]>([]);
  const [institutionTypes, setInstitutionTypes] = useState<string[]>([]);

  // Load filter options from database
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        console.log('🔄 Loading filter options from database...');

        // Fetch ALL active countries (both origin and destination)
        // Students can study anywhere: abroad, other African countries, or at home
        const { data: allCountries } = await supabase
          .from('countries')
          .select('*')
          .eq('is_active', true)
          .order('name');

        console.log('📍 Countries loaded:', allCountries?.length);

        if (allCountries) {
          setCountries(allCountries.map(c => ({
            code: c.country_code,
            name: c.name
          })));
        }

        // Fetch programs and extract fields from names
        const { data: programsData } = await supabase
          .from('programs')
          .select('name');

        console.log('📚 Programs loaded:', programsData?.length);

        if (programsData) {
          // Extract field names from program names
          const extractedFields = programsData
            .map(p => {
              const name = p.name || '';
              const cleaned = name.replace(/^(BSc|MSc|MA|MBA|PhD|Master|Bachelor|Doctor)\s+(of\s+)?(Science\s+in\s+|Arts\s+in\s+)?/i, '').trim();
              return cleaned;
            })
            .filter(Boolean);

          const uniqueFields = [...new Set(extractedFields)].sort();
          console.log('🎓 Unique fields extracted:', uniqueFields.length);
          setFields(uniqueFields.slice(0, 20));
        }

        // Fetch unique degree types from programs table
        const { data: degreeData } = await supabase
          .from('programs')
          .select('degree_type')
          .not('degree_type', 'is', null);

        if (degreeData) {
          const uniqueDegrees = [...new Set(degreeData.map(p => p.degree_type).filter((d): d is string => Boolean(d)))].sort();
          console.log('🎯 Degree types loaded:', uniqueDegrees);
          setDegreeTypes(uniqueDegrees);
        }

        // Fetch unique institution types from universities
        const { data: universitiesData } = await supabase
          .from('universities')
          .select('institution_type')
          .not('institution_type', 'is', null);

        if (universitiesData) {
          const uniqueInstitutionTypes = [...new Set(universitiesData.map(u => u.institution_type).filter((t): t is string => Boolean(t)))].sort();
          console.log('🏫 Institution types loaded:', uniqueInstitutionTypes);
          setInstitutionTypes(uniqueInstitutionTypes);
        }

        console.log('✅ Filter options loaded successfully');
      } catch (error) {
        console.error('❌ Error loading filter options:', error);
      }
    };

    loadFilterOptions();
  }, []);

  // Parse URL parameters for initial filter state
  useEffect(() => {
    const scholarshipsOnly = searchParams.get('scholarshipsOnly');
    if (scholarshipsOnly === 'true') {
      setFilters(prev => ({ ...prev, scholarshipsOnly: true }));
    }
  }, [searchParams]);

  // Search programs with simplified query
  const searchPrograms = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('⏳ Starting search with filters:', filters);
      
      // Check connection health first
      console.log('🔍 Checking connection health...');
      const health = await checkConnectionHealth();
      
      if (!health.isHealthy) {
        console.log('❌ Connection unhealthy:', health.error);
        throw new Error(`Connection issue: ${health.error}. Please check your internet connection.`);
      }
      
      console.log(`✅ Connection healthy (${health.latency?.toFixed(0)}ms)`);
      
      const startTime = performance.now();

      // Start with optimized query - only fetch needed fields
      // If filtering by institution type, we need to join with universities table
      let query = supabase
        .from('programs')
        .select(filters.institutionType
          ? 'id, name, university, university_id, country, location, tuition_fee, degree_type, created_at, scholarship_available, has_scholarships, specialization, application_deadline, deadline, description, website, duration, application_fee, requirements, city, university_website, program_website, entry_requirements, language_requirements, study_level, tuition_fee_currency, tuition_fee_original, application_fee_currency, universities!inner(institution_type)'
          : 'id, name, university, university_id, country, location, tuition_fee, degree_type, created_at, scholarship_available, has_scholarships, specialization, application_deadline, deadline, description, website, duration, application_fee, requirements, city, university_website, program_website, entry_requirements, language_requirements, study_level, tuition_fee_currency, tuition_fee_original, application_fee_currency')
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

      if (filters.institutionType) {
        query = query.eq('universities.institution_type', filters.institutionType);
      }

      if (filters.scholarshipsOnly) {
        // Check both possible scholarship fields
        query = query.or('scholarship_available.eq.true,has_scholarships.eq.true');
      }

      // Apply sorting (skip tuition sorting here, we'll do it client-side after currency conversion)
      switch (sortBy) {
        case 'tuition-low':
        case 'tuition-high':
          // Don't sort by tuition_fee at database level - will sort client-side after currency conversion
          query = query.order('created_at', { ascending: false });
          break;
        case 'deadline':
          // Use application_deadline if available, otherwise created_at
          query = query.order('application_deadline', { ascending: true, nullsFirst: false });
          break;
        default:
          // Default sort by created_at (newest first)
          query = query.order('created_at', { ascending: false });
      }

      console.log('🔄 Executing query with retry logic...');

      // Wrap query execution with retry logic for connection issues
      const executeQuery = async () => {
        // Add timeout wrapper to prevent indefinite hanging
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout after 6 seconds. Please check your internet connection or try again later.')), 6000)
        );

        // Race the query against the timeout
        const { data, error: queryError } = await Promise.race([
          query,
          timeoutPromise
        ]) as any;

        if (queryError) {
          throw queryError;
        }

        return { data, error: null };
      };

      // Execute with retry logic for connection errors
      const { data, error: queryError } = await retryWithBackoff(executeQuery, 2, 1000);

      const endTime = performance.now();
      console.log(`✅ Query completed in ${(endTime - startTime).toFixed(0)}ms`);

      if (queryError) {
        console.error('❌ Supabase query error:', queryError);
        throw new Error(`Database error: ${(queryError as any).message || 'Unknown error'}`);
      }

      console.log('📊 Query successful, got data:', { count: data?.length || 0 });

      if (!data || data.length === 0) {
        console.log('ℹ️ No programs found with current filters');
        setPrograms([]);
        setError(null); // Clear error if query succeeded but no results
        return;
      }

      // Map database fields to frontend Program interface
      const mappedPrograms = data.map((program: any) => ({
        id: program.id,
        name: program.name || 'Unnamed Program',
        university: program.university || 'Unknown University',
        university_id: program.university_id || null,
        abbreviation: program.university?.split(' ').map((w: string) => w[0]).join('') || 'N/A',
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
        term: 'Fall 2025', // Default term since column doesn't exist
        description: program.description || `${program.degree_type || 'Program'} in ${program.specialization || program.name} at ${program.university}`,
        website: program.website || '#',
        logo: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=200', // Default logo since column doesn't exist
        faculties: ['Faculty of Science'], // Default faculties since column doesn't exist
        duration: program.duration || '2 years',
        application_fee: program.application_fee || 0
      }));

      // Client-side sorting for tuition (after currency conversion)
      let sortedPrograms = [...mappedPrograms];

      if (sortBy === 'tuition-low' || sortBy === 'tuition-high') {
        // Convert all tuitions to NGN for fair comparison
        const programsWithNGNTuition = sortedPrograms.map((program) => {
          const currency = program.tuition_fee_currency || getCountryCurrency(program.country);
          const tuitionInNGN = convertCurrency(program.tuition_fee || 0, currency, 'NGN');
          return {
            ...program,
            tuitionInNGN
          };
        });

        // Sort by converted tuition
        programsWithNGNTuition.sort((a, b) => {
          const diff = (a.tuitionInNGN || 0) - (b.tuitionInNGN || 0);
          return sortBy === 'tuition-low' ? diff : -diff;
        });

        sortedPrograms = programsWithNGNTuition;
      }

      setPrograms(sortedPrograms);
      setError(null);
    } catch (err: any) {
      console.error('Error searching programs:', err);
      
      // Check if it's a connection-related error
      if (isConnectionError(err)) {
        console.log('🔌 Connection error detected, showing fallback data');
        setError('Connection issue detected. Showing sample programs while we resolve this.');
        
        // Show some sample programs so the user isn't stuck with an empty page
        const fallbackPrograms = [
          {
            id: 'fallback-1',
            name: 'Computer Science',
            university: 'Sample University',
            country: 'United States',
            degree_type: 'Bachelor',
            specialization: 'Computer Science',
            tuition_fee: 25000,
            duration: '4 years',
            scholarship_available: true,
            application_deadline: '2024-12-31',
            entry_requirements: 'High school diploma',
            language_requirements: 'TOEFL 80',
            program_website: '#',
            university_website: '#',
            application_fee: 100
          },
          {
            id: 'fallback-2', 
            name: 'Business Administration',
            university: 'Sample Business School',
            country: 'Canada',
            degree_type: 'Master',
            specialization: 'Business',
            tuition_fee: 30000,
            duration: '2 years',
            scholarship_available: false,
            application_deadline: '2024-11-30',
            entry_requirements: 'Bachelor degree',
            language_requirements: 'IELTS 6.5',
            program_website: '#',
            university_website: '#',
            application_fee: 150
          }
        ];
        
        const mappedFallbackPrograms = fallbackPrograms.map(program => ({
          id: program.id,
          name: program.name,
          university: program.university,
          country: program.country,
          degree_type: program.degree_type,
          specialization: program.specialization,
          tuition_fee: program.tuition_fee,
          duration: program.duration,
          scholarship_available: program.scholarship_available,
          application_deadline: program.application_deadline,
          entry_requirements: program.entry_requirements,
          language_requirements: program.language_requirements,
          program_website: program.program_website,
          university_website: program.university_website,
          application_fee: program.application_fee.toString(),
          created_at: new Date().toISOString()
        }));
        
        setPrograms(mappedFallbackPrograms);
      } else if (err.message?.includes('timeout')) {
        console.log('⏰ Program search query timed out, showing fallback data');
        setError('Search is taking longer than expected. Showing sample programs.');
        
        // Show some sample programs so the user isn't stuck with an empty page
        const fallbackPrograms = [
          {
            id: 'fallback-1',
            name: 'Computer Science',
            university: 'Sample University',
            country: 'United States',
            degree_type: 'Bachelor',
            specialization: 'Computer Science',
            tuition_fee: 25000,
            duration: '4 years',
            scholarship_available: true,
            application_deadline: '2024-12-31',
            entry_requirements: 'High school diploma',
            language_requirements: 'TOEFL 80',
            program_website: '#',
            university_website: '#',
            application_fee: 100
          },
          {
            id: 'fallback-2', 
            name: 'Business Administration',
            university: 'Sample Business School',
            country: 'Canada',
            degree_type: 'Master',
            specialization: 'Business',
            tuition_fee: 30000,
            duration: '2 years',
            scholarship_available: false,
            application_deadline: '2024-11-30',
            entry_requirements: 'Bachelor degree',
            language_requirements: 'IELTS 6.5',
            program_website: '#',
            university_website: '#',
            application_fee: 150
          }
        ];
        
        const mappedFallbackPrograms = fallbackPrograms.map(program => ({
          id: program.id,
          name: program.name,
          university: program.university,
          country: program.country,
          degree_type: program.degree_type,
          specialization: program.specialization,
          tuition_fee: program.tuition_fee,
          duration: program.duration,
          scholarship_available: program.scholarship_available,
          application_deadline: program.application_deadline,
          entry_requirements: program.entry_requirements,
          language_requirements: program.language_requirements,
          program_website: program.program_website,
          university_website: program.university_website,
          application_fee: program.application_fee.toString(),
          created_at: new Date().toISOString()
        }));
        
        setPrograms(mappedFallbackPrograms);
      } else {
        setError(err.message || 'Failed to fetch programs. Please try again.');
        setPrograms([]);
      }
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
    if (filters.institutionType) newActiveFilters.push(`Institution Type: ${filters.institutionType}`);
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
      case 'Institution Type':
        handleFilterChange('institutionType', '');
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
      institutionType: '',
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
                aria-label={`Remove filter ${filter}`}
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
          <label htmlFor="filter-country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Country
          </label>
          <select
            id="filter-country"
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Any country</option>
            {countries.map(country => (
              <option key={country.code} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-degree" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Degree Type
          </label>
          <select
            id="filter-degree"
            value={filters.degreeType}
            onChange={(e) => handleFilterChange('degreeType', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Any type</option>
            {degreeTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-tuition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tuition Range (USD/year)
          </label>
          <select
            id="filter-tuition"
            value={filters.maxTuition}
            onChange={(e) => handleFilterChange('maxTuition', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
              <label htmlFor="filter-field" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Field of Study
              </label>
              <select
                id="filter-field"
                value={filters.field}
                onChange={(e) => handleFilterChange('field', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Any field</option>
                {fields.map(field => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-institution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Institution Type
              </label>
              <select
                id="filter-institution"
                value={filters.institutionType}
                onChange={(e) => handleFilterChange('institutionType', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Any type</option>
                {institutionTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
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
        onViewDetails={(id) => navigate(`/app/programs/${id}`)}
      />
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <button
              onClick={() => navigate('/app')}
              className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Your Program</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover programs that match your profile and preferences</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/app/calculator')} 
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
          className="block w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
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
              onClick={() => navigate('/app/assistant')}
              className="w-full bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center gap-2 mb-4"
            >
              <Search className="h-5 w-5" />
              Get Personalized Suggestions
            </button>
            <button 
              onClick={() => navigate('/app/calculator')}
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
                  aria-label="Sort programs"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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