import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  GraduationCap,
  DollarSign,
  Calendar,
  Heart,
  Share2,
  ExternalLink,
  Building2,
  FileText,
  CheckCircle,
  Clock,
  Globe,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import CostCalculator from '../components/app/CostCalculator';
import type { Program } from '../lib/types';
import { useDarkMode } from '../hooks/useDarkMode';
import CreateApplicationModal from '../components/app/CreateApplicationModal';

interface University {
  id: string;
  name: string;
  country_code: string;
  type: string;
  website: string;
  description: string;
  ranking_world?: number;
  total_students?: number;
  international_students?: number;
  acceptance_rate?: number;
}

interface Country {
  id: string;
  country_code: string;
  name: string;
  visa_type?: string;
  visa_fee_usd?: number;
  language_requirements?: string;
  work_permit_hours_weekly?: number;
  post_study_work_duration?: string;
}

interface City {
  id: string;
  name: string;
  country_code: string;
  tier: string;
  population?: number;
  climate?: string;
}

type SectionType = 'overview' | 'requirements' | 'costs' | 'location' | 'application' | 'similar';

const ProgramDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  const [program, setProgram] = useState<Program | null>(null);
  const [university, setUniversity] = useState<University | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionType>('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  useEffect(() => {
    const fetchProgramDetails = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Fetch program
        const { data: programData, error: programError } = await supabase
          .from('programs')
          .select('*')
          .eq('id', id)
          .single();

        if (programError) throw programError;
        setProgram(programData as any as Program);

        // Fetch university if university_id exists
        if (programData.university_id) {
          const { data: universityData } = await supabase
            .from('universities')
            .select('*')
            .eq('id', programData.university_id)
            .single();
          setUniversity(universityData as any as University);
        }

        // Fetch country
        const { data: countryData } = await supabase
          .from('countries')
          .select('*')
          .eq('country_code', programData.country)
          .single();
        setCountry(countryData as any as Country);

        // Fetch city if city_id exists
        if (programData.city_id) {
          const { data: cityData } = await supabase
            .from('cities')
            .select('*')
            .eq('id', programData.city_id)
            .single();
          setCity(cityData as any as City);
        }
      } catch (error) {
        console.error('Error fetching program details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgramDetails();
  }, [id]);

  const handleSave = () => {
    // TODO: Implement save to saved_programs table
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    if (navigator.share && program) {
      try {
        await navigator.share({
          title: program.name,
          text: `Check out ${program.name} at ${program.university}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleApplyNow = () => {
    setShowApplicationModal(true);
  };

  const handleApplicationSuccess = () => {
    console.log('Application created successfully');
    setShowApplicationModal(false);
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: <FileText className="w-4 h-4" /> },
    { id: 'requirements', label: 'Requirements', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'costs', label: 'Tuition & Costs', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'location', label: 'Location', icon: <MapPin className="w-4 h-4" /> },
    { id: 'application', label: 'Application', icon: <FileText className="w-4 h-4" /> },
    { id: 'similar', label: 'Similar Programs', icon: <TrendingUp className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-foreground mb-4">Program Not Found</h2>
        <button
          onClick={() => navigate('/app/search')}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Search
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {program.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-1" />
                  {program.university}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {city?.name || program.country}
                </div>
                <div className="flex items-center">
                  <GraduationCap className="w-4 h-4 mr-1" />
                  {program.degree_type}
                </div>
                <div className="flex items-center font-semibold text-primary dark:text-primary">
                  <DollarSign className="w-4 h-4 mr-1" />
                  ${program.tuition_fee?.toLocaleString()}/year
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <button
                onClick={handleSave}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  isSaved
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                    : 'border-border text-foreground hover:bg-accent'
                }`}
              >
                <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button
                onClick={handleApplyNow}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors shadow-sm"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as SectionType)}
                  className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeSection === section.id
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {section.icon}
                  <span className="ml-2">{section.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section 1: Overview */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border shadow-sm p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Program Overview</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-muted-foreground">
                  {program.description || 'No description available for this program.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-card/50 dark:bg-muted/30 rounded-lg p-5 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Duration</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-1">2 Years</p>
                  <p className="text-sm text-muted-foreground">Full-time</p>
                </div>

                <div className="bg-card/50 dark:bg-muted/30 rounded-lg p-5 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Start Date</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-1">Fall 2025</p>
                  <p className="text-sm text-muted-foreground">September</p>
                </div>

                <div className="bg-card/50 dark:bg-muted/30 rounded-lg p-5 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <Award className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Degree</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-1">{program.degree_type}</p>
                  <p className="text-sm text-muted-foreground">Master's Level</p>
                </div>
              </div>
            </div>

            {university && (
              <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">About {university.name}</h3>
                <p className="text-muted-foreground mb-4">{university.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {university.ranking_world && (
                    <div>
                      <p className="text-sm text-muted-foreground">World Ranking</p>
                      <p className="text-lg font-semibold text-foreground">#{university.ranking_world}</p>
                    </div>
                  )}
                  {university.total_students && (
                    <div>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                      <p className="text-lg font-semibold text-foreground">{university.total_students.toLocaleString()}</p>
                    </div>
                  )}
                  {university.international_students && (
                    <div>
                      <p className="text-sm text-muted-foreground">International</p>
                      <p className="text-lg font-semibold text-foreground">{university.international_students.toLocaleString()}</p>
                    </div>
                  )}
                  {university.acceptance_rate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                      <p className="text-lg font-semibold text-foreground">{university.acceptance_rate}%</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 2: Requirements */}
        {activeSection === 'requirements' && (
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Entry Requirements</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Academic Requirements</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Bachelor's degree in related field (minimum 3.0 GPA)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Official transcripts from all institutions attended</span>
                  </li>
                </ul>
              </div>

              {country?.language_requirements && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Language Requirements</h3>
                  <p className="text-muted-foreground">{country.language_requirements}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Application Deadline</h3>
                <p className="text-muted-foreground">January 15, 2025 for Fall 2025 intake</p>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Tuition & Costs */}
        {activeSection === 'costs' && (
          <div>
            <CostCalculator
              programId={program.id}
              preselectedCountry={program.country}
              preselectedCity={city?.id}
              initialTuition={program.tuition_fee}
              className="shadow-sm"
            />
          </div>
        )}

        {/* Section 4: Location */}
        {activeSection === 'location' && (
          <div className="space-y-6">
            {city && (
              <div className="bg-card rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">Location: {city.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Population</p>
                    <p className="text-lg font-semibold text-foreground">
                      {city.population?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Climate</p>
                    <p className="text-lg font-semibold text-foreground">{city.climate || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City Tier</p>
                    <p className="text-lg font-semibold text-foreground capitalize">{city.tier}</p>
                  </div>
                </div>
              </div>
            )}

            {country && (
              <div className="bg-card rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Visa & Immigration</h3>
                <div className="space-y-4">
                  {country.visa_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">Visa Type</p>
                      <p className="text-foreground">{country.visa_type}</p>
                    </div>
                  )}
                  {country.work_permit_hours_weekly && (
                    <div>
                      <p className="text-sm text-muted-foreground">Work Permit</p>
                      <p className="text-foreground">{country.work_permit_hours_weekly} hours/week allowed</p>
                    </div>
                  )}
                  {country.post_study_work_duration && (
                    <div>
                      <p className="text-sm text-muted-foreground">Post-Study Work Permit</p>
                      <p className="text-foreground">{country.post_study_work_duration}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 5: Application Process */}
        {activeSection === 'application' && (
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Application Process</h2>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Create Account', description: 'Register on the university application portal' },
                { step: 2, title: 'Prepare Documents', description: 'Gather transcripts, test scores, and recommendation letters' },
                { step: 3, title: 'Submit Application', description: 'Complete online application and pay application fee' },
                { step: 4, title: 'Track Status', description: 'Monitor your application status online' },
                { step: 5, title: 'Receive Decision', description: 'Decisions typically sent 8-12 weeks after deadline' }
              ].map((item) => (
                <div key={item.step} className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {university?.website && (
              <div className="mt-6 pt-6 border-t border-border">
                <a
                  href={university.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Visit Application Portal
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Section 6: Similar Programs */}
        {activeSection === 'similar' && (
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Similar Programs</h2>
            <p className="text-muted-foreground">
              AI-recommended similar programs will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Application Modal */}
      <CreateApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        programId={program?.id}
        programName={program?.name}
        universityName={program?.university}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
};

export default ProgramDetailPage;
