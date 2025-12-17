/**
 * Paystack Webhook Handler
 *
 * Processes Paystack webhook events for subscription payments
 * Verifies webhook signature and updates user subscriptions
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY')!;

    // Get request body as text for signature verification
    const bodyText = await req.text();
    const body = JSON.parse(bodyText);

    // Verify webhook signature
    const signature = req.headers.get('x-paystack-signature');
    const hash = createHmac('sha512', paystackSecret)
      .update(bodyText)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Webhook event received:', body.event);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle different event types
    switch (body.event) {
      case 'charge.success': {
        // Payment successful - create/update subscription
        const { metadata, reference, amount, currency } = body.data;
        const userId = metadata.user_id;
        const plan = metadata.plan;

        console.log(`Processing successful charge for user ${userId}, plan ${plan}`);

        // Calculate subscription period (30 days)
        const now = new Date();
        const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Upsert subscription
        const { error: upsertError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            tier: plan,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            cancel_at_period_end: false,
            payment_method: 'paystack',
            payment_provider: 'paystack',
            external_subscription_id: reference,
            metadata: {
              amount,
              currency,
              reference,
            },
          }, {
            onConflict: 'user_id',
          });

        if (upsertError) {
          console.error('Error upserting subscription:', upsertError);
          throw upsertError;
        }

        console.log(`Subscription activated for user ${userId}`);

        return new Response(
          JSON.stringify({ message: 'Subscription activated' }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'subscription.disable':
      case 'subscription.not_renew': {
        // Subscription cancelled
        const { subscription_code } = body.data;

        console.log(`Processing subscription cancellation: ${subscription_code}`);

        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'cancelled',
            cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq('external_subscription_id', subscription_code);

        if (updateError) {
          console.error('Error cancelling subscription:', updateError);
          throw updateError;
        }

        return new Response(
          JSON.stringify({ message: 'Subscription cancelled' }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'invoice.payment_failed': {
        // Payment failed - mark subscription as past_due
        const { subscription_code } = body.data;

        console.log(`Payment failed for subscription: ${subscription_code}`);

        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('external_subscription_id', subscription_code);

        if (updateError) {
          console.error('Error updating subscription status:', updateError);
          throw updateError;
        }

        return new Response(
          JSON.stringify({ message: 'Subscription marked as past due' }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      default:
        console.log(`Unhandled event type: ${body.event}`);
        return new Response(
          JSON.stringify({ message: 'Event received' }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
