import { NextRequest, NextResponse } from 'next/server';
import { getWorshipSongBySunoTaskId, updateWorshipSongAudioUrl } from '@/lib/db-service';

// Check status of Suno generation task
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;

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

    // Poll Suno API for task status
    const sunoApiKey = process.env.SUNO_API_KEY;
    const sunoApiUrl = process.env.SUNO_API_URL || 'https://api.suno.ai';

    if (!sunoApiKey) {
      return NextResponse.json({
        success: true,
        status: 'generating',
        songId: song.id,
        message: 'Still generating...',
      });
    }

    try {
      const response = await fetch(`${sunoApiUrl}/api/task/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sunoApiKey}`,
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
      
      // Suno API returns status and audio_url when complete
      if (data.status === 'complete' && data.audio_url) {
        // Update database with final audio URL
        await updateWorshipSongAudioUrl(song.id, data.audio_url);

        return NextResponse.json({
          success: true,
          status: 'complete',
          songId: song.id,
          audioUrl: data.audio_url,
          title: song.title,
          lyrics: song.lyrics,
        });
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

