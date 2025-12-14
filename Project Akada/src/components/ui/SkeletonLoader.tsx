import React from 'react';

// Base skeleton animation classes (reused for minimal CSS)
const baseSkeletonClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';
const shimmerClasses = 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700';

// Micro-component for skeleton lines (highly reusable)
const SkeletonLine: React.FC<{ 
  width?: string; 
  height?: string; 
  className?: string;
}> = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '' 
}) => (
  <div className={`${baseSkeletonClasses} ${shimmerClasses} ${width} ${height} ${className}`} />
);

// Micro-component for skeleton circles
const SkeletonCircle: React.FC<{ 
  size?: string; 
  className?: string;
}> = ({ 
  size = 'w-12 h-12', 
  className = '' 
}) => (
  <div className={`${baseSkeletonClasses} ${shimmerClasses} ${size} rounded-full ${className}`} />
);

// Micro-component for skeleton rectangles
const SkeletonRect: React.FC<{ 
  width?: string; 
  height?: string; 
  className?: string;
}> = ({ 
  width = 'w-full', 
  height = 'h-32', 
  className = '' 
}) => (
  <div className={`${baseSkeletonClasses} ${shimmerClasses} ${width} ${height} ${className}`} />
);

/**
 * Program Card Skeleton - For search results
 * Optimized for 3G: Minimal DOM nodes, efficient animations
 */
export const ProgramCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3 ${className}`}>
    {/* University logo */}
    <div className="flex items-start space-x-3">
      <SkeletonCircle size="w-12 h-12" />
      <div className="flex-1 space-y-2">
        <SkeletonLine width="w-3/4" height="h-5" />
        <SkeletonLine width="w-1/2" height="h-4" />
      </div>
    </div>
    
    {/* Program details */}
    <div className="space-y-2">
      <SkeletonLine width="w-full" height="h-4" />
      <SkeletonLine width="w-5/6" height="h-4" />
    </div>
    
    {/* Tags */}
    <div className="flex space-x-2">
      <SkeletonLine width="w-16" height="h-6" className="rounded-full" />
      <SkeletonLine width="w-20" height="h-6" className="rounded-full" />
      <SkeletonLine width="w-14" height="h-6" className="rounded-full" />
    </div>
    
    {/* Footer */}
    <div className="flex justify-between items-center pt-2">
      <SkeletonLine width="w-24" height="h-5" />
      <SkeletonLine width="w-16" height="h-8" className="rounded-md" />
    </div>
  </div>
);

/**
 * Dashboard Widget Skeleton - For dashboard cards
 * Ultra-lightweight with minimal elements
 */
export const DashboardWidgetSkeleton: React.FC<{ 
  variant?: 'stats' | 'list' | 'chart';
  className?: string;
}> = ({ variant = 'stats', className = '' }) => {
  if (variant === 'stats') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <SkeletonLine width="w-1/3" height="h-4" />
          <SkeletonCircle size="w-8 h-8" />
        </div>
        <SkeletonLine width="w-1/2" height="h-8" className="mb-1" />
        <SkeletonLine width="w-1/4" height="h-3" />
      </div>
    );
  }
  
  if (variant === 'list') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <SkeletonLine width="w-1/2" height="h-5" className="mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-3">
              <SkeletonCircle size="w-6 h-6" />
              <div className="flex-1 space-y-1">
                <SkeletonLine width="w-3/4" height="h-4" />
                <SkeletonLine width="w-1/2" height="h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // chart variant
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <SkeletonLine width="w-1/3" height="h-5" className="mb-4" />
      <SkeletonRect width="w-full" height="h-48" />
    </div>
  );
};

/**
 * Cost Chart Skeleton - For cost calculator charts
 * Minimal design optimized for data visualization loading
 */
export const CostChartSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
    {/* Chart header */}
    <div className="flex items-center justify-between mb-4">
      <SkeletonLine width="w-1/4" height="h-6" />
      <div className="flex space-x-2">
        <SkeletonLine width="w-16" height="h-8" className="rounded-md" />
        <SkeletonLine width="w-16" height="h-8" className="rounded-md" />
      </div>
    </div>
    
    {/* Chart area with bars */}
    <div className="space-y-3 mb-4">
      <div className="flex items-end space-x-2 h-32">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <SkeletonRect 
            key={i}
            width="flex-1" 
            height={`h-${Math.floor(Math.random() * 20) + 12}`}
            className="rounded-t-sm"
          />
        ))}
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <SkeletonLine key={i} width="w-8" height="h-3" />
        ))}
      </div>
    </div>
    
    {/* Chart legend */}
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <SkeletonRect width="w-3" height="h-3" />
        <SkeletonLine width="w-16" height="h-3" />
      </div>
      <div className="flex items-center space-x-2">
        <SkeletonRect width="w-3" height="h-3" />
        <SkeletonLine width="w-20" height="h-3" />
      </div>
    </div>
  </div>
);

/**
 * Application Card Skeleton - For application tracking
 */
export const ApplicationCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1 space-y-2">
        <SkeletonLine width="w-3/4" height="h-5" />
        <SkeletonLine width="w-1/2" height="h-4" />
      </div>
      <SkeletonLine width="w-16" height="h-6" className="rounded-full" />
    </div>
    
    {/* Progress bar */}
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <SkeletonLine width="w-20" height="h-3" />
        <SkeletonLine width="w-12" height="h-3" />
      </div>
      <SkeletonRect width="w-full" height="h-2" className="rounded-full" />
    </div>
    
    {/* Deadline */}
    <SkeletonLine width="w-32" height="h-4" />
  </div>
);

/**
 * Search Results Container Skeleton
 * For when entire search page is loading
 */
export const SearchResultsSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }, (_, i) => (
      <ProgramCardSkeleton key={i} />
    ))}
  </div>
);

/**
 * Dashboard Grid Skeleton
 * For complete dashboard loading state
 */
export const DashboardGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
    <DashboardWidgetSkeleton variant="stats" />
    <DashboardWidgetSkeleton variant="stats" />
    <DashboardWidgetSkeleton variant="stats" />
  </div>
);

/**
 * Generic List Skeleton - Highly reusable
 */
export const ListSkeleton: React.FC<{ 
  items?: number;
  showAvatar?: boolean;
  className?: string;
}> = ({ 
  items = 5, 
  showAvatar = true, 
  className = '' 
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="flex items-center space-x-3">
        {showAvatar && <SkeletonCircle size="w-8 h-8" />}
        <div className="flex-1 space-y-2">
          <SkeletonLine width="w-3/4" height="h-4" />
          <SkeletonLine width="w-1/2" height="h-3" />
        </div>
      </div>
    ))}
  </div>
);

// Default export with all skeleton components
const SkeletonLoader = {
  ProgramCard: ProgramCardSkeleton,
  DashboardWidget: DashboardWidgetSkeleton,
  CostChart: CostChartSkeleton,
  ApplicationCard: ApplicationCardSkeleton,
  SearchResults: SearchResultsSkeleton,
  DashboardGrid: DashboardGridSkeleton,
  List: ListSkeleton,
  Line: SkeletonLine,
  Circle: SkeletonCircle,
  Rect: SkeletonRect
};

export default SkeletonLoader;