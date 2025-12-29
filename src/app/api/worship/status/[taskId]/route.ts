import { NextRequest, NextResponse } from 'next/server';
import { getWorshipSongBySunoTaskId, updateWorshipSongAudioUrl } from '@/lib/db-service';

// Check status of Suno generation task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID required' },
        { status: 400 }
      );
    }

    // Check if we have this song in our database
    const song = await getWorshipSongBySunoTaskId(taskId);
    
    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // If audio URL is already set, return complete status
    if (song.audioUrl && song.audioUrl !== 'pending') {
      return NextResponse.json({
        success: true,
        status: 'complete',
        songId: song.id,
        audioUrl: song.audioUrl,
        title: song.title,
        lyrics: song.lyrics,
      });
    }

    // Poll SunoAPI.org for task status
    const sunoApiKey = process.env.SUNO_API_KEY;
    const sunoApiUrl = process.env.SUNO_API_URL || 'https://api.sunoapi.org';

    if (!sunoApiKey) {
      return NextResponse.json({
        success: true,
        status: 'generating',
        songId: song.id,
        message: 'Still generating...',
      });
    }

    try {
      // SunoAPI.org v1 status endpoint
      const response = await fetch(`${sunoApiUrl}/v1/suno/get/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sunoApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Task might still be processing
        return NextResponse.json({
          success: true,
          status: 'generating',
          songId: song.id,
          message: 'Still generating...',
        });
      }

      const data = await response.json();
      
      // SunoAPI.org returns different response structure
      // Check for common formats: { status, audio_url } or { data: { status, audio_url } }
      const status = data.status || data.data?.status || data.task_status;
      const audioUrl = data.audio_url || data.data?.audio_url || data.audio_urls?.[0] || data.metadata?.audio_url;
      
      // Status can be: 'complete', 'generating', 'pending', 'failed'
      if (status === 'complete' && audioUrl) {
        // Update database with final audio URL
        await updateWorshipSongAudioUrl(song.id, audioUrl);

        return NextResponse.json({
          success: true,
          status: 'complete',
          songId: song.id,
          audioUrl: audioUrl,
          title: song.title,
          lyrics: song.lyrics,
        });
      }
      
      if (status === 'failed' || status === 'error') {
        return NextResponse.json({
          success: false,
          status: 'failed',
          songId: song.id,
          message: 'Song generation failed. Please try again.',
        }, { status: 500 });
      }

      // Still generating
      return NextResponse.json({
        success: true,
        status: 'generating',
        songId: song.id,
        message: 'Still generating your worship song...',
      });

    } catch (error) {
      console.error('Error polling Suno API:', error);
      // Return generating status on error (client can retry)
      return NextResponse.json({
        success: true,
        status: 'generating',
        songId: song.id,
        message: 'Checking generation status...',
      });
    }

  } catch (error) {
    console.error('Error checking worship song status:', error);
    return NextResponse.json(
      { error: 'Failed to check song status' },
      { status: 500 }
    );
  }
}

