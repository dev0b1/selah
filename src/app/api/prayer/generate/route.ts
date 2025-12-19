import { NextRequest, NextResponse } from 'next/server';
import { createOpenRouterClient } from '@/lib/openrouter';
import { createElevenNudgeClient } from '@/lib/server/eleven-nudge.server';
import { 
  getUserSubscriptionStatus, 
  getUserCredits,
  savePrayer,
  checkTrialStatus,
  startTrialIfEligible
} from '@/lib/db-service';

// Prayer need types (new MVP categories + backward compatibility)
type NeedType = 'peace' | 'strength' | 'guidance' | 'healing' | 'gratitude' | 'comfort' | 'anxiety' | 'confidence' | 'grief' | 'sleep' | 'heartbreak' | 'focus' | 'recovery' | 'secular' | 'protection' | string;

// Prayer generation using OpenRouter/Claude - faith-first, personalized approach
async function generatePrayerText(
  need: NeedType,
  userName: string,
  userMessage?: string
): Promise<string> {
  try {
    const openrouter = createOpenRouterClient();
    
    // Map need types to prayer focus themes
    const prayerThemes: Record<string, string> = {
      peace: 'peace and tranquility',
      strength: 'strength and courage',
      guidance: 'guidance and wisdom',
      healing: 'healing and restoration',
      gratitude: 'gratitude and thankfulness',
      comfort: 'comfort and consolation',
      anxiety: 'peace and relief from anxiety',
      confidence: 'confidence and boldness',
      grief: 'comfort in grief',
      sleep: 'rest and peaceful sleep',
      heartbreak: 'healing from heartbreak',
      focus: 'focus and clarity',
      recovery: 'healing and recovery',
      protection: 'protection and safety',
    };

    const theme = prayerThemes[need] || 'peace and strength';
    
    const systemPrompt = `You are a compassionate Christian prayer writer. Write heartfelt, personalized prayers that are faith-first, God-centered, and spiritually authentic. Your prayers should:
- Be warm, personal, and speak directly to God
- Include the person's name naturally (2-3 times)
- Be 3-5 sentences in length
- Reference appropriate Bible themes without quoting verses verbatim
- End with "In Jesus' name, Amen."
- Avoid being preachy or overly formal
- Feel like a genuine conversation with God

Keep the tone reverent but approachable, as if a close friend is praying on their behalf.`;

    const userPrompt = `Write a personalized prayer for ${userName} who needs ${theme}.${userMessage ? ` They shared: "${userMessage}"` : ''} Make it personal and include ${userName}'s name naturally in the prayer.`;

    const prayerText = await openrouter.generatePrayerText({
      system: systemPrompt,
      user: userPrompt,
    });

    return prayerText;
  } catch (error) {
    console.error('Error generating prayer with OpenRouter, falling back to template:', error);
    
    // Fallback to template if OpenRouter fails
    const fallbackTemplates: Record<string, string> = {
      peace: `Heavenly Father, we pray for ${userName} to receive Your perfect peace. Quiet ${userName}'s heart and mind.${userMessage ? ` We specifically lift up ${userMessage} to You.` : ''} Let Your peace, which surpasses all understanding, guard ${userName}'s heart and mind in Christ Jesus. In Jesus' name, Amen.`,
      strength: `Heavenly Father, we pray for ${userName} to receive Your strength. Fill ${userName} with Your power and courage.${userMessage ? ` As ${userName} faces ${userMessage},` : ''} Give ${userName} the strength to overcome and to stand firm. In Jesus' name, Amen.`,
      guidance: `Heavenly Father, we pray for ${userName} to receive Your guidance and wisdom. Direct ${userName}'s steps.${userMessage ? ` We specifically seek Your guidance regarding ${userMessage}.` : ''} Show ${userName} the path You have prepared. In Jesus' name, Amen.`,
      healing: `Heavenly Father, we bring ${userName} before You for healing. Touch ${userName} with Your healing hand.${userMessage ? ` We specifically lift up ${userName}'s need for healing regarding ${userMessage}.` : ''} Restore body, mind, and spirit. In Jesus' name, Amen.`,
      gratitude: `Heavenly Father, we come before You with hearts full of gratitude on behalf of ${userName}.${userMessage ? ` We are especially grateful for ${userMessage} in ${userName}'s life.` : ''} Open ${userName}'s eyes to see Your many blessings. In Jesus' name, Amen.`,
      comfort: `Heavenly Father, we pray for ${userName} to receive Your comfort. Draw near to ${userName}.${userMessage ? ` We specifically pray for comfort regarding ${userMessage}.` : ''} Wrap ${userName} in Your loving arms. In Jesus' name, Amen.`,
    };

    return fallbackTemplates[need] || `Heavenly Father, we lift up ${userName} to You today.${userMessage ? ` We bring before You ${userMessage}.` : ''} May Your peace, love, and strength surround ${userName}. In Jesus' name, Amen.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, need, message, userName } = body;

    if (!userId || !need || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check trial/subscription status
    const subscription = await getUserSubscriptionStatus(userId);
    const trialStatus = await checkTrialStatus(userId);

    const hasAccess = subscription.isPro || (trialStatus?.hasTrial && !trialStatus?.isExpired);

    if (!hasAccess) {
      // Start trial if eligible
      const trialStarted = await startTrialIfEligible(userId);
      if (!trialStarted) {
        return NextResponse.json(
          { error: 'Trial expired or subscription required', code: 'PAYWALL_REQUIRED' },
          { status: 402 }
        );
      }
    }

    // Generate prayer text (faith-first, no spiritual level needed)
    const prayerText = await generatePrayerText(need, userName, message);

    // Generate audio using ElevenLabs (include user name)
    let audioUrl: string | undefined = undefined;
    try {
      const nudgeClient = createElevenNudgeClient();
      const audioResult = await nudgeClient.generateDailyNudge({
        userStory: prayerText,
        mood: need,
        motivationText: prayerText,
        userName: userName,
      });
      audioUrl = audioResult.audioUrl;
    } catch (e) {
      console.warn('Audio generation failed, continuing with text-only', e);
    }

    // Save to database
    await savePrayer({
      userId,
      userName,
      need,
      message,
      prayerText,
      audioUrl,
    });

    // Generate shareable video card (async, non-blocking)
    let videoUrl: string | undefined = undefined;
    try {
      // This would call a video generation service
      // For now, we'll return the audio URL as a placeholder
      // In production, you'd generate a video card here
    } catch (e) {
      console.warn('Video generation failed', e);
    }

    return NextResponse.json({
      success: true,
      prayerText,
      audioUrl: audioUrl || null,
      videoUrl: videoUrl || null,
    });
  } catch (error) {
    console.error('Error generating prayer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate prayer';
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    );
  }
}

