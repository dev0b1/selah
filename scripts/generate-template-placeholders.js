#!/usr/bin/env node

/**
 * Placeholder MP3 Generator
 * 
 * Creates minimal valid MP3 files for testing template matching
 * Each file is ~1KB and plays ~1 second of silence
 * 
 * Usage: node scripts/generate-template-placeholders.js
 * Output: public/demo-nudges/*.mp3
 */

const fs = require('fs');
const path = require('path');

// Minimal valid MP3 header + silent frame
// This is a real MP3 header + silence payload (~1KB)
const MP3_FRAME = Buffer.from([
  0xFF, 0xFA, 0x90, 0x00, // MP3 frame sync + header
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  // Repeat this pattern to make a ~1KB file
]);


// Demo nudges used as audio fallbacks for DailyMotiv
const TEMPLATES = [
  { filename: 'angry-1.mp3', description: 'Angry - fallback 1' },
  { filename: 'angry-2.mp3', description: 'Angry - fallback 2' },
  { filename: 'confidence-1.mp3', description: 'Confidence - fallback 1' },
  { filename: 'confidence-2.mp3', description: 'Confidence - fallback 2' },
  { filename: 'hurting-1.mp3', description: 'Hurting - fallback 1' },
  { filename: 'hurting-2.mp3', description: 'Hurting - fallback 2' },
  { filename: 'feeling-unstoppable-1.mp3', description: 'Unstoppable - fallback 1' },
  { filename: 'feeling-unstoppable-2.mp3', description: 'Unstoppable - fallback 2' },
];

const OUTPUT_DIR = path.join(__dirname, '../public/demo-nudges');

function generatePlaceholders() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created directory: ${OUTPUT_DIR}`);
  }

  // Generate placeholder MP3 for each template
  TEMPLATES.forEach(({ filename, description }) => {
    const filepath = path.join(OUTPUT_DIR, filename);
    
    // Create ~1KB placeholder
    const buffer = Buffer.alloc(1024, MP3_FRAME);
    
    try {
      fs.writeFileSync(filepath, buffer);
      console.log(`✅ Created: ${filename} (${description})`);
    } catch (error) {
      console.error(`❌ Failed to create ${filename}:`, error.message);
    }
  });

  console.log(`\n✨ Placeholder demo nudges created in ${OUTPUT_DIR}`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Replace placeholders with real MP3 files (8-30 seconds)`);
  console.log(`   2. Run: npm run dev`);
  console.log(`   3. Test on: http://localhost:5000/daily`);
}

generatePlaceholders();
