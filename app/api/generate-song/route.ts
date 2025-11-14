import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateLyrics, SongStyle } from '@/lib/lyrics';
import { createElevenLabsClient } from '@/lib/elevenlabs';

interface GenerateSongRequest {
  story: string;
  style: SongStyle;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSongRequest = await request.json();
    const { story, style } = body;

    if (!story || story.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Story is too short' },
        { status: 400 }
      );
    }

    const validStyles: SongStyle[] = ['sad', 'savage', 'healing', 'vibe', 'meme'];
    if (!validStyles.includes(style)) {
      return NextResponse.json(
        { success: false, error: 'Invalid style selected' },
        { status: 400 }
      );
    }

    console.log('Generating lyrics for story:', story.substring(0, 50) + '...');
    
    const lyricsResult = await generateLyrics({ story, style });

    console.log('Lyrics generated:', lyricsResult.title);

    let previewUrl = '';
    let fullUrl = '';

    const elevenLabsClient = createElevenLabsClient();
    
    try {
      console.log('Generating music with ElevenLabs...');
      
      const musicResult = await elevenLabsClient.generateSong({
        prompt: lyricsResult.lyrics,
        title: lyricsResult.title,
        style,
        duration: 30,
      });

      previewUrl = musicResult.audioUrl;
      fullUrl = musicResult.audioUrl;

      console.log('Music generated successfully');
    } catch (musicError) {
      console.warn('ElevenLabs music generation failed, using placeholder:', musicError);
      
      previewUrl = '/audio/placeholder-preview.mp3';
      fullUrl = '/audio/placeholder-full.mp3';
    }

    const song = await prisma.song.create({
      data: {
        title: lyricsResult.title,
        story,
        style,
        lyrics: lyricsResult.lyrics,
        genre: lyricsResult.genre,
        mood: lyricsResult.mood,
        previewUrl,
        fullUrl,
        isPurchased: false,
      },
    });

    return NextResponse.json({
      success: true,
      songId: song.id,
      title: lyricsResult.title,
      lyrics: lyricsResult.lyrics,
      message: 'Song generated successfully',
    });
  } catch (error) {
    console.error('Error generating song:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate song',
      },
      { status: 500 }
    );
  }
}
