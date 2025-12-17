import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, GraduationCap, Star, BookOpen, AlertCircle } from 'lucide-react';
import { formatProgramTuition } from '../../lib/utils';
import { useIsMobile } from '../../hooks/useResponsive';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useProgramTuition } from '../../hooks/useProgramTuition';
import type { Program } from '../../lib/types';

// Helper function to create slug from university name
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

// Enhanced Program interface for better type safety
export interface EnhancedProgram extends Program {
  city?: string | null;
  studentsEnrolled?: number;
  ranking?: number;
  imageUrl?: string;
  degreeLevel?: 'bachelor' | 'master' | 'phd';
  scholarshipAvailable?: boolean;
  applicationFee?: number | null;
  requirementsDetails?: {
    gpa?: number;
    ielts?: number;
    toefl?: number;
    gre?: boolean;
  };
  duration?: string | null;
  specialization?: string | null;
  university_id?: string;
}

interface ProgramCardProps {
  program: EnhancedProgram;
  onSave?: (id: string) => void;
  onUnsave?: (id: string) => void;
  onApply?: (id: string) => void;
  isSaved?: boolean;
  isLoading?: boolean;
  onViewDetails?: (id: string) => void;
  className?: string;
  showMatchScore?: boolean;
  showRecommendationBadge?: boolean;
  compact?: boolean;
}

interface ProgramCardSkeletonProps {
  className?: string;
}

// ======================================
// SKELETON COMPONENT
// ======================================

export const ProgramCardSkeleton: React.FC<ProgramCardSkeletonProps> = ({ className = '' }) => {
  const { isDark } = useDarkMode();
  const baseClasses = `animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`;

  return (
    <div className={`bg-card rounded-lg border border-border p-4 ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className={`h-5 ${baseClasses} mb-2`} style={{ width: '80%' }} />
          <div className={`h-4 ${baseClasses} mb-1`} style={{ width: '60%' }} />
          <div className={`h-3 ${baseClasses}`} style={{ width: '40%' }} />
        </div>
        <div className={`h-8 w-8 ${baseClasses} rounded-full ml-3`} />
      </div>

      {/* Price skeleton */}
      <div className="mb-3 p-3 bg-primary/10 dark:bg-indigo-900/20 rounded-lg">
        <div className="flex items-baseline justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`h-6 ${baseClasses}`} style={{ width: '60%' }} />
              <div className={`h-3 w-8 ${baseClasses} rounded-full`} />
            </div>
            <div className={`h-3 ${baseClasses}`} style={{ width: '40%' }} />
          </div>
          <div className={`h-6 w-16 ${baseClasses} rounded-full`} />
        </div>
      </div>

      {/* Details skeleton */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className={`h-4 w-4 ${baseClasses} rounded`} />
          <div className={`h-3 ${baseClasses}`} style={{ width: '45%' }} />
        </div>
        <div className="flex items-center space-x-2">
          <div className={`h-4 w-4 ${baseClasses} rounded`} />
          <div className={`h-3 ${baseClasses}`} style={{ width: '35%' }} />
        </div>
      </div>

      {/* Requirements skeleton */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className={`h-8 ${baseClasses} rounded-md`} />
        <div className={`h-8 ${baseClasses} rounded-md`} />
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between">
        <div className={`h-8 ${baseClasses} rounded-md`} style={{ width: '40%' }} />
        <div className={`h-8 ${baseClasses} rounded-md`} style={{ width: '25%' }} />
      </div>
    </div>
  );
};

// ======================================
// MAIN COMPONENT
// ======================================

const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  onSave,
  onUnsave,
  onApply,
  isSaved = false,
  isLoading = false,
  onViewDetails,
  className = '',
  showMatchScore = false,
  showRecommendationBadge = false,
  compact = false
}) => {
  const isMobile = useIsMobile();
  const { isDark } = useDarkMode();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate smart currency display based on program country with real-time rates
  const tuitionAmount = program.tuition_fee || 0;
  const tuitionDisplay = useProgramTuition(tuitionAmount, program.country || '', {
    showConversion: true,
    enableRealTime: true,
    cacheTime: 300000 // 5 minutes cache
  });

  // Fallback to static display if hook is still loading or has issues
  const currencyDisplay = tuitionDisplay.isLoading 
    ? formatProgramTuition(tuitionAmount, program.country || '')
    : {
        primary: tuitionDisplay.primary,
        secondary: tuitionDisplay.secondary,
        isNigerian: tuitionDisplay.isNigerian
      };

  // Handle save/unsave
  const handleSaveToggle = () => {
    if (isSaved && onUnsave) {
      onUnsave(program.id);
    } else if (!isSaved && onSave) {
      onSave(program.id);
    }
  };

  // Handle keyboard navigation for save button
  const handleSaveKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSaveToggle();
    }
  };

  // Get country flag emoji
  const getCountryFlag = (country: string): string => {
    const flags: Record<string, string> = {
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'Germany': '🇩🇪',
      'Netherlands': '🇳🇱',
      'Sweden': '🇸🇪',
      'Denmark': '🇩🇰',
      'France': '🇫🇷',
      'Switzerland': '🇨🇭'
    };
    return flags[country] || '🌍';
  };

  // Get degree level badge color
  const getDegreeColor = (level: string) => {
    switch (level) {
      case 'bachelor': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      case 'master': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300';
      case 'phd': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      default: return 'bg-muted dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return <ProgramCardSkeleton className={className} />;
  }

  return (
    <article 
      className={`
        bg-card 
        rounded-lg border border-border 
        hover:border-indigo-300 dark:hover:border-indigo-600
        hover:shadow-sm dark:hover:shadow-gray-900/20
        transition-all duration-200 
        p-4 ${isMobile ? 'p-3' : 'p-4'}
        relative overflow-hidden
        ${className}
      `}
      aria-label={`Program: ${program.name} at ${program.university}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2 mb-1">
            {program.name || 'Program Title'}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <GraduationCap className="h-4 w-4 mr-1 flex-shrink-0" />
            {program.university ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const slug = createSlug(program.university);
                  navigate(`/app/institution/${slug}`);
                }}
                className="truncate text-primary dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors underline cursor-pointer font-medium"
                title="View university details"
              >
                {program.university}
              </button>
            ) : (
              <span className="truncate">University not specified</span>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
            <span className="mr-1">{getCountryFlag(program.country || '')}</span>
            <MapPin className="h-3 w-3 mr-1" />
            <span>{program.location || program.city || 'Location N/A'}, {program.country || 'Country N/A'}</span>
          </div>
        </div>
      </div>

      {/* Price Section - Prominent display with real-time indicators */}
      <div className="mb-3 p-3 bg-primary/10 dark:bg-indigo-900/20 rounded-lg">
        <div className="flex items-baseline justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <div className="text-lg font-bold text-primary dark:text-indigo-400">
                {tuitionDisplay.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse bg-indigo-200 dark:bg-indigo-700 h-6 w-24 rounded"></div>
                    <span className="text-sm font-normal">/year</span>
                  </div>
                ) : (
                  <>
                    {currencyDisplay.primary}
                    <span className="text-sm font-normal">/year</span>
                  </>
                )}
              </div>
              
              {/* Real-time indicator */}
              {!tuitionDisplay.isLoading && tuitionDisplay.isRealTime && (
                <div className="flex items-center text-xs text-green-600 dark:text-green-400" title="Real-time exchange rates">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                  Live
                </div>
              )}
              
              {/* Error indicator */}
              {tuitionDisplay.hasError && (
                <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400" title="Using approximate rates">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Approx
                </div>
              )}
            </div>
            
            {currencyDisplay.secondary && !tuitionDisplay.isLoading && (
              <div className="text-xs text-muted-foreground mt-1">
                {currencyDisplay.secondary}
              </div>
            )}
            
            {currencyDisplay.isNigerian && (
              <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                🇳🇬 Local tuition fees
              </div>
            )}
          </div>
          
          {(program.has_scholarships || program.scholarshipAvailable) && (
            <div className="text-xs bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-full font-medium flex-shrink-0">
              <Star className="h-3 w-3 inline mr-1" />
              Scholarship
            </div>
          )}
        </div>
      </div>

      {/* Program Details */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="flex items-center text-muted-foreground">
          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>{program.duration || 'Duration N/A'}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <BookOpen className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{program.specialization || 'Specialization N/A'}</span>
        </div>
        {program.studentsEnrolled && (
          <div className="flex items-center text-muted-foreground">
            <Users className="h-3 w-3 mr-1 flex-shrink-0" />
            <span>{program.studentsEnrolled} students</span>
          </div>
        )}
        <div className="flex items-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDegreeColor(program.degree_type || program.degreeLevel || '')}`}>
            {(program.degree_type || program.degreeLevel || 'N/A').charAt(0).toUpperCase() + (program.degree_type || program.degreeLevel || 'N/A').slice(1)}
          </span>
        </div>
      </div>

      {/* Requirements - Mobile optimized */}
      {program.requirementsDetails && (
        <div className="mb-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted dark:bg-gray-700 p-2 rounded">
              <span className="text-muted-foreground">Min GPA:</span>
              <span className="font-medium text-foreground ml-1">{program.requirementsDetails.gpa || 'N/A'}</span>
            </div>
            <div className="bg-muted dark:bg-gray-700 p-2 rounded">
              <span className="text-muted-foreground">
                {program.requirementsDetails.ielts ? 'IELTS:' : program.requirementsDetails.toefl ? 'TOEFL:' : 'English:'}
              </span>
              <span className="font-medium text-foreground ml-1">
                {program.requirementsDetails.ielts || program.requirementsDetails.toefl || 'Required'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Description */}
      {program.description && (
        <div className="mb-3">
          <p className={`text-xs text-muted-foreground ${!isExpanded ? 'line-clamp-2' : ''}`}>
            {program.description}
          </p>
          {program.description.length > 100 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-primary dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mt-1 focus:outline-none"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Show less description' : 'Show more description'}
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="text-xs text-muted-foreground">
          <span>Deadline: </span>
          <span className="font-medium text-foreground dark:text-gray-300">
            {program.deadline || 'N/A'}
          </span>
        </div>
        
        <div className="flex gap-2">
          {/* Save/Unsave Button */}
          {(onSave || onUnsave) && (
            <button
              onClick={handleSaveToggle}
              onKeyDown={handleSaveKeyDown}
              className={`text-xs px-3 py-1.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                isSaved
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/30 focus:ring-red-500'
                  : 'bg-muted dark:bg-gray-700 text-foreground dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500'
              }`}
              aria-label={isSaved ? `Remove ${program.name} from saved programs` : `Save ${program.name}`}
            >
              {isSaved ? 'Saved' : 'Save'}
            </button>
          )}

          {/* Apply Button */}
          {onApply && (
            <button
              onClick={() => onApply(program.id)}
              className="text-xs bg-primary dark:bg-primary/100 text-white px-3 py-1.5 rounded hover:bg-primary/90 dark:hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              aria-label={`Apply to ${program.name}`}
            >
              Apply
            </button>
          )}

          {/* View Details Button */}
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(program.id)}
              className="text-xs bg-primary dark:bg-primary/100 text-white px-3 py-1.5 rounded hover:bg-primary/90 dark:hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              aria-label={`View details for ${program.name}`}
            >
              View Details
            </button>
          )}
        </div>
      </div>

      {/* Ranking badge (if available) */}
      {program.ranking && (
        <div className="absolute top-3 left-3 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-xs px-2 py-1 rounded-full font-medium">
          #{program.ranking}
        </div>
      )}
    </article>
  );
}

export default ProgramCard