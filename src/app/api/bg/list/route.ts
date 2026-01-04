import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const bgDir = path.join(process.cwd(), 'public', 'bg');
    const files = fs.readdirSync(bgDir).filter(f => f.toLowerCase().endsWith('.mp3'));
    const urls = files.map(f => `/bg/${encodeURIComponent(f)}`);
    return NextResponse.json({ files: urls });
  } catch (err) {
    console.error('Error listing bg files', err);
    return NextResponse.json({ files: [] });
  }
}
