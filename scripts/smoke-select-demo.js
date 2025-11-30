#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function walk(dir, rel = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let out = [];
  for (const ent of entries) {
    const name = ent.name;
    const full = path.join(dir, name);
    const relPath = rel ? `${rel}/${name}` : name;
    if (ent.isDirectory()) {
      out = out.concat(walk(full, relPath));
    } else if (ent.isFile() && name.toLowerCase().endsWith('.mp3')) {
      out.push(relPath);
    }
  }
  return out;
}

const demoDir = path.join(process.cwd(), 'public', 'demo-nudges');
const allMp3 = walk(demoDir);

function pickForMood(mood) {
  const baseMood = mood === 'unstoppable' ? 'feeling-unstoppable' : (mood || 'hurting');
  const folderCandidates = allMp3.filter(p => p.toLowerCase().startsWith(`${baseMood.toLowerCase()}/`));
  if (folderCandidates.length > 0) return folderCandidates[Math.floor(Math.random()*folderCandidates.length)];
  const filenameCandidates = allMp3.filter(p => path.basename(p).toLowerCase().startsWith(baseMood.toLowerCase()));
  if (filenameCandidates.length > 0) return filenameCandidates[Math.floor(Math.random()*filenameCandidates.length)];
  return `${baseMood}.mp3`;
}

const moods = process.argv.slice(2);
if (moods.length === 0) moods.push('hurting','confidence','anxious','calm','frustrated','unstoppable');

for (const m of moods) {
  const pick = pickForMood(m);
  console.log(`${m} => /demo-nudges/${pick}`);
}
