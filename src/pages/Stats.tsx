import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { getXPForLevel } from '../context/GameContext';
import { loadStats, getAccuracy } from '../logic/statsTracker';
import { loadAchievements, type Achievement } from '../logic/achievements';
import { StatCard } from '../components/StatCard';
import { AchievementToast } from '../components/AchievementToast';
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

    const accuracy = getAccuracy(stats);
    const unlockedCount = Object.values(achievements).filter(a => a.unlocked).length;
    const totalAchievements = Object.keys(achievements).length;

    const achievementCategories = {
        streak: Object.values(achievements).filter(a => a.category === 'streak'),
        total: Object.values(achievements).filter(a => a.category === 'total'),
        perfect: Object.values(achievements).filter(a => a.category === 'perfect'),
        mode: Object.values(achievements).filter(a => a.category === 'mode'),
        daily: Object.values(achievements).filter(a => a.category === 'daily'),
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

            <div className="relative z-10 py-8 lg:py-12 px-4 flex-1">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 lg:mb-12">
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
                        <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight">
                            Statistics
                        </h1>
                        <div className="w-16"></div>
                    </div>

                    {/* Overview Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
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
                    <div className="glass-card mb-8 lg:mb-12">
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
                            <div className="flex items-center gap-2 text-sm text-neutral-600 bg-white/50 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
                                <Flame className="w-5 h-5 text-orange-600" strokeWidth={2} />
                                <span className="font-medium">Daily Streak: {stats.dailyStreak} days</span>
                            </div>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="glass-card mb-8 lg:mb-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">Achievements</h2>
                            <span className="text-sm lg:text-base text-neutral-500 font-medium bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                                {unlockedCount} / {totalAchievements}
                            </span>
                        </div>
                        
                        {Object.entries(achievementCategories).map(([category, achievements]) => (
                            <div key={category} className="mb-8 last:mb-0">
                                <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-4">
                                    {category}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {achievements.map(ach => {
                                        // Map emoji icons to Lucide icons
                                        const getIcon = () => {
                                            if (ach.icon === '🔥' || ach.icon.startsWith('🔥')) return <Flame className="w-8 h-8 text-orange-600" strokeWidth={2} />;
                                            if (ach.icon === '⭐' || ach.icon.startsWith('⭐')) return <Star className="w-8 h-8 text-yellow-600" strokeWidth={2} />;
                                            if (ach.icon === '🎯') return <Target className="w-8 h-8 text-blue-600" strokeWidth={2} />;
                                            if (ach.icon === '🎵') return <Music className="w-8 h-8 text-purple-600" strokeWidth={2} />;
                                            if (ach.icon === '🎹') return <Piano className="w-8 h-8 text-indigo-600" strokeWidth={2} />;
                                            if (ach.icon === '🎼') return <Music2 className="w-8 h-8 text-pink-600" strokeWidth={2} />;
                                            if (ach.icon === '🏆' || ach.icon === '👑') return <Trophy className="w-8 h-8 text-amber-600" strokeWidth={2} />;
                                            if (ach.icon === '📚' || ach.icon === '📖' || ach.icon === '🎓') return <BarChart3 className="w-8 h-8 text-blue-600" strokeWidth={2} />;
                                            if (ach.icon === '📅' || ach.icon === '🗓️') return <Star className="w-8 h-8 text-green-600" strokeWidth={2} />;
                                            // Default fallback
                                            return <Trophy className="w-8 h-8 text-neutral-400" strokeWidth={2} />;
                                        };
                                        
                                        return (
                                            <div
                                                key={ach.id}
                                                className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                                                    ach.unlocked
                                                        ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-300/50 shadow-md'
                                                        : 'bg-white/30 border-white/20 opacity-60'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                                                        ach.unlocked 
                                                            ? 'bg-white/80 border border-orange-200/50' 
                                                            : 'bg-white/30 border border-white/20'
                                                    }`}>
                                                        {getIcon()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className={`font-bold text-base ${ach.unlocked ? 'text-neutral-900' : 'text-neutral-400'}`}>
                                                            {ach.name}
                                                        </div>
                                                        <div className="text-xs text-neutral-500 mt-1.5">
                                                            {ach.description}
                                                        </div>
                                                    </div>
                                                    {ach.unlocked && (
                                                        <CheckCircle2 className="w-6 h-6 text-orange-600" strokeWidth={2.5} />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mode Stats */}
                    <div className="glass-card">
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
