import { NextRequest, NextResponse } from 'next/server';
import { getWorshipSongBySunoTaskId, updateWorshipSongAudioUrl } from '@/lib/db-service';

// Webhook endpoint for Suno API to notify when song generation is complete
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id, status, audio_url } = body;

    if (!task_id) {
      return NextResponse.json(
        { error: 'task_id required' },
        { status: 400 }
      );
    }

    // Find the worship song by Suno task ID
    const song = await getWorshipSongBySunoTaskId(task_id);
    
    if (!song) {
      console.warn(`Song not found for Suno task ID: ${task_id}`);
      return NextResponse.json({ success: false, error: 'Song not found' }, { status: 404 });
    }

    // Update audio URL if generation is complete
    if (status === 'complete' && audio_url) {
      await updateWorshipSongAudioUrl(song.id, audio_url);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Song audio URL updated',
        songId: song.id 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Callback received',
      status 
    });

  } catch (error) {
    console.error('Error processing Suno callback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

