# NGN Currency Formatting System

Comprehensive currency utilities optimized for Nigerian users with mobile-first design and proper localization.

## 🎯 Features

- **NGN-First**: Optimized for Nigerian Naira with proper thousands separators
- **Mobile Optimized**: Compact formatting for small screens (1.5K, 2.5M, etc.)
- **PRD Compliant**: Uses 1 USD = ₦1,500 exchange rate from PRD specifications
- **Locale Aware**: Proper Nigerian English (en-NG) formatting
- **Fallback Support**: Works on older browsers without full Intl support
- **TypeScript Ready**: Full type safety and IntelliSense support

## 🚀 Quick Start

### Basic NGN Formatting

```typescript
import { formatNGN } from '../utils/currency';

// Basic formatting
formatNGN(1500)           // "₦1,500.00"
formatNGN(2500000)        // "₦2,500,000.00"
formatNGN(1500.50)        // "₦1,500.50"

// No decimals for whole numbers
formatNGN(1500, { decimals: 0 })  // "₦1,500"

// Compact mobile format
formatNGN(1500000, { compact: true })  // "₦1.5M"
formatNGN(2500, { compact: true })     // "₦2.5K"
```

### Currency Conversion

```typescript
import { convertUSDToNGN, convertNGNToUSD } from '../utils/currency';

// USD to NGN (1 USD = ₦1,500)
convertUSDToNGN(100)      // 150000
convertUSDToNGN(50.5)     // 75750

// NGN to USD
convertNGNToUSD(150000)   // 100
convertNGNToUSD(75750)    // 50.5

// With formatting
convertUSDToNGN(100, { 
  format: { compact: true } 
});  // "₦150K"
```

### Mobile-Optimized Compact Format

```typescript
import { formatCompactCurrency } from '../utils/currency';

formatCompactCurrency(1500, 'NGN')        // "₦1.5K"
formatCompactCurrency(2500000, 'NGN')     // "₦2.5M"
formatCompactCurrency(1000000000, 'NGN')  // "₦1B"
formatCompactCurrency(100, 'USD')         // "$100"
```

## 📖 API Reference

### formatNGN(amount, options?)

Format amount in Nigerian Naira with proper localization.

```typescript
function formatNGN(
  amount: number, 
  options?: CurrencyFormatOptions
): string

interface CurrencyFormatOptions {
  includeSymbol?: boolean;    // Include ₦ symbol (default: true)
  decimals?: number;          // Decimal places (default: 2)
  compact?: boolean;          // Use compact format (default: false)
  showCode?: boolean;         // Show 'NGN' instead of ₦ (default: false)
  locale?: string;           // Locale override (default: 'en-NG')
  style?: 'decimal' | 'currency' | 'percent';
}
```

**Examples:**
```typescript
formatNGN(1500)                           // "₦1,500.00"
formatNGN(1500, { decimals: 0 })          // "₦1,500"
formatNGN(1500, { includeSymbol: false }) // "1,500.00"
formatNGN(1500, { showCode: true })       // "NGN1,500.00"
formatNGN(1500000, { compact: true })     // "₦1.5M"
```

### convertUSDToNGN(usdAmount, options?)

Convert USD to NGN using PRD exchange rate (1 USD = ₦1,500).

```typescript
function convertUSDToNGN(
  usdAmount: number,
  options?: ConversionOptions
): number | string

interface ConversionOptions {
  round?: boolean;                    // Round to whole number
  exchangeRate?: number;             // Custom rate override
  format?: CurrencyFormatOptions;    // Format the result
}
```

**Examples:**
```typescript
convertUSDToNGN(100)                  // 150000
convertUSDToNGN(100, { round: true }) // 150000
convertUSDToNGN(100, { 
  format: { compact: true } 
})                                    // "₦150K"

convertUSDToNGN(100, { 
  exchangeRate: 1600,
  format: { decimals: 0 }
})                                    // "₦160,000"
```

### convertNGNToUSD(ngnAmount, options?)

Convert NGN to USD using PRD exchange rate.

```typescript
function convertNGNToUSD(
  ngnAmount: number,
  options?: ConversionOptions
): number | string
```

**Examples:**
```typescript
convertNGNToUSD(150000)               // 100
convertNGNToUSD(150000, { 
  format: { includeSymbol: true } 
})                                    // "$100.00"
```

### formatCompactCurrency(amount, currency?, options?)

Format large amounts compactly for mobile displays.

```typescript
function formatCompactCurrency(
  amount: number,
  currency?: 'NGN' | 'USD',
  options?: CurrencyFormatOptions
): string
```

**Compact Units:**
- **K** = Thousand (1,000)
- **M** = Million (1,000,000)  
- **B** = Billion (1,000,000,000)
- **T** = Trillion (1,000,000,000,000)

**Examples:**
```typescript
formatCompactCurrency(1500, 'NGN')       // "₦1.5K"
formatCompactCurrency(2500000, 'NGN')    // "₦2.5M"
formatCompactCurrency(1200000000, 'NGN') // "₦1.2B"
formatCompactCurrency(500, 'NGN')        // "₦500" (no unit for < 1K)
```

## 🎨 Advanced Usage

### Component Integration

```typescript
import { formatNGN, convertUSDToNGN } from '../utils/currency';

const PriceDisplay = ({ usdPrice }: { usdPrice: number }) => {
  const ngnPrice = convertUSDToNGN(usdPrice);
  
  return (
    <div className="price-display">
      <div className="primary-price">
        {formatNGN(ngnPrice, { compact: true })}
      </div>
      <div className="secondary-price text-gray-500">
        ({formatUSD(usdPrice)} USD)
      </div>
    </div>
  );
};

// Usage
<PriceDisplay usdPrice={100} />
// Renders: ₦150K ($100.00 USD)
```

### Responsive Price Display

```typescript
import { formatNGN } from '../utils/currency';
import { useIsMobile } from '../hooks/useResponsive';

const ResponsivePrice = ({ amount }: { amount: number }) => {
  const isMobile = useIsMobile();
  
  return (
    <span className="price">
      {formatNGN(amount, { 
        compact: isMobile && amount > 100000,
        decimals: isMobile ? 0 : 2 
      })}
    </span>
  );
};

// Desktop: "₦1,500,000.00"
// Mobile:  "₦1.5M"
```

### Form Input Integration

```typescript
import { parseCurrencyString, formatNGN } from '../utils/currency';

const CurrencyInput = ({ value, onChange }) => {
  const [displayValue, setDisplayValue] = useState(
    value ? formatNGN(value, { decimals: 0 }) : ''
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);
    
    // Parse back to number for form state
    const numericValue = parseCurrencyString(input, 'NGN');
    onChange(numericValue);
  };
  
  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder="₦0"
      className="currency-input"
    />
  );
};
```

### Data Table Formatting

```typescript
import { formatCompactCurrency, getCurrencyDisplayInfo } from '../utils/currency';

const TuitionTable = ({ programs }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Program</th>
          <th>Tuition (NGN)</th>
          <th>Tuition (USD)</th>
        </tr>
      </thead>
      <tbody>
        {programs.map(program => {
          const ngnInfo = getCurrencyDisplayInfo(
            program.tuitionNGN, 
            'NGN', 
            { compact: true }
          );
          
          return (
            <tr key={program.id}>
              <td>{program.name}</td>
              <td>
                <span className={ngnInfo.isCompact ? 'compact' : 'full'}>
                  {ngnInfo.formatted}
                </span>
              </td>
              <td>{formatUSD(program.tuitionUSD)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
```

## 🔧 Utility Functions

### getCurrencyDisplayInfo()

Get comprehensive formatting information for advanced use cases.

```typescript
const info = getCurrencyDisplayInfo(1500000, 'NGN', { compact: true });
// Returns:
{
  formatted: "₦1.5M",
  value: 1500000,
  currency: "NGN",
  isCompact: true,
  originalAmount: 1500000
}
```

### parseCurrencyString()

Parse formatted currency strings back to numbers.

```typescript
parseCurrencyString("₦1,500.00", 'NGN')    // 1500
parseCurrencyString("₦1.5M", 'NGN')        // 1500000
parseCurrencyString("$100.00", 'USD')      // 100
parseCurrencyString("NGN2,500", 'NGN')     // 2500
```

### compareCurrencyAmounts()

Compare currency amounts with proper precision handling.

```typescript
compareCurrencyAmounts(1500.00, 1500.01, 2)  // -1 (first is smaller)
compareCurrencyAmounts(1500.00, 1500.00, 2)  //  0 (equal)
compareCurrencyAmounts(1500.01, 1500.00, 2)  //  1 (first is larger)
```

### calculatePercentageChange()

Calculate percentage change between amounts.

```typescript
calculatePercentageChange(1000, 1500)  // "+50.0%"
calculatePercentageChange(1500, 1000)  // "-33.3%"
calculatePercentageChange(1000, 1000)  // "0.0%"
```

## 🌍 Nigerian Localization Features

### Proper Thousands Separators

Uses Nigerian English (en-NG) locale for proper number formatting:

```typescript
// Nigerian format with commas
formatNGN(1234567)        // "₦1,234,567.00"
formatNGN(12345)          // "₦12,345.00"

// Compact format for mobile
formatNGN(1234567, { compact: true })  // "₦1.2M"
```

### Mobile-First Compact Display

Automatically switches to compact format for better mobile experience:

```typescript
// Large amounts automatically format compactly on mobile
const amount = 2500000;

// Desktop display
formatNGN(amount)                    // "₦2,500,000.00"

// Mobile display (when compact: true or auto-detected)
formatNGN(amount, { compact: true }) // "₦2.5M"
```

### Smart Decimal Handling

Shows decimals only when necessary:

```typescript
formatNGN(1500)     // "₦1,500.00" (shows decimals)
formatNGN(1500.50)  // "₦1,500.50" (shows decimals)
formatNGN(1500, { decimals: 0 })  // "₦1,500" (no decimals)
```

## 📱 Mobile Optimization Examples

### Compact Price Cards

```typescript
const PriceCard = ({ program }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="price-card">
      <h3>{program.name}</h3>
      <div className="tuition-display">
        <div className="primary">
          {formatNGN(program.tuitionNGN, { 
            compact: isMobile,
            decimals: isMobile ? 0 : 2 
          })}
        </div>
        {!isMobile && (
          <div className="secondary">
            ≈ {formatUSD(program.tuitionUSD)}
          </div>
        )}
      </div>
    </div>
  );
};
```

### Responsive Tables

```typescript
const TuitionDisplay = ({ amount, showUSD = true }) => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div className="mobile-price">
        {formatCompactCurrency(amount, 'NGN')}
      </div>
    );
  }
  
  return (
    <div className="desktop-price">
      <div className="ngn">{formatNGN(amount)}</div>
      {showUSD && (
        <div className="usd">
          ≈ {convertNGNToUSD(amount, { 
            format: { includeSymbol: true } 
          })}
        </div>
      )}
    </div>
  );
};
```

## 🧪 Testing Examples

### Unit Tests

```typescript
import { formatNGN, convertUSDToNGN, formatCompactCurrency } from '../utils/currency';

describe('NGN Currency Formatting', () => {
  test('formats basic amounts correctly', () => {
    expect(formatNGN(1500)).toBe('₦1,500.00');
    expect(formatNGN(1500000)).toBe('₦1,500,000.00');
  });
  
  test('handles compact formatting', () => {
    expect(formatNGN(1500, { compact: true })).toBe('₦1.5K');
    expect(formatNGN(1500000, { compact: true })).toBe('₦1.5M');
  });
  
  test('converts USD to NGN correctly', () => {
    expect(convertUSDToNGN(100)).toBe(150000);
    expect(convertUSDToNGN(1)).toBe(1500);
  });
});
```

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import PriceDisplay from './PriceDisplay';

test('displays price in NGN format', () => {
  render(<PriceDisplay amount={1500000} />);
  expect(screen.getByText('₦1,500,000.00')).toBeInTheDocument();
});

test('displays compact format on mobile', () => {
  // Mock mobile viewport
  Object.defineProperty(window, 'innerWidth', { value: 350 });
  
  render(<PriceDisplay amount={1500000} compact />);
  expect(screen.getByText('₦1.5M')).toBeInTheDocument();
});
```

## ⚠️ Important Notes

### Exchange Rate Updates

The PRD specifies 1 USD = ₦1,500. To update this rate:

```typescript
// Update the constant in currency.ts
export const CURRENCY_CONFIG = {
  USD_TO_NGN_RATE: 1600, // New rate
  // ... other config
};

// Or use custom rate per conversion
convertUSDToNGN(100, { exchangeRate: 1600 });
```

### Browser Compatibility

The utilities include fallback formatters for older browsers:
- Primary: Uses `Intl.NumberFormat` for full localization
- Fallback: Uses `toLocaleString()` for basic formatting
- Minimum: Manual formatting for very old browsers

### Performance Considerations

- All formatters are optimized for frequent calls
- Compact formatting reduces string length for mobile
- No external dependencies required
- Tree-shakeable exports for smaller bundles

This comprehensive currency system ensures proper Nigerian localization while maintaining excellent mobile performance and user experience.