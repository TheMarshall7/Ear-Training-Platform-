/**
 * Achievement Toast Component
 * 
 * Displays achievement unlock notifications with premium icons.
 * Stays visible longer on mobile and allows tap-to-dismiss.
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Achievement } from '../logic/achievements';
import { Trophy, Star, BookOpen, GraduationCap, Crown, Calendar, CalendarDays, Music, Piano, Music2, Flame, Gift } from 'lucide-react';

interface AchievementToastProps {
    achievement: Achievement | null;
    onClose: () => void;
}

// Map achievement icons to premium Lucide icons
const getAchievementIcon = (achievement: Achievement) => {
    const iconMap: Record<string, React.ReactNode> = {
        'streak_5': <Flame className="w-8 h-8 text-orange-400" />,
        'streak_10': <Flame className="w-8 h-8 text-orange-500" />,
        'streak_25': <Flame className="w-8 h-8 text-red-500" />,
        'streak_50': <Flame className="w-8 h-8 text-red-600" />,
        'streak_100': <Flame className="w-8 h-8 text-red-700" />,
        'total_50': <BookOpen className="w-8 h-8 text-blue-400" />,
        'total_100': <BookOpen className="w-8 h-8 text-blue-500" />,
        'total_500': <GraduationCap className="w-8 h-8 text-purple-500" />,
        'total_1000': <Crown className="w-8 h-8 text-yellow-500" />,
        'perfect_1': <Star className="w-8 h-8 text-yellow-400" />,
        'perfect_5': <Star className="w-8 h-8 text-yellow-500" />,
        'perfect_10': <Star className="w-8 h-8 text-yellow-600" />,
        'mode_interval_100': <Music className="w-8 h-8 text-green-500" />,
        'mode_chord_100': <Piano className="w-8 h-8 text-indigo-500" />,
        'mode_progression_100': <Music2 className="w-8 h-8 text-pink-500" />,
        'daily_7': <Calendar className="w-8 h-8 text-cyan-500" />,
        'daily_30': <CalendarDays className="w-8 h-8 text-teal-500" />,
        'mystery_platinum_gift': <Gift className="w-8 h-8 text-yellow-400" />,
    };
    
    return iconMap[achievement.id] || <Trophy className="w-8 h-8 text-yellow-500" />;
};

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleDismiss = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setIsVisible(false);
        setTimeout(() => {
            onClose();
            // If it's the Mystery Platinum Gift, navigate to the special page
            if (achievement?.id === 'mystery_platinum_gift') {
                navigate('/platinum-gift');
            }
        }, 300);
    };

    useEffect(() => {
        if (achievement) {
            setIsVisible(true);
            // Longer display time: 4000ms (4 seconds) for better visibility on mobile
            timerRef.current = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for fade out
            }, 4000);
            return () => {
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
            };
        }
    }, [achievement, onClose]);

    if (!achievement || !isVisible) return null;

    const isPlatinumGift = achievement.id === 'mystery_platinum_gift';

    return (
        <div 
            className="fixed top-4 right-4 z-40 animate-slide-in-right pointer-events-auto cursor-pointer"
            onClick={handleDismiss}
        >
            <div className={`text-white p-4 rounded-xl shadow-2xl max-w-sm ${
                isPlatinumGift 
                    ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 animate-pulse border-2 border-yellow-300' 
                    : 'bg-gradient-to-r from-yellow-400 to-orange-500'
            }`}>
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                        {getAchievementIcon(achievement)}
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-lg">
                            {isPlatinumGift ? '🎉 SPECIAL ACHIEVEMENT UNLOCKED! 🎉' : 'Achievement Unlocked!'}
                        </div>
                        <div className="text-sm opacity-90 font-semibold">{achievement.name}</div>
                        <div className="text-xs opacity-75 mt-1">{achievement.description}</div>
                        <div className="text-xs opacity-60 mt-1">
                            {isPlatinumGift ? 'Tap to claim your reward!' : 'Tap to dismiss'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
