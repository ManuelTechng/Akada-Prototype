import React, { useState } from 'react';
import { 
  FileText, 
  BookOpen, 
  Award, 
  Globe, 
  Download, 
  ExternalLink, 
  Search,
  Filter,
  Calendar,
  DollarSign,
  GraduationCap,
  BookmarkIcon,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const Resources: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'scholarships' | 'visas' | 'guides'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const scholarships = [
    {
      name: "Chevening Scholarship",
      country: "UK",
      coverage: "Full tuition, living expenses, flights",
      deadline: "November 2, 2024",
      eligibility: "Nigerian citizens with at least 2 years work experience",
      website: "https://www.chevening.org/",
      logo: "https://images.pexels.com/photos/6147363/pexels-photo-6147363.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      name: "DAAD Scholarship",
      country: "Germany",
      coverage: "Full tuition, €850/month stipend",
      deadline: "October 15, 2024",
      eligibility: "International students with excellent academic record",
      website: "https://www.daad.de/",
      logo: "https://images.pexels.com/photos/54097/germany-flag-german-flag-germany-flag-54097.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      name: "Fulbright Foreign Student Program",
      country: "USA",
      coverage: "Full tuition, living expenses, health insurance",
      deadline: "February 28, 2025",
      eligibility: "Nigerian citizens with bachelor's degree",
      website: "https://foreign.fulbrightonline.org/",
      logo: "https://images.pexels.com/photos/1550342/pexels-photo-1550342.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      name: "Commonwealth Scholarships",
      country: "UK",
      coverage: "Full tuition, living allowance, travel",
      deadline: "December 16, 2024",
      eligibility: "Citizens of Commonwealth countries",
      website: "https://cscuk.fcdo.gov.uk/",
      logo: "https://images.pexels.com/photos/1796794/pexels-photo-1796794.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      name: "Rhodes Scholarship",
      country: "UK",
      coverage: "Full tuition, stipend, travel expenses",
      deadline: "September 30, 2024",
      eligibility: "Nigerian citizens, under 25, bachelor's degree",
      website: "https://www.rhodeshouse.ox.ac.uk/",
      logo: "https://images.pexels.com/photos/6147179/pexels-photo-6147179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      name: "Orange Knowledge Programme",
      country: "Netherlands",
      coverage: "Full tuition, living expenses, insurance",
      deadline: "January 15, 2025",
      eligibility: "Professionals from eligible countries including Nigeria",
      website: "https://www.nuffic.nl/",
      logo: "https://images.pexels.com/photos/2649541/pexels-photo-2649541.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
  ];

  const visaGuides = [
    {
      country: "Canada",
      requirements: ["Study permit", "Biometrics", "Medical exam", "Proof of funds"],
      processingTime: "8-12 weeks",
      link: "#",
      flag: "https://images.pexels.com/photos/45201/kitchener-waterloo-ontario-canada-45201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      country: "USA",
      requirements: ["F-1 visa", "I-20 form", "SEVIS fee", "Visa interview"],
      processingTime: "3-5 weeks",
      link: "#",
      flag: "https://images.pexels.com/photos/1550340/pexels-photo-1550340.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      country: "UK",
      requirements: ["Student visa", "CAS number", "Tuberculosis test", "Financial proof"],
      processingTime: "3 weeks",
      link: "#",
      flag: "https://images.pexels.com/photos/672532/pexels-photo-672532.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      country: "Germany",
      requirements: ["Student visa", "University admission", "Blocked account", "Health insurance"],
      processingTime: "4-6 weeks",
      link: "#",
      flag: "https://images.pexels.com/photos/109629/pexels-photo-109629.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      country: "Australia",
      requirements: ["Student visa (subclass 500)", "GTE requirement", "Health insurance", "Financial proof"],
      processingTime: "4-8 weeks",
      link: "#",
      flag: "https://images.pexels.com/photos/1098461/pexels-photo-1098461.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      country: "Netherlands",
      requirements: ["MVV visa", "Residence permit", "Proof of acceptance", "Health insurance"],
      processingTime: "4-6 weeks",
      link: "#",
      flag: "https://images.pexels.com/photos/1223648/pexels-photo-1223648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
  ];

  const guides = [
    {
      title: "Writing a Compelling Statement of Purpose",
      type: "PDF Guide",
      description: "Learn how to craft a standout SOP that showcases your unique story and aspirations.",
      icon: <FileText className="h-5 w-5" />,
      category: "application",
      featured: true,
      downloadUrl: "#"
    },
    {
      title: "Securing Strong Recommendation Letters",
      type: "Video Tutorial",
      description: "Tips for approaching professors and employers for impactful recommendation letters.",
      icon: <BookOpen className="h-5 w-5" />,
      category: "application",
      featured: false,
      downloadUrl: "#"
    },
    {
      title: "Budgeting for International Education",
      type: "Interactive Calculator",
      description: "Plan your finances with our comprehensive education budget calculator.",
      icon: <DollarSign className="h-5 w-5" />,
      category: "finance",
      featured: true,
      downloadUrl: "#"
    },
    {
      title: "Navigating the Student Visa Interview",
      type: "Video Guide",
      description: "Prepare for your visa interview with tips from successful applicants and former consular officers.",
      icon: <Globe className="h-5 w-5" />,
      category: "visa",
      featured: true,
      downloadUrl: "#"
    },
    {
      title: "Finding Accommodation Abroad",
      type: "PDF Guide",
      description: "Everything you need to know about finding suitable housing when studying internationally.",
      icon: <FileText className="h-5 w-5" />,
      category: "living",
      featured: false,
      downloadUrl: "#"
    },
    {
      title: "Mastering the GRE/GMAT",
      type: "Study Plan",
      description: "A comprehensive 8-week study plan for achieving your target score.",
      icon: <BookOpen className="h-5 w-5" />,
      category: "exams",
      featured: false,
      downloadUrl: "#"
    },
    {
      title: "Research Proposal Writing Guide",
      type: "Template",
      description: "Structure and format your research proposal to impress admission committees.",
      icon: <FileText className="h-5 w-5" />,
      category: "application",
      featured: true,
      downloadUrl: "#"
    },
    {
      title: "Scholarship Application Checklist",
      type: "Worksheet",
      description: "Stay organized with this comprehensive checklist for scholarship applications.",
      icon: <Award className="h-5 w-5" />,
      category: "scholarship",
      featured: true,
      downloadUrl: "#"
    }
  ];

  const upcomingEvents = [
    {
      title: "UK Universities Virtual Fair",
      date: "May 15, 2024",
      time: "10:00 AM - 4:00 PM WAT",
      organizer: "British Council",
      link: "#",
      type: "fair"
    },
    {
      title: "Scholarship Application Workshop",
      date: "May 22, 2024",
      time: "2:00 PM - 4:00 PM WAT",
      organizer: "Akada",
      link: "#",
      type: "workshop"
    },
    {
      title: "Statement of Purpose Masterclass",
      date: "June 5, 2024",
      time: "6:00 PM - 8:00 PM WAT",
      organizer: "Educational Advising Center",
      link: "#",
      type: "webinar"
    }
  ];

  const filterGuides = () => {
    if (activeCategory === 'all' && !searchQuery) {
      return guides;
    }
    
    return guides.filter(guide => {
      const matchesCategory = activeCategory === 'all' || 
        (activeCategory === 'guides' && guide.category !== 'scholarship' && guide.category !== 'visa');
      
      const matchesSearch = !searchQuery || 
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  };

  const filterScholarships = () => {
    if (activeCategory !== 'all' && activeCategory !== 'scholarships') {
      return [];
    }
    
    return scholarships.filter(scholarship => {
      const matchesCountry = !countryFilter || scholarship.country === countryFilter;
      
      const matchesSearch = !searchQuery || 
        scholarship.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scholarship.eligibility.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCountry && matchesSearch;
    });
  };

  const filterVisas = () => {
    if (activeCategory !== 'all' && activeCategory !== 'visas') {
      return [];
    }
    
    return visaGuides.filter(visa => {
      const matchesCountry = !countryFilter || visa.country === countryFilter;
      
      const matchesSearch = !searchQuery || 
        visa.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visa.requirements.some(req => req.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCountry && matchesSearch;
    });
  };

  const filteredGuides = filterGuides();
  const filteredScholarships = filterScholarships();
  const filteredVisas = filterVisas();

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Resources</h1>
        <p className="text-gray-600">Helpful guides and information for your international education journey</p>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search resources..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-lg ${
                activeCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Resources
            </button>
            <button
              onClick={() => setActiveCategory('scholarships')}
              className={`px-4 py-2 rounded-lg ${
                activeCategory === 'scholarships'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Scholarships
            </button>
            <button
              onClick={() => setActiveCategory('visas')}
              className={`px-4 py-2 rounded-lg ${
                activeCategory === 'visas'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Visa Guides
            </button>
            <button
              onClick={() => setActiveCategory('guides')}
              className={`px-4 py-2 rounded-lg ${
                activeCategory === 'guides'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Guides & Tips
            </button>
          </div>
        </div>

        {/* Country filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700">Filter by country:</span>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Countries</option>
            <option value="UK">United Kingdom</option>
            <option value="USA">United States</option>
            <option value="Canada">Canada</option>
            <option value="Germany">Germany</option>
            <option value="Australia">Australia</option>
            <option value="Netherlands">Netherlands</option>
          </select>
        </div>
      </div>

      <div className="space-y-8">
        {/* Featured Resources */}
        {activeCategory === 'all' && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Featured Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {guides.filter(guide => guide.featured).slice(0, 3).map((guide, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-indigo-100 p-2 rounded-lg flex-shrink-0">
                      {guide.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{guide.title}</h3>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{guide.type}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{guide.description}</p>
                  <a 
                    href={guide.downloadUrl} 
                    className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-700"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scholarships Section */}
        {(activeCategory === 'all' || activeCategory === 'scholarships') && filteredScholarships.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-6">
              <Award className="h-6 w-6 text-indigo-600 flex-shrink-0" />
              <h2 className="text-xl font-semibold">Scholarships for Nigerian Students</h2>
            </div>
            
            <div className="space-y-6">
              {filteredScholarships.map((scholarship, index) => (
                <div key={index} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={scholarship.logo} 
                        alt={`${scholarship.name} logo`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                        <h3 className="font-semibold text-lg text-gray-900 break-words">{scholarship.name}</h3>
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs self-start">
                          {scholarship.country}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3 break-words">{scholarship.coverage}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-red-600 font-medium">
                          <Calendar className="h-4 w-4" />
                          Deadline: {scholarship.deadline}
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <GraduationCap className="h-4 w-4 text-gray-500" />
                          {scholarship.eligibility}
                        </span>
                      </div>
                      <a 
                        href={scholarship.website}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="mt-4 inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        Visit official website
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="mt-6 text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-700">
              <span>View all scholarships</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Visa Guides */}
        {(activeCategory === 'all' || activeCategory === 'visas') && filteredVisas.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mt-8">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="h-6 w-6 text-indigo-600 flex-shrink-0" />
              <h2 className="text-xl font-semibold">Visa Requirements</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVisas.map((visa, index) => (
                <div key={index} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                      <img 
                        src={visa.flag} 
                        alt={`${visa.country} flag`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{visa.country} Student Visa</h3>
                      <span className="text-sm text-gray-500">Processing: {visa.processingTime}</span>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-gray-700 mb-2 text-sm">Requirements:</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {visa.requirements.map((req, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {req}
                      </span>
                    ))}
                  </div>
                  <a href={visa.link} className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-700 mt-2">
                    <span>View detailed guide</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guides and Resources */}
        {(activeCategory === 'all' || activeCategory === 'guides') && filteredGuides.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mt-8">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-6 w-6 text-indigo-600 flex-shrink-0" />
              <h2 className="text-xl font-semibold">Guides & Tips</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredGuides.map((guide, index) => (
                <div key={index} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg flex-shrink-0">
                      {guide.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-gray-900 mb-1 break-words">{guide.title}</h3>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full flex-shrink-0">{guide.type}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 break-words">{guide.description}</p>
                      <div className="flex justify-between items-center">
                        <a 
                          href={guide.downloadUrl} 
                          className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-700"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </a>
                        <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                          <BookmarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* If no results found */}
        {filteredGuides.length === 0 && filteredScholarships.length === 0 && filteredVisas.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Resources Found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? `No resources matching "${searchQuery}" were found.` 
                : "No resources found for the selected filters."}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCountryFilter('');
                setActiveCategory('all');
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Upcoming Events */}
        <div className="bg-indigo-600 rounded-xl p-6 text-white mt-8">
          <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="bg-indigo-700/50 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                  <h3 className="font-medium text-white">{event.title}</h3>
                  <span className="bg-indigo-500 px-2 py-1 rounded text-xs font-medium inline-block">
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 text-indigo-200 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {event.date}, {event.time}
                  </span>
                  <span>Organized by: {event.organizer}</span>
                </div>
                <a 
                  href={event.link} 
                  className="mt-3 inline-flex items-center gap-1 bg-white text-indigo-700 px-3 py-1 rounded-lg text-sm hover:bg-indigo-50 transition-colors"
                >
                  Register now
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <a href="#" className="text-indigo-200 hover:text-white text-sm font-medium inline-flex items-center">
              View all upcoming events
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>

        {/* Ask for Resources */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Can't Find What You Need?</h2>
          <p className="text-gray-600 mb-4">
            We're constantly adding new resources. Let us know what you're looking for.
          </p>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2">
            <MessageIcon className="h-5 w-5" />
            <span>Request a Resource</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Message icon component
const MessageIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default Resources;