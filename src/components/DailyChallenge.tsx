import React from 'react';
import type { DailyChallenge } from '../logic/dailyChallenges';

interface DailyChallengeProps {
    challenge: DailyChallenge;
    index: number;
}

export const DailyChallengeCard: React.FC<DailyChallengeProps> = ({ challenge, index }) => {
    const percentage = Math.min(100, (challenge.progress / challenge.target) * 100);
    
    return (
        <div 
            className={`glass-card transition-all duration-300 cursor-pointer group ${
                challenge.completed 
                    ? 'border-green-300/50 bg-gradient-to-br from-green-50/50 to-green-100/30' 
                    : 'border-white/20'
            } hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-1 animate-fade-in-up`}
            style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
            }}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-neutral-700 group-hover:text-neutral-900 transition-colors duration-300">
                            {challenge.description}
                        </span>
                        {challenge.completed && (
                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs font-bold group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                                ✓
                            </div>
                        )}
                    </div>
                    <div className="text-xs text-neutral-500 font-medium group-hover:text-neutral-600 transition-colors duration-300">
                        {challenge.progress} / {challenge.target}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full group-hover:bg-orange-100 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                        +{challenge.reward.xp} XP
                    </div>
                </div>
            </div>
            <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden border border-white/20 group-hover:bg-white/70 transition-colors duration-300">
                <div
                    className={`h-full transition-all duration-500 group-hover:shadow-lg ${
                        challenge.completed 
                            ? 'bg-gradient-to-r from-green-400 to-green-600 shadow-lg shadow-green-500/30 group-hover:shadow-green-500/50' 
                            : 'bg-gradient-to-r from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50'
                    }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

interface DailyChallengesProps {
    challenges: DailyChallenge[];
}

export const DailyChallenges: React.FC<DailyChallengesProps> = ({ challenges }) => {
    if (challenges.length === 0) return null;
    
    const completedCount = challenges.filter(c => c.completed).length;
    
    return (
        <div className="glass-card mb-6 lg:mb-8 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg lg:text-xl font-bold text-neutral-900">Daily Challenges</h3>
                <span className="text-xs lg:text-sm text-neutral-500 font-medium bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    {completedCount} / {challenges.length} completed
                </span>
            </div>
            <div className="space-y-4">
                {challenges.map((challenge, index) => (
                    <DailyChallengeCard key={challenge.id} challenge={challenge} index={index} />
                ))}
            </div>
        </div>
    );
};
