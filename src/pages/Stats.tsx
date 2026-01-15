import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { getXPForLevel } from '../context/GameContext';
import { loadStats, getAccuracy } from '../logic/statsTracker';
import { loadAchievements, type Achievement } from '../logic/achievements';
import { StatCard } from '../components/StatCard';
import { AchievementToast } from '../components/AchievementToast';
import { AchievementCarousel } from '../components/AchievementCarousel';
import { BrandLogo } from '../components/BrandLogo';
import { Footer } from '../components/Footer';
import { 
    BarChart3, 
    Target, 
    Flame, 
    Star, 
    Music, 
    Piano, 
    Music2,
    Trophy,
    CheckCircle2
} from 'lucide-react';

export const Stats: React.FC = () => {
    const navigate = useNavigate();
    const { state } = useGame();
    const [stats, setStats] = useState(loadStats());
    const [achievements, setAchievements] = useState(loadAchievements());
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

    useEffect(() => {
        const currentStats = loadStats();
        setStats(currentStats);
        const currentAchievements = loadAchievements();
        setAchievements(currentAchievements);
    }, [state]);

    useEffect(() => {
        document.title = 'Achievements - Areo';
    }, []);

    const accuracy = getAccuracy(stats);
    const unlockedCount = Object.values(achievements).filter(a => a.unlocked).length;
    const totalAchievements = Object.keys(achievements).length;

    // Separate mystery gift from other achievements
    const mysteryGift = Object.values(achievements).find(a => a.id === 'mystery_platinum_gift');
    const regularAchievements = Object.values(achievements).filter(a => a.id !== 'mystery_platinum_gift');
    
    const achievementCategories = {
        streak: regularAchievements.filter(a => a.category === 'streak'),
        total: regularAchievements.filter(a => a.category === 'total'),
        perfect: regularAchievements.filter(a => a.category === 'perfect'),
        mode: regularAchievements.filter(a => a.category === 'mode'),
        daily: regularAchievements.filter(a => a.category === 'daily'),
        accuracy: regularAchievements.filter(a => a.category === 'accuracy'),
        level: regularAchievements.filter(a => a.category === 'level'),
        multimode: regularAchievements.filter(a => a.category === 'multimode'),
        special: regularAchievements.filter(a => a.category === 'special'),
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 relative flex flex-col">
            {/* Background gradient */}
            <div className="fixed inset-0 -z-0">
                <div className="absolute -translate-x-1/2 -translate-y-1/2 animate-pulse-glow bg-gradient-to-br from-orange-400/20 via-red-500/15 to-rose-600/15 opacity-60 mix-blend-multiply w-[500px] h-[500px] rounded-full top-1/4 left-1/4 blur-3xl"></div>
                <div className="absolute translate-x-1/2 translate-y-1/2 animate-pulse-glow bg-gradient-to-br from-orange-400/20 via-red-500/15 to-rose-600/15 opacity-60 mix-blend-multiply w-[500px] h-[500px] rounded-full bottom-1/4 right-1/4 blur-3xl"></div>
            </div>

            {/* Top Left Branding */}
            <div className="absolute top-6 left-4 lg:top-8 lg:left-8 z-50">
                <BrandLogo showText={false} />
            </div>

            {/* Top Right Home Button */}
            <div className="absolute top-6 right-4 lg:hidden z-50">
                <button 
                    onClick={() => navigate('/')} 
                    className="group flex items-center gap-2 text-neutral-400 hover:text-neutral-600 font-medium text-sm transition-all duration-300 hover:gap-3"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform duration-300">
                        <path d="m12 19-7-7 7-7"></path>
                        <path d="M19 12H5"></path>
                    </svg>
                    <span>Home</span>
                </button>
            </div>

            <div className="relative z-10 pt-20 pb-8 lg:py-12 px-4 flex-1">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-center lg:justify-between mb-8 lg:mb-12">
                        <button 
                            onClick={() => navigate('/')} 
                            className="hidden lg:flex group items-center gap-2 text-neutral-400 hover:text-neutral-600 font-medium text-sm transition-all duration-300 hover:gap-3"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform duration-300">
                                <path d="m12 19-7-7 7-7"></path>
                                <path d="M19 12H5"></path>
                            </svg>
                            <span>Home</span>
                        </button>
                        <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight">
                            Achievements
                        </h1>
                        <div className="hidden lg:block w-16"></div>
                    </div>

                    {/* Overview Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12 animate-fade-in-up">
                        <StatCard 
                            title="Total Questions" 
                            value={stats.totalQuestions} 
                            icon={BarChart3}
                        />
                        <StatCard 
                            title="Accuracy" 
                            value={`${accuracy}%`}
                            subtitle={`${stats.totalCorrect} correct`}
                            icon={Target}
                        />
                        <StatCard 
                            title="Best Streak" 
                            value={stats.bestStreak}
                            icon={Flame}
                        />
                        <StatCard 
                            title="Perfect Runs" 
                            value={stats.perfectRuns}
                            icon={Star}
                        />
                    </div>

                    {/* Level and XP */}
                    <div className="glass-card mb-8 lg:mb-12 animate-fade-in-up hover:shadow-lg transition-all duration-300">
                        <h2 className="text-xl lg:text-2xl font-bold text-neutral-900 mb-6">Progress</h2>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm lg:text-base font-semibold text-neutral-700 uppercase tracking-wider">Level {state.level}</span>
                                    <span className="text-sm lg:text-base text-neutral-500 font-medium">{state.xp} XP</span>
                                </div>
                                <div className="h-4 w-full bg-white/50 rounded-full overflow-hidden border border-white/20">
                                    {(() => {
                                        const currentLevelXP = getXPForLevel(state.level);
                                        const nextLevelXP = getXPForLevel(state.level + 1);
                                        const xpInLevel = state.xp - currentLevelXP;
                                        const xpNeededForNext = nextLevelXP - currentLevelXP;
                                        const xpPercentage = xpNeededForNext > 0 ? Math.min(100, (xpInLevel / xpNeededForNext) * 100) : 100;
                                        return (
                                            <div 
                                                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 shadow-lg shadow-orange-500/30"
                                                style={{ width: `${xpPercentage}%` }}
                                            />
                                        );
                                    })()}
                                </div>
                                <div className="text-xs text-neutral-400 mt-2">
                                    {(() => {
                                        const currentLevelXP = getXPForLevel(state.level);
                                        const nextLevelXP = getXPForLevel(state.level + 1);
                                        const xpInLevel = state.xp - currentLevelXP;
                                        const xpNeededForNext = nextLevelXP - currentLevelXP;
                                        return `${xpInLevel} / ${xpNeededForNext} XP to next level`;
                                    })()}
                                </div>
                            </div>
                            <div className="group flex items-center gap-2 text-sm text-neutral-600 bg-white/50 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20 hover:border-orange-300 hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105">
                                <Flame className="w-5 h-5 text-orange-600 group-hover:scale-125 transition-transform duration-300" strokeWidth={2} />
                                <span className="font-medium">Daily Streak: {stats.dailyStreak} days</span>
                            </div>
                        </div>
                    </div>

                    {/* Mystery Platinum Gift - Special Tier */}
                    {mysteryGift && (
                        <div className="glass-card mb-8 lg:mb-12 animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-4">
                                <Trophy className="w-5 h-5 text-orange-600" strokeWidth={2} />
                                <h2 className="text-xs uppercase tracking-widest text-orange-600 font-semibold">
                                    Ultimate Achievement
                                </h2>
                            </div>
                            
                            <div className={`group p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                                mysteryGift.unlocked
                                    ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-300/50 shadow-lg hover:shadow-xl'
                                    : 'bg-white/30 border-white/20 opacity-75 hover:opacity-85'
                            }`}>
                                <div className="flex items-center gap-6">
                                    <div className={`flex items-center justify-center w-20 h-20 rounded-2xl flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${
                                        mysteryGift.unlocked 
                                            ? 'bg-white/80 border-2 border-orange-200/50 shadow-md group-hover:shadow-lg' 
                                            : 'bg-white/50 border-2 border-neutral-300'
                                    }`}>
                                        <Trophy className={`w-12 h-12 ${mysteryGift.unlocked ? 'text-orange-600' : 'text-neutral-400'}`} strokeWidth={2} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className={`text-2xl font-bold ${mysteryGift.unlocked ? 'text-neutral-900' : 'text-neutral-500'}`}>
                                                {mysteryGift.name}
                                            </h3>
                                            {mysteryGift.unlocked && (
                                                <CheckCircle2 className="w-7 h-7 text-orange-600" strokeWidth={2.5} />
                                            )}
                                        </div>
                                        <p className="text-neutral-600 mb-4">
                                            {mysteryGift.description}
                                        </p>
                                        {mysteryGift.unlocked ? (
                                            <button
                                                onClick={() => navigate('/platinum-gift')}
                                                className="btn-primary inline-flex items-center gap-2 hover:gap-3 transition-all duration-300"
                                            >
                                                Claim Your Reward →
                                            </button>
                                        ) : (
                                            <div className="text-sm text-neutral-500 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 inline-block">
                                                Unlock all {totalAchievements - 1} other achievements to reveal this mystery
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Achievements Carousel */}
                    <div className="glass-card mb-8 lg:mb-12 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">Achievements</h2>
                            <span className="text-sm lg:text-base text-neutral-500 font-medium bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                                {unlockedCount} / {totalAchievements}
                            </span>
                        </div>
                        
                        <AchievementCarousel categories={achievementCategories} />
                    </div>

                    {/* Mode Stats */}
                    <div className="glass-card animate-fade-in-up hover:shadow-lg transition-all duration-300">
                        <h2 className="text-xl lg:text-2xl font-bold text-neutral-900 mb-6">Mode Performance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                            <StatCard 
                                title="Intervals" 
                                value={stats.modeStats.interval || 0}
                                icon={Music}
                                subtitle="correct answers"
                            />
                            <StatCard 
                                title="Chords" 
                                value={stats.modeStats.chord || 0}
                                icon={Piano}
                                subtitle="correct answers"
                            />
                            <StatCard 
                                title="Progressions" 
                                value={stats.modeStats.progression || 0}
                                icon={Music2}
                                subtitle="correct answers"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <AchievementToast 
                achievement={newAchievement}
                onClose={() => setNewAchievement(null)}
            />

            {/* Footer */}
            <Footer />
        </div>
    );
};
