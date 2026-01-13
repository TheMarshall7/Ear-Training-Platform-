import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { Achievement } from '../logic/achievements';
import {
    Flame,
    Target,
    Star,
    Music,
    Piano,
    Music2,
    Trophy,
    BarChart3,
    Calendar,
    Zap,
    Award,
    TrendingUp,
    Users
} from 'lucide-react';

interface AchievementCarouselProps {
    categories: {
        [key: string]: Achievement[];
    };
}

const getCategoryInfo = (category: string) => {
    const info: Record<string, { title: string; icon: any }> = {
        streak: { title: 'Streak Milestones', icon: Flame },
        total: { title: 'Total Questions', icon: BarChart3 },
        perfect: { title: 'Perfect Runs', icon: Star },
        mode: { title: 'Mode Mastery', icon: Music },
        daily: { title: 'Daily Practice', icon: Calendar },
        accuracy: { title: 'Accuracy', icon: Target },
        level: { title: 'Level Milestones', icon: TrendingUp },
        multimode: { title: 'Multi-Mode Mastery', icon: Users },
        special: { title: 'Special Achievements', icon: Zap }
    };
    return info[category] || { title: category, icon: Award };
};

const getAchievementIcon = (ach: Achievement) => {
    // All icons use orange theme to match site
    if (ach.icon === '🔥' || ach.icon.startsWith('🔥')) return <Flame className="w-6 h-6 text-orange-600" strokeWidth={2} />;
    if (ach.icon === '⭐' || ach.icon.startsWith('⭐') || ach.icon === '🌟' || ach.icon === '💫' || ach.icon === '✨') return <Star className="w-6 h-6 text-orange-600" strokeWidth={2} />;
    if (ach.icon === '🎯') return <Target className="w-6 h-6 text-orange-600" strokeWidth={2} />;
    if (ach.icon === '🎵' || ach.icon === '🎶') return <Music className="w-6 h-6 text-orange-600" strokeWidth={2} />;
    if (ach.icon === '🎹') return <Piano className="w-6 h-6 text-orange-600" strokeWidth={2} />;
    if (ach.icon === '🎼') return <Music2 className="w-6 h-6 text-orange-600" strokeWidth={2} />;
    if (ach.icon === '🏆' || ach.icon === '👑') return <Trophy className="w-6 h-6 text-orange-600" strokeWidth={2} />;
    if (ach.icon === '📚' || ach.icon === '📖' || ach.icon === '🎓' || ach.icon === '📘') return <BarChart3 className="w-6 h-6 text-orange-600" strokeWidth={2} />;
    if (ach.icon === '📅' || ach.icon === '🗓️' || ach.icon === '💯' || ach.icon === '🎊') return <Calendar className="w-6 h-6 text-orange-600" strokeWidth={2} />;
    if (ach.icon === '⚡' || ach.icon === '💪' || ach.icon === '🏃') return <Zap className="w-6 h-6 text-orange-600" strokeWidth={2} />;
    if (ach.icon === '🌱' || ach.icon === '🌿' || ach.icon === '🌳' || ach.icon === '🌲' || ach.icon === '🌴') return <TrendingUp className="w-6 h-6 text-orange-600" strokeWidth={2} />;
    if (ach.icon === '🎭') return <Users className="w-6 h-6 text-orange-600" strokeWidth={2} />;
    if (ach.icon === '🔑') return <Award className="w-6 h-6 text-orange-600" strokeWidth={2} />;
    if (ach.icon === '⏱️') return <Music className="w-6 h-6 text-orange-600" strokeWidth={2} />;
    if (ach.icon === '🦉' || ach.icon === '🐦' || ach.icon === '🎷') return <Star className="w-6 h-6 text-orange-600" strokeWidth={2} />;
    return <Trophy className="w-6 h-6 text-neutral-400" strokeWidth={2} />;
};

export const AchievementCarousel: React.FC<AchievementCarouselProps> = ({ categories }) => {
    const categoryKeys = Object.keys(categories).filter(key => categories[key].length > 0);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentCategory = categoryKeys[currentIndex];
    const currentAchievements = categories[currentCategory] || [];
    const categoryInfo = getCategoryInfo(currentCategory);

    const nextCategory = () => {
        setCurrentIndex((prev) => (prev + 1) % categoryKeys.length);
    };

    const prevCategory = () => {
        setCurrentIndex((prev) => (prev - 1 + categoryKeys.length) % categoryKeys.length);
    };

    const goToCategory = (index: number) => {
        setCurrentIndex(index);
    };

    const CategoryIcon = categoryInfo.icon;
    const unlockedCount = currentAchievements.filter(a => a.unlocked).length;

    return (
        <div className="space-y-6">
            {/* Category Navigation */}
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={prevCategory}
                    className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/80 hover:border-orange-300 transition-all hover:scale-110 hover:shadow-lg"
                    aria-label="Previous category"
                >
                    <ChevronLeft className="w-5 h-5 text-neutral-700 group-hover:text-orange-600 transition-colors" strokeWidth={2.5} />
                </button>

                <div className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2 group">
                        <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center border border-orange-200/50 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                            <CategoryIcon className="w-6 h-6 text-orange-600 group-hover:rotate-6 transition-transform duration-300" strokeWidth={2} />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900">{categoryInfo.title}</h3>
                    </div>
                    <div className="text-sm text-neutral-500">
                        {unlockedCount} / {currentAchievements.length} unlocked
                    </div>
                </div>

                <button
                    onClick={nextCategory}
                    className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/80 hover:border-orange-300 transition-all hover:scale-110 hover:shadow-lg"
                    aria-label="Next category"
                >
                    <ChevronRight className="w-5 h-5 text-neutral-700 group-hover:text-orange-600 transition-colors" strokeWidth={2.5} />
                </button>
            </div>

            {/* Dots Navigation */}
            <div className="flex items-center justify-center gap-2">
                {categoryKeys.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToCategory(index)}
                        className={`transition-all duration-300 rounded-full hover:scale-125 ${
                            index === currentIndex
                                ? 'w-8 h-2 bg-orange-500 shadow-md'
                                : 'w-2 h-2 bg-neutral-300 hover:bg-orange-400'
                        }`}
                        aria-label={`Go to category ${index + 1}`}
                    />
                ))}
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentAchievements.map(ach => (
                    <div
                        key={ach.id}
                        className={`group p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 ${
                            ach.unlocked
                                ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-300/50 shadow-md hover:shadow-lg'
                                : 'bg-white/30 border-white/20 opacity-60 hover:opacity-80 hover:border-orange-200/30'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ${
                                ach.unlocked 
                                    ? 'bg-white/80 border border-orange-200/50 group-hover:shadow-md' 
                                    : 'bg-white/30 border border-white/20'
                            }`}>
                                {getAchievementIcon(ach)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`font-bold text-sm ${ach.unlocked ? 'text-neutral-900' : 'text-neutral-400'}`}>
                                    {ach.name}
                                </div>
                                <div className="text-xs text-neutral-500 mt-1">
                                    {ach.description}
                                </div>
                            </div>
                            {ach.unlocked && (
                                <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0" strokeWidth={2.5} />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {currentAchievements.length === 0 && (
                <div className="text-center py-8 text-neutral-500">
                    No achievements in this category yet.
                </div>
            )}
        </div>
    );
};
