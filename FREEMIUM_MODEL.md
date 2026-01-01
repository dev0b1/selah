# Selah Freemium Model

## Overview
Selah uses a freemium model where basic prayer features are free, and premium features require subscription.

## Free Features (All Users)

### ✅ Text-Based Prayers
- **Prayer Generation**: Unlimited AI-generated personalized prayers
- **Prayer Text Display**: Full prayer text visible on screen
- **Prayer History**: Access to previously generated prayers
- **Prayer Intents**: All prayer categories (peace, guidance, anxiety, etc.)
- **Custom Prayer Requests**: Write specific prayer needs

### ✅ Test Mode (Development)
When `NEXT_PUBLIC_VOICE_MODE=test`:
- Browser TTS (Text-to-Speech) for prayer audio
- Background ambience music during prayer playback
- All prayer features work without subscription

## Premium Features (Subscription Required)

### 🔒 Audio Prayers
- **ElevenLabs TTS**: High-quality AI voice for prayers
- **Background Music**: Professional ambient soundscapes
- **Offline Playback**: Download prayers for offline listening
- **Voice Selection**: Choose from multiple AI voices

### 🔒 Worship Songs (Optional)
- **AI-Generated Songs**: Personalized worship songs with your name
- **Suno Integration**: Professional music generation
- **Song History**: Access to all generated songs
- **Download MP3**: Save songs for offline listening

### 🔒 Premium UI Indicators
- Golden ring around profile picture
- Crown icon in profile tab
- "Premium Member" badge
- Sparkle effects

## Implementation Details

### Prayer Generation API
**File**: `src/app/api/prayer/generate/route.ts`

```typescript
// Prayer text generation - FREE FOR ALL USERS
const prayerText = await generatePrayerText(need, userName, message);

// Audio generation - PREMIUM ONLY
if (hasAccess) {
  audioUrl = await generateAudio(prayerText);
}
```

### Audio Playback Logic
**File**: `components/HomeScreen.tsx`

```typescript
// Test mode: Browser TTS + background music (FREE)
if (isTestMode) {
  handleTestModePlay(); // Uses browser TTS
}
// Premium: ElevenLabs audio
else if (isPremium && displayAudioUrl) {
  handlePlayPause(); // Uses ElevenLabs
}
// Free users: Show upgrade modal
else {
  onListenToPrayer(); // Opens paywall
}
```

## User Journey

### Free User Flow
1. User opens app (no login required)
2. Sees daily prayer text
3. Can generate unlimited text prayers
4. Clicking "Pray with audio" shows upgrade modal
5. Can sign up for 3-day free trial

### Premium User Flow
1. User subscribes via Dodo Payments
2. Gets 3-day free trial
3. After trial: $9.99/month or $99/year
4. Unlocks ElevenLabs audio prayers
5. Profile shows premium indicators

### Test Mode Flow (Development)
1. Set `NEXT_PUBLIC_VOICE_MODE=test`
2. All users get browser TTS + background music
3. No paywall for audio playback
4. Used for testing without ElevenLabs API

## Subscription Tiers

### Free Tier
- ✅ Unlimited text prayers
- ✅ All prayer categories
- ✅ Prayer history
- ❌ No audio prayers
- ❌ No worship songs

### Premium Tier ($9.99/month or $99/year)
- ✅ Everything in Free
- ✅ ElevenLabs audio prayers
- ✅ Background music
- ✅ Offline playback
- ✅ AI worship songs (optional)
- ✅ Premium badge

## Environment Variables

### Required for Free Features
```bash
OPENROUTER_API_KEY=sk-or-xxx  # For prayer text generation
```

### Required for Premium Features
```bash
ELEVENLABS_API_KEY=sk_xxx     # For audio prayers
ELEVENLABS_VOICE_ID=voice_xxx # Voice for prayers
DODO_API_KEY=pk_xxx           # For subscriptions
```

### Optional
```bash
SUNO_API_KEY=xxx              # For worship songs
```

## Credits System (Optional)

The app includes a credits system that can be used for:
- Limiting free prayer generations per day
- Granting credits on subscription renewal
- Tracking usage for analytics

Currently, prayer generation is unlimited for all users.

## Testing

### Test Free User
1. Clear browser data
2. Open app without signing in
3. Generate prayers (should work)
4. Try to play audio (should show paywall)

### Test Premium User
1. Sign in with premium account
2. Generate prayer
3. Click "Pray with audio" (should play ElevenLabs audio)
4. Check profile for premium indicators

### Test Mode
1. Set `NEXT_PUBLIC_VOICE_MODE=test` in `.env.local`
2. Restart dev server
3. Click "Pray with audio" (should use browser TTS)
4. Verify background music plays

## Conversion Strategy

### Upgrade Triggers
- Clicking "Pray with audio" button
- Accessing worship songs tab
- After generating 5+ prayers (optional)

### Upgrade Modal Features
- 3-day free trial offer
- Feature comparison
- Social proof
- Easy checkout with Dodo Payments

### Success Metrics
- Free-to-paid conversion rate
- Trial-to-paid conversion rate
- Monthly recurring revenue (MRR)
- Churn rate
