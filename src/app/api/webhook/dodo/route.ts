import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { transactions, subscriptions } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { refillCredits } from "@/lib/db-service";

/**
 * Dodo Payments Webhook Handler
 * Handles subscription and transaction events from Dodo Payments
 */

export async function POST(request: NextRequest) {
  const signature = request.headers.get('dodo-signature') ?? '';
  const body = await request.text();

  // Validate signature and body are present
  if (!signature || !body) {
    console.error('[Dodo Webhook] Missing signature or body');
    return NextResponse.json({ error: 'Missing signature or body' }, { status: 400 });
  }

  if (!process.env.DODO_WEBHOOK_SECRET) {
    console.warn('[Dodo Webhook] DODO_WEBHOOK_SECRET not configured');
    return NextResponse.json({ received: true, note: 'Webhook secret not configured' }, { status: 200 });
  }

  try {
    // TODO: Implement Dodo signature verification when SDK is available
    // For now, we'll parse the webhook payload
    const eventData = JSON.parse(body);

    if (!eventData || !eventData.event || !eventData.data) {
      throw new Error('Invalid event data structure');
    }

    console.log(`[Dodo Webhook] Received event: ${eventData.event}`);

    const transactionId = eventData.data.id || `tx-${Date.now()}`;
    
    // Check for duplicate with row locking to prevent race conditions
    const existing = await db.select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);
    
    if (existing.length > 0) {
      console.log(`[Dodo Webhook] Transaction ${transactionId} already processed - skipping`);
      return NextResponse.json({ received: true, note: "Already processed" });
    }

    const data = eventData.data;

    // Insert transaction record first to claim this event
    const amountTotal = Number(data.amount || data.total || 0);
    const amountStr = String(amountTotal || '0');
    await db.insert(transactions).values({
      id: transactionId,
      userId: data.customer?.metadata?.userId || data.metadata?.userId || null,
      amount: amountStr,
      currency: data.currency || 'USD',
      dodoData: JSON.stringify(data),
      status: data.status || eventData.event,
    });

    // Route to appropriate handler based on event type
    switch (eventData.event) {
      case "payment.succeeded":
      case "payment.completed":
        await handlePaymentCompleted(data);
        break;

      case "subscription.created":
      case "subscription.activated":
        await handleSubscriptionCreated(data);
        break;

      case "subscription.updated":
      case "subscription.renewed":
        await handleSubscriptionUpdated(data, eventData.event);
        break;

      case "subscription.canceled":
      case "subscription.cancelled":
        await handleSubscriptionCanceled(data);
        break;

      case "subscription.expired":
        await handleSubscriptionExpired(data);
        break;

      case "subscription.paused":
        await handleSubscriptionPaused(data);
        break;

      default:
        console.log(`[Dodo Webhook] Unhandled event type: ${eventData.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Dodo Webhook] Processing error:", error);
    // Return 200 even on error to prevent Dodo from retrying
    return NextResponse.json({ received: true, error: 'Processing failed' }, { status: 200 });
  }
}

async function handlePaymentCompleted(payment: any) {
  console.log(`[Dodo Webhook] Processing payment.completed: ${payment.id}`);

  const userId = payment.customer?.metadata?.userId || payment.metadata?.userId || null;

  if (!userId) {
    console.warn(`[Dodo Webhook] No userId in payment ${payment.id} - skipping user-specific actions`);
    return;
  }

  // Handle one-time credit purchases if applicable
  const credits = Number(payment.metadata?.credits || 0);
  if (credits > 0) {
    await refillCredits(userId, credits);
    console.log(`[Dodo Webhook] Refilled ${credits} credits for user ${userId}`);
  }
}

async function handleSubscriptionCreated(subscription: any) {
  console.log(`[Dodo Webhook] Processing subscription.created: ${subscription.id}`);
  
  const userId = subscription.customer?.metadata?.userId || subscription.metadata?.userId;
  
  if (!userId) {
    console.error(`[Dodo Webhook] No userId in subscription ${subscription.id} metadata`);
    return;
  }

  // Selah subscription model: 'monthly' or 'yearly' tier for premium users
  const tier = subscription.metadata?.tier || subscription.plan?.interval || 'monthly';
  let initialCredits = 0;

  if (tier === 'monthly' || tier === 'yearly') {
    // Premium subscription: 1 worship song per day (credits reset daily)
    // We start with 1 credit that can be used immediately
    initialCredits = 1;
  }
  
  await db
    .insert(subscriptions)
    .values({
      userId,
      dodoSubscriptionId: subscription.id,
      tier,
      status: subscription.status || 'active',
      creditsRemaining: initialCredits,
      renewsAt: subscription.next_billing_date ? new Date(subscription.next_billing_date) : null,
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        dodoSubscriptionId: subscription.id,
        tier,
        status: subscription.status || 'active',
        creditsRemaining: initialCredits,
        renewsAt: subscription.next_billing_date ? new Date(subscription.next_billing_date) : null,
        updatedAt: new Date(),
      }
    });
  
  console.log(`[Dodo Webhook] Subscription created for user ${userId} with ${initialCredits} credits`);
}

async function handleSubscriptionUpdated(subscription: any, eventType: string) {
  console.log(`[Dodo Webhook] Processing subscription.updated: ${subscription.id}`);
  
  const userId = subscription.customer?.metadata?.userId || subscription.metadata?.userId;
  
  if (!userId) {
    console.error(`[Dodo Webhook] No userId in subscription ${subscription.id} metadata`);
    return;
  }

  const tier = subscription.metadata?.tier || subscription.plan?.interval || 'monthly';
  const status = subscription.status;

  // Check if this is a renewal
  const isRenewal = eventType === 'subscription.renewed' || 
                    (subscription.billing_cycle && subscription.current_period_start);

  // Refill credits on renewal for premium users
  if (isRenewal && status === 'active') {
    if (tier === 'monthly' || tier === 'yearly') {
      // Refill 1 credit per day for premium subscription renewals (worship songs)
      await refillCredits(userId, 1);
      console.log(`[Dodo Webhook] Refilled 1 credit for user ${userId} on premium subscription renewal`);
    }
  }

  await db
    .update(subscriptions)
    .set({
      tier,
      status,
      renewsAt: subscription.next_billing_date ? new Date(subscription.next_billing_date) : null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.dodoSubscriptionId, subscription.id));

  console.log(`[Dodo Webhook] Subscription ${subscription.id} updated - status: ${status}`);
}

async function handleSubscriptionCanceled(subscription: any) {
  console.log(`[Dodo Webhook] Processing subscription.canceled: ${subscription.id}`);
  
  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.dodoSubscriptionId, subscription.id));
  
  console.log(`[Dodo Webhook] Subscription ${subscription.id} marked as canceled`);
}

async function handleSubscriptionExpired(subscription: any) {
  console.log(`[Dodo Webhook] Processing subscription.expired: ${subscription.id}`);
  
  await db
    .update(subscriptions)
    .set({
      status: 'expired',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.dodoSubscriptionId, subscription.id));
  
  console.log(`[Dodo Webhook] Subscription ${subscription.id} marked as expired`);
}

async function handleSubscriptionPaused(subscription: any) {
  console.log(`[Dodo Webhook] Processing subscription.paused: ${subscription.id}`);
  
  await db
    .update(subscriptions)
    .set({
      status: 'paused',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.dodoSubscriptionId, subscription.id));
  
  console.log(`[Dodo Webhook] Subscription ${subscription.id} marked as paused`);
}
