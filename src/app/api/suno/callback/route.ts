import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { audioGenerationJobs, songs } from '@/src/db/schema';
import { markJobSucceeded } from '@/lib/db-service';
import { publishEvent } from '@/lib/sse';

export async function POST(req: NextRequest) {
  const raw = await req.text();
  console.info('[callback] received', { length: raw?.length });

  let body: any;
  try {
    body = JSON.parse(raw);
  } catch (e) {
    console.error('[callback] invalid JSON');
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  // ✅ HANDLE MULTIPLE POSSIBLE STRUCTURES
  let taskId: string | null = null;
  let items: any[] = [];

  // Structure 1: { data: { task_id, data: [...] } }
  if (body?.data?.task_id) {
    taskId = body.data.task_id;
    items = body.data.data || [];
  }
  // Structure 2: { task_id, data: [...] }
  else if (body?.task_id) {
    taskId = body.task_id;
    items = body.data || [];
  }
  // Structure 3: { id, ... } (direct song object)
  else if (body?.id) {
    taskId = body.id;
    items = [body];
  }

  if (!taskId) {
    console.warn('[callback] no task_id found');
    return NextResponse.json({ error: 'missing task_id' }, { status: 400 });
  }

  console.info('[callback] processing', { taskId, itemsCount: items.length });

  try {
    // ✅ FIND JOB BY PROVIDER TASK ID
    const jobRows = await db
      .select()
      .from(audioGenerationJobs)
      .where(eq(audioGenerationJobs.providerTaskId, taskId))
      .limit(1);

    if (!jobRows || jobRows.length === 0) {
      console.warn('[callback] no matching job', { taskId });
      
      // Still publish SSE event for clients
      try {
        publishEvent(taskId, { taskId, items, status: 'complete' });
      } catch (e) {}
      
      return NextResponse.json({ message: 'job not found' }, { status: 404 });
    }

    const job = jobRows[0];
    const jobId = job.id;
    
    let payload: any = {};
    try {
      payload = JSON.parse(job.payload || '{}');
    } catch (e) {}

    const songId = payload.songId || null;

    // ✅ EXTRACT URLS FROM FIRST ITEM
    const item = Array.isArray(items) && items.length > 0 ? items[0] : items;
    const audioUrl = item?.audio_url || item?.audioUrl || null;
    const videoUrl = item?.video_url || item?.videoUrl || null;
    const imageUrl = item?.image_url || item?.image_large_url || null;
    const duration = item?.duration ? Math.round(item.duration) : null;
    const lyrics = item?.lyric || item?.lyrics || null;

    console.info('[callback] extracted data', { 
      songId, 
      audioUrl: !!audioUrl, 
      videoUrl: !!videoUrl 
    });

    // ✅ UPDATE SONG RECORD
    if (songId && audioUrl) {
      await db
        .update(songs)
        .set({
          previewUrl: audioUrl,
          fullUrl: videoUrl || audioUrl,
          duration: duration || undefined,
          lyrics: lyrics || undefined,
          updatedAt: new Date(),
        })
        .where(eq(songs.id, songId));

      console.info('[callback] song updated', { songId });
    }

    // ✅ MARK JOB SUCCEEDED
    await markJobSucceeded(jobId, audioUrl || videoUrl || '');
    console.info('[callback] job marked succeeded', { jobId });

    // ✅ PUBLISH SSE EVENT
    try {
      publishEvent(taskId, {
        taskId,
        songId,
        audioUrl,
        videoUrl,
        imageUrl,
        duration,
        status: 'complete',
      });
      console.info('[callback] SSE event published', { taskId });
    } catch (e) {
      console.warn('[callback] SSE publish failed', e);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[callback] error:', error);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
