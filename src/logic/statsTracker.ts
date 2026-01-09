export interface GameStats {
    totalQuestions: number;
    totalCorrect: number;
    totalIncorrect: number;
    bestStreak: number;
    perfectRuns: number;
    modeStats: Record<string, number>; // mode -> correct count
    dailyStreak: number;
    lastPlayDate: string; // YYYY-MM-DD
    dailyActivity: Record<string, number>; // date -> questions answered
}

const STORAGE_KEY = 'ear_trainer_stats';

export function loadStats(): GameStats {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        return {
            totalQuestions: 0,
            totalCorrect: 0,
            totalIncorrect: 0,
            bestStreak: 0,
            perfectRuns: 0,
            modeStats: {},
            dailyStreak: 0,
            lastPlayDate: '',
            dailyActivity: {}
        };
    }
    
    return JSON.parse(stored);
}

export function saveStats(stats: GameStats): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function updateDailyStreak(stats: GameStats): GameStats {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (stats.lastPlayDate === today) {
        // Already played today, no change
        return stats;
    } else if (stats.lastPlayDate === yesterday) {
        // Played yesterday, continue streak
        return {
            ...stats,
            dailyStreak: stats.dailyStreak + 1,
            lastPlayDate: today
        };
    } else {
        // Streak broken, reset to 1
        return {
            ...stats,
            dailyStreak: 1,
            lastPlayDate: today
        };
    }
}

export function recordAnswer(
    stats: GameStats,
    isCorrect: boolean,
    mode: string,
    isPerfectRun: boolean = false
): GameStats {
    const updated = updateDailyStreak(stats);
    const today = new Date().toISOString().split('T')[0];
    
    return {
        ...updated,
        totalQuestions: updated.totalQuestions + 1,
        totalCorrect: updated.totalCorrect + (isCorrect ? 1 : 0),
        totalIncorrect: updated.totalIncorrect + (isCorrect ? 0 : 1),
        modeStats: {
            ...updated.modeStats,
            [mode]: (updated.modeStats[mode] || 0) + (isCorrect ? 1 : 0)
        },
        perfectRuns: updated.perfectRuns + (isPerfectRun ? 1 : 0),
        dailyActivity: {
            ...updated.dailyActivity,
            [today]: (updated.dailyActivity[today] || 0) + 1
        }
    };
}

export function updateBestStreak(stats: GameStats, currentStreak: number): GameStats {
    if (currentStreak > stats.bestStreak) {
        return {
            ...stats,
            bestStreak: currentStreak
        };
    }
    return stats;
}

export function getAccuracy(stats: GameStats): number {
    if (stats.totalQuestions === 0) return 0;
    return Math.round((stats.totalCorrect / stats.totalQuestions) * 100);
}
