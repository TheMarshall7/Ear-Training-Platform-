export interface DailyChallenge {
    id: string;
    type: 'questions' | 'streak' | 'perfect' | 'time' | 'difficulty';
    description: string;
    target: number;
    progress: number;
    completed: boolean;
    reward: {
        xp: number;
        achievementId?: string;
    };
}

const CHALLENGE_TEMPLATES: Omit<DailyChallenge, 'progress' | 'completed'>[] = [
    {
        id: 'daily_questions_10',
        type: 'questions',
        description: 'Answer 10 questions correctly',
        target: 10,
        reward: { xp: 50 }
    },
    {
        id: 'daily_streak_5',
        type: 'streak',
        description: 'Get a 5+ streak',
        target: 5,
        reward: { xp: 75 }
    },
    {
        id: 'daily_perfect',
        type: 'perfect',
        description: 'Complete a perfect run',
        target: 1,
        reward: { xp: 100 }
    },
    {
        id: 'daily_hard_3',
        type: 'difficulty',
        description: 'Answer 3 hard mode questions',
        target: 3,
        reward: { xp: 150 }
    }
];

const STORAGE_KEY = 'ear_trainer_daily_challenges';
const STORAGE_DATE_KEY = 'ear_trainer_challenges_date';

export function getDailyChallenges(): DailyChallenge[] {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = localStorage.getItem(STORAGE_DATE_KEY);
    
    // If it's a new day, generate new challenges
    if (lastDate !== today) {
        const challenges = generateDailyChallenges();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
        localStorage.setItem(STORAGE_DATE_KEY, today);
        return challenges;
    }
    
    // Load existing challenges
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        const challenges = generateDailyChallenges();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
        return challenges;
    }
    
    return JSON.parse(stored);
}

function generateDailyChallenges(): DailyChallenge[] {
    // Select 3 random challenges
    const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map(template => ({
        ...template,
        progress: 0,
        completed: false
    }));
}

export function updateChallengeProgress(
    challenges: DailyChallenge[],
    type: DailyChallenge['type'],
    amount: number = 1
): { challenges: DailyChallenge[]; completed: DailyChallenge[] } {
    const updated = challenges.map(challenge => {
        if (challenge.completed || challenge.type !== type) {
            return challenge;
        }
        
        const newProgress = challenge.progress + amount;
        const completed = newProgress >= challenge.target;
        
        return {
            ...challenge,
            progress: Math.min(newProgress, challenge.target),
            completed
        };
    });
    
    const completed = updated.filter(c => c.completed && !challenges.find(old => old.id === c.id && old.completed));
    
    // Always save progress updates, not just when completed
    const hasProgressUpdate = updated.some((c, idx) => {
        const oldChallenge = challenges[idx];
        return oldChallenge && c.progress !== oldChallenge.progress;
    });
    
    if (hasProgressUpdate) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    
    return { challenges: updated, completed };
}
