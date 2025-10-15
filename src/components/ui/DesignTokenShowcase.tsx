import React, { useState } from 'react';
import { useDesignTokens } from '../../hooks/useDesignTokens';
import { Copy, Check, Palette, Grid, Type, DollarSign, Square } from 'lucide-react';

interface ShowcaseSection {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const DesignTokenShowcase: React.FC = () => {
  const tokens = useDesignTokens();
  const [activeSection, setActiveSection] = useState('colors');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const sections: ShowcaseSection[] = [
    { id: 'colors', title: 'Colors', icon: <Palette className="h-4 w-4" /> },
    { id: 'spacing', title: 'Spacing', icon: <Square className="h-4 w-4" /> },
    { id: 'typography', title: 'Typography', icon: <Type className="h-4 w-4" /> },
    { id: 'currency', title: 'Currency', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'components', title: 'Components', icon: <Grid className="h-4 w-4" /> },
  ];

  const copyToClipboard = async (text: string, tokenName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToken(tokenName);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const TokenExample: React.FC<{ token: string; value: string; usage: string }> = ({ token, value, usage }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <code className="text-sm font-mono text-indigo-600 dark:text-indigo-400">{token}</code>
        <button
          onClick={() => copyToClipboard(usage, token)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {copiedToken === token ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{value}</div>
      <code className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded block overflow-x-auto">
        {usage}
      </code>
    </div>
  );

  const ColorSwatch: React.FC<{ color: string; name: string; usage: string }> = ({ color, name, usage }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div 
        className="w-full h-12 rounded-lg mb-3 border border-gray-200 dark:border-gray-600"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900 dark:text-white">{name}</span>
        <button
          onClick={() => copyToClipboard(usage, name)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {copiedToken === name ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <code className="text-xs text-gray-600 dark:text-gray-400">{color}</code>
      <code className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded block mt-2 overflow-x-auto">
        {usage}
      </code>
    </div>
  );

  return (
    <div 
      className="min-h-screen p-6"
      style={{ backgroundColor: tokens.colors.surface('primary') }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ 
              color: tokens.colors.text('primary'),
              fontFamily: tokens.typography.fontFamily.sans.join(', ')
            }}
          >
            Akada Design System Showcase
          </h1>
          <p 
            className="text-lg"
            style={{ color: tokens.colors.text('secondary') }}
          >
            Nigerian-optimized design tokens for study abroad applications
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-medium"
              style={{
                backgroundColor: activeSection === section.id ? tokens.colors.primary[500] : 'transparent',
                color: activeSection === section.id ? 'white' : tokens.colors.text('primary')
              }}
            >
              {section.icon}
              {section.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeSection === 'colors' && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: tokens.colors.text('primary') }}>
                Color System
              </h2>
              
              {/* Primary Colors */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4" style={{ color: tokens.colors.text('primary') }}>
                  Primary Colors
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(tokens.colors.primary).map(([key, value]) => (
                    <ColorSwatch
                      key={key}
                      color={value}
                      name={`primary.${key}`}
                      usage={`colors.primary['${key}']`}
                    />
                  ))}
                </div>
              </div>

              {/* Theme-aware Colors */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4" style={{ color: tokens.colors.text('primary') }}>
                  Theme-aware Colors
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ColorSwatch
                    color={tokens.colors.surface('primary')}
                    name="Surface Primary"
                    usage="colors.surface('primary')"
                  />
                  <ColorSwatch
                    color={tokens.colors.surface('secondary')}
                    name="Surface Secondary"
                    usage="colors.surface('secondary')"
                  />
                  <ColorSwatch
                    color={tokens.colors.text('primary')}
                    name="Text Primary"
                    usage="colors.text('primary')"
                  />
                  <ColorSwatch
                    color={tokens.colors.text('secondary')}
                    name="Text Secondary"
                    usage="colors.text('secondary')"
                  />
                  <ColorSwatch
                    color={tokens.colors.border()}
                    name="Border"
                    usage="colors.border()"
                  />
                </div>
              </div>

              {/* Status Colors */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: tokens.colors.text('primary') }}>
                  Status Colors
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(tokens.colors.status).map(([key, value]) => (
                    <ColorSwatch
                      key={key}
                      color={value}
                      name={`status.${key}`}
                      usage={`colors.status.${key}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'spacing' && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: tokens.colors.text('primary') }}>
                Spacing System
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Standard Spacing */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: tokens.colors.text('primary') }}>
                    Standard Spacing
                  </h3>
                  <div className="space-y-4">
                    {['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].map((size) => (
                      <TokenExample
                        key={size}
                        token={`spacing.${size}`}
                        value={tokens.spacing[size as keyof typeof tokens.spacing] as string}
                        usage={`spacing.${size}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Special Spacing */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: tokens.colors.text('primary') }}>
                    3G-Optimized Spacing
                  </h3>
                  <div className="space-y-4">
                    <TokenExample
                      token="spacing.compact"
                      value={tokens.spacing.compact}
                      usage="spacing.compact"
                    />
                    <TokenExample
                      token="spacing.touch"
                      value={tokens.spacing.touch}
                      usage="spacing.touch"
                    />
                    <TokenExample
                      token="spacing.touchLarge"
                      value={tokens.spacing.touchLarge}
                      usage="spacing.touchLarge"
                    />
                  </div>
                </div>
              </div>

              {/* Visual Spacing Demo */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4" style={{ color: tokens.colors.text('primary') }}>
                  Visual Spacing Demo
                </h3>
                <div 
                  className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 space-y-4"
                >
                  {['xs', 'sm', 'md', 'lg', 'xl'].map((size) => (
                    <div key={size} className="flex items-center gap-4">
                      <span className="w-16 text-sm font-mono" style={{ color: tokens.colors.text('secondary') }}>
                        {size}:
                      </span>
                      <div 
                        className="bg-indigo-500 h-4 rounded"
                        style={{ 
                          width: typeof tokens.spacing[size as keyof typeof tokens.spacing] === 'string' 
                            ? tokens.spacing[size as keyof typeof tokens.spacing] 
                            : (tokens.spacing[size as keyof typeof tokens.spacing] as any).desktop || '16px'
                        }}
                      />
                      <span className="text-sm" style={{ color: tokens.colors.text('secondary') }}>
                        {typeof tokens.spacing[size as keyof typeof tokens.spacing] === 'string' 
                          ? tokens.spacing[size as keyof typeof tokens.spacing] 
                          : (tokens.spacing[size as keyof typeof tokens.spacing] as any).desktop || '16px'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'typography' && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: tokens.colors.text('primary') }}>
                Typography System
              </h2>
              
              <div className="space-y-8">
                {/* Font Sizes */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: tokens.colors.text('primary') }}>
                    Font Sizes
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(tokens.typography.fontSize).map(([key, value]) => (
                      <div key={key} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-sm font-mono text-indigo-600 dark:text-indigo-400">{key}</code>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
                        </div>
                        <div 
                          style={{ 
                            fontSize: value,
                            color: tokens.colors.text('primary'),
                            fontFamily: tokens.typography.fontFamily.sans.join(', ')
                          }}
                        >
                          The quick brown fox jumps over the lazy dog
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Font Weights */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: tokens.colors.text('primary') }}>
                    Font Weights
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(tokens.typography.fontWeight).map(([key, value]) => (
                      <div key={key} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-sm font-mono text-indigo-600 dark:text-indigo-400">{key}</code>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
                        </div>
                        <div 
                          style={{ 
                            fontWeight: value,
                            fontSize: tokens.typography.fontSize.lg,
                            color: tokens.colors.text('primary'),
                            fontFamily: tokens.typography.fontFamily.sans.join(', ')
                          }}
                        >
                          Sample text with {key} weight
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'currency' && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: tokens.colors.text('primary') }}>
                Nigerian Currency System
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Currency Formatting Examples */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: tokens.colors.text('primary') }}>
                    Currency Formatting
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <h4 className="font-medium mb-2" style={{ color: tokens.colors.text('primary') }}>
                        Nigerian Naira (₦)
                      </h4>
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {tokens.currency.format(150000, 'NGN')}
                      </div>
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded block">
                        currency.format(150000, 'NGN')
                      </code>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <h4 className="font-medium mb-2" style={{ color: tokens.colors.text('primary') }}>
                        US Dollar ($)
                      </h4>
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {tokens.currency.format(100, 'USD')}
                      </div>
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded block">
                        currency.format(100, 'USD')
                      </code>
                    </div>
                  </div>
                </div>

                {/* Currency Conversion */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: tokens.colors.text('primary') }}>
                    Currency Conversion
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <h4 className="font-medium mb-3" style={{ color: tokens.colors.text('primary') }}>
                        Tuition Fee Example
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span style={{ color: tokens.colors.text('secondary') }}>USD:</span>
                          <span className="font-medium text-blue-600">$25,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: tokens.colors.text('secondary') }}>NGN:</span>
                          <span className="font-medium text-green-600">
                            {tokens.currency.format(tokens.currency.convert.usdToNgn(25000), 'NGN')}
                          </span>
                        </div>
                      </div>
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded block mt-3">
                        currency.convert.usdToNgn(25000)
                      </code>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                        Exchange Rate
                      </h4>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        1 USD = ₦{tokens.currency.exchangeRate}
                      </div>
                      <code className="text-xs text-blue-700 dark:text-blue-300 mt-2 block">
                        currency.exchangeRate
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'components' && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: tokens.colors.text('primary') }}>
                Component Examples
              </h2>
              
              <div className="space-y-8">
                {/* Button Examples */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: tokens.colors.text('primary') }}>
                    Buttons with Design Tokens
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <button
                      style={{
                        backgroundColor: tokens.colors.primary[500],
                        color: 'white',
                        padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
                        borderRadius: tokens.borderRadius.md,
                        border: 'none',
                        fontFamily: tokens.typography.fontFamily.sans.join(', '),
                        fontWeight: tokens.typography.fontWeight.medium,
                        minHeight: tokens.spacing.touch,
                        cursor: 'pointer'
                      }}
                    >
                      Primary Button
                    </button>
                    
                    <button
                      style={{
                        backgroundColor: 'transparent',
                        color: tokens.colors.primary[500],
                        padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
                        borderRadius: tokens.borderRadius.md,
                        border: `2px solid ${tokens.colors.primary[500]}`,
                        fontFamily: tokens.typography.fontFamily.sans.join(', '),
                        fontWeight: tokens.typography.fontWeight.medium,
                        minHeight: tokens.spacing.touch,
                        cursor: 'pointer'
                      }}
                    >
                      Secondary Button
                    </button>
                  </div>
                </div>

                {/* Card Examples */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: tokens.colors.text('primary') }}>
                    Cards with Design Tokens
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                      style={{
                        backgroundColor: tokens.colors.surface('primary'),
                        border: `1px solid ${tokens.colors.border()}`,
                        borderRadius: tokens.borderRadius.lg,
                        padding: tokens.spacing.lg,
                        boxShadow: tokens.shadows.sm
                      }}
                    >
                      <h4 
                        className="font-semibold mb-2"
                        style={{ 
                          color: tokens.colors.text('primary'),
                          fontSize: tokens.typography.fontSize.lg
                        }}
                      >
                        Program Card
                      </h4>
                      <p style={{ color: tokens.colors.text('secondary') }}>
                        This card uses design tokens for consistent spacing, colors, and typography.
                      </p>
                      <div 
                        className="mt-4 pt-4"
                        style={{ borderTop: `1px solid ${tokens.colors.border()}` }}
                      >
                        <span 
                          className="text-sm"
                          style={{ color: tokens.colors.text('tertiary') }}
                        >
                          Tuition: {tokens.currency.format(45000000, 'NGN')}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: tokens.colors.surface('secondary'),
                        borderRadius: tokens.borderRadius.lg,
                        padding: tokens.spacing.lg,
                        boxShadow: tokens.shadows.md
                      }}
                    >
                      <h4 
                        className="font-semibold mb-2"
                        style={{ 
                          color: tokens.colors.text('primary'),
                          fontSize: tokens.typography.fontSize.lg
                        }}
                      >
                        Elevated Card
                      </h4>
                      <p style={{ color: tokens.colors.text('secondary') }}>
                        This elevated card demonstrates different surface levels and shadow depths.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Examples */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: tokens.colors.text('primary') }}>
                    Form Elements
                  </h3>
                  <div 
                    className="max-w-md"
                    style={{
                      backgroundColor: tokens.colors.surface('primary'),
                      padding: tokens.spacing.lg,
                      borderRadius: tokens.borderRadius.lg,
                      border: `1px solid ${tokens.colors.border()}`
                    }}
                  >
                    <div style={{ marginBottom: tokens.spacing.md }}>
                      <label 
                        className="block mb-2"
                        style={{ 
                          color: tokens.colors.text('primary'),
                          fontWeight: tokens.typography.fontWeight.medium,
                          fontSize: tokens.typography.fontSize.sm
                        }}
                      >
                        University Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter university name"
                        style={{
                          width: '100%',
                          padding: tokens.spacing.sm,
                          borderRadius: tokens.borderRadius.md,
                          border: `1px solid ${tokens.colors.border()}`,
                          fontSize: tokens.typography.fontSize.base,
                          fontFamily: tokens.typography.fontFamily.sans.join(', '),
                          backgroundColor: tokens.colors.surface('primary'),
                          color: tokens.colors.text('primary')
                        }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: tokens.spacing.md }}>
                      <label 
                        className="block mb-2"
                        style={{ 
                          color: tokens.colors.text('primary'),
                          fontWeight: tokens.typography.fontWeight.medium,
                          fontSize: tokens.typography.fontSize.sm
                        }}
                      >
                        Budget (NGN)
                      </label>
                      <input
                        type="text"
                        placeholder="₦0"
                        style={{
                          width: '100%',
                          padding: tokens.spacing.sm,
                          borderRadius: tokens.borderRadius.md,
                          border: `1px solid ${tokens.colors.border()}`,
                          fontSize: tokens.typography.fontSize.base,
                          fontFamily: tokens.typography.fontFamily.sans.join(', '),
                          backgroundColor: tokens.colors.surface('primary'),
                          color: tokens.colors.text('primary')
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignTokenShowcase; 