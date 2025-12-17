# 3G-Optimized Skeleton Loader Component Library

Ultra-lightweight skeleton loading components designed specifically for 3G networks and Nigerian users with data constraints.

## 🎯 Key Features

- **<2KB Bundle Size**: Highly optimized with shared base classes
- **3G-Optimized**: Minimal DOM nodes and efficient animations
- **Tailwind-Only**: No custom CSS, leverages existing utility classes
- **Dark Mode**: Full theme support with automatic transitions
- **Tree-Shakeable**: Import only what you need
- **Nigerian Context**: Optimized for mobile-first, data-conscious users

## 📦 Bundle Size Breakdown

| Component | Estimated Size | Usage |
|-----------|---------------|--------|
| Base Skeleton Classes | ~200B | Shared animation classes |
| ProgramCardSkeleton | ~300B | Search results loading |
| DashboardWidgetSkeleton | ~250B | Dashboard widgets |
| CostChartSkeleton | ~350B | Chart loading states |
| ApplicationCardSkeleton | ~200B | Application tracking |
| Utility Components | ~150B | Line, Circle, Rect |
| Hooks & Logic | ~500B | Loading state management |
| **Total** | **<2KB** | Complete library |

## 🚀 Quick Start

### Basic Usage

```tsx
import SkeletonLoader from '../ui/SkeletonLoader';

// Simple loading state
const MyComponent = ({ isLoading, data }) => {
  if (isLoading) {
    return <SkeletonLoader.ProgramCard />;
  }
  
  return <ProgramCard data={data} />;
};
```

### With Hooks

```tsx
import { useSkeletonData } from '../hooks/useSkeletonLoader';
import SkeletonLoader from '../ui/SkeletonLoader';

const ProgramSearch = ({ query }) => {
  const { data, showSkeleton } = useSkeletonData(
    () => fetchPrograms(query),
    [query]
  );
  
  return (
    <div>
      {showSkeleton ? (
        <SkeletonLoader.SearchResults count={6} />
      ) : (
        <ProgramList programs={data} />
      )}
    </div>
  );
};
```

## 📋 Available Components

### 1. ProgramCardSkeleton
Perfect for university program search results.

```tsx
<SkeletonLoader.ProgramCard className="mb-4" />
```

**Features:**
- University logo placeholder
- Program title and description lines
- Tag placeholders
- Action button placeholder

### 2. DashboardWidgetSkeleton
Three variants for different dashboard content types.

```tsx
// Statistics widget
<SkeletonLoader.DashboardWidget variant="stats" />

// List widget
<SkeletonLoader.DashboardWidget variant="list" />

// Chart widget
<SkeletonLoader.DashboardWidget variant="chart" />
```

### 3. CostChartSkeleton
Specialized for cost calculator charts and data visualizations.

```tsx
<SkeletonLoader.CostChart className="w-full max-w-2xl" />
```

**Features:**
- Chart header with controls
- Bar chart visualization
- Axis labels
- Legend placeholders

### 4. ApplicationCardSkeleton
For application tracking and status cards.

```tsx
<SkeletonLoader.ApplicationCard />
```

**Features:**
- Application title and university
- Status badge placeholder
- Progress bar
- Deadline information

### 5. Utility Components
Building blocks for custom skeletons.

```tsx
// Line skeleton
<SkeletonLoader.Line width="w-3/4" height="h-4" />

// Circle skeleton
<SkeletonLoader.Circle size="w-12 h-12" />

// Rectangle skeleton
<SkeletonLoader.Rect width="w-full" height="h-32" />
```

## 🔄 Advanced Loading Patterns

### Progressive Loading
Load different sections independently:

```tsx
import { useProgressiveSkeleton } from '../hooks/useSkeletonLoader';

const Dashboard = () => {
  const skeleton = useProgressiveSkeleton();
  
  useEffect(() => {
    // Start all loading states
    skeleton.startLoading('stats');
    skeleton.startLoading('applications');
    skeleton.startLoading('charts');
    
    // Load data independently
    fetchStats().then(() => skeleton.stopLoading('stats'));
    fetchApplications().then(() => skeleton.stopLoading('applications'));
    fetchCharts().then(() => skeleton.stopLoading('charts'));
  }, []);
  
  return (
    <div>
      {skeleton.showSkeleton('stats') ? (
        <SkeletonLoader.DashboardGrid />
      ) : (
        <StatsGrid />
      )}
      
      {skeleton.showSkeleton('applications') ? (
        <SkeletonLoader.List items={5} />
      ) : (
        <ApplicationsList />
      )}
    </div>
  );
};
```

### Search Results with Pagination

```tsx
const SearchResults = ({ query, page }) => {
  const { data, showSkeleton, refetch } = useSkeletonData(
    () => fetchPrograms(query, page),
    [query, page]
  );
  
  return (
    <div>
      {showSkeleton ? (
        <SkeletonLoader.SearchResults count={page === 1 ? 6 : 3} />
      ) : (
        <>
          <ProgramList programs={data?.programs} />
          <Pagination 
            current={page} 
            total={data?.total} 
            onPageChange={refetch}
          />
        </>
      )}
    </div>
  );
};
```

## 🎨 Customization

### Custom Skeleton Components
Build your own using the utility components:

```tsx
const CustomSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-center space-x-3 mb-4">
      <SkeletonLoader.Circle size="w-16 h-16" />
      <div className="flex-1 space-y-2">
        <SkeletonLoader.Line width="w-2/3" height="h-5" />
        <SkeletonLoader.Line width="w-1/2" height="h-4" />
      </div>
    </div>
    <SkeletonLoader.Rect width="w-full" height="h-40" className="mb-3" />
    <div className="flex justify-between">
      <SkeletonLoader.Line width="w-24" height="h-6" />
      <SkeletonLoader.Line width="w-20" height="h-8" />
    </div>
  </div>
);
```

### Responsive Skeletons
Adapt skeleton counts based on screen size:

```tsx
const ResponsiveSkeletons = () => {
  const [skeletonCount, setSkeletonCount] = useState(3);
  
  useEffect(() => {
    const updateCount = () => {
      if (window.innerWidth < 768) setSkeletonCount(2);
      else if (window.innerWidth < 1024) setSkeletonCount(4);
      else setSkeletonCount(6);
    };
    
    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, []);
  
  return <SkeletonLoader.SearchResults count={skeletonCount} />;
};
```

## ⚡ Performance Optimizations

### 3G-Specific Optimizations

1. **Minimal DOM Nodes**: Each skeleton uses the fewest possible elements
2. **Shared Classes**: Base animation classes are reused across all components
3. **Efficient Animations**: CSS-only animations with minimal repaints
4. **Tree Shaking**: Import only needed components

### Bundle Size Tips

```tsx
// ✅ Good - Import only what you need
import { ProgramCardSkeleton } from '../ui/SkeletonLoader';

// ❌ Avoid - Importing entire library
import SkeletonLoader from '../ui/SkeletonLoader';
const { ProgramCard } = SkeletonLoader; // Still includes full bundle
```

### Performance Monitoring

```tsx
// Monitor skeleton display duration
const PerformanceAwareSkeleton = () => {
  const startTime = useRef(Date.now());
  const { showSkeleton } = useSkeletonLoader();
  
  useEffect(() => {
    if (!showSkeleton) {
      const duration = Date.now() - startTime.current;
      console.log(`Skeleton shown for ${duration}ms`);
      
      // Log to analytics for 3G optimization insights
      analytics.track('skeleton_duration', { duration });
    }
  }, [showSkeleton]);
  
  return showSkeleton ? <SkeletonLoader.ProgramCard /> : <ProgramCard />;
};
```

## 🌍 Nigerian Context Optimizations

### Data-Conscious Loading
```tsx
// Reduce skeleton complexity on slow connections
const DataAwareSkeleton = () => {
  const [connectionSpeed] = useConnectionSpeed();
  
  const getSkeletonCount = () => {
    if (connectionSpeed === 'slow-2g' || connectionSpeed === '2g') return 3;
    if (connectionSpeed === '3g') return 4;
    return 6; // 4g+
  };
  
  return <SkeletonLoader.SearchResults count={getSkeletonCount()} />;
};
```

### Progressive Enhancement
```tsx
// Start with minimal skeletons, enhance based on capability
const ProgressiveSkeletons = () => {
  const [enhanced, setEnhanced] = useState(false);
  
  useEffect(() => {
    // Check device capabilities
    const supportsAdvanced = 
      'requestIdleCallback' in window && 
      navigator.hardwareConcurrency > 2;
      
    if (supportsAdvanced) {
      setTimeout(() => setEnhanced(true), 100);
    }
  }, []);
  
  return enhanced ? (
    <SkeletonLoader.CostChart />
  ) : (
    <SkeletonLoader.DashboardWidget variant="chart" />
  );
};
```

## 🧪 Testing

Test skeleton loading states:

```tsx
// Test utilities
export const SkeletonTestUtils = {
  // Force skeleton state for testing
  mockSkeleton: (Component, props = {}) => (
    <Component {...props} isLoading={true} />
  ),
  
  // Test different loading durations
  testLoadingDuration: async (ms = 1000) => {
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, ms));
    return Date.now() - start;
  }
};
```

## 📊 Performance Metrics

Monitor skeleton effectiveness:

```tsx
const SkeletonMetrics = {
  // Track perceived performance
  trackSkeletonImpact: (skeletonDuration, totalLoadTime) => {
    const improvement = (skeletonDuration / totalLoadTime) * 100;
    analytics.track('skeleton_performance', {
      skeleton_duration: skeletonDuration,
      total_load_time: totalLoadTime,
      perceived_improvement: improvement
    });
  }
};
```

## 🔍 Troubleshooting

### Common Issues

1. **Skeleton doesn't hide**: Check `stopLoading()` is called after data fetch
2. **Flash of content**: Increase `minDuration` in `useSkeletonLoader`
3. **Performance issues**: Ensure you're importing only needed components
4. **Dark mode not working**: Verify ThemeProvider is wrapping your app

### Debug Mode

```tsx
const DebugSkeleton = ({ children }) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Skeleton rendered:', Date.now());
  }
  return children;
};
```