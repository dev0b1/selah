import { NextRequest, NextResponse } from 'next/server';
import { getPrayerById } from '@/lib/db-service';
import { createCanvas, registerFont } from 'canvas';
import path from 'path';
import fs from 'fs/promises';

// Prayer card image generation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Prayer ID required' },
        { status: 400 }
      );
    }

    const prayer = await getPrayerById(id);

    if (!prayer) {
      return NextResponse.json(
        { error: 'Prayer not found' },
        { status: 404 }
      );
    }

    // Card dimensions (Instagram-friendly square)
    const width = 1080;
    const height = 1080;

    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background gradient (night theme matching Selah)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a2332');
    gradient.addColorStop(0.5, '#2d3a5a');
    gradient.addColorStop(1, '#6b4d57');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle overlay
    const overlayGradient = ctx.createLinearGradient(0, 0, width, height);
    overlayGradient.addColorStop(0, 'transparent');
    overlayGradient.addColorStop(0.5, 'rgba(74, 58, 95, 0.4)');
    overlayGradient.addColorStop(1, 'rgba(139, 90, 79, 0.6)');
    ctx.fillStyle = overlayGradient;
    ctx.fillRect(0, 0, width, height);

    // Padding
    const padding = 80;
    const contentWidth = width - padding * 2;
    const contentHeight = height - padding * 2;

    // Draw crescent moon (top right)
    ctx.save();
    ctx.translate(width - 120, 120);
    const moonGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
    moonGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    moonGradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
    ctx.fillStyle = moonGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.fill();
    // Crescent shadow
    ctx.fillStyle = '#1a2332';
    ctx.beginPath();
    ctx.arc(15, 0, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Title: User's name
    ctx.fillStyle = '#D4A574'; // Selah gold
    ctx.font = 'bold 72px "Georgia", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const nameY = padding + 60;
    ctx.fillText(prayer.userName || 'Friend', width / 2, nameY);

    // Subtitle: "A Prayer for You"
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'italic 32px "Georgia", serif';
    const subtitleY = nameY + 90;
    ctx.fillText('A Prayer for You', width / 2, subtitleY);

    // Prayer text excerpt (first 2-3 lines, max ~150 chars)
    const maxExcerptLength = 150;
    let excerpt = prayer.prayerText || '';
    if (excerpt.length > maxExcerptLength) {
      // Find last sentence break before max length
      const truncated = excerpt.substring(0, maxExcerptLength);
      const lastPeriod = truncated.lastIndexOf('.');
      const lastExclamation = truncated.lastIndexOf('!');
      const lastBreak = Math.max(lastPeriod, lastExclamation);
      if (lastBreak > 50) {
        excerpt = excerpt.substring(0, lastBreak + 1);
      } else {
        // No good break point, just truncate
        excerpt = truncated + '...';
      }
    }

    // Prayer text styling
    ctx.fillStyle = '#F5F5F5';
    ctx.font = '32px "Georgia", serif';
    ctx.textAlign = 'center';
    
    // Word wrap for prayer text
    const words = excerpt.split(' ');
    const lineHeight = 48;
    const maxWidth = contentWidth - 40;
    let currentLine = '';
    let y = subtitleY + 100;
    const lines: string[] = [];

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    // Limit to 4 lines max
    const displayLines = lines.slice(0, 4);
    
    displayLines.forEach((line, index) => {
      ctx.fillText(line, width / 2, y + index * lineHeight);
    });

    // "Read the full prayer" CTA at bottom
    const ctaY = height - padding - 80;
    ctx.fillStyle = '#D4A574';
    ctx.font = 'bold 28px "Georgia", serif';
    ctx.fillText('Read the full prayer', width / 2, ctaY);

    // Selah branding at very bottom
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'italic 24px "Georgia", serif';
    ctx.fillText('Selah', width / 2, height - padding - 20);

    // Convert to buffer
    const buffer = canvas.toBuffer('image/png');

    // Return image
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error generating prayer card:', error);
    return NextResponse.json(
      { error: 'Failed to generate prayer card' },
      { status: 500 }
    );
  }
}

