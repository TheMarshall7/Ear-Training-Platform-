export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'streak' | 'total' | 'perfect' | 'mode' | 'speed' | 'daily';
    threshold: number;
    unlocked: boolean;
    unlockedAt?: number; // timestamp
}

export const ACHIEVEMENTS: Achievement[] = [
    // Streak milestones
    { id: 'streak_5', name: 'On Fire', description: 'Get a 5 streak', icon: '🔥', category: 'streak', threshold: 5, unlocked: false },
    { id: 'streak_10', name: 'Blazing', description: 'Get a 10 streak', icon: '🔥🔥', category: 'streak', threshold: 10, unlocked: false },
    { id: 'streak_25', name: 'Inferno', description: 'Get a 25 streak', icon: '🔥🔥🔥', category: 'streak', threshold: 25, unlocked: false },
    { id: 'streak_50', name: 'Unstoppable', description: 'Get a 50 streak', icon: '🔥🔥🔥🔥', category: 'streak', threshold: 50, unlocked: false },
    { id: 'streak_100', name: 'Legendary', description: 'Get a 100 streak', icon: '🔥🔥🔥🔥🔥', category: 'streak', threshold: 100, unlocked: false },
    
    // Total questions
    { id: 'total_50', name: 'Getting Started', description: 'Answer 50 questions', icon: '📚', category: 'total', threshold: 50, unlocked: false },
    { id: 'total_100', name: 'Dedicated', description: 'Answer 100 questions', icon: '📖', category: 'total', threshold: 100, unlocked: false },
    { id: 'total_500', name: 'Scholar', description: 'Answer 500 questions', icon: '🎓', category: 'total', threshold: 500, unlocked: false },
    { id: 'total_1000', name: 'Master', description: 'Answer 1000 questions', icon: '👑', category: 'total', threshold: 1000, unlocked: false },
    
    // Perfect runs
    { id: 'perfect_1', name: 'Perfect Run', description: 'Complete a perfect run (10/10)', icon: '⭐', category: 'perfect', threshold: 1, unlocked: false },
    { id: 'perfect_5', name: 'Consistent', description: 'Complete 5 perfect runs', icon: '⭐⭐', category: 'perfect', threshold: 5, unlocked: false },
    { id: 'perfect_10', name: 'Flawless', description: 'Complete 10 perfect runs', icon: '⭐⭐⭐', category: 'perfect', threshold: 10, unlocked: false },
    
    // Mode mastery
    { id: 'mode_interval_100', name: 'Interval Expert', description: 'Answer 100 intervals correctly', icon: '🎵', category: 'mode', threshold: 100, unlocked: false },
    { id: 'mode_chord_100', name: 'Chord Master', description: 'Answer 100 chords correctly', icon: '🎹', category: 'mode', threshold: 100, unlocked: false },
    { id: 'mode_progression_100', name: 'Harmony Guru', description: 'Answer 100 progressions correctly', icon: '🎼', category: 'mode', threshold: 100, unlocked: false },
    
    // Daily practice
    { id: 'daily_7', name: 'Week Warrior', description: 'Practice 7 days in a row', icon: '📅', category: 'daily', threshold: 7, unlocked: false },
    { id: 'daily_30', name: 'Monthly Master', description: 'Practice 30 days in a row', icon: '🗓️', category: 'daily', threshold: 30, unlocked: false },
];

export function loadAchievements(): Record<string, Achievement> {
    const stored = localStorage.getItem('ear_trainer_achievements');
    if (!stored) {
        const achievements: Record<string, Achievement> = {};
        ACHIEVEMENTS.forEach(ach => {
            achievements[ach.id] = { ...ach };
        });
        return achievements;
    }
    
    const parsed = JSON.parse(stored);
    // Merge with defaults to handle new achievements
    const achievements: Record<string, Achievement> = {};
    ACHIEVEMENTS.forEach(ach => {
        achievements[ach.id] = parsed[ach.id] || { ...ach };
    });
    return achievements;
}

export function saveAchievements(achievements: Record<string, Achievement>): void {
    localStorage.setItem('ear_trainer_achievements', JSON.stringify(achievements));
}

export function checkAchievements(
    achievements: Record<string, Achievement>,
    stats: {
        bestStreak: number;
        totalQuestions: number;
        totalCorrect: number;
        perfectRuns: number;
        modeStats: Record<string, number>;
        dailyStreak: number;
    }
): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    
    Object.values(achievements).forEach(ach => {
        if (ach.unlocked) return;
        
        let shouldUnlock = false;
        
        switch (ach.category) {
            case 'streak':
                shouldUnlock = stats.bestStreak >= ach.threshold;
                break;
            case 'total':
                shouldUnlock = stats.totalQuestions >= ach.threshold;
                break;
            case 'perfect':
                shouldUnlock = stats.perfectRuns >= ach.threshold;
                break;
            case 'mode':
                const modeId = ach.id.split('_')[1];
                shouldUnlock = (stats.modeStats[modeId] || 0) >= ach.threshold;
                break;
            case 'daily':
                shouldUnlock = stats.dailyStreak >= ach.threshold;
                break;
        }
        
        if (shouldUnlock) {
            ach.unlocked = true;
            ach.unlockedAt = Date.now();
            newlyUnlocked.push(ach);
        }
    });
    
    if (newlyUnlocked.length > 0) {
        saveAchievements(achievements);
    }
    
    return newlyUnlocked;
}
