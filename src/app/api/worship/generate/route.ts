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
    };

    const systemPrompt = `You are a gifted Christian worship songwriter. Create a beautiful, heartfelt worship song that:
- Is 2-3 verses with a chorus
- Includes the name "${userName}" naturally in the lyrics (2-3 times)
- Focuses on ${moodDescriptions[mood]}
- Uses biblical language and imagery
- Is suitable for congregational worship
- Has a memorable, uplifting melody suggestion

Return ONLY a JSON object with this structure:
{
  "title": "Song Title",
  "lyrics": "Verse 1\\n\\nChorus\\n\\nVerse 2\\n\\nChorus"
}`;

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
  };

  return templates[mood] || templates.peace;
}

// Generate song with Suno API
async function generateSongWithSuno(lyrics: string, title: string): Promise<{ taskId: string; audioUrl?: string } | null> {
  const sunoApiKey = process.env.SUNO_API_KEY;
  const sunoApiUrl = process.env.SUNO_API_URL || 'https://api.suno.ai';

  if (!sunoApiKey) {
    console.warn('Suno API key not configured');
    return null;
  }

  try {
    // Suno API typically requires: prompt, lyrics, title, and style
    const response = await fetch(`${sunoApiUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sunoApiKey}`,
      },
      body: JSON.stringify({
        prompt: `A beautiful worship song about faith and hope`,
        lyrics: lyrics,
        title: title,
        style: 'worship',
        duration: 120, // 2 minutes
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Suno API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    
    // Suno API returns a task ID that we can poll for completion
    return {
      taskId: data.task_id || data.id,
      audioUrl: data.audio_url, // May be null if still generating
    };
  } catch (error) {
    console.error('Error calling Suno API:', error);
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
    if (!creditReserved && subscription.tier !== 'unlimited') {
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

      const sunoResult = await generateSongWithSuno(lyrics, title);
      
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

