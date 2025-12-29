import { NextRequest, NextResponse } from 'next/server';
import { getWorshipSongById } from '@/lib/db-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Song ID required' },
        { status: 400 }
      );
    }

    const song = await getWorshipSongById(id);

    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      song: {
        id: song.id,
        title: song.title,
        lyrics: song.lyrics,
        audioUrl: song.audioUrl,
        videoUrl: song.videoUrl,
        mood: song.mood,
        userName: song.userName,
        generationMethod: song.generationMethod,
        isFavorite: song.isFavorite,
        createdAt: song.createdAt,
      },
    });

  } catch (error) {
    console.error('Error fetching worship song:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
