# Dodo Payments Setup Guide

This guide explains how to configure Dodo Payments for subscription billing in the Selah app.

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Dodo Payments Configuration
NEXT_PUBLIC_DODO_API_KEY=your_dodo_api_key_here
NEXT_PUBLIC_DODO_ENVIRONMENT=sandbox  # Use 'production' for live
NEXT_PUBLIC_DODO_PRICE_MONTHLY=price_xxxxx  # Your monthly price ID from Dodo dashboard
NEXT_PUBLIC_DODO_PRICE_YEARLY=price_xxxxx   # Your yearly price ID from Dodo dashboard
NEXT_PUBLIC_DODO_SDK_URL=https://cdn.dodopayments.com/dodo.js
DODO_WEBHOOK_SECRET=whsec_xxxxx  # Webhook signing secret from Dodo dashboard
```

## Setup Steps

### 1. Create Dodo Account
1. Sign up at [Dodo Payments](https://dodopayments.com)
2. Complete business verification
3. Get your API key from the dashboard

### 2. Create Products & Prices
1. In Dodo dashboard, create a product (e.g., "Selah Premium")
2. Create two prices:
   - **Monthly**: Recurring, billed monthly
   - **Yearly**: Recurring, billed yearly
3. Copy the price IDs (format: `price_xxxxx`)

### 3. Configure Webhook
1. In Dodo dashboard, go to Webhooks
2. Add endpoint: `https://your-domain.com/api/webhook/dodo`
3. Select events to listen for:
   - `payment.succeeded`
   - `payment.completed`
   - `subscription.created`
   - `subscription.activated`
   - `subscription.updated`
   - `subscription.renewed`
   - `subscription.canceled`
   - `subscription.expired`
   - `subscription.paused`
4. Copy the webhook signing secret (format: `whsec_xxxxx`)

### 4. Test in Sandbox Mode
1. Set `NEXT_PUBLIC_DODO_ENVIRONMENT=sandbox`
2. Use test card numbers from Dodo docs
3. Verify webhook events are received

### 5. Go Live
1. Switch to production API keys
2. Set `NEXT_PUBLIC_DODO_ENVIRONMENT=production`
3. Update webhook URL to production domain
4. Test with real payment methods

## Implementation Details

### Checkout Flow
- **File**: `src/lib/dodo-checkout.ts`
- **Function**: `openDodoCheckout({ planType: 'monthly' | 'yearly' })`
- **Usage**: Called from UpgradeModal when user clicks "Start Free Trial"

### Webhook Handler
- **File**: `src/app/api/webhook/dodo/route.ts`
- **Endpoint**: `POST /api/webhook/dodo`
- **Features**:
  - Signature verification (TODO: implement when SDK available)
  - Duplicate transaction prevention
  - Subscription creation/updates
  - Credit refills on renewal
  - Transaction logging

### Database Schema
The webhook handler updates these tables:
- `subscriptions`: User subscription status, tier, renewal dates
- `transactions`: Payment transaction records

### User Metadata
The checkout passes user ID via `customer.metadata.userId` to link payments to users.

## Webhook Events Handled

| Event | Action |
|-------|--------|
| `payment.succeeded` | Process one-time payments, refill credits |
| `subscription.created` | Create subscription record, grant 1 initial credit |
| `subscription.activated` | Activate subscription |
| `subscription.updated` | Update subscription details |
| `subscription.renewed` | Refill credits (1 per renewal) |
| `subscription.canceled` | Mark subscription as canceled |
| `subscription.expired` | Mark subscription as expired |
| `subscription.paused` | Mark subscription as paused |

## Success & Cancel URLs

- **Success**: `${origin}/success?type=subscription&plan=${planType}`
- **Cancel**: `${origin}/pricing`

The success page handles:
- Immediate credit grant for authenticated users
- Confirmation message
- Redirect back to app

## Verification Checklist

- [ ] All environment variables configured
- [ ] Webhook endpoint accessible from internet
- [ ] Webhook secret matches Dodo dashboard
- [ ] Test subscription flow in sandbox
- [ ] Verify webhook events are received
- [ ] Check database updates after payment
- [ ] Test subscription cancellation
- [ ] Verify credit refills on renewal

## Troubleshooting

### Webhook not receiving events
1. Check webhook URL is publicly accessible
2. Verify webhook secret is correct
3. Check Dodo dashboard for delivery logs
4. Ensure endpoint returns 200 status

### Subscription not activating
1. Check webhook handler logs
2. Verify `userId` is passed in metadata
3. Check database for subscription record
4. Verify event type is handled

### Credits not refilling
1. Check `subscription.renewed` event is configured
2. Verify `refillCredits` function is called
3. Check database credits table

## Security Notes

- ✅ Webhook signature verification (TODO: implement)
- ✅ Duplicate transaction prevention
- ✅ Environment variable validation
- ✅ Error handling and logging
- ⚠️ TODO: Implement proper signature verification when Dodo SDK provides it
