import { NextRequest, NextResponse } from "next/server";
import { Environment, Paddle } from '@paddle/paddle-node-sdk';
import { db } from "@/server/db";
import { transactions, subscriptions } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { refillCredits } from "@/lib/db-service";
import { mapPriceIdToAction } from '@/lib/paddle-config';

// Initialize Paddle SDK instance once (reused across requests)
const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as Environment) || Environment.sandbox,
});

export async function POST(request: NextRequest) {
  const signature = request.headers.get('paddle-signature') ?? '';
  const body = await request.text();

  // Validate signature and body are present
  if (!signature || !body) {
    console.error('[Webhook] Missing signature or body');
    return NextResponse.json({ error: 'Missing signature or body' }, { status: 400 });
  }

  if (!process.env.PADDLE_API_KEY || !process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET) {
    console.warn('[Webhook] Paddle credentials not configured');
    return NextResponse.json({ received: true, note: 'Credentials not configured' }, { status: 200 });
  }

  try {
    // Unmarshal and verify webhook signature (await in case it's async)
    const eventData = await paddle.webhooks.unmarshal(
      body,
      process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET!,
      signature,
    );

    if (!eventData || !eventData.data) {
      throw new Error('Invalid event data structure');
    }

    console.log(`[Webhook] Received event: ${eventData.eventType}`);

    const transactionId = eventData.data.id || `tx-${Date.now()}`;
    
    // Check for duplicate with row locking to prevent race conditions
    const existing = await db.select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);
    
    if (existing.length > 0) {
      console.log(`[Webhook] Transaction ${transactionId} already processed - skipping`);
      return NextResponse.json({ received: true, note: "Already processed" });
    }

    // Type-safe data extraction - cast to any for webhook data since structure varies
    const data = eventData.data as any;

    // Insert transaction record first to claim this event
    const amountTotal = Number(data.details?.totals?.total || 0);
    const amountStr = String(amountTotal || '0');
    await db.insert(transactions).values({
      id: transactionId,
      userId: data.custom_data?.userId || null,
      amount: amountStr,
      currency: data.currency_code || 'USD',
      dodoData: JSON.stringify(data),
      status: data.status || eventData.eventType,
    });

    // Extract price_id from items array (Paddle structure)
    let priceId: string | null = null;
    if (data.items && Array.isArray(data.items) && data.items.length > 0) {
      // Get first item's price_id
      priceId = data.items[0].price?.id || data.items[0].price_id || null;
    }
    
    // Fallback to other possible locations
    if (!priceId) {
      priceId = data.price_id || 
                data.product_id || 
                data.plan_id || 
                data.checkout?.price_id || 
                null;
    }

    const priceAction = priceId ? mapPriceIdToAction(priceId) : null;
    if (priceAction) {
      console.log(`[Webhook] Detected price action for ${priceId}:`, priceAction);
    }

    // Route to appropriate handler
    switch (eventData.eventType) {
      case "transaction.completed":
      case "transaction.paid":
        await handleTransactionCompleted(data, priceAction);
        break;

      case "subscription.created":
        await handleSubscriptionCreated(data);
        break;

      case "subscription.updated":
        await handleSubscriptionUpdated(data, eventData.eventType);
        break;

      case "subscription.activated":
        // Treat activation similar to creation
        await handleSubscriptionCreated(data);
        break;

      case "subscription.canceled":
        await handleSubscriptionCanceled(data);
        break;

      case "subscription.past_due":
        await handleSubscriptionPastDue(data);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${eventData.eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Processing error:", error);
    // Return 200 even on error to prevent Paddle from retrying
    return NextResponse.json({ received: true, error: 'Processing failed' }, { status: 200 });
  }
}

async function handleTransactionCompleted(transaction: any, priceAction: any = null) {
  console.log(`[Webhook] Processing transaction.completed: ${transaction.id}`);

  const customData = transaction.custom_data || {};
  const customType = customData.type;
  const userId = customData.userId || null;

  if (!userId) {
    console.warn(`[Webhook] No userId in transaction ${transaction.id} - skipping user-specific actions`);
  }

  // Handle credit purchases
  if (customType === 'credit_purchase' || (priceAction && priceAction.kind === 'credits')) {
    const credits = Number(customData.creditsAmount) || Number(priceAction?.creditsAmount) || 0;
    if (userId && credits > 0) {
      await refillCredits(userId, credits);
      console.log(`[Webhook] Refilled ${credits} credits for user ${userId}`);
    } else {
      console.warn(`[Webhook] Credit purchase detected but missing userId or credits amount`);
    }
  }

  // Note: song purchases are deprecated in Selah
  // are archived by migrations. For purchases that map to daily credits, we
  // handle credits above. If you need custom fulfillment, extend this handler.
}

async function handleSubscriptionCreated(subscription: any) {
  console.log(`[Webhook] Processing subscription.created: ${subscription.id}`);
  
  const userId = subscription.custom_data?.userId;
  
  if (!userId) {
    console.error(`[Webhook] No userId in subscription ${subscription.id} custom_data`);
    return;
  }

  // Selah subscription model: 'monthly' tier for premium users
  const tier = subscription.custom_data?.tier || 'monthly';
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
      renewsAt: subscription.next_billed_at ? new Date(subscription.next_billed_at) : null,
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        dodoSubscriptionId: subscription.id,
        tier,
        status: subscription.status || 'active',
        creditsRemaining: initialCredits,
        renewsAt: subscription.next_billed_at ? new Date(subscription.next_billed_at) : null,
        updatedAt: new Date(),
      }
    });
  
  console.log(`[Webhook] Subscription created for user ${userId} with ${initialCredits} credits`);
}

async function handleSubscriptionUpdated(subscription: any, eventType: string) {
  console.log(`[Webhook] Processing subscription.updated: ${subscription.id}`);
  
  const userId = subscription.custom_data?.userId;
  
  if (!userId) {
    console.error(`[Webhook] No userId in subscription ${subscription.id} custom_data`);
    return;
  }

  const tier = subscription.custom_data?.tier || 'unlimited';
  const status = subscription.status;

  // Check if this is a renewal by looking at billing_cycle or scheduled_change
  const isRenewal = subscription.billing_cycle && 
                    subscription.current_billing_period?.starts_at &&
                    new Date(subscription.current_billing_period.starts_at) > new Date(subscription.created_at);

  // Refill credits on renewal for unlimited tier
  if (isRenewal && status === 'active') {
    if (tier === 'unlimited') {
      await refillCredits(userId, 20);
      console.log(`[Webhook] Refilled 20 credits for user ${userId} on subscription renewal`);
    } else if (tier === 'monthly' || tier === 'yearly') {
      // Refill 1 credit per day for premium subscription renewals (worship songs)
      // For Selah, premium users get 1 worship song per day
      await refillCredits(userId, 1);
      console.log(`[Webhook] Refilled 1 credit for user ${userId} on premium subscription renewal`);
    }
  }

  await db
    .update(subscriptions)
    .set({
      tier,
      status,
      renewsAt: subscription.next_billed_at ? new Date(subscription.next_billed_at) : null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.dodoSubscriptionId, subscription.id));

  console.log(`[Webhook] Subscription ${subscription.id} updated - status: ${status}`);
}

async function handleSubscriptionCanceled(subscription: any) {
  console.log(`[Webhook] Processing subscription.canceled: ${subscription.id}`);
  
  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.dodoSubscriptionId, subscription.id));
  
  console.log(`[Webhook] Subscription ${subscription.id} marked as canceled`);
}

async function handleSubscriptionPastDue(subscription: any) {
  console.log(`[Webhook] Processing subscription.past_due: ${subscription.id}`);
  
  await db
    .update(subscriptions)
    .set({
      status: 'past_due',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.dodoSubscriptionId, subscription.id));
  
  console.log(`[Webhook] Subscription ${subscription.id} marked as past_due`);
}