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
  Info
} from 'lucide-react';
import { searchPrograms } from '../lib/program';
import { convertCurrency, formatCurrency, getCountryCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import ProgramCard from '../components/app/ProgramCard';
import { useSavedProgramsContext } from '../contexts/SavedProgramsContext';
import type { Program } from '../lib/types';

const ProgramSearchPage: React.FC = () => {
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
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('match');
  const [error, setError] = useState<string | null>(null);
  
  // Sample programs data for development
  const samplePrograms = [
    {
      id: '1',
      name: 'MSc Computer Science',
      university: 'University of Toronto',
      abbreviation: 'UofT',
      country: 'Canada',
      location: 'Toronto, Ontario, Canada',
      tuition_fee: 42000,
      degree_type: 'Masters',
      created_at: new Date().toISOString(),
      has_scholarships: true,
      match: 94,
      requirements: ['GPA: 3.5+', 'IELTS: 7.0'],
      fields: ['Computer Science', 'AI', 'Machine Learning'],
      deadline: 'January 15, 2025',
      term: 'Fall 2025',
      description: 'The University of Toronto offers world-class graduate programs in computer science, with research opportunities in artificial intelligence, machine learning, and computer systems.',
      website: 'https://www.utoronto.ca',
      logo: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      faculties: ['Faculty of Arts and Science', 'Faculty of Applied Science and Engineering']
    },
    {
      id: '2',
      name: 'MSc Artificial Intelligence',
      university: 'University of Edinburgh',
      abbreviation: 'UoE',
      country: 'UK',
      location: 'Edinburgh, Scotland, UK',
      tuition_fee: 38000,
      degree_type: 'Masters',
      created_at: new Date().toISOString(),
      has_scholarships: true,
      match: 91,
      requirements: ['GPA: 3.3+', 'IELTS: 6.5'],
      fields: ['AI', 'Machine Learning', 'NLP'],
      deadline: 'February 28, 2025',
      term: 'Fall 2025',
      description: 'The University of Edinburgh has been at the forefront of AI research for decades, offering cutting-edge programs taught by world-renowned faculty.',
      website: 'https://www.ed.ac.uk',
      logo: 'https://images.pexels.com/photos/6147363/pexels-photo-6147363.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      faculties: ['School of Informatics', 'College of Science and Engineering']
    },
    {
      id: '3',
      name: 'MSc Data Science',
      university: 'TU Munich',
      abbreviation: 'TUM',
      country: 'Germany',
      location: 'Munich, Bavaria, Germany',
      tuition_fee: 32000,
      degree_type: 'Masters',
      created_at: new Date().toISOString(),
      has_scholarships: false,
      match: 89,
      requirements: ['GPA: 3.0+', 'German: B1'],
      fields: ['Data Science', 'Statistics', 'Programming'],
      deadline: 'March 31, 2025',
      term: 'Fall 2025',
      description: 'Technical University of Munich is one of Germany\'s most prestigious universities, offering innovative programs in data science and technology.',
      website: 'https://www.tum.de/en',
      logo: 'https://images.pexels.com/photos/159490/yale-university-landscape-universities-schools-159490.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      faculties: ['Department of Informatics', 'Department of Mathematics']
    },
    {
      id: '4',
      name: 'MSc Computer Engineering',
      university: 'KTH Royal Institute of Technology',
      abbreviation: 'KTH',
      country: 'Sweden',
      location: 'Stockholm, Sweden',
      tuition_fee: 35000,
      degree_type: 'Masters',
      created_at: new Date().toISOString(),
      has_scholarships: true,
      match: 87,
      requirements: ['GPA: 3.0+', 'IELTS: 6.5'],
      fields: ['Computer Engineering', 'Electronics', 'Systems'],
      deadline: 'January 15, 2025',
      term: 'Fall 2025',
      description: 'KTH is Sweden\'s largest technical university and offers distinguished programs in engineering and computer science with a focus on sustainability.',
      website: 'https://www.kth.se/en',
      logo: 'https://images.pexels.com/photos/164338/pexels-photo-164338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      faculties: ['School of Electrical Engineering and Computer Science', 'School of Engineering Sciences']
    },
    {
      id: '5',
      name: 'MSc Robotics',
      university: 'ETH Zurich',
      abbreviation: 'ETH',
      country: 'Switzerland',
      location: 'Zurich, Switzerland',
      tuition_fee: 45000,
      degree_type: 'Masters',
      created_at: new Date().toISOString(),
      has_scholarships: false,
      match: 85,
      requirements: ['GPA: 3.7+', 'GRE: 320+'],
      fields: ['Robotics', 'AI', 'Computer Vision'],
      deadline: 'December 15, 2024',
      term: 'Fall 2025',
      description: 'ETH Zurich is consistently ranked among the top universities in the world, known for excellence in science, technology, and engineering.',
      website: 'https://ethz.ch/en.html',
      logo: 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      faculties: ['Department of Computer Science', 'Department of Mechanical and Process Engineering']
    },
    {
      id: '6',
      name: 'MSc Cloud Computing',
      university: 'TU Delft',
      abbreviation: 'TUD',
      country: 'Netherlands',
      location: 'Delft, South Holland, Netherlands',
      tuition_fee: 30000,
      degree_type: 'Masters',
      created_at: new Date().toISOString(),
      has_scholarships: true,
      match: 82,
      requirements: ['GPA: 3.2+', 'IELTS: 6.5'],
      fields: ['Cloud Computing', 'Distributed Systems'],
      deadline: 'April 1, 2025',
      term: 'Fall 2025',
      description: 'TU Delft is the largest and oldest Dutch public technical university, known for its high-quality research and education in engineering and technology.',
      website: 'https://www.tudelft.nl/en',
      logo: 'https://images.pexels.com/photos/164337/pexels-photo-164337.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      faculties: ['Faculty of Electrical Engineering, Mathematics and Computer Science', 'Faculty of Technology, Policy and Management']
    },
    // Nigerian Universities
    {
      id: '7',
      name: 'MSc Computer Science',
      university: 'University of Lagos',
      abbreviation: 'UNILAG',
      country: 'Nigeria',
      location: 'Lagos, Nigeria',
      tuition_fee: 500000, // in Nigerian Naira
      degree_type: 'Masters',
      created_at: new Date().toISOString(),
      has_scholarships: true,
      match: 97,
      requirements: ['GPA: 3.5+', 'JAMB: 250+'],
      fields: ['Computer Science', 'AI', 'Software Engineering'],
      deadline: 'May 30, 2025',
      term: 'Fall 2025',
      description: 'The University of Lagos is one of Nigeria\'s leading institutions, known for its rigorous academic programs and research in computer science and technology.',
      website: 'https://unilag.edu.ng',
      logo: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      faculties: ['Faculty of Science', 'Faculty of Engineering', 'Faculty of Business Administration']
    },
    {
      id: '8',
      name: 'MSc Artificial Intelligence',
      university: 'University of Ibadan',
      abbreviation: 'UI',
      country: 'Nigeria',
      location: 'Ibadan, Oyo State, Nigeria',
      tuition_fee: 450000, // in Nigerian Naira
      degree_type: 'Masters',
      created_at: new Date().toISOString(),
      has_scholarships: true,
      match: 95,
      requirements: ['GPA: 3.3+', 'JAMB: 240+'],
      fields: ['Artificial Intelligence', 'Machine Learning', 'Data Science'],
      deadline: 'June 15, 2025',
      term: 'Fall 2025',
      description: 'Founded in 1948, the University of Ibadan is Nigeria\'s first university and offers cutting-edge programs in AI and emerging technologies.',
      website: 'https://ui.edu.ng',
      logo: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      faculties: ['Faculty of Science', 'Faculty of Technology', 'Faculty of Agriculture']
    },
    {
      id: '9',
      name: 'MSc Software Engineering',
      university: 'Ahmadu Bello University',
      abbreviation: 'ABU',
      country: 'Nigeria',
      location: 'Zaria, Kaduna State, Nigeria',
      tuition_fee: 400000, // in Nigerian Naira
      degree_type: 'Masters',
      created_at: new Date().toISOString(),
      has_scholarships: false,
      match: 92,
      requirements: ['GPA: 3.0+', 'JAMB: 230+'],
      fields: ['Software Engineering', 'Web Development', 'Mobile Development'],
      deadline: 'July 1, 2025',
      term: 'Fall 2025',
      description: 'ABU is the largest university in Nigeria and sub-Saharan Africa, renowned for its excellent engineering and technology programs.',
      website: 'https://abu.edu.ng',
      logo: 'https://images.pexels.com/photos/256514/pexels-photo-256514.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      faculties: ['Faculty of Computing', 'Faculty of Engineering', 'Faculty of Environmental Design']
    },
    {
      id: '10',
      name: 'MSc Data Science',
      university: 'University of Nigeria, Nsukka',
      abbreviation: 'UNN',
      country: 'Nigeria',
      location: 'Nsukka, Enugu State, Nigeria',
      tuition_fee: 420000, // in Nigerian Naira
      degree_type: 'Masters',
      created_at: new Date().toISOString(),
      has_scholarships: true,
      match: 93,
      requirements: ['GPA: 3.2+', 'JAMB: 235+'],
      fields: ['Data Science', 'Big Data Analytics', 'Machine Learning'],
      deadline: 'June 30, 2025',
      term: 'Fall 2025',
      description: 'UNN is a leading institution in Eastern Nigeria with a strong focus on innovation, research, and technology education across various disciplines.',
      website: 'https://unn.edu.ng',
      logo: 'https://images.pexels.com/photos/159490/yale-university-landscape-universities-schools-159490.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      faculties: ['Faculty of Physical Sciences', 'Faculty of Engineering', 'Faculty of Biological Sciences']
    }
  ];

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch real data from the database
        let results = await searchPrograms({
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

    // Update active filters
    const newActiveFilters: string[] = [];
    if (filters.country) newActiveFilters.push(`Country: ${filters.country}`);
    if (filters.degreeType) newActiveFilters.push(`Degree: ${filters.degreeType}`);
    if (filters.maxTuition !== 'any') newActiveFilters.push(`Max Tuition: $${filters.maxTuition}`);
    if (filters.field) newActiveFilters.push(`Field: ${filters.field}`);
    if (filters.scholarshipsOnly) newActiveFilters.push('Scholarships Available');
    setActiveFilters(newActiveFilters);

    fetchPrograms();
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
            aria-label="Country"
            title="Country"
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Any country</option>
            <option value="Nigeria">Nigeria</option>
            <option value="USA">United States</option>
            <option value="UK">United Kingdom</option>
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
            aria-label="Degree Type"
            title="Degree Type"
            value={filters.degreeType}
            onChange={(e) => handleFilterChange('degreeType', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
            Tuition Range
          </label>
          <select
            aria-label="Tuition Range"
            title="Tuition Range"
            value={filters.maxTuition}
            onChange={(e) => handleFilterChange('maxTuition', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="any">Any range</option>
            <option value="5000">Under $5,000/year</option>
            <option value="20000">$5,000 - $20,000/year</option>
            <option value="40000">$20,000 - $40,000/year</option>
            <option value="100000">$40,000+/year</option>
          </select>
        </div>

        {showAdvancedFilters && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Field of Study
              </label>
              <select
                aria-label="Field of Study"
                title="Field of Study"
                value={filters.field}
                onChange={(e) => handleFilterChange('field', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Any field</option>
                <option value="Computer Science">Computer Science</option>
                <option value="AI">Artificial Intelligence</option>
                <option value="Data Science">Data Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Robotics">Robotics</option>
                <option value="Cloud">Cloud Computing</option>
                <option value="Software">Software Engineering</option>
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
          aria-label={showAdvancedFilters ? "Show less filters" : "Show more filters"}
          title={showAdvancedFilters ? "Show less filters" : "Show more filters"}
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
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <button 
              aria-label="Back to Dashboard"
              title="Back to Dashboard"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors"
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
            aria-label="Go to Cost Calculator"
            title="Go to Cost Calculator"
            onClick={() => navigate('/dashboard/calculator')} 
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
          >
            <Calculator className="h-5 w-5" />
            <span className="hidden sm:inline">Cost Calculator</span>
          </button>
          <button className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors inline-flex items-center gap-2"
            aria-label="Show Match Filters"
            title="Show Match Filters"
          >
            <Filter className="h-5 w-5" />
            <span className="hidden sm:inline">Match Filters</span>
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
            <button className="w-full bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 mb-4"
              aria-label="Get Personalized Suggestions"
              title="Get Personalized Suggestions"
            >
              <Search className="h-5 w-5" />
              Get Personalized Suggestions
            </button>
            <button 
              aria-label="Calculate Education Costs"
              title="Calculate Education Costs"
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
                <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline-block">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  aria-label="Sort by"
                  title="Sort by"
                >
                  <option value="match">Best Match</option>
                  <option value="deadline">Deadline (Soonest)</option>
                  <option value="tuition-low">Tuition (Low to High)</option>
                  <option value="tuition-high">Tuition (High to Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Nigerian Universities Info Alert */}
          {filters.country === 'Nigeria' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800 mb-1">About Nigerian Universities</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Nigerian universities offer high-quality education at affordable rates compared to international options.
                  Tuition fees are displayed in Nigerian Naira (₦).
                </p>
                <p className="text-xs text-blue-600">
                  Programs are accredited by the National Universities Commission (NUC) and are recognized worldwide.
                </p>
              </div>
            </div>
          )}

          {/* Results grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
              <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Searching for programs that match your criteria...</p>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
              <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <AlertIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">Error</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
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
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
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

// Alert Icon Component
const AlertIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default ProgramSearchPage;