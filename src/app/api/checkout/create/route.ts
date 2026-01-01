import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side Dodo checkout creation endpoint
 * This keeps the Dodo API key secure on the server
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planType, userId, userEmail } = body;

    if (!planType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const dodoApiKey = process.env.DODO_API_KEY;
    const dodoEnvironment = process.env.DODO_ENVIRONMENT || 'sandbox';
    const priceId = planType === 'yearly' 
      ? process.env.DODO_PRICE_YEARLY 
      : process.env.DODO_PRICE_MONTHLY;

    if (!dodoApiKey || !priceId) {
      return NextResponse.json(
        { error: 'Dodo configuration missing' },
        { status: 500 }
      );
    }

    // Create checkout session with Dodo API
    // Note: This is a placeholder - implement actual Dodo API call when SDK is available
    const checkoutUrl = `https://checkout.dodopayments.com/${dodoEnvironment}?price=${priceId}&customer_id=${userId}`;

    return NextResponse.json({
      success: true,
      checkoutUrl,
      sessionId: `session_${Date.now()}`,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
