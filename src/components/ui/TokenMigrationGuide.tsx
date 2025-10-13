import React, { useState } from 'react';
import { useDesignTokens } from '../../hooks/useDesignTokens';
import { AlertTriangle, CheckCircle, Copy, ArrowRight } from 'lucide-react';

interface MigrationExample {
  title: string;
  category: 'color' | 'spacing' | 'typography' | 'currency';
  before: string;
  after: string;
  description: string;
  benefits: string[];
}

const TokenMigrationGuide: React.FC = () => {
  const tokens = useDesignTokens();
  const [copiedExample, setCopiedExample] = useState<string | null>(null);

  const examples: MigrationExample[] = [
    {
      title: 'Button Colors',
      category: 'color',
      before: `<button className="bg-indigo-600 hover:bg-indigo-700 text-white">
  Click me
</button>`,
      after: `const { colors } = useDesignTokens();

<button style={{
  backgroundColor: colors.primary[500],
  color: 'white'
}}>
  Click me
</button>`,
      description: 'Replace hardcoded Tailwind colors with theme-aware design tokens',
      benefits: ['Automatic dark mode support', 'Consistent brand colors', 'Easy theme switching']
    },
    {
      title: 'Spacing & Layout',
      category: 'spacing',
      before: `<div className="p-4 mb-6 gap-2">
  <div className="px-3 py-2">Content</div>
</div>`,
      after: `const { spacing } = useDesignTokens();

<div style={{
  padding: spacing.lg,
  marginBottom: spacing.xl,
  gap: spacing.xs
}}>
  <div style={{
    padding: \`\${spacing.xs} \${spacing.sm}\`
  }}>Content</div>
</div>`,
      description: 'Use consistent spacing tokens for better layout harmony',
      benefits: ['3G-optimized compact spacing', 'Consistent touch targets', 'Responsive design support']
    },
    {
      title: 'Nigerian Currency',
      category: 'currency',
      before: `<span>₦{amount.toLocaleString()}</span>
// Manual conversion: $100 * 1500 = ₦150,000`,
      after: `const { currency } = useDesignTokens();

<span>{currency.format(amount, 'NGN')}</span>
// Auto conversion: currency.convert.usdToNgn(100)`,
      description: 'Use built-in Nigerian currency formatting and conversion',
      benefits: ['Proper NGN formatting', 'Automatic USD conversion', 'Exchange rate management']
    },
    {
      title: 'Typography Scale',
      category: 'typography',
      before: `<h1 className="text-2xl font-bold text-gray-900">
  Heading
</h1>
<p className="text-sm text-gray-600">
  Body text
</p>`,
      after: `const { typography, colors } = useDesignTokens();

<h1 style={{
  fontSize: typography.fontSize['2xl'],
  fontWeight: typography.fontWeight.bold,
  color: colors.text('primary')
}}>
  Heading
</h1>
<p style={{
  fontSize: typography.fontSize.sm,
  color: colors.text('secondary')
}}>
  Body text
</p>`,
      description: 'Consistent typography with theme-aware text colors',
      benefits: ['Scalable type system', 'Theme-aware colors', 'Better readability']
    }
  ];

  const copyToClipboard = async (text: string, exampleTitle: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedExample(exampleTitle);
      setTimeout(() => setCopiedExample(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'color': return tokens.colors.status.info;
      case 'spacing': return tokens.colors.status.success;
      case 'typography': return tokens.colors.primary[500];
      case 'currency': return tokens.colors.status.warning;
      default: return tokens.colors.text('secondary');
    }
  };

  return (
    <div 
      className="max-w-6xl mx-auto p-6"
      style={{ backgroundColor: tokens.colors.surface('primary') }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 
          className="text-3xl font-bold mb-4"
          style={{ 
            color: tokens.colors.text('primary'),
            fontFamily: tokens.typography.fontFamily.sans.join(', ')
          }}
        >
          Design Token Migration Guide
        </h1>
        <div 
          className="p-4 rounded-lg flex items-start gap-3"
          style={{ 
            backgroundColor: tokens.colors.status.warningLight,
            border: `1px solid ${tokens.colors.status.warning}`
          }}
        >
          <AlertTriangle 
            className="h-5 w-5 mt-0.5 flex-shrink-0"
            style={{ color: tokens.colors.status.warning }}
          />
          <div>
            <h3 
              className="font-medium mb-1"
              style={{ color: tokens.colors.status.warning }}
            >
              Migration Priority
            </h3>
            <p style={{ color: tokens.colors.text('primary') }}>
              Focus on frequently used components first: buttons, inputs, cards, and layout containers. 
              This maximizes the benefit of consistent theming and Nigerian market optimizations.
            </p>
          </div>
        </div>
      </div>

      {/* Migration Examples */}
      <div className="space-y-8">
        {examples.map((example, index) => (
          <div 
            key={example.title}
            className="rounded-lg border p-6"
            style={{ 
              backgroundColor: tokens.colors.surface('secondary'),
              borderColor: tokens.colors.border()
            }}
          >
            {/* Example Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${getCategoryColor(example.category)}20`,
                    color: getCategoryColor(example.category)
                  }}
                >
                  {example.category}
                </span>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: tokens.colors.text('primary') }}
                >
                  {example.title}
                </h3>
              </div>
              <button
                onClick={() => copyToClipboard(example.after, example.title)}
                className="p-2 rounded-md transition-colors"
                style={{
                  backgroundColor: tokens.colors.surface('primary'),
                  color: tokens.colors.text('secondary')
                }}
                title="Copy new code"
              >
                {copiedExample === example.title ? (
                  <CheckCircle className="h-4 w-4" style={{ color: tokens.colors.status.success }} />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            <p 
              className="mb-6"
              style={{ color: tokens.colors.text('secondary') }}
            >
              {example.description}
            </p>

            {/* Code Comparison */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Before */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: tokens.colors.status.error }}
                  >
                    ❌ Before (Hardcoded)
                  </span>
                </div>
                <pre 
                  className="p-4 rounded-lg text-sm overflow-x-auto"
                  style={{ 
                    backgroundColor: `${tokens.colors.status.error}10`,
                    border: `1px solid ${tokens.colors.status.error}40`,
                    color: tokens.colors.text('primary')
                  }}
                >
                  <code>{example.before}</code>
                </pre>
              </div>

              {/* After */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: tokens.colors.status.success }}
                  >
                    ✅ After (Design Tokens)
                  </span>
                </div>
                <pre 
                  className="p-4 rounded-lg text-sm overflow-x-auto"
                  style={{ 
                    backgroundColor: `${tokens.colors.status.success}10`,
                    border: `1px solid ${tokens.colors.status.success}40`,
                    color: tokens.colors.text('primary')
                  }}
                >
                  <code>{example.after}</code>
                </pre>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h4 
                className="font-medium mb-3 flex items-center gap-2"
                style={{ color: tokens.colors.text('primary') }}
              >
                <ArrowRight className="h-4 w-4" style={{ color: tokens.colors.status.success }} />
                Benefits
              </h4>
              <ul className="space-y-2">
                {example.benefits.map((benefit, benefitIndex) => (
                  <li 
                    key={benefitIndex}
                    className="flex items-center gap-2"
                    style={{ color: tokens.colors.text('secondary') }}
                  >
                    <CheckCircle 
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: tokens.colors.status.success }}
                    />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Reference */}
      <div 
        className="mt-12 p-6 rounded-lg"
        style={{ 
          backgroundColor: tokens.colors.primary[50],
          border: `1px solid ${tokens.colors.primary[200]}`
        }}
      >
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: tokens.colors.primary[700] }}
        >
          Quick Reference
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 
              className="font-medium mb-2"
              style={{ color: tokens.colors.primary[600] }}
            >
              Import Pattern
            </h4>
            <code 
              className="block p-3 rounded bg-white border"
              style={{ color: tokens.colors.text('primary') }}
            >
              import &#123; useDesignTokens &#125; from '../hooks/useDesignTokens';
            </code>
          </div>
          <div>
            <h4 
              className="font-medium mb-2"
              style={{ color: tokens.colors.primary[600] }}
            >
              Hook Usage
            </h4>
            <code 
              className="block p-3 rounded bg-white border"
              style={{ color: tokens.colors.text('primary') }}
            >
              const &#123; colors, spacing, typography &#125; = useDesignTokens();
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenMigrationGuide; 