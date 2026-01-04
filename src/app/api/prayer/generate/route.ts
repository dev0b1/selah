import { NextRequest, NextResponse } from 'next/server';
import { createOpenRouterClient } from '@/lib/openrouter';
import { createElevenNudgeClient } from '@/lib/server/eleven-nudge.server';
import {
  getUserSubscriptionStatus,
  getUserCredits,
  savePrayer,
  checkTrialStatus,
  startTrialIfEligible,
  hasGeneratedAudioToday,
} from '@/lib/db-service';

// Prayer need types (new MVP categories + backward compatibility)
type NeedType = 'peace' | 'strength' | 'guidance' | 'healing' | 'gratitude' | 'comfort' | 'anxiety' | 'confidence' | 'grief' | 'sleep' | 'heartbreak' | 'focus' | 'recovery' | 'secular' | 'protection' | string;

// Prayer generation using OpenRouter/Claude - faith-first, personalized approach
async function generatePrayerText(
  need: NeedType,
  requesterName: string,
  userMessage?: string,
  options?: { mode?: 'personal' | 'friend'; friendName?: string }
): Promise<string> {
  // Determine the target name for the prayer (either requester or friend)
  const isFriend = options?.mode === 'friend' && options?.friendName;
  const targetName = isFriend ? options!.friendName! : requesterName;

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

  const openrouter = createOpenRouterClient();

  // If no model is configured, use local template stitching to avoid calling OpenRouter
  if (!openrouter.hasModel) {
    const fallbackTemplates: Record<string, string> = {
      peace: `Heavenly Father, we pray for ${targetName} to receive Your perfect peace. Quiet ${targetName}'s heart and mind.${userMessage ? ` We specifically lift up ${userMessage} to You.` : ''} Let Your peace, which surpasses all understanding, guard ${targetName}'s heart and mind in Christ Jesus. In Jesus' name, Amen.`,
      strength: `Heavenly Father, we pray for ${targetName} to receive Your strength. Fill ${targetName} with Your power and courage.${userMessage ? ` As ${targetName} faces ${userMessage},` : ''} Give ${targetName} the strength to overcome and to stand firm. In Jesus' name, Amen.`,
      guidance: `Heavenly Father, we pray for ${targetName} to receive Your guidance and wisdom. Direct ${targetName}'s steps.${userMessage ? ` We specifically seek Your guidance regarding ${userMessage}.` : ''} Show ${targetName} the path You have prepared. In Jesus' name, Amen.`,
      healing: `Heavenly Father, we bring ${targetName} before You for healing. Touch ${targetName} with Your healing hand.${userMessage ? ` We specifically lift up ${targetName}'s need for healing regarding ${userMessage}.` : ''} Restore body, mind, and spirit. In Jesus' name, Amen.`,
      gratitude: `Heavenly Father, we come before You with hearts full of gratitude on behalf of ${targetName}.${userMessage ? ` We are especially grateful for ${userMessage} in ${targetName}'s life.` : ''} Open ${targetName}'s eyes to see Your many blessings. In Jesus' name, Amen.`,
      comfort: `Heavenly Father, we pray for ${targetName} to receive Your comfort. Draw near to ${targetName}.${userMessage ? ` We specifically pray for comfort regarding ${userMessage}.` : ''} Wrap ${targetName} in Your loving arms. In Jesus' name, Amen.`,
    };

    // If the user asked to pray for a friend, stitch in the requester's name as a short parenthetical when appropriate
    let base = fallbackTemplates[need] || `Heavenly Father, we lift up ${targetName} to You today.${userMessage ? ` We bring before You ${userMessage}.` : ''} May Your peace, love, and strength surround ${targetName}. In Jesus' name, Amen.`;
    if (isFriend) {
      base = base.replace("In Jesus' name, Amen.", `on behalf of ${requesterName}. In Jesus' name, Amen.`);
    }

    // Ensure fallback is long enough for a ~1 minute read (approx 120-160 words)
    // If praying for a friend, create a shorter ~20s prayer (~30-45 words)
    function expandToTargetWords(text: string, targetWords = 140) {
      const words = text.split(/\s+/).filter(Boolean);
      if (words.length >= targetWords) return text;

      const fragments = [
        `We ask that You would pour out patience, hope, and a quiet assurance over ${targetName}.`,
        `May ${targetName} sense Your presence and be strengthened by Your promises.`,
        `We pray for renewed courage, restful sleep, and a deep awareness of Your love surrounding ${targetName}.`,
        `Grant wisdom to the people around ${targetName} and provide comfort in every small moment.`,
        `We trust in Your steadfast care and surrender these needs into Your hands.`,
      ];

      let idx = 0;
      let out = text;
      while (out.split(/\s+/).filter(Boolean).length < targetWords) {
        out = out + ' ' + fragments[idx % fragments.length];
        idx++;
        if (idx > fragments.length * 4) break; // safety
      }

      if (!out.trim().endsWith("In Jesus' name, Amen.")) {
        out = out.trim() + ' In Jesus\' name, Amen.';
      }

      return out;
    }

    return expandToTargetWords(base, isFriend ? 40 : 140);
  }

  try {
    const systemPromptBase = `You are a compassionate Christian prayer writer. Write heartfelt, personalized prayers that are faith-first, God-centered, and spiritually authentic. Your prayers should:\n- Be warm, personal, and speak directly to God\n- Include the person's name naturally (1-3 times)\n- Reference appropriate Bible themes without quoting verses verbatim\n- End with "In Jesus' name, Amen."\n- Avoid being preachy or overly formal\n- Feel like a genuine conversation with God.`;

    // If friend mode, ask for a short ~20s prayer (2-3 sentences). Otherwise request a 30-60s prayer (3-5 sentences).
    const lengthInstruction = isFriend
      ? ` Keep this prayer very short — about 20 seconds when read aloud (roughly 30-45 words). Use 2-3 concise sentences.`
      : ` Keep this prayer around 30-60 seconds when read aloud (roughly 120-160 words). Use 3-5 sincere sentences.`;

    const systemPrompt = systemPromptBase + lengthInstruction;

    const userPrompt = `Write a personalized prayer for ${targetName} who needs ${theme}.${userMessage ? ` They shared: "${userMessage}"` : ''} Make it personal and include ${targetName}'s name naturally in the prayer.${isFriend ? ` This prayer is requested by ${requesterName} on their behalf.` : ''}`;

    const prayerText = await openrouter.generatePrayerText({
      system: systemPrompt,
      user: userPrompt,
    });

    return prayerText;
  } catch (error) {
    console.error('Error generating prayer with OpenRouter, falling back to template:', error);

    // Fallback to templates as a safe default
    const fallbackTemplates: Record<string, string> = {
      peace: `Heavenly Father, we pray for ${targetName} to receive Your perfect peace. Quiet ${targetName}'s heart and mind.${userMessage ? ` We specifically lift up ${userMessage} to You.` : ''} Let Your peace, which surpasses all understanding, guard ${targetName}'s heart and mind in Christ Jesus. In Jesus' name, Amen.`,
      strength: `Heavenly Father, we pray for ${targetName} to receive Your strength. Fill ${targetName} with Your power and courage.${userMessage ? ` As ${targetName} faces ${userMessage},` : ''} Give ${targetName} the strength to overcome and to stand firm. In Jesus' name, Amen.`,
      guidance: `Heavenly Father, we pray for ${targetName} to receive Your guidance and wisdom. Direct ${targetName}'s steps.${userMessage ? ` We specifically seek Your guidance regarding ${userMessage}.` : ''} Show ${targetName} the path You have prepared. In Jesus' name, Amen.`,
      healing: `Heavenly Father, we bring ${targetName} before You for healing. Touch ${targetName} with Your healing hand.${userMessage ? ` We specifically lift up ${targetName}'s need for healing regarding ${userMessage}.` : ''} Restore body, mind, and spirit. In Jesus' name, Amen.`,
      gratitude: `Heavenly Father, we come before You with hearts full of gratitude on behalf of ${targetName}.${userMessage ? ` We are especially grateful for ${userMessage} in ${targetName}'s life.` : ''} Open ${targetName}'s eyes to see Your many blessings. In Jesus' name, Amen.`,
      comfort: `Heavenly Father, we pray for ${targetName} to receive Your comfort. Draw near to ${targetName}.${userMessage ? ` We specifically pray for comfort regarding ${userMessage}.` : ''} Wrap ${targetName} in Your loving arms. In Jesus' name, Amen.`,
    };

    let base = fallbackTemplates[need] || `Heavenly Father, we lift up ${targetName} to You today.${userMessage ? ` We bring before You ${userMessage}.` : ''} May Your peace, love, and strength surround ${targetName}. In Jesus' name, Amen.`;
    if (isFriend) {
      base = base.replace("In Jesus' name, Amen.", `on behalf of ${requesterName}. In Jesus' name, Amen.`);
      // For friend fallback, return a short prayer
      return base.replace(/\s+/g, ' ').trim();
    }

    return base;
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

    // Support optional friend mode: body.mode === 'friend' and body.friendName
    const mode: 'personal' | 'friend' = body?.mode === 'friend' ? 'friend' : 'personal';
    const friendName: string | undefined = body?.friendName;

    // Generate prayer text - FREE FOR ALL USERS
    const prayerText = await generatePrayerText(need, userName, message, { mode, friendName });

    // Check trial/subscription status for AUDIO generation only
    const subscription = await getUserSubscriptionStatus(userId);
    const trialStatus = await checkTrialStatus(userId);
    const hasAccess = subscription.isPro || (trialStatus?.hasTrial && !trialStatus?.isExpired);

    // Decide whether we should generate server-side audio:
    // - If NEXT_PUBLIC_VOICE_MODE === 'test' => do NOT generate server TTS (use browser TTS)
    // - If user is pro/trial (hasAccess) => generate audio
    // - If free user => allow one server audio per day
    let audioUrl: string | undefined = undefined;
    const voiceMode = process.env.NEXT_PUBLIC_VOICE_MODE || '';

    const canGenerateInTestMode = voiceMode === 'test' ? false : true;

    const isTestMode = voiceMode === 'test';

    // Only attempt server TTS when not in test mode
    if (!isTestMode) {
      let allowAudio = false;

      if (hasAccess) {
        allowAudio = true;
      } else {
        // Free user: allow one server TTS per day
        const already = await hasGeneratedAudioToday(userId);
        allowAudio = !already;
      }

      if (allowAudio) {
        const openaiKey = process.env.OPENAI_API_KEY;
        if (openaiKey) {
          try {
            const nudgeClient = createElevenNudgeClient();
            const audioResult = await nudgeClient.generateDailyNudge({
              userStory: prayerText,
              mood: need,
              motivationText: prayerText,
              userName: userName,
            });
            audioUrl = audioResult.audioUrl;
            // Persist the last audio generation timestamp for daily quota tracking
            try {
              // Update subscription row so future checks can use persisted value
              await (await import('@/lib/db-service')).setLastAudioGeneratedAt(userId, new Date());
            } catch (e) {
              console.warn('Failed to persist last audio timestamp', e);
            }
          } catch (e) {
            console.warn('OpenAI TTS audio generation failed, will use browser TTS fallback', e);
            // Don't set audioUrl - let client use browser TTS
          }
        } else {
          console.log('OpenAI API key not configured, will use browser TTS fallback');
        }
      } else {
        console.log('Server TTS skipped: free user already generated audio today or no access');
      }
    } else {
      // Test mode: prefer browser TTS + background sound; do not call OpenAI TTS
      console.log('Voice mode set to test; skipping server TTS generation');
    }

    // Save to database
    const prayerId = await savePrayer({
      userId,
      userName,
      need,
      message,
      prayerText,
      audioUrl,
    });

    // Provide audio quota info to the client so it can show upsell modal when appropriate
    const audioAllowed = !isTestMode && (hasAccess || (!!audioUrl));
    const freeAudioRemaining = hasAccess ? null : (audioUrl ? 0 : (await hasGeneratedAudioToday(userId) ? 0 : 1));

    return NextResponse.json({
      success: true,
      prayerId,
      prayerText,
      audioUrl: audioUrl || null,
      audioAllowed,
      freeAudioRemaining,
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

