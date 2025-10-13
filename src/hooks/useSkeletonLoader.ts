import { useState, useEffect } from 'react';

interface UseSkeletonLoaderOptions {
  /**
   * Minimum loading duration in milliseconds
   * Ensures skeleton shows for at least this duration for perceived performance
   */
  minDuration?: number;
  
  /**
   * Whether to show skeleton immediately or wait for initial data fetch
   */
  immediate?: boolean;
}

/**
 * Hook for managing skeleton loading states
 * Optimized for 3G networks with intelligent timing
 */
export const useSkeletonLoader = (options: UseSkeletonLoaderOptions = {}) => {
  const { minDuration = 800, immediate = true } = options;
  
  const [isLoading, setIsLoading] = useState(immediate);
  const [showSkeleton, setShowSkeleton] = useState(immediate);
  const [startTime, setStartTime] = useState<number | null>(null);

  const startLoading = () => {
    setIsLoading(true);
    setShowSkeleton(true);
    setStartTime(Date.now());
  };

  const stopLoading = () => {
    setIsLoading(false);
    
    if (startTime) {
      const elapsed = Date.now() - startTime;
      const remainingTime = minDuration - elapsed;
      
      if (remainingTime > 0) {
        // Ensure minimum skeleton duration for perceived performance
        setTimeout(() => {
          setShowSkeleton(false);
          setStartTime(null);
        }, remainingTime);
      } else {
        setShowSkeleton(false);
        setStartTime(null);
      }
    } else {
      setShowSkeleton(false);
    }
  };

  return {
    isLoading,
    showSkeleton,
    startLoading,
    stopLoading
  };
};

/**
 * Hook for data fetching with skeleton states
 * Combines data fetching with optimized skeleton loading
 */
export const useSkeletonData = <T>(
  fetchFn: () => Promise<T>,
  dependencies: React.DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { isLoading, showSkeleton, startLoading, stopLoading } = useSkeletonLoader();

  const refetch = async () => {
    try {
      startLoading();
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fetch failed'));
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    refetch();
  }, dependencies);

  return {
    data,
    error,
    isLoading,
    showSkeleton,
    refetch
  };
};

/**
 * Hook for progressive loading with multiple skeleton states
 * Useful for complex pages with multiple data sources
 */
export const useProgressiveSkeleton = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [skeletonStates, setSkeletonStates] = useState<Record<string, boolean>>({});

  const startLoading = (key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    setSkeletonStates(prev => ({ ...prev, [key]: true }));
  };

  const stopLoading = (key: string, minDuration = 800) => {
    setLoadingStates(prev => ({ ...prev, [key]: false }));
    
    // Delay skeleton hiding for perceived performance
    setTimeout(() => {
      setSkeletonStates(prev => ({ ...prev, [key]: false }));
    }, minDuration);
  };

  const isLoading = (key: string) => loadingStates[key] || false;
  const showSkeleton = (key: string) => skeletonStates[key] || false;
  const isAnyLoading = Object.values(loadingStates).some(Boolean);
  const showAnySkeleton = Object.values(skeletonStates).some(Boolean);

  return {
    startLoading,
    stopLoading,
    isLoading,
    showSkeleton,
    isAnyLoading,
    showAnySkeleton,
    loadingStates,
    skeletonStates
  };
};

/**
 * Example usage patterns for different components
 */
export const SkeletonPatterns = {
  // For search results
  searchResults: `
    const { data, showSkeleton } = useSkeletonData(() => fetchPrograms(query), [query]);
    
    return (
      <div>
        {showSkeleton ? (
          <SkeletonLoader.SearchResults count={6} />
        ) : (
          <ProgramList programs={data} />
        )}
      </div>
    );
  `,
  
  // For dashboard
  dashboard: `
    const skeleton = useProgressiveSkeleton();
    
    useEffect(() => {
      skeleton.startLoading('stats');
      skeleton.startLoading('applications');
      skeleton.startLoading('charts');
      
      fetchDashboardData().then(data => {
        skeleton.stopLoading('stats');
        skeleton.stopLoading('applications');
        skeleton.stopLoading('charts');
      });
    }, []);
    
    return (
      <div>
        {skeleton.showSkeleton('stats') ? (
          <SkeletonLoader.DashboardGrid />
        ) : (
          <StatsGrid data={statsData} />
        )}
      </div>
    );
  `,
  
  // For individual components
  component: `
    const { showSkeleton, startLoading, stopLoading } = useSkeletonLoader({
      minDuration: 600,
      immediate: false
    });
    
    const handleRefresh = async () => {
      startLoading();
      await fetchData();
      stopLoading();
    };
    
    return showSkeleton ? <SkeletonLoader.ProgramCard /> : <ProgramCard data={data} />;
  `
};