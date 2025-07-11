import React, { useState } from 'react';
import { 
  useIsMobile, 
  useIsOnline, 
  useReducedData, 
  useResponsive,
  useResponsiveContext 
} from '../../hooks/useResponsive';

/**
 * Demo component showcasing all responsive utilities
 * Perfect for testing and development
 */
const ResponsiveDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Mobile-First Responsive Utilities
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Optimized for Nigerian users with 3G connectivity
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {['overview', 'mobile', 'network', 'data-reduction', 'combined'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                activeTab === tab
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && <OverviewDemo />}
          {activeTab === 'mobile' && <MobileDemo />}
          {activeTab === 'network' && <NetworkDemo />}
          {activeTab === 'data-reduction' && <DataReductionDemo />}
          {activeTab === 'combined' && <CombinedDemo />}
        </div>
      </div>
    </div>
  );
};

// Overview of all utilities
const OverviewDemo = () => {
  const responsive = useResponsive();
  const isMobile = useIsMobile();
  const network = useIsOnline();
  const dataSettings = useReducedData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Device Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Device Info</h3>
        <div className="space-y-2 text-sm">
          <div>Screen: {responsive.windowSize.width}×{responsive.windowSize.height}</div>
          <div>Breakpoint: <span className="font-medium text-indigo-600">{responsive.currentBreakpoint}</span></div>
          <div>Is Mobile: <span className={isMobile ? 'text-green-600' : 'text-red-600'}>{isMobile ? 'Yes' : 'No'}</span></div>
          <div>Is Touch: <span className="text-blue-600">{'ontouchstart' in window ? 'Yes' : 'No'}</span></div>
        </div>
      </div>

      {/* Network Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Network Status</h3>
        <div className="space-y-2 text-sm">
          <div>Status: <span className={network.isOnline ? 'text-green-600' : 'text-red-600'}>{network.isOnline ? 'Online' : 'Offline'}</span></div>
          <div>Type: <span className="font-medium text-indigo-600">{network.connectionType}</span></div>
          <div>Speed: {network.downlink} Mbps</div>
          <div>RTT: {network.rtt}ms</div>
          <div>Data Saver: <span className={network.saveData ? 'text-orange-600' : 'text-gray-600'}>{network.saveData ? 'On' : 'Off'}</span></div>
        </div>
      </div>

      {/* Performance Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Performance</h3>
        <div className="space-y-2 text-sm">
          <div>Reduced Data: <span className={dataSettings.isReducedData ? 'text-orange-600' : 'text-green-600'}>{dataSettings.isReducedData ? 'Active' : 'Inactive'}</span></div>
          <div>Level: <span className="font-medium text-indigo-600">{dataSettings.performanceLevel}</span></div>
          <div>Max Results: {dataSettings.maxResults}</div>
          <div>Animation: {dataSettings.animationDuration}ms</div>
          <div>Lazy Load: <span className={dataSettings.shouldLazyLoad ? 'text-green-600' : 'text-gray-600'}>{dataSettings.shouldLazyLoad ? 'Yes' : 'No'}</span></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Quick Actions</h3>
        <div className="space-y-3">
          <button
            onClick={() => dataSettings.toggleReducedData()}
            className="w-full px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Toggle Data Reduction
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

// Mobile detection demo
const MobileDemo = () => {
  const isMobile = useIsMobile();
  const responsive = useResponsive();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Mobile Detection (375px breakpoint)</h3>
        
        {/* Real-time display */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-center">
            <span className={`${isMobile ? 'text-green-600' : 'text-blue-600'}`}>
              {isMobile ? '📱 Mobile View' : '🖥️ Desktop View'}
            </span>
          </div>
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            Current width: {responsive.windowSize.width}px
          </div>
        </div>

        {/* Responsive grid demonstration */}
        <div className="grid gap-4" style={{ 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))' 
        }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`p-4 rounded-lg ${isMobile ? 'bg-green-100 dark:bg-green-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
              <div className="text-center">
                <div className="text-lg font-semibold">Card {i}</div>
                <div className="text-sm opacity-75">
                  {isMobile ? 'Mobile layout' : 'Desktop layout'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Breakpoint indicators */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(responsive.breakpoints).map(([name, width]) => (
            <div key={name} className={`p-3 rounded-lg text-center ${
              responsive.windowSize.width >= width 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <div className="font-medium capitalize">{name}</div>
              <div className="text-sm">{width}px+</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Network detection demo
const NetworkDemo = () => {
  const network = useIsOnline();

  const getNetworkColor = (type: string) => {
    switch (type) {
      case 'slow-2g': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case '2g': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case '3g': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case '4g': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Network Detection & 3G Optimization</h3>
        
        {/* Connection status */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-center space-x-4">
            <div className={`px-4 py-2 rounded-full font-medium ${
              network.isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            }`}>
              {network.isOnline ? '🟢 Online' : '🔴 Offline'}
            </div>
            <div className={`px-4 py-2 rounded-full font-medium ${getNetworkColor(network.connectionType)}`}>
              📶 {network.connectionType.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Network details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Connection Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Effective Type:</span>
                <span className="font-medium">{network.effectiveType}</span>
              </div>
              <div className="flex justify-between">
                <span>Downlink Speed:</span>
                <span className="font-medium">{network.downlink} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span>Round Trip Time:</span>
                <span className="font-medium">{network.rtt}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Data Saver:</span>
                <span className={`font-medium ${network.saveData ? 'text-orange-600' : 'text-green-600'}`}>
                  {network.saveData ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Optimization Flags</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Slow Connection:</span>
                <span className={`font-medium ${network.isSlowConnection ? 'text-red-600' : 'text-green-600'}`}>
                  {network.isSlowConnection ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Is 3G:</span>
                <span className={`font-medium ${network.is3G ? 'text-yellow-600' : 'text-gray-600'}`}>
                  {network.is3G ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>4G or Better:</span>
                <span className={`font-medium ${network.is4GOrBetter ? 'text-green-600' : 'text-gray-600'}`}>
                  {network.is4GOrBetter ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Should Optimize:</span>
                <span className={`font-medium ${network.shouldOptimize ? 'text-orange-600' : 'text-green-600'}`}>
                  {network.shouldOptimize ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Network simulation */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-300">💡 Testing Tip</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Use Chrome DevTools → Network tab → Throttling to simulate different connection speeds and test the responsive behavior.
          </p>
        </div>
      </div>
    </div>
  );
};

// Data reduction demo
const DataReductionDemo = () => {
  const dataSettings = useReducedData();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Data Reduction & Performance Optimization
        </h3>
        
        {/* Current status */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium">
                Reduced Data Mode: <span className={dataSettings.isReducedData ? 'text-orange-600' : 'text-green-600'}>
                  {dataSettings.isReducedData ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {dataSettings.isUserEnabled ? 'User enabled' : dataSettings.isAutoEnabled ? 'Auto-enabled' : 'Normal mode'}
              </div>
            </div>
            <button
              onClick={() => dataSettings.toggleReducedData()}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dataSettings.isReducedData 
                  ? 'bg-orange-600 text-white hover:bg-orange-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {dataSettings.isReducedData ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>

        {/* Performance settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Feature Flags</h4>
            <div className="space-y-2 text-sm">
              {[
                { key: 'shouldDisableAnimations', label: 'Disable Animations' },
                { key: 'shouldLazyLoad', label: 'Lazy Loading' },
                { key: 'shouldCompressImages', label: 'Compress Images' },
                { key: 'shouldLimitResults', label: 'Limit Results' },
                { key: 'shouldShowSkeletons', label: 'Show Skeletons' },
                { key: 'shouldPreloadData', label: 'Preload Data' }
              ].map(({ key, label }) => (
                <div key={key} className="flex justify-between">
                  <span>{label}:</span>
                  <span className={`font-medium ${
                    dataSettings[key as keyof typeof dataSettings] ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {dataSettings[key as keyof typeof dataSettings] ? 'Yes' : 'No'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Performance Settings</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Performance Level:</span>
                <span className="font-medium text-indigo-600">{dataSettings.performanceLevel}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Results:</span>
                <span className="font-medium">{dataSettings.maxResults}</span>
              </div>
              <div className="flex justify-between">
                <span>Animation Duration:</span>
                <span className="font-medium">{dataSettings.animationDuration}ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Animation demo */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Animation Demo</h4>
          <div className="flex space-x-4">
            <div 
              className={`w-16 h-16 bg-indigo-600 rounded-lg transition-transform hover:scale-110`}
              style={{ transitionDuration: `${dataSettings.animationDuration}ms` }}
            >
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hover over the square to see animation with current duration: <strong>{dataSettings.animationDuration}ms</strong>
              </p>
              {dataSettings.shouldDisableAnimations && (
                <p className="text-sm text-orange-600 mt-1">
                  ⚡ Animations disabled for better performance
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Combined utilities demo
const CombinedDemo = () => {
  const { device, network, performance, utils } = useResponsiveContext();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Combined Responsive Context
        </h3>
        
        {/* Smart image sizing demo */}
        <div className="mb-6">
          <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Smart Image Sizing</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[200, 300, 400].map(baseSize => {
              const optimalSize = utils.getOptimalImageSize(baseSize);
              return (
                <div key={baseSize} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-center">
                    <div 
                      className="bg-gradient-to-br from-indigo-400 to-purple-600 rounded-lg mx-auto mb-2"
                      style={{ 
                        width: Math.min(optimalSize, 150), 
                        height: Math.min(optimalSize * 0.75, 112) 
                      }}
                    />
                    <div className="text-sm">
                      <div>Base: {baseSize}px</div>
                      <div className="font-medium text-indigo-600">Optimal: {optimalSize}px</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Adaptive pagination demo */}
        <div className="mb-6">
          <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Adaptive Pagination</h4>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-2">
                {utils.getOptimalPageSize()} items per page
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Automatically adjusted based on device type and network conditions
              </div>
            </div>
          </div>
        </div>

        {/* Feature availability */}
        <div className="mb-6">
          <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Feature Availability</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['animations', 'autoplay', 'preload', 'heavy-ui'].map(feature => (
              <div key={feature} className={`p-3 rounded-lg text-center ${
                utils.shouldEnableFeature(feature as any)
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
              }`}>
                <div className="font-medium capitalize">{feature.replace('-', ' ')}</div>
                <div className="text-sm">
                  {utils.shouldEnableFeature(feature as any) ? '✅ Enabled' : '❌ Disabled'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Context summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Device Context</h5>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <div>Type: {device.currentBreakpoint}</div>
              <div>Mobile: {device.isMobile ? 'Yes' : 'No'}</div>
              <div>Touch: {device.isTouch ? 'Yes' : 'No'}</div>
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h5 className="font-medium text-green-800 dark:text-green-300 mb-2">Network Context</h5>
            <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <div>Type: {network.connectionType}</div>
              <div>Speed: {network.downlink} Mbps</div>
              <div>Should Optimize: {network.shouldOptimize ? 'Yes' : 'No'}</div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h5 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Performance Context</h5>
            <div className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
              <div>Level: {performance.performanceLevel}</div>
              <div>Reduced Data: {performance.isReducedData ? 'Yes' : 'No'}</div>
              <div>Animation: {performance.animationDuration}ms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveDemo;