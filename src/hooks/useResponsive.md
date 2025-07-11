# Mobile-First Responsive Utilities

Comprehensive responsive hooks optimized for Nigerian users with 3G connectivity constraints and mobile-first design patterns.

## 🎯 Features

- **Mobile-First Approach**: 375px breakpoint for Nigerian mobile devices
- **3G Network Detection**: Smart network analysis for optimal performance
- **Reduced Data Mode**: Automatic optimization for slow connections
- **Offline Support**: All hooks work without network connectivity
- **Performance Focused**: Optimized for common Nigerian devices and network conditions

## 📱 Breakpoints

| Device | Width | Common Devices |
|--------|-------|----------------|
| Mobile | 375px+ | iPhone SE, Samsung Galaxy A series |
| Tablet | 768px+ | iPad, Android tablets |
| Desktop | 1024px+ | Laptops, desktop computers |
| Wide | 1280px+ | Large desktop screens |

## 🚀 Quick Start

### Basic Mobile Detection

```tsx
import { useIsMobile } from '../hooks/useResponsive';

const MyComponent = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'p-4' : 'p-8'}`}>
      {isMobile ? 'Mobile View' : 'Desktop View'}
    </div>
  );
};
```

### Network-Aware Components

```tsx
import { useIsOnline } from '../hooks/useResponsive';

const DataIntensiveComponent = () => {
  const { isOnline, is3G, shouldOptimize } = useIsOnline();
  
  if (!isOnline) {
    return <OfflineMessage />;
  }
  
  return (
    <div>
      {shouldOptimize ? (
        <LightweightVersion />
      ) : (
        <FullFeaturedVersion />
      )}
      
      {is3G && <NetworkOptimizationBanner />}
    </div>
  );
};
```

### Adaptive UI with Reduced Data

```tsx
import { useReducedData } from '../hooks/useResponsive';

const AnimatedComponent = () => {
  const { 
    shouldDisableAnimations, 
    animationDuration,
    maxResults,
    performanceLevel 
  } = useReducedData();
  
  return (
    <div 
      className={`transition-all duration-${shouldDisableAnimations ? '0' : animationDuration}`}
      style={{
        transitionDuration: `${animationDuration}ms`
      }}
    >
      <ResultsList limit={maxResults} />
      
      {performanceLevel === 'enhanced' && <AdvancedFeatures />}
    </div>
  );
};
```

## 📖 Hook Reference

### useIsMobile()

Detects mobile devices with 375px breakpoint.

```tsx
const isMobile = useIsMobile();

// Returns: boolean
// true if screen width < 375px
// false if screen width >= 375px
```

**Features:**
- ✅ Works offline
- ✅ Debounced resize detection (100ms)
- ✅ SSR-safe (assumes mobile-first)
- ✅ Optimized for performance

### useIsOnline()

Comprehensive network detection with 3G optimization.

```tsx
const networkInfo = useIsOnline();

// Returns object with:
{
  isOnline: boolean,           // Navigator online status
  connectionType: ConnectionType, // 'slow-2g' | '2g' | '3g' | '4g' | 'offline'
  effectiveType: string,       // Browser reported effective type
  downlink: number,           // Connection speed (Mbps)
  rtt: number,               // Round trip time (ms)
  saveData: boolean,         // Data saver enabled
  
  // Convenience methods
  isSlowConnection: boolean,  // slow-2g or 2g
  is3G: boolean,             // 3g connection
  is4GOrBetter: boolean,     // 4g+ connection
  shouldOptimize: boolean    // Should optimize for data usage
}
```

**Network Type Detection:**
```tsx
const { connectionType } = useIsOnline();

switch (connectionType) {
  case 'slow-2g':
    return <MinimalInterface />;
  case '2g':
    return <BasicInterface />;
  case '3g':
    return <StandardInterface />;
  case '4g':
    return <FullInterface />;
}
```

### useReducedData()

Smart data reduction for 3G optimization.

```tsx
const dataSettings = useReducedData();

// Returns object with:
{
  isReducedData: boolean,        // Reduced data mode active
  isUserEnabled: boolean,        // User manually enabled
  isAutoEnabled: boolean,        // Auto-enabled by system
  
  // Control functions
  toggleReducedData: (enabled?: boolean) => void,
  
  // Feature flags
  shouldDisableAnimations: boolean,
  shouldLazyLoad: boolean,
  shouldCompressImages: boolean,
  shouldLimitResults: boolean,
  maxResults: number,           // 5, 10, or 20 based on connection
  
  // Performance settings
  animationDuration: number,    // 0, 150, or 300ms
  shouldShowSkeletons: boolean,
  shouldPreloadData: boolean,
  performanceLevel: 'minimal' | 'basic' | 'standard' | 'enhanced'
}
```

**Auto-Enable Conditions:**
- User has data saver enabled
- Connection is slow-2g or 2g
- User prefers reduced motion
- Device is offline
- User manually enabled

### useResponsive()

Complete responsive design toolkit.

```tsx
const responsive = useResponsive();

// Returns object with:
{
  windowSize: { width: number, height: number },
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop' | 'wide',
  isMobile: boolean,
  isTablet: boolean,
  isDesktop: boolean,
  isWide: boolean,
  breakpoints: ResponsiveBreakpoints,
  
  // Utility functions
  isAbove: (breakpoint) => boolean,
  isBelow: (breakpoint) => boolean,
  isBetween: (min, max) => boolean
}
```

### useResponsiveContext()

All-in-one responsive hook combining all utilities.

```tsx
const { device, network, performance, utils } = useResponsiveContext();

// Device information
device.isMobile           // Mobile detection
device.currentBreakpoint  // Current breakpoint
device.isTouch           // Touch device detection

// Network information  
network.isOnline         // Online status
network.connectionType   // Connection speed
network.shouldOptimize   // Should optimize for data

// Performance optimization
performance.isReducedData    // Reduced data mode
performance.animationDuration // Optimal animation duration
performance.maxResults       // Optimal result count

// Utility functions
utils.getOptimalImageSize(baseSize)  // Get optimal image size
utils.getOptimalPageSize()          // Get optimal pagination
utils.shouldEnableFeature(feature)  // Check if feature should be enabled
```

## 🎨 Advanced Usage Patterns

### Responsive Image Loading

```tsx
const ResponsiveImage = ({ src, alt, baseSize = 300 }) => {
  const { utils, network, performance } = useResponsiveContext();
  
  const imageSize = utils.getOptimalImageSize(baseSize);
  const shouldCompress = performance.shouldCompressImages;
  
  const imageSrc = shouldCompress 
    ? `${src}?w=${imageSize}&q=70` 
    : `${src}?w=${imageSize}`;
    
  return (
    <img 
      src={imageSrc}
      alt={alt}
      loading={performance.shouldLazyLoad ? 'lazy' : 'eager'}
      className="w-full h-auto"
    />
  );
};
```

### Adaptive Pagination

```tsx
const PaginatedList = ({ data, onPageChange }) => {
  const { utils } = useResponsiveContext();
  const pageSize = utils.getOptimalPageSize();
  
  return (
    <div>
      <ResultsList 
        data={data} 
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
};
```

### Performance-Aware Animations

```tsx
const AnimatedCard = ({ children }) => {
  const { performance, utils } = useResponsiveContext();
  const shouldAnimate = utils.shouldEnableFeature('animations');
  
  return (
    <div 
      className={`
        ${shouldAnimate ? 'transition-transform hover:scale-105' : ''}
        duration-${performance.animationDuration}
      `}
    >
      {children}
    </div>
  );
};
```

### Network-Adaptive Search

```tsx
const SearchResults = ({ query }) => {
  const { network, performance } = useResponsiveContext();
  const [results, setResults] = useState([]);
  
  const fetchResults = useCallback(async () => {
    const limit = performance.maxResults;
    const includeImages = !network.isSlowConnection;
    const compress = performance.shouldCompressImages;
    
    const data = await searchAPI(query, { 
      limit, 
      includeImages, 
      compress 
    });
    
    setResults(data);
  }, [query, performance.maxResults, network.isSlowConnection]);
  
  return (
    <div>
      {performance.shouldShowSkeletons ? (
        <SkeletonLoader count={performance.maxResults} />
      ) : null}
      
      <ResultsList results={results} />
      
      {network.isSlowConnection && (
        <LowBandwidthWarning />
      )}
    </div>
  );
};
```

### Responsive Layout Components

```tsx
const ResponsiveGrid = ({ children }) => {
  const { device } = useResponsiveContext();
  
  const getGridCols = () => {
    if (device.isMobile) return 'grid-cols-1';
    if (device.isTablet) return 'grid-cols-2';
    if (device.isDesktop) return 'grid-cols-3';
    return 'grid-cols-4';
  };
  
  return (
    <div className={`grid gap-4 ${getGridCols()}`}>
      {children}
    </div>
  );
};
```

## 🔧 Performance Optimization

### Automatic Data Reduction

The hooks automatically optimize for Nigerian network conditions:

```tsx
// Automatically reduces data usage on 3G networks
const OptimizedComponent = () => {
  const { performance, network } = useResponsiveContext();
  
  useEffect(() => {
    if (network.is3G) {
      // Automatically enabled reduced data mode
      console.log('3G detected, optimizing experience');
    }
  }, [network.is3G]);
  
  return (
    <div>
      {performance.performanceLevel === 'minimal' && <MinimalUI />}
      {performance.performanceLevel === 'basic' && <BasicUI />}
      {performance.performanceLevel === 'standard' && <StandardUI />}
      {performance.performanceLevel === 'enhanced' && <EnhancedUI />}
    </div>
  );
};
```

### User Preference Management

```tsx
const DataSettingsPanel = () => {
  const { isReducedData, toggleReducedData, isUserEnabled } = useReducedData();
  
  return (
    <div className="settings-panel">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isUserEnabled}
          onChange={(e) => toggleReducedData(e.target.checked)}
        />
        <span>Reduce data usage</span>
      </label>
      
      {isReducedData && (
        <p className="text-sm text-gray-600">
          Data reduction active - some features limited
        </p>
      )}
    </div>
  );
};
```

## 🌍 Nigerian-Specific Optimizations

### Common Device Support
- **Samsung Galaxy A Series**: Primary target (375px+)
- **iPhone SE**: Minimum viable size (375px)
- **Tecno/Infinix**: Popular budget smartphones
- **iPad**: Tablet experience (768px+)

### Network Conditions
- **3G Networks**: Primary optimization target
- **2G Fallback**: Basic functionality maintained
- **4G Enhancement**: Full features when available
- **Offline Mode**: Core functionality preserved

### Data-Conscious Features
- **Image Compression**: Automatic quality adjustment
- **Lazy Loading**: Reduced initial payload
- **Pagination Limits**: Smaller result sets on slow connections
- **Animation Reduction**: Performance over aesthetics on 3G

## 🧪 Testing

### Manual Testing
```tsx
// Test different breakpoints
const BreakpointTester = () => {
  const responsive = useResponsive();
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded">
      <div>Width: {responsive.windowSize.width}px</div>
      <div>Breakpoint: {responsive.currentBreakpoint}</div>
      <div>Mobile: {responsive.isMobile ? 'Yes' : 'No'}</div>
    </div>
  );
};

// Test network conditions
const NetworkTester = () => {
  const network = useIsOnline();
  
  return (
    <div className="fixed top-4 right-4 bg-blue-500 text-white p-2 rounded">
      <div>Online: {network.isOnline ? 'Yes' : 'No'}</div>
      <div>Type: {network.connectionType}</div>
      <div>Speed: {network.downlink} Mbps</div>
      <div>RTT: {network.rtt}ms</div>
    </div>
  );
};
```

### Programmatic Testing
```tsx
// Mock network conditions for testing
const TestEnvironment = ({ children, mockNetwork }) => {
  useEffect(() => {
    if (mockNetwork) {
      // Override navigator.connection for testing
      Object.defineProperty(navigator, 'connection', {
        writable: true,
        value: mockNetwork
      });
    }
  }, [mockNetwork]);
  
  return children;
};

// Usage
<TestEnvironment mockNetwork={{ effectiveType: '3g', downlink: 0.7 }}>
  <MyComponent />
</TestEnvironment>
```

This comprehensive responsive utilities package provides everything needed for building mobile-first, performance-conscious applications optimized for Nigerian users and network conditions.