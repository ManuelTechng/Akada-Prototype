/**
 * Paystack Payment Integration
 *
 * Handles payment initialization and verification for subscription upgrades
 * using Paystack (recommended for Nigerian users)
 */

import { SubscriptionTier } from '../subscription-types';

interface PaystackConfig {
  email: string;
  amount: number; // In kobo (NGN * 100)
  plan: SubscriptionTier;
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Initialize Paystack payment popup
 *
 * @example
 * ```tsx
 * initializePaystackPayment({
 *   email: user.email,
 *   amount: 800000, // ₦8,000 in kobo
 *   plan: 'basic',
 *   userId: user.id,
 * });
 * ```
 */
export function initializePaystackPayment(config: PaystackConfig) {
  // Check if Paystack script is loaded
  if (!(window as any).PaystackPop) {
    console.error('Paystack script not loaded');
    alert('Payment system is not ready. Please refresh the page.');
    return;
  }

  const handler = (window as any).PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxx',
    email: config.email,
    amount: config.amount,
    currency: 'NGN',
    ref: `${config.userId}_${Date.now()}`, // Unique transaction reference

    metadata: {
      custom_fields: [
        {
          display_name: 'User ID',
          variable_name: 'user_id',
          value: config.userId,
        },
        {
          display_name: 'Subscription Plan',
          variable_name: 'plan',
          value: config.plan,
        },
      ],
    },

    callback: function (response: any) {
      console.log('Paystack payment successful:', response.reference);

      // Verify payment on backend
      verifyPayment(response.reference)
        .then(() => {
          config.onSuccess?.();
          // Redirect to billing page with success message
          window.location.href = '/app/billing?success=true';
        })
        .catch((error) => {
          console.error('Payment verification failed:', error);
          alert('Payment verification failed. Please contact support.');
        });
    },

    onClose: function () {
      console.log('Payment popup closed');
      config.onCancel?.();
    },
  });

  handler.openIframe();
}

/**
 * Verify payment on backend
 *
 * This calls your backend API to verify the payment with Paystack
 * and update the user's subscription status
 */
async function verifyPayment(reference: string): Promise<void> {
  try {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reference }),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

/**
 * Load Paystack script dynamically
 * Call this in your main App component
 */
export function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;

    script.onload = () => {
      console.log('Paystack script loaded successfully');
      resolve();
    };

    script.onerror = () => {
      console.error('Failed to load Paystack script');
      reject(new Error('Failed to load Paystack'));
    };

    document.body.appendChild(script);
  });
}

/**
 * Check Paystack payment status
 * Useful for checking subscription status
 */
export async function checkPaymentStatus(reference: string): Promise<{
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: string;
}> {
  try {
    const response = await fetch(`/api/payments/status/${reference}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
}
