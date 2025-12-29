// 365 KJV Bible verses for daily rotation
// One verse per day, rotates yearly

export interface BibleVerse {
  text: string;
  reference: string;
}

export const BIBLE_VERSES: BibleVerse[] = [
  { text: "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.", reference: "Psalm 46:10 KJV" },
  { text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding.", reference: "Proverbs 3:5 KJV" },
  { text: "I can do all things through Christ which strengtheneth me.", reference: "Philippians 4:13 KJV" },
  { text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.", reference: "Isaiah 41:10 KJV" },
  { text: "The Lord is my shepherd; I shall not want.", reference: "Psalm 23:1 KJV" },
  { text: "Cast all your care upon him; for he careth for you.", reference: "1 Peter 5:7 KJV" },
  { text: "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.", reference: "John 14:27 KJV" },
  { text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.", reference: "Isaiah 40:31 KJV" },
  { text: "For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.", reference: "Jeremiah 29:11 KJV" },
  { text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.", reference: "Romans 8:28 KJV" },
  // Add more verses to reach 365... For MVP, we'll use a smaller set and rotate
  // In production, you'd have all 365 verses here
];

/**
 * Get today's Bible verse based on day of year (1-365)
 * Rotates yearly - same verse on same day each year
 */
export function getTodaysVerse(): BibleVerse {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Use modulo to cycle through available verses if we have fewer than 365
  const verseIndex = (dayOfYear - 1) % BIBLE_VERSES.length;
  
  return BIBLE_VERSES[verseIndex];
}

/**
 * Get a specific verse by day of year (1-365)
 */
export function getVerseByDay(dayOfYear: number): BibleVerse {
  const index = (dayOfYear - 1) % BIBLE_VERSES.length;
  return BIBLE_VERSES[index];
}

