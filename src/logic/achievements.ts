export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'streak' | 'total' | 'perfect' | 'mode' | 'speed' | 'daily' | 'special' | 'accuracy' | 'level' | 'difficulty' | 'multimode';
    threshold: number;
    unlocked: boolean;
    unlockedAt?: number; // timestamp
}

export const ACHIEVEMENTS: Achievement[] = [
    // ============ STREAK MILESTONES ============
    { id: 'streak_3', name: 'Hot Streak', description: 'Get a 3 answer streak', icon: '🔥', category: 'streak', threshold: 3, unlocked: false },
    { id: 'streak_5', name: 'On Fire', description: 'Get a 5 answer streak', icon: '🔥', category: 'streak', threshold: 5, unlocked: false },
    { id: 'streak_10', name: 'Blazing', description: 'Get a 10 answer streak', icon: '🔥🔥', category: 'streak', threshold: 10, unlocked: false },
    { id: 'streak_15', name: 'Scorching', description: 'Get a 15 answer streak', icon: '🔥🔥', category: 'streak', threshold: 15, unlocked: false },
    { id: 'streak_25', name: 'Inferno', description: 'Get a 25 answer streak', icon: '🔥🔥🔥', category: 'streak', threshold: 25, unlocked: false },
    { id: 'streak_50', name: 'Unstoppable', description: 'Get a 50 answer streak', icon: '🔥🔥🔥🔥', category: 'streak', threshold: 50, unlocked: false },
    { id: 'streak_75', name: 'God Mode', description: 'Get a 75 answer streak', icon: '⚡', category: 'streak', threshold: 75, unlocked: false },
    { id: 'streak_100', name: 'Legendary', description: 'Get a 100 answer streak', icon: '👑', category: 'streak', threshold: 100, unlocked: false },
    { id: 'streak_200', name: 'Mythical', description: 'Get a 200 answer streak', icon: '🌟', category: 'streak', threshold: 200, unlocked: false },
    
    // ============ TOTAL QUESTIONS ============
    { id: 'total_1', name: 'First Step', description: 'Answer your first question correctly', icon: '🎯', category: 'total', threshold: 1, unlocked: false },
    { id: 'total_50', name: 'Getting Started', description: 'Answer 50 questions', icon: '📚', category: 'total', threshold: 50, unlocked: false },
    { id: 'total_100', name: 'Dedicated', description: 'Answer 100 questions', icon: '📖', category: 'total', threshold: 100, unlocked: false },
    { id: 'total_250', name: 'Committed', description: 'Answer 250 questions', icon: '📘', category: 'total', threshold: 250, unlocked: false },
    { id: 'total_500', name: 'Scholar', description: 'Answer 500 questions', icon: '🎓', category: 'total', threshold: 500, unlocked: false },
    { id: 'total_1000', name: 'Master', description: 'Answer 1,000 questions', icon: '👑', category: 'total', threshold: 1000, unlocked: false },
    { id: 'total_2500', name: 'Grand Master', description: 'Answer 2,500 questions', icon: '🏆', category: 'total', threshold: 2500, unlocked: false },
    { id: 'total_5000', name: 'Legend', description: 'Answer 5,000 questions', icon: '🌟', category: 'total', threshold: 5000, unlocked: false },
    { id: 'total_10000', name: 'Living Legend', description: 'Answer 10,000 questions', icon: '💎', category: 'total', threshold: 10000, unlocked: false },
    
    // ============ PERFECT RUNS ============
    { id: 'perfect_1', name: 'Perfect Run', description: 'Complete a perfect run (10/10)', icon: '⭐', category: 'perfect', threshold: 1, unlocked: false },
    { id: 'perfect_5', name: 'Consistent', description: 'Complete 5 perfect runs', icon: '⭐⭐', category: 'perfect', threshold: 5, unlocked: false },
    { id: 'perfect_10', name: 'Flawless', description: 'Complete 10 perfect runs', icon: '⭐⭐⭐', category: 'perfect', threshold: 10, unlocked: false },
    { id: 'perfect_25', name: 'Perfection Seeker', description: 'Complete 25 perfect runs', icon: '🌟', category: 'perfect', threshold: 25, unlocked: false },
    { id: 'perfect_50', name: 'Flawless Master', description: 'Complete 50 perfect runs', icon: '💫', category: 'perfect', threshold: 50, unlocked: false },
    { id: 'perfect_100', name: 'Untouchable', description: 'Complete 100 perfect runs', icon: '✨', category: 'perfect', threshold: 100, unlocked: false },
    
    // ============ INTERVAL MASTERY ============
    { id: 'mode_interval_10', name: 'Interval Learner', description: 'Answer 10 intervals correctly', icon: '🎵', category: 'mode', threshold: 10, unlocked: false },
    { id: 'mode_interval_50', name: 'Interval Student', description: 'Answer 50 intervals correctly', icon: '🎵', category: 'mode', threshold: 50, unlocked: false },
    { id: 'mode_interval_100', name: 'Interval Expert', description: 'Answer 100 intervals correctly', icon: '🎵', category: 'mode', threshold: 100, unlocked: false },
    { id: 'mode_interval_500', name: 'Interval Master', description: 'Answer 500 intervals correctly', icon: '🎵', category: 'mode', threshold: 500, unlocked: false },
    { id: 'mode_interval_1000', name: 'Interval Legend', description: 'Answer 1,000 intervals correctly', icon: '🎵', category: 'mode', threshold: 1000, unlocked: false },
    
    // ============ CHORD MASTERY ============
    { id: 'mode_chord_10', name: 'Chord Beginner', description: 'Answer 10 chords correctly', icon: '🎹', category: 'mode', threshold: 10, unlocked: false },
    { id: 'mode_chord_50', name: 'Chord Student', description: 'Answer 50 chords correctly', icon: '🎹', category: 'mode', threshold: 50, unlocked: false },
    { id: 'mode_chord_100', name: 'Chord Expert', description: 'Answer 100 chords correctly', icon: '🎹', category: 'mode', threshold: 100, unlocked: false },
    { id: 'mode_chord_250', name: 'Chord Virtuoso', description: 'Answer 250 chords correctly', icon: '🎹', category: 'mode', threshold: 250, unlocked: false },
    { id: 'mode_chord_500', name: 'Chord Master', description: 'Answer 500 chords correctly', icon: '🎹', category: 'mode', threshold: 500, unlocked: false },
    { id: 'mode_chord_1000', name: 'Jazz Harmonist', description: 'Answer 1,000 chords correctly', icon: '🎹', category: 'mode', threshold: 1000, unlocked: false },
    
    // ============ PROGRESSION MASTERY ============
    { id: 'mode_progression_10', name: 'Progression Learner', description: 'Answer 10 progressions correctly', icon: '🎼', category: 'mode', threshold: 10, unlocked: false },
    { id: 'mode_progression_50', name: 'Progression Student', description: 'Answer 50 progressions correctly', icon: '🎼', category: 'mode', threshold: 50, unlocked: false },
    { id: 'mode_progression_100', name: 'Harmony Guru', description: 'Answer 100 progressions correctly', icon: '🎼', category: 'mode', threshold: 100, unlocked: false },
    { id: 'mode_progression_250', name: 'Harmony Master', description: 'Answer 250 progressions correctly', icon: '🎼', category: 'mode', threshold: 250, unlocked: false },
    { id: 'mode_progression_500', name: 'Harmonic Genius', description: 'Answer 500 progressions correctly', icon: '🎼', category: 'mode', threshold: 500, unlocked: false },
    
    // ============ KEY FINDER MASTERY ============
    { id: 'mode_keyFinder_10', name: 'Key Scout', description: 'Identify 10 keys correctly', icon: '🔑', category: 'mode', threshold: 10, unlocked: false },
    { id: 'mode_keyFinder_50', name: 'Key Detective', description: 'Identify 50 keys correctly', icon: '🔑', category: 'mode', threshold: 50, unlocked: false },
    { id: 'mode_keyFinder_100', name: 'Key Master', description: 'Identify 100 keys correctly', icon: '🔑', category: 'mode', threshold: 100, unlocked: false },
    { id: 'mode_keyFinder_250', name: 'Tonal Navigator', description: 'Identify 250 keys correctly', icon: '🔑', category: 'mode', threshold: 250, unlocked: false },
    { id: 'mode_keyFinder_500', name: 'Tonal Center Wizard', description: 'Identify 500 keys correctly', icon: '🔑', category: 'mode', threshold: 500, unlocked: false },
    
    // ============ TEMPO MASTERY ============
    { id: 'mode_tempo_10', name: 'Tempo Tracker', description: 'Guess 10 tempos correctly', icon: '⏱️', category: 'mode', threshold: 10, unlocked: false },
    { id: 'mode_tempo_50', name: 'Metronome Apprentice', description: 'Guess 50 tempos correctly', icon: '⏱️', category: 'mode', threshold: 50, unlocked: false },
    { id: 'mode_tempo_100', name: 'BPM Expert', description: 'Guess 100 tempos correctly', icon: '⏱️', category: 'mode', threshold: 100, unlocked: false },
    { id: 'mode_tempo_250', name: 'Human Metronome', description: 'Guess 250 tempos correctly', icon: '⏱️', category: 'mode', threshold: 250, unlocked: false },
    
    // ============ SCALE MASTERY ============
    { id: 'mode_scale_50', name: 'Scale Student', description: 'Answer 50 scales correctly', icon: '🎶', category: 'mode', threshold: 50, unlocked: false },
    { id: 'mode_scale_100', name: 'Scale Expert', description: 'Answer 100 scales correctly', icon: '🎶', category: 'mode', threshold: 100, unlocked: false },
    { id: 'mode_scale_250', name: 'Scale Master', description: 'Answer 250 scales correctly', icon: '🎶', category: 'mode', threshold: 250, unlocked: false },
    
    // ============ DAILY PRACTICE ============
    { id: 'daily_3', name: 'Building Habits', description: 'Practice 3 days in a row', icon: '📅', category: 'daily', threshold: 3, unlocked: false },
    { id: 'daily_7', name: 'Week Warrior', description: 'Practice 7 days in a row', icon: '📅', category: 'daily', threshold: 7, unlocked: false },
    { id: 'daily_14', name: 'Two Week Champion', description: 'Practice 14 days in a row', icon: '📅', category: 'daily', threshold: 14, unlocked: false },
    { id: 'daily_30', name: 'Monthly Master', description: 'Practice 30 days in a row', icon: '🗓️', category: 'daily', threshold: 30, unlocked: false },
    { id: 'daily_60', name: 'Dedicated Student', description: 'Practice 60 days in a row', icon: '🗓️', category: 'daily', threshold: 60, unlocked: false },
    { id: 'daily_100', name: 'Centurion', description: 'Practice 100 days in a row', icon: '💯', category: 'daily', threshold: 100, unlocked: false },
    { id: 'daily_365', name: 'Year of Growth', description: 'Practice 365 days in a row', icon: '🎊', category: 'daily', threshold: 365, unlocked: false },
    
    // ============ ACCURACY ACHIEVEMENTS ============
    { id: 'accuracy_80', name: 'Good Ear', description: 'Reach 80% overall accuracy', icon: '🎯', category: 'accuracy', threshold: 80, unlocked: false },
    { id: 'accuracy_90', name: 'Sharp Listener', description: 'Reach 90% overall accuracy', icon: '🎯', category: 'accuracy', threshold: 90, unlocked: false },
    { id: 'accuracy_95', name: 'Precision Expert', description: 'Reach 95% overall accuracy', icon: '🎯', category: 'accuracy', threshold: 95, unlocked: false },
    { id: 'accuracy_99', name: 'Nearly Perfect', description: 'Reach 99% overall accuracy', icon: '🎯', category: 'accuracy', threshold: 99, unlocked: false },
    
    // ============ LEVEL ACHIEVEMENTS ============
    { id: 'level_5', name: 'Novice', description: 'Reach level 5', icon: '🌱', category: 'level', threshold: 5, unlocked: false },
    { id: 'level_10', name: 'Apprentice', description: 'Reach level 10', icon: '🌿', category: 'level', threshold: 10, unlocked: false },
    { id: 'level_25', name: 'Journeyman', description: 'Reach level 25', icon: '🌳', category: 'level', threshold: 25, unlocked: false },
    { id: 'level_50', name: 'Expert', description: 'Reach level 50', icon: '🌲', category: 'level', threshold: 50, unlocked: false },
    { id: 'level_100', name: 'Grandmaster', description: 'Reach level 100', icon: '🌴', category: 'level', threshold: 100, unlocked: false },
    
    // ============ MULTI-MODE ACHIEVEMENTS ============
    { id: 'multimode_3', name: 'Well Rounded', description: 'Master 3 different modes (100+ correct each)', icon: '🎭', category: 'multimode', threshold: 3, unlocked: false },
    { id: 'multimode_5', name: 'Renaissance Musician', description: 'Master 5 different modes (100+ correct each)', icon: '🎭', category: 'multimode', threshold: 5, unlocked: false },
    { id: 'multimode_all', name: 'Complete Musician', description: 'Master all training modes (100+ correct each)', icon: '🎭', category: 'multimode', threshold: 7, unlocked: false },
    
    // ============ SPECIAL ACHIEVEMENTS ============
    { id: 'special_comeback', name: 'Comeback Kid', description: 'Get a streak of 10 after missing an answer', icon: '💪', category: 'special', threshold: 0, unlocked: false },
    { id: 'special_marathon', name: 'Marathon Session', description: 'Answer 100 questions in one session', icon: '🏃', category: 'special', threshold: 100, unlocked: false },
    { id: 'special_speed_demon', name: 'Speed Demon', description: 'Complete 5 questions in under 30 seconds', icon: '⚡', category: 'special', threshold: 0, unlocked: false },
    { id: 'special_night_owl', name: 'Night Owl', description: 'Practice between midnight and 4 AM', icon: '🦉', category: 'special', threshold: 0, unlocked: false },
    { id: 'special_early_bird', name: 'Early Bird', description: 'Practice between 5 AM and 7 AM', icon: '🐦', category: 'special', threshold: 0, unlocked: false },
    { id: 'special_jazz_master', name: 'Jazz Master', description: 'Identify 50 hard jazz chords correctly', icon: '🎷', category: 'special', threshold: 50, unlocked: false },
    
    // ============ MYSTERY ACHIEVEMENT ============
    { id: 'mystery_platinum_gift', name: 'Mystery Platinum Gift', description: 'Unlock all other achievements to claim your reward!', icon: '💎', category: 'special', threshold: 0, unlocked: false },
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
        level?: number;
        currentSessionQuestions?: number;
    }
): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    
    // Calculate accuracy
    const accuracy = stats.totalQuestions > 0 
        ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) 
        : 0;
    
    // Calculate number of mastered modes (100+ correct answers)
    const masteredModes = Object.values(stats.modeStats).filter(count => count >= 100).length;
    
    Object.values(achievements).forEach(ach => {
        if (ach.unlocked) return;
        
        let shouldUnlock = false;
        
        switch (ach.category) {
            case 'streak':
                shouldUnlock = stats.bestStreak >= ach.threshold;
                break;
                
            case 'total':
                shouldUnlock = stats.totalCorrect >= ach.threshold;
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
                
            case 'accuracy':
                shouldUnlock = accuracy >= ach.threshold && stats.totalQuestions >= 50;
                break;
                
            case 'level':
                shouldUnlock = (stats.level || 1) >= ach.threshold;
                break;
                
            case 'multimode':
                shouldUnlock = masteredModes >= ach.threshold;
                break;
                
            case 'special':
                // Special achievements have custom logic
                if (ach.id === 'mystery_platinum_gift') {
                    // Check if all other achievements are unlocked
                    const allOtherAchievements = Object.values(achievements).filter(
                        a => a.id !== 'mystery_platinum_gift'
                    );
                    shouldUnlock = allOtherAchievements.every(a => a.unlocked);
                }
                // Marathon Session achievement
                else if (ach.id === 'special_marathon') {
                    shouldUnlock = (stats.currentSessionQuestions || 0) >= ach.threshold;
                }
                // Jazz Master achievement - check hard difficulty chord count
                else if (ach.id === 'special_jazz_master') {
                    // This would need to track hard difficulty chords specifically
                    // For now, we'll trigger it based on total chord mastery
                    shouldUnlock = (stats.modeStats['chord'] || 0) >= 250;
                }
                // Night Owl and Early Bird - check current time
                else if (ach.id === 'special_night_owl') {
                    const hour = new Date().getHours();
                    shouldUnlock = hour >= 0 && hour < 4;
                }
                else if (ach.id === 'special_early_bird') {
                    const hour = new Date().getHours();
                    shouldUnlock = hour >= 5 && hour < 7;
                }
                // Other special achievements can be unlocked via custom events
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

/**
 * Check if all regular achievements are unlocked (for Mystery Platinum Gift)
 */
export function areAllAchievementsUnlocked(achievements: Record<string, Achievement>): boolean {
    const allRegularAchievements = Object.values(achievements).filter(
        a => a.id !== 'mystery_platinum_gift'
    );
    return allRegularAchievements.every(a => a.unlocked);
}
