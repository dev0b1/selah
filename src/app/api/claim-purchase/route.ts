import { NextResponse } from 'next/server';

// Claim-purchase flow deprecated for Selah: songs model removed.
// Endpoint retained to return 410 Gone for older clients.

// Claim purchases that were made while the user was logged out. We match
// transactions whose `paddleData` contains the buyer email and which are not
// yet associated with a user. For each matched transaction we:
// - attach transactions.userId = provided userId
// - if it's a credits/subscription action, create/update the subscription row
//   and grant the correct number of credits
// - if it's a single-song purchase with songId, mark the song as purchased
// NOTE: This endpoint expects a POST with JSON { userId, email }.

export async function POST() {
  return NextResponse.json({ ok: false, error: 'Claim-purchase endpoint deprecated: songs model removed.' }, { status: 410 });
}
