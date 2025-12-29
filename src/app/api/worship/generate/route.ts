import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserSubscriptionStatus,
  checkTrialStatus,
  reserveCredit,
  refundCredit,
  saveWorshipSong,
  getWorshipSongBySunoTaskId,
  updateWorshipSongAudioUrl,
} from '@/lib/db-service';
import type { WorshipMoodType } from '@/src/db/schema';

// Generate worship song lyrics using OpenRouter/Claude
async function generateWorshipSongLyrics(
  userName: string,
  mood: WorshipMoodType
): Promise<{ title: string; lyrics: string }> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku';

  if (!openRouterKey) {
    // Fallback to template-based lyrics if OpenRouter not configured
    return generateTemplateLyrics(userName, mood);
  }

  try {
    const moodDescriptions: Record<WorshipMoodType, string> = {
      peace: 'peace, calm, and rest',
      strength: 'strength, courage, and perseverance',
      trust: 'trust and faith in God',
      hope: 'hope and expectation',
      gratitude: 'gratitude and thankfulness',
      comfort: 'comfort and consolation in difficult times',
    };

    const systemPrompt = `You are a gifted Christian worship songwriter with deep understanding of biblical themes and worship music. Create a beautiful, heartfelt worship song that:

1. Structure: 2-3 verses with a memorable, repeatable chorus
2. Personalization: Naturally includes the name "${userName}" 2-3 times throughout the song
3. Theme: Focuses deeply on ${moodDescriptions[mood]} with biblical foundation
4. Language: Uses reverent, biblical language and imagery (references to God, Jesus, Holy Spirit, Scripture)
5. Tone: Suitable for personal devotion and congregational worship
6. Flow: Has clear verse-chorus structure that flows naturally
7. Emotion: Conveys genuine emotion and spiritual depth

Guidelines:
- Use "You" or "Lord" when addressing God
- Include biblical references or imagery (e.g., "Your Word", "Your presence", "the cross", "Your grace")
- Make the chorus memorable and repeatable
- Ensure ${userName} feels personally addressed and loved by God
- Keep language reverent and worshipful, not casual

Return ONLY a JSON object with this exact structure:
{
  "title": "Song Title (should be meaningful and worshipful)",
  "lyrics": "Verse 1 lyrics here\\n\\nChorus lyrics here\\n\\nVerse 2 lyrics here\\n\\nChorus lyrics here"
}

The lyrics should be formatted with line breaks (\\n) between verses and chorus.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Write a worship song for ${userName} about ${moodDescriptions[mood]}.` },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    
    // Try to parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || `${userName}'s Song of ${mood.charAt(0).toUpperCase() + mood.slice(1)}`,
        lyrics: parsed.lyrics || content,
      };
    }

    // Fallback if JSON parsing fails
    return {
      title: `${userName}'s Song of ${mood.charAt(0).toUpperCase() + mood.slice(1)}`,
      lyrics: content,
    };
  } catch (error) {
    console.error('Error generating lyrics with OpenRouter:', error);
    return generateTemplateLyrics(userName, mood);
  }
}

// Template-based fallback lyrics
function generateTemplateLyrics(userName: string, mood: WorshipMoodType): { title: string; lyrics: string } {
  const templates: Record<WorshipMoodType, { title: string; lyrics: string }> = {
    peace: {
      title: `${userName}'s Song of Peace`,
      lyrics: `In Your presence, ${userName} finds rest\nYour peace flows like a gentle stream\nAll worries fade, all fears depart\nWhen ${userName} trusts in You, Lord\n\nYour peace that passes understanding\nGuards ${userName}'s heart and mind\nIn Christ, true rest is found\nForever, ${userName} is Yours`,
    },
    strength: {
      title: `${userName}'s Strength`,
      lyrics: `${userName} stands strong in Your power\nYour strength is made perfect in weakness\nWhen ${userName} feels weak, You are strong\nTogether, ${userName} can face anything\n\nYou strengthen ${userName} with might\nBy Your Spirit, ${userName} will rise\nIn You, ${userName} is more than a conqueror\nYour strength never fails`,
    },
    trust: {
      title: `${userName} Trusts in You`,
      lyrics: `${userName} trusts in You, O Lord\nYou are faithful, true, and good\nWhen ${userName} doesn't understand\n${userName} will trust Your perfect plan\n\nYour ways are higher, Your thoughts are pure\n${userName} will trust and not be afraid\nIn every season, ${userName} will trust\nFor You are worthy, Lord`,
    },
    hope: {
      title: `${userName}'s Hope`,
      lyrics: `${userName}'s hope is in You, Lord\nYour promises are true and sure\nWhen ${userName} feels lost or alone\nYour hope lifts ${userName} up\n\n${userName} anchors hope in You\nUnshakable, eternal, bright\nThrough You, ${userName} will overcome\nYour hope never disappoints`,
    },
    gratitude: {
      title: `${userName} Gives Thanks`,
      lyrics: `${userName} gives thanks to You, O Lord\nFor all Your goodness and Your grace\nYour blessings overflow in ${userName}'s life\nYour love fills ${userName}'s heart with praise\n\n${userName} will sing of Your great love\nForever grateful, ${userName} will be\nThank You, Lord, for everything\n${userName} gives thanks with joy`,
    },
    comfort: {
      title: `${userName}'s Comfort`,
      lyrics: `${userName} finds comfort in Your arms\nYour love surrounds like a warm embrace\nWhen ${userName} feels broken and alone\nYou draw near with tender grace\n\nYou are the God of all comfort\n${userName} rests in Your faithful care\nThrough every trial, ${userName} will trust\nYour comfort is always there`,
    },
  };

  return templates[mood] || templates.peace;
}

// Generate song with SunoAPI.org
async function generateSongWithSuno(lyrics: string, title: string, mood: WorshipMoodType, userName: string): Promise<{ taskId: string; audioUrl?: string } | null> {
  const sunoApiKey = process.env.SUNO_API_KEY;
  // SunoAPI.org uses api.sunoapi.org
  const sunoApiUrl = process.env.SUNO_API_URL || 'https://api.sunoapi.org';

  if (!sunoApiKey) {
    console.warn('Suno API key not configured');
    return null;
  }

  try {
    // Craft a well-designed prompt based on mood and user input
    const moodPrompts: Record<WorshipMoodType, string> = {
      peace: 'gentle, peaceful, calming worship music with soft piano and strings, like a quiet prayer',
      strength: 'uplifting, powerful worship anthem with inspiring melodies and encouraging rhythm',
      trust: 'faithful, trusting worship song with warm harmonies and steady, reassuring tempo',
      hope: 'hopeful, bright worship music with uplifting melodies and inspiring instrumentation',
      gratitude: 'joyful, thankful worship song with celebratory tones and grateful harmonies',
      comfort: 'comforting, gentle worship music with soothing melodies and peaceful atmosphere',
    };

    const styleDescription = moodPrompts[mood] || moodPrompts.peace;
    
    // Well-crafted prompt for SunoAPI.org - based on actual API documentation
    // Format: custom_mode with gpt_description_prompt and lyrics
    const gptDescriptionPrompt = `A beautiful Christian worship song titled "${title}" for ${userName}. ${styleDescription}. The song should be reverent, heartfelt, and suitable for personal devotion. Include gentle instrumentation that supports the vocals without overwhelming them.`;

    // SunoAPI.org v1 API endpoint structure
    const response = await fetch(`${sunoApiUrl}/v1/suno/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sunoApiKey}`,
      },
      body: JSON.stringify({
        custom_mode: true,
        gpt_description_prompt: gptDescriptionPrompt,
        make_instrumental: false, // We want vocals with lyrics
        mv: 'suno-v4', // Use v4 model
        lyrics: lyrics, // Include the lyrics
        title: title,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SunoAPI.org error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    
    // SunoAPI.org v1 returns: { id, status, audio_url, ... }
    const taskId = data.id || data.data?.id;
    const audioUrl = data.audio_url || data.data?.audio_url || null;
    const status = data.status || data.data?.status;
    
    if (!taskId) {
      console.error('SunoAPI.org response missing task ID:', data);
      return null;
    }
    
    // If status is 'complete' and we have audio_url, return it
    // Otherwise, return taskId for polling
    return {
      taskId: taskId.toString(),
      audioUrl: (status === 'complete' && audioUrl) ? audioUrl : undefined,
    };
  } catch (error) {
    console.error('Error calling SunoAPI.org:', error);
    return null;
  }
}

// Generate song with ElevenLabs (fallback)
async function generateSongWithElevenLabs(lyrics: string): Promise<string | null> {
  try {
    // Use the existing ElevenLabs integration
    const { generateMusicWithEleven } = await import('@/lib/eleven');
    
    // Generate music with lyrics as voiceover
    const result = await generateMusicWithEleven(
      lyrics,
      'voiceover',
      'peaceful', // Worship music should be peaceful/calming
      120 // 2 minutes
    );

    return result.audioUrl || null;
  } catch (error) {
    console.error('Error generating song with ElevenLabs:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userName, mood } = body;

    if (!userId || !userName || !mood) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, userName, mood' },
        { status: 400 }
      );
    }

    // Validate mood
    const validMoods: WorshipMoodType[] = ['peace', 'strength', 'trust', 'hope', 'gratitude'];
    if (!validMoods.includes(mood)) {
      return NextResponse.json(
        { error: `Invalid mood. Must be one of: ${validMoods.join(', ')}` },
        { status: 400 }
      );
    }

    // Check subscription/trial status (worship songs are premium)
    const subscription = await getUserSubscriptionStatus(userId);
    const trialStatus = await checkTrialStatus(userId);
    
    const isPremium = subscription.isPro || (trialStatus?.hasTrial && !trialStatus?.isExpired);
    
    if (!isPremium) {
      return NextResponse.json(
        { error: 'Premium subscription required for worship songs', code: 'PAYWALL_REQUIRED' },
        { status: 402 }
      );
    }

    // Check if user has credits (1 worship song per day for premium users)
    // For now, we'll allow unlimited for premium users (can be restricted later)
    
    // Reserve credit if using credit system
    const creditReserved = await reserveCredit(userId);
    if (!creditReserved && subscription.tier !== 'yearly') {
      return NextResponse.json(
        { error: 'No credits remaining. Worship songs are limited to 1 per day.' },
        { status: 402 }
      );
    }

    try {
      // Generate lyrics
      const { title, lyrics } = await generateWorshipSongLyrics(userName, mood);

      // Try Suno API first
      let audioUrl: string | null = null;
      let sunoTaskId: string | null = null;
      let generationMethod: 'suno' | 'elevenlabs' = 'suno';

      const sunoResult = await generateSongWithSuno(lyrics, title, mood, userName);
      
      if (sunoResult?.taskId) {
        sunoTaskId = sunoResult.taskId;
        audioUrl = sunoResult.audioUrl || null;

        // Save song to database immediately (even if audio is still generating)
        const songId = await saveWorshipSong({
          userId,
          userName,
          mood,
          title,
          lyrics,
          audioUrl: audioUrl || 'pending', // Temporary placeholder
          sunoTaskId,
          generationMethod: 'suno',
        });

        // If audio is ready, return it. Otherwise, return task ID for polling
        if (audioUrl) {
          await updateWorshipSongAudioUrl(songId!, audioUrl);
          
          return NextResponse.json({
            success: true,
            songId,
            title,
            lyrics,
            audioUrl,
            generationMethod: 'suno',
            status: 'complete',
          });
        } else {
          // Song is still generating - client should poll for completion
          return NextResponse.json({
            success: true,
            songId,
            title,
            lyrics,
            audioUrl: null,
            sunoTaskId,
            generationMethod: 'suno',
            status: 'generating',
            message: 'Your worship song is being generated. Please check back in a few moments.',
          });
        }
      }

      // Fallback to ElevenLabs if Suno fails
      console.log('Suno generation failed, falling back to ElevenLabs');
      generationMethod = 'elevenlabs';
      
      audioUrl = await generateSongWithElevenLabs(lyrics);
      
      if (!audioUrl) {
        // Refund credit if generation failed
        if (creditReserved) {
          await refundCredit(userId, 1);
        }
        
        return NextResponse.json(
          { error: 'Failed to generate song audio. Please try again later.' },
          { status: 500 }
        );
      }

      // Save song to database
      const songId = await saveWorshipSong({
        userId,
        userName,
        mood,
        title,
        lyrics,
        audioUrl,
        generationMethod: 'elevenlabs',
      });

      return NextResponse.json({
        success: true,
        songId,
        title,
        lyrics,
        audioUrl,
        generationMethod: 'elevenlabs',
        status: 'complete',
      });

    } catch (error) {
      // Refund credit on error
      if (creditReserved) {
        await refundCredit(userId, 1);
      }
      throw error;
    }

  } catch (error) {
    console.error('Error generating worship song:', error);
    return NextResponse.json(
      { error: 'Failed to generate worship song' },
      { status: 500 }
    );
  }
}

