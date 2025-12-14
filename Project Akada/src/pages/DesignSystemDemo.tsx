import React, { useState } from 'react';
import { useDesignTokens } from '../hooks/useDesignTokens';
import DesignTokenShowcase from '../components/ui/DesignTokenShowcase';
import TokenMigrationGuide from '../components/ui/TokenMigrationGuide';
import TokenizedButton from '../components/ui/TokenizedButton';
import TokenizedInput from '../components/ui/TokenizedInput';
import AkadaCard from '../components/ui/AkadaCard';
import { Palette, Code, BookOpen, Smartphone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type DemoSection = 'showcase' | 'migration' | 'components' | 'performance';

const DesignSystemDemo: React.FC = () => {
  const tokens = useDesignTokens();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<DemoSection>('showcase');

  const sections = [
    { id: 'showcase' as const, title: 'Token Showcase', icon: <Palette className="h-4 w-4" /> },
    { id: 'migration' as const, title: 'Migration Guide', icon: <Code className="h-4 w-4" /> },
    { id: 'components' as const, title: 'Components', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'performance' as const, title: '3G Optimization', icon: <Smartphone className="h-4 w-4" /> }
  ];

  const ComponentExamples: React.FC = () => (
    <div 
      className="max-w-6xl mx-auto p-6"
      style={{ backgroundColor: tokens.colors.surface('primary') }}
    >
      <h2 
        className="text-2xl font-bold mb-6"
        style={{ color: tokens.colors.text('primary') }}
      >
        Tokenized Components
      </h2>

      <div className="space-y-8">
        {/* Button Examples */}
        <AkadaCard variant="outlined" padding="lg">
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: tokens.colors.text('primary') }}
          >
            TokenizedButton Examples
          </h3>
          <div className="flex flex-wrap gap-4 mb-4">
            <TokenizedButton variant="primary" size="sm">Small Primary</TokenizedButton>
            <TokenizedButton variant="primary" size="md">Medium Primary</TokenizedButton>
            <TokenizedButton variant="primary" size="lg">Large Primary</TokenizedButton>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <TokenizedButton variant="secondary">Secondary</TokenizedButton>
            <TokenizedButton variant="outline">Outline</TokenizedButton>
            <TokenizedButton variant="ghost">Ghost</TokenizedButton>
          </div>
          <TokenizedButton variant="primary" fullWidth>Full Width Button</TokenizedButton>
        </AkadaCard>

        {/* Input Examples */}
        <AkadaCard variant="outlined" padding="lg">
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: tokens.colors.text('primary') }}
          >
            TokenizedInput Examples
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <TokenizedInput
              label="University Name"
              placeholder="Enter university name"
              helperText="Search for universities worldwide"
            />
            <TokenizedInput
              label="Budget (NGN)"
              placeholder="Enter your budget"
              currency={true}
              helperText="Nigerian Naira amount"
            />
            <TokenizedInput
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              required
            />
            <TokenizedInput
              label="Disabled Field"
              placeholder="This field is disabled"
              disabled
              helperText="Example of disabled state"
            />
          </div>
        </AkadaCard>

        {/* Card Examples */}
        <div className="grid md:grid-cols-3 gap-6">
          <AkadaCard variant="default" padding="md">
            <h4 
              className="font-semibold mb-2"
              style={{ color: tokens.colors.text('primary') }}
            >
              Default Card
            </h4>
            <p style={{ color: tokens.colors.text('secondary') }}>
              Standard card with border and subtle shadow
            </p>
          </AkadaCard>

          <AkadaCard variant="elevated" padding="md">
            <h4 
              className="font-semibold mb-2"
              style={{ color: tokens.colors.text('primary') }}
            >
              Elevated Card
            </h4>
            <p style={{ color: tokens.colors.text('secondary') }}>
              Elevated card with prominent shadow
            </p>
          </AkadaCard>

          <AkadaCard variant="outlined" padding="md">
            <h4 
              className="font-semibold mb-2"
              style={{ color: tokens.colors.text('primary') }}
            >
              Outlined Card
            </h4>
            <p style={{ color: tokens.colors.text('secondary') }}>
              Clean outlined card without shadow
            </p>
          </AkadaCard>
        </div>

        {/* Currency Examples */}
        <AkadaCard variant="outlined" padding="lg">
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: tokens.colors.text('primary') }}
          >
            Nigerian Currency Integration
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 
                className="font-medium mb-3"
                style={{ color: tokens.colors.text('primary') }}
              >
                Tuition Fees
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: tokens.colors.text('secondary') }}>Harvard (USD):</span>
                  <span className="font-medium">{tokens.currency.format(50000, 'USD')}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: tokens.colors.text('secondary') }}>Harvard (NGN):</span>
                  <span className="font-medium text-green-600">
                    {tokens.currency.format(tokens.currency.convert.usdToNgn(50000), 'NGN')}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 
                className="font-medium mb-3"
                style={{ color: tokens.colors.text('primary') }}
              >
                Living Expenses
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: tokens.colors.text('secondary') }}>Monthly (USD):</span>
                  <span className="font-medium">{tokens.currency.format(1500, 'USD')}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: tokens.colors.text('secondary') }}>Monthly (NGN):</span>
                  <span className="font-medium text-green-600">
                    {tokens.currency.format(tokens.currency.convert.usdToNgn(1500), 'NGN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </AkadaCard>
      </div>
    </div>
  );

  const PerformanceDemo: React.FC = () => (
    <div 
      className="max-w-6xl mx-auto p-6"
      style={{ backgroundColor: tokens.colors.surface('primary') }}
    >
      <h2 
        className="text-2xl font-bold mb-6"
        style={{ color: tokens.colors.text('primary') }}
      >
        3G Network Optimizations
      </h2>

      <div className="space-y-6">
        <AkadaCard variant="outlined" padding="lg">
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: tokens.colors.text('primary') }}
          >
            Compact Spacing for Data Constraints
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="w-20 text-sm" style={{ color: tokens.colors.text('secondary') }}>
                Standard:
              </span>
              <div 
                className="bg-blue-500 h-4"
                style={{ width: tokens.spacing.lg }}
              />
              <span className="text-sm" style={{ color: tokens.colors.text('secondary') }}>
                {tokens.spacing.lg}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-20 text-sm" style={{ color: tokens.colors.text('secondary') }}>
                Compact:
              </span>
              <div 
                className="bg-green-500 h-4"
                style={{ width: tokens.spacing.compact }}
              />
              <span className="text-sm" style={{ color: tokens.colors.text('secondary') }}>
                {tokens.spacing.compact}
              </span>
            </div>
          </div>
        </AkadaCard>

        <AkadaCard variant="outlined" padding="lg">
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: tokens.colors.text('primary') }}
          >
            Touch Target Optimization
          </h3>
          <div className="flex items-center gap-4">
            <div 
              className="bg-indigo-500 rounded flex items-center justify-center text-white text-sm font-medium"
              style={{ 
                width: tokens.spacing.touch,
                height: tokens.spacing.touch
              }}
            >
              44px
            </div>
            <div>
              <p style={{ color: tokens.colors.text('primary') }}>
                Minimum 44px touch targets for accessibility
              </p>
              <p className="text-sm" style={{ color: tokens.colors.text('secondary') }}>
                Ensures usability on mobile devices
              </p>
            </div>
          </div>
        </AkadaCard>

        <AkadaCard variant="outlined" padding="lg">
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: tokens.colors.text('primary') }}
          >
            Performance Benefits
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2" style={{ color: tokens.colors.status.success }}>
                ✅ Tree-shakeable tokens
              </h4>
              <p className="text-sm" style={{ color: tokens.colors.text('secondary') }}>
                Only import the tokens you use, reducing bundle size
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: tokens.colors.status.success }}>
                ✅ Optimized for 3G
              </h4>
              <p className="text-sm" style={{ color: tokens.colors.text('secondary') }}>
                Compact spacing and minimal color palette
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: tokens.colors.status.success }}>
                ✅ CSS Custom Properties
              </h4>
              <p className="text-sm" style={{ color: tokens.colors.text('secondary') }}>
                Runtime theme switching without re-renders
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: tokens.colors.status.success }}>
                ✅ Nigerian Market Focus
              </h4>
              <p className="text-sm" style={{ color: tokens.colors.text('secondary') }}>
                Built-in NGN formatting and conversion
              </p>
            </div>
          </div>
        </AkadaCard>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: tokens.colors.surface('primary'), minHeight: '100vh' }}>
      {/* Header */}
      <div 
        className="sticky top-0 z-10 border-b"
        style={{ 
          backgroundColor: tokens.colors.surface('primary'),
          borderColor: tokens.colors.border()
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TokenizedButton 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </TokenizedButton>
              <h1 
                className="text-xl font-semibold"
                style={{ color: tokens.colors.text('primary') }}
              >
                Design System Demo
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap gap-2 mb-6">
          {sections.map((section) => (
            <TokenizedButton
              key={section.id}
              variant={activeSection === section.id ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveSection(section.id)}
            >
              {section.icon}
              {section.title}
            </TokenizedButton>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeSection === 'showcase' && <DesignTokenShowcase />}
        {activeSection === 'migration' && <TokenMigrationGuide />}
        {activeSection === 'components' && <ComponentExamples />}
        {activeSection === 'performance' && <PerformanceDemo />}
      </div>
    </div>
  );
};

export default DesignSystemDemo; 