import React, { useState } from 'react';
import { Heart, MapPin, Clock, Users, GraduationCap, Star, BookOpen } from 'lucide-react';
import { formatNGN, convertUSDToNGN } from '../../utils/currency';
import { useIsMobile } from '../../hooks/useResponsive';
import { useDarkMode } from '../../hooks/useDarkMode';
import type { Program } from '../../lib/types';

// Enhanced Program interface for better type safety
export interface EnhancedProgram extends Program {
  city?: string;
  studentsEnrolled?: number;
  ranking?: number;
  imageUrl?: string;
  degreeLevel?: 'bachelor' | 'master' | 'phd';
  scholarshipAvailable?: boolean;
  applicationFee?: number;
  requirementsDetails?: {
    gpa?: number;
    ielts?: number;
    toefl?: number;
    gre?: boolean;
  };
  duration?: string;
  specialization?: string;
}

interface ProgramCardProps {
  program: EnhancedProgram;
  onSave?: (id: string) => void;
  onUnsave?: (id: string) => void;
  isSaved?: boolean;
  isLoading?: boolean;
  onViewDetails?: (id: string) => void;
  className?: string;
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
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
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
      <div className="mb-3">
        <div className={`h-6 ${baseClasses} mb-1`} style={{ width: '50%' }} />
        <div className={`h-3 ${baseClasses}`} style={{ width: '30%' }} />
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
  isSaved = false,
  isLoading = false,
  onViewDetails,
  className = ''
}) => {
  const isMobile = useIsMobile();
  const { isDark } = useDarkMode();
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate NGN price using proper currency utilities
  const tuitionUSD = program.tuition_fee || 0;
  const tuitionNGN = convertUSDToNGN(tuitionUSD) as number;

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
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return <ProgramCardSkeleton className={className} />;
  }

  return (
    <article 
      className={`
        bg-white dark:bg-gray-800 
        rounded-lg border border-gray-200 dark:border-gray-700 
        hover:border-indigo-300 dark:hover:border-indigo-600
        hover:shadow-lg dark:hover:shadow-gray-900/20
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
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base line-clamp-2 mb-1">
            {program.name || 'Program Title'}
          </h3>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
            <GraduationCap className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{program.university || 'University not specified'}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
            <span className="mr-1">{getCountryFlag(program.country || '')}</span>
            <MapPin className="h-3 w-3 mr-1" />
            <span>{program.location || program.city || 'Location N/A'}, {program.country || 'Country N/A'}</span>
          </div>
        </div>

        {/* Save/Bookmark Button */}
        <button
          onClick={handleSaveToggle}
          onKeyDown={handleSaveKeyDown}
          className={`
            ml-3 p-2 rounded-full transition-all duration-200 flex-shrink-0
            ${isSaved 
              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30' 
              : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-red-500'
            }
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
          `}
          aria-label={isSaved ? 'Remove from saved programs' : 'Save program'}
          title={isSaved ? 'Remove from saved' : 'Save program'}
        >
          <Heart 
            className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Price Section - Prominent display */}
      <div className="mb-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {formatNGN(tuitionNGN, { compact: isMobile, decimals: 0 })}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Tuition: {tuitionUSD.toLocaleString()}/year
            </div>
          </div>
          {(program.has_scholarships || program.scholarshipAvailable) && (
            <div className="text-xs bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-full font-medium">
              <Star className="h-3 w-3 inline mr-1" />
              Scholarship
            </div>
          )}
        </div>
      </div>

      {/* Program Details */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>{program.duration || 'Duration N/A'}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <BookOpen className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{program.specialization || 'Specialization N/A'}</span>
        </div>
        {program.studentsEnrolled && (
          <div className="flex items-center text-gray-600 dark:text-gray-400">
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
            <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
              <span className="text-gray-500 dark:text-gray-400">Min GPA:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100 ml-1">{program.requirementsDetails.gpa || 'N/A'}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
              <span className="text-gray-500 dark:text-gray-400">
                {program.requirementsDetails.ielts ? 'IELTS:' : program.requirementsDetails.toefl ? 'TOEFL:' : 'English:'}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100 ml-1">
                {program.requirementsDetails.ielts || program.requirementsDetails.toefl || 'Required'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Description */}
      {program.description && (
        <div className="mb-3">
          <p className={`text-xs text-gray-600 dark:text-gray-400 ${!isExpanded ? 'line-clamp-2' : ''}`}>
            {program.description}
          </p>
          {program.description.length > 100 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mt-1 focus:outline-none"
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
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <span>Deadline: </span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {program.deadline || 'N/A'}
          </span>
        </div>
        
        <div className="flex gap-2">
          {onViewDetails && (
            <button 
              onClick={() => onViewDetails(program.id)}
              className="text-xs bg-indigo-600 dark:bg-indigo-500 text-white px-3 py-1.5 rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
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