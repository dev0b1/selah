/**
 * Test mode utilities for development
 */

export function isVoiceTestMode(): boolean {
  return process.env.NEXT_PUBLIC_VOICE_MODE === 'test';
}

export function getRandomBackgroundMusic(): string {
  const bgTracks = [
    '/bg/Midnight Rain Haze.mp3',
    '/bg/Rain Drift Continuum.mp3',
    '/bg/Tidal Stillness.mp3'
  ];
  return bgTracks[Math.floor(Math.random() * bgTracks.length)];
}

export function generateTestPrayer(userName: string = 'Friend'): string {
  const prayers = [
    `Dear Heavenly Father, we come before You today with grateful hearts, ${userName}. In this moment of stillness, we acknowledge Your presence and Your unfailing love that surrounds us. Lord, we thank You for the gift of this day, for the breath in our lungs, and for the countless blessings You have bestowed upon us. We ask for Your guidance as we navigate the challenges and opportunities that lie ahead. Grant us wisdom to make decisions that honor You, courage to face our fears, and strength to overcome obstacles. Help us to be instruments of Your peace, spreading love and kindness wherever we go. May our words be filled with grace, our actions reflect Your compassion, and our hearts remain open to Your will. We pray for those who are struggling, those who are hurting, and those who feel lost. Bring them comfort, healing, and hope. Remind us that we are never alone, for You walk beside us every step of the way. In Your holy name we pray, Amen.`,
    
    `Gracious God, ${userName}, we pause in this sacred moment to seek Your presence. Thank You for being our refuge and strength, a very present help in times of trouble. We lift up our hearts to You, acknowledging that You are the source of all good things. Lord, we confess our weaknesses and our need for Your grace. Forgive us for the times we have fallen short, for the moments we have chosen our own way instead of Yours. Cleanse our hearts and renew our spirits. We ask for Your protection over our loved ones, our families, and our communities. Shield them from harm and surround them with Your angels. Give us compassionate hearts to serve others, patient spirits to endure trials, and joyful attitudes to celebrate Your goodness. Help us to trust in Your perfect timing, even when we cannot see the path ahead. May we find peace in knowing that You work all things together for the good of those who love You. Fill us with Your Holy Spirit and use us for Your glory. In Jesus' name, Amen.`,
    
    `Loving Father, ${userName} comes before You with a heart full of praise and thanksgiving. You are worthy of all honor and glory, for You have done great things in our lives. We marvel at Your creation, from the vastness of the universe to the intricate details of a single flower. Everything speaks of Your majesty and power. Lord, we bring our burdens to You today, knowing that You care for us deeply. Take our anxieties, our worries, and our fears, and replace them with Your perfect peace that surpasses all understanding. Grant us clarity of mind to focus on what truly matters, and help us to let go of things beyond our control. We pray for healing - physical, emotional, and spiritual - for ourselves and for those we love. Touch the broken places in our lives and make us whole again. Give us generous hearts to share with those in need, forgiving spirits to release grudges, and humble attitudes to learn and grow. May we walk in Your light, guided by Your truth, and empowered by Your love. Thank You for hearing our prayers and for Your faithfulness that endures forever. Amen.`
  ];
  
  return prayers[Math.floor(Math.random() * prayers.length)];
}
