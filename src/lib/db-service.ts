import { db } from '@/server/db';
import { subscriptions, users, prayers, worshipSongs, transactions } from '@/src/db/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import type { InsertPrayer, InsertWorshipSong } from '@/src/db/schema';

// ============================================================================
// User Management
// ============================================================================

/**
 * Ensure a minimal user row exists for the provided userId.
 * This helps with legacy/anonymous flows where an auth user id exists
 * but the `users` table row hasn't been created yet.
 */
export async function ensureUserRow(userId: string, email?: string): Promise<boolean> {
	try {
		const existing = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (existing && existing.length > 0) return true;

		const userEmail = email || `${userId}@no-email.selah`;

		await db.insert(users).values({
			id: userId,
			email: userEmail,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		return true;
	} catch (error) {
		console.error('Error ensuring user row exists:', error);
		return false;
	}
}

// ============================================================================
// Subscription Management
// ============================================================================

export async function getUserSubscriptionStatus(userId: string): Promise<{
	isPro: boolean;
	tier: 'free' | 'monthly' | 'yearly' | 'trial';
	subscriptionId?: string;
}> {
	try {
		const data = await db
			.select()
			.from(subscriptions)
			.where(eq(subscriptions.userId, userId))
			.limit(1);

		if (!data || data.length === 0) {
			return { isPro: false, tier: 'free' };
		}

		const subscription = data[0];
		const tier = (subscription.tier || 'free') as 'free' | 'monthly' | 'yearly' | 'trial';
    
		return {
			isPro: subscription.status === 'active',
			tier,
			subscriptionId: subscription.dodoSubscriptionId || undefined
		};
	} catch (error) {
		console.error('Error fetching subscription:', error);
		return { isPro: false, tier: 'free' };
	}
}

export async function updateSubscription(
	userId: string,
	updates: {
		tier?: string;
		status?: string;
		dodoSubscriptionId?: string;
		creditsRemaining?: number;
		renewsAt?: Date | null;
	}
): Promise<boolean> {
	try {
		await db
			.update(subscriptions)
			.set({
				...updates,
				updatedAt: new Date()
			})
			.where(eq(subscriptions.userId, userId));

		return true;
	} catch (error) {
		console.error('Error updating subscription:', error);
		return false;
	}
}

// ============================================================================
// Credits Management
// ============================================================================

export async function getUserCredits(userId: string): Promise<{
	creditsRemaining: number;
	tier: string;
}> {
	try {
		const subscription = await db
			.select()
			.from(subscriptions)
			.where(eq(subscriptions.userId, userId))
			.limit(1);

		if (subscription[0]) {
			return {
				creditsRemaining: subscription[0].creditsRemaining || 0,
				tier: subscription[0].tier,
			};
		}

		return {
			creditsRemaining: 0,
			tier: 'free',
		};
	} catch (error) {
		console.error('Error fetching user credits:', error);
		return {
			creditsRemaining: 0,
			tier: 'free',
		};
	}
}

export async function deductCredit(userId: string): Promise<boolean> {
	try {
		const subscription = await db
			.select()
			.from(subscriptions)
			.where(eq(subscriptions.userId, userId))
			.limit(1);

		if (!subscription[0]) {
			return false;
		}

		const currentCredits = subscription[0].creditsRemaining || 0;
    
		if (currentCredits <= 0) {
			return false;
		}

		await db
			.update(subscriptions)
			.set({
				creditsRemaining: currentCredits - 1,
				updatedAt: new Date()
			})
			.where(eq(subscriptions.userId, userId));

		return true;
	} catch (error) {
		console.error('Error deducting credit:', error);
		return false;
	}
}

export async function reserveCredit(userId: string): Promise<boolean> {
	try {
		const updated = await db.update(subscriptions)
			.set({ creditsRemaining: sql`credits_remaining - 1`, updatedAt: new Date() })
			.where(and(eq(subscriptions.userId, userId), sql`credits_remaining > 0`))
			.returning({ id: subscriptions.id, creditsRemaining: subscriptions.creditsRemaining });

		return !!(updated && updated.length > 0);
	} catch (error) {
		console.error('Error reserving credit:', error);
		return false;
	}
}

export async function refundCredit(userId: string, amount: number = 1): Promise<boolean> {
	try {
		const subscription = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
		if (!subscription || subscription.length === 0) return false;
		const current = subscription[0].creditsRemaining || 0;
		await db.update(subscriptions).set({ creditsRemaining: current + amount, updatedAt: new Date() }).where(eq(subscriptions.userId, userId));
		return true;
	} catch (error) {
		console.error('Error refunding credit:', error);
		return false;
	}
}

export async function refillCredits(userId: string, amount: number = 20): Promise<boolean> {
	try {
		const subscription = await db
			.select()
			.from(subscriptions)
			.where(eq(subscriptions.userId, userId))
			.limit(1);

		if (!subscription[0]) {
			return false;
		}

		const currentCredits = subscription[0].creditsRemaining || 0;
    
		await db
			.update(subscriptions)
			.set({
				creditsRemaining: currentCredits + amount,
				updatedAt: new Date()
			})
			.where(eq(subscriptions.userId, userId));

		return true;
	} catch (error) {
		console.error('Error refilling credits:', error);
		return false;
	}
}

// ============================================================================
// Trial Management
// ============================================================================

export async function checkTrialStatus(userId: string): Promise<{ hasTrial: boolean; isExpired: boolean; daysRemaining: number } | null> {
	try {
		const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
		if (!user || user.length === 0) return null;
		
		const userData = user[0];
		if (!userData.trialStartDate || !userData.trialEndDate) {
			return { hasTrial: false, isExpired: false, daysRemaining: 0 };
		}

		const now = new Date();
		const endDate = new Date(userData.trialEndDate);
		const isExpired = now > endDate;
		const daysRemaining = isExpired ? 0 : Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

		return {
			hasTrial: true,
			isExpired,
			daysRemaining: Math.max(0, daysRemaining),
		};
	} catch (error) {
		console.error('Error checking trial status:', error);
		return null;
	}
}

export async function startTrialIfEligible(userId: string): Promise<boolean> {
	try {
		const trialStatus = await checkTrialStatus(userId);
		
		// If user already has an active or expired trial, don't start a new one
		if (trialStatus?.hasTrial) {
			return !trialStatus.isExpired;
		}

		// Check if user has an active subscription
		const subscription = await getUserSubscriptionStatus(userId);
		if (subscription.isPro) {
			return true; // User has access via subscription
		}

		// Start 3-day trial
		const now = new Date();
		const trialEndDate = new Date(now);
		trialEndDate.setDate(trialEndDate.getDate() + 3);

		await ensureUserRow(userId);
		await db.update(users).set({
			trialStartDate: now,
			trialEndDate: trialEndDate,
			updatedAt: now,
		}).where(eq(users.id, userId));

		return true;
	} catch (error) {
		console.error('Error starting trial:', error);
		return false;
	}
}

// ============================================================================
// Prayer Management
// ============================================================================

export async function savePrayer(prayer: {
	userId: string;
	userName: string;
	need: string;
	message?: string;
	prayerText: string;
	audioUrl?: string;
}): Promise<string | null> {
	try {
		const insertResult = await db.insert(prayers).values({
			userId: prayer.userId,
			userName: prayer.userName,
			need: prayer.need,
			message: prayer.message || null,
			prayerText: prayer.prayerText,
			audioUrl: prayer.audioUrl || null,
		}).returning({ id: prayers.id });

		return insertResult?.[0]?.id || null;
	} catch (error) {
		console.error('Error saving prayer:', error);
		return null;
	}
}

export async function getPrayersByUser(userId: string, limit: number = 30): Promise<any[]> {
	try {
		const results = await db
			.select()
			.from(prayers)
			.where(eq(prayers.userId, userId))
			.orderBy(desc(prayers.createdAt))
			.limit(limit);

		return results;
	} catch (error) {
		console.error('Error fetching prayers:', error);
		return [];
	}
}

export async function getPrayerById(prayerId: string): Promise<any | null> {
	try {
		const results = await db
			.select()
			.from(prayers)
			.where(eq(prayers.id, prayerId))
			.limit(1);

		return results[0] || null;
	} catch (error) {
		console.error('Error fetching prayer:', error);
		return null;
	}
}

export async function togglePrayerFavorite(prayerId: string, userId: string): Promise<boolean> {
	try {
		const prayer = await getPrayerById(prayerId);
		if (!prayer || prayer.userId !== userId) {
			return false;
		}

		await db
			.update(prayers)
			.set({
				isFavorite: !prayer.isFavorite
			})
			.where(eq(prayers.id, prayerId));

		return true;
	} catch (error) {
		console.error('Error toggling prayer favorite:', error);
		return false;
	}
}

// ============================================================================
// Worship Song Management
// ============================================================================

export async function saveWorshipSong(song: {
	userId: string;
	userName: string;
	mood: string;
	title?: string;
	lyrics: string;
	audioUrl: string;
	videoUrl?: string;
	sunoTaskId?: string;
	generationMethod?: 'suno' | 'elevenlabs';
}): Promise<string | null> {
	try {
		const insertResult = await db.insert(worshipSongs).values({
			userId: song.userId,
			userName: song.userName,
			mood: song.mood,
			title: song.title || null,
			lyrics: song.lyrics,
			audioUrl: song.audioUrl,
			videoUrl: song.videoUrl || null,
			sunoTaskId: song.sunoTaskId || null,
			generationMethod: song.generationMethod || 'suno',
		}).returning({ id: worshipSongs.id });

		return insertResult?.[0]?.id || null;
	} catch (error) {
		console.error('Error saving worship song:', error);
		return null;
	}
}

export async function getWorshipSongsByUser(userId: string, limit: number = 30): Promise<any[]> {
	try {
		const results = await db
			.select()
			.from(worshipSongs)
			.where(eq(worshipSongs.userId, userId))
			.orderBy(desc(worshipSongs.createdAt))
			.limit(limit);

		return results;
	} catch (error) {
		console.error('Error fetching worship songs:', error);
		return [];
	}
}

export async function getWorshipSongById(songId: string): Promise<any | null> {
	try {
		const results = await db
			.select()
			.from(worshipSongs)
			.where(eq(worshipSongs.id, songId))
			.limit(1);

		return results[0] || null;
	} catch (error) {
		console.error('Error fetching worship song:', error);
		return null;
	}
}

export async function getWorshipSongBySunoTaskId(sunoTaskId: string): Promise<any | null> {
	try {
		const results = await db
			.select()
			.from(worshipSongs)
			.where(eq(worshipSongs.sunoTaskId, sunoTaskId))
			.limit(1);

		return results[0] || null;
	} catch (error) {
		console.error('Error fetching worship song by Suno task ID:', error);
		return null;
	}
}

export async function updateWorshipSongAudioUrl(songId: string, audioUrl: string): Promise<boolean> {
	try {
		await db
			.update(worshipSongs)
			.set({
				audioUrl: audioUrl
			})
			.where(eq(worshipSongs.id, songId));

		return true;
	} catch (error) {
		console.error('Error updating worship song audio URL:', error);
		return false;
	}
}

export async function updateWorshipSongVideoUrl(songId: string, videoUrl: string): Promise<boolean> {
	try {
		await db
			.update(worshipSongs)
			.set({
				videoUrl: videoUrl
			})
			.where(eq(worshipSongs.id, songId));

		return true;
	} catch (error) {
		console.error('Error updating worship song video URL:', error);
		return false;
	}
}

export async function toggleWorshipSongFavorite(songId: string, userId: string): Promise<boolean> {
	try {
		const song = await getWorshipSongById(songId);
		if (!song || song.userId !== userId) {
			return false;
		}

		await db
			.update(worshipSongs)
			.set({
				isFavorite: !song.isFavorite
			})
			.where(eq(worshipSongs.id, songId));

		return true;
	} catch (error) {
		console.error('Error toggling worship song favorite:', error);
		return false;
	}
}

// ============================================================================
// History (Combined Prayers & Songs)
// ============================================================================

export async function getUserHistory(userId: string, limit: number = 30): Promise<any[]> {
	try {
		// Fetch both prayers and songs, combine, sort by date
		const [prayerList, songList] = await Promise.all([
			getPrayersByUser(userId, limit),
			getWorshipSongsByUser(userId, limit)
		]);

		// Combine and format for history view
		const history = [
			...prayerList.map(p => ({
				...p,
				type: 'prayer' as const,
				createdAt: p.createdAt
			})),
			...songList.map(s => ({
				...s,
				type: 'song' as const,
				createdAt: s.createdAt
			}))
		].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, limit);

		return history;
	} catch (error) {
		console.error('Error fetching user history:', error);
		return [];
	}
}

// ============================================================================
// Legacy Functions (for backward compatibility during migration)
// ============================================================================

/**
 * Legacy function - maps to savePrayer for backward compatibility
 * @deprecated Use savePrayer instead
 */
export async function saveDailyCheckIn(checkIn: {
	userId: string;
	mood: string;
	need?: string;
	message?: string;
	motivationText?: string;
	prayerText?: string;
	motivationAudioUrl?: string;
}): Promise<string | null> {
	if (!checkIn.prayerText) {
		console.warn('saveDailyCheckIn called without prayerText, returning null');
		return null;
	}

	return savePrayer({
		userId: checkIn.userId,
		userName: checkIn.userId, // Fallback - should use actual userName
		need: checkIn.need || checkIn.mood,
		message: checkIn.message,
		prayerText: checkIn.prayerText,
		audioUrl: checkIn.motivationAudioUrl,
	});
}
