import React, { useEffect, useState } from 'react';

interface CelebrationOverlayProps {
    type: 'level-up' | 'perfect-run' | 'achievement' | 'streak-milestone';
    message: string;
    subtitle?: string;
    onComplete: () => void;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
    type,
    message,
    subtitle,
    onComplete
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 300);
        }, 2500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'level-up': return '🎉';
            case 'perfect-run': return '⭐';
            case 'achievement': return '🏆';
            case 'streak-milestone': return '🔥';
            default: return '🎊';
        }
    };

    const getColors = () => {
        switch (type) {
            case 'level-up': return 'from-blue-500 to-purple-500';
            case 'perfect-run': return 'from-yellow-400 to-orange-500';
            case 'achievement': return 'from-yellow-500 to-orange-500';
            case 'streak-milestone': return 'from-orange-500 to-red-500';
            default: return 'from-orange-500 to-yellow-500';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 animate-fade-in pointer-events-auto">
            <div className={`bg-gradient-to-r ${getColors()} text-white px-12 py-10 rounded-3xl shadow-2xl transform scale-110 animate-bounce max-w-md mx-4 text-center`}>
                <div className="text-7xl mb-4">{getIcon()}</div>
                <div className="text-4xl font-bold mb-2">{message}</div>
                {subtitle && (
                    <div className="text-xl opacity-90">{subtitle}</div>
                )}
            </div>
        </div>
    );
};
