// Currency Error Boundary for graceful error handling in React components
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { CurrencyError, CurrencyErrorType } from '../../lib/currency/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorType: CurrencyErrorType | null;
  retryCount: number;
}

export class CurrencyErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorType: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state to show error UI
    return {
      hasError: true,
      error,
      errorType: error instanceof CurrencyError ? error.type : null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Currency Error Boundary caught an error:', error, errorInfo);
    
    // Report to error tracking service if available
    this.props.onError?.(error, errorInfo);
    
    // Log currency-specific error details
    if (error instanceof CurrencyError) {
      console.error('Currency Error Details:', {
        type: error.type,
        code: error.code,
        retryable: error.retryable,
        fallbackAvailable: error.fallbackAvailable,
        details: error.details
      });
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorType: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorType: null,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI based on error type
      return this.renderErrorUI();
    }

    return this.props.children;
  }

  private renderErrorUI() {
    const { error, errorType, retryCount } = this.state;
    const canRetry = retryCount < this.maxRetries && error instanceof CurrencyError && error.retryable;

    return (
      <div className="currency-error-boundary p-4 border border-red-200 bg-red-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              {this.getErrorTitle(errorType)}
            </h3>
            
            <div className="mt-2 text-sm text-red-700">
              <p>{this.getErrorMessage(error, errorType)}</p>
            </div>

            {this.props.showErrorDetails && error && (
              <details className="mt-3">
                <summary className="text-xs text-red-600 cursor-pointer">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}

            <div className="mt-4 flex space-x-3">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Retry ({this.maxRetries - retryCount} left)
                </button>
              )}
              
              <button
                onClick={this.handleReset}
                className="bg-white px-3 py-2 rounded-md text-sm font-medium text-red-800 border border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private getErrorTitle(errorType: CurrencyErrorType | null): string {
    switch (errorType) {
      case CurrencyErrorType.API_UNAVAILABLE:
        return 'Currency Service Unavailable';
      case CurrencyErrorType.NETWORK_ERROR:
        return 'Network Connection Error';
      case CurrencyErrorType.RATE_LIMIT_EXCEEDED:
        return 'Rate Limit Exceeded';
      case CurrencyErrorType.QUOTA_EXCEEDED:
        return 'Service Quota Exceeded';
      case CurrencyErrorType.CONVERSION_FAILED:
        return 'Currency Conversion Failed';
      case CurrencyErrorType.INVALID_CURRENCY:
        return 'Invalid Currency';
      case CurrencyErrorType.INVALID_AMOUNT:
        return 'Invalid Amount';
      default:
        return 'Currency Service Error';
    }
  }

  private getErrorMessage(error: Error | null, errorType: CurrencyErrorType | null): string {
    switch (errorType) {
      case CurrencyErrorType.API_UNAVAILABLE:
        return 'The currency exchange service is temporarily unavailable. Showing cached rates or fallback values.';
      case CurrencyErrorType.NETWORK_ERROR:
        return 'Unable to connect to currency services. Please check your internet connection.';
      case CurrencyErrorType.RATE_LIMIT_EXCEEDED:
        return 'Too many requests to the currency service. Please wait a moment and try again.';
      case CurrencyErrorType.QUOTA_EXCEEDED:
        return 'Currency service quota has been exceeded. Using static fallback rates.';
      case CurrencyErrorType.CONVERSION_FAILED:
        return 'Failed to convert between currencies. Using approximate rates.';
      case CurrencyErrorType.INVALID_CURRENCY:
        return 'The specified currency is not supported.';
      case CurrencyErrorType.INVALID_AMOUNT:
        return 'Please enter a valid amount.';
      default:
        return error?.message || 'An unexpected error occurred with the currency service.';
    }
  }
}

/**
 * HOC for wrapping components with currency error boundary
 */
export function withCurrencyErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<Props>
) {
  return function CurrencyErrorBoundaryWrapper(props: P) {
    return (
      <CurrencyErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </CurrencyErrorBoundary>
    );
  };
}

/**
 * Simple error fallback component for currency displays
 */
export function CurrencyErrorFallback({ 
  amount, 
  currency, 
  error 
}: { 
  amount?: number; 
  currency?: string; 
  error?: Error;
}) {
  return (
    <span className="text-gray-500 italic" title={error?.message}>
      {amount && currency ? `${amount} ${currency}` : 'Error loading currency'}
    </span>
  );
}

export default CurrencyErrorBoundary;