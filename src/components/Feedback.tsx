import React, { useEffect, useState } from 'react';

interface FeedbackProps {
    correct: boolean | null;
    points: number;
    multiplier?: number;
    onShowParticles?: () => void;
}

export const Feedback: React.FC<FeedbackProps> = ({ 
    correct, 
    points, 
    multiplier = 1,
    onShowParticles 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [displayPoints, setDisplayPoints] = useState(0);

    useEffect(() => {
        if (correct !== null) {
            setIsVisible(true);
            
            if (correct) {
                // Trigger particle effect only once when correct becomes true
                if (onShowParticles) {
                    onShowParticles();
                }
                
                // Animate score counter
                const targetPoints = points * multiplier;
                const duration = 500;
                const steps = 20;
                const increment = targetPoints / steps;
                let current = 0;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= targetPoints) {
                        setDisplayPoints(targetPoints);
                        clearInterval(timer);
                    } else {
                        setDisplayPoints(Math.floor(current));
                    }
                }, duration / steps);

                return () => clearInterval(timer);
            } else {
                setDisplayPoints(0);
            }
        } else {
            setIsVisible(false);
            setDisplayPoints(0);
        }
    }, [correct, points, multiplier]); // Removed onShowParticles to prevent infinite loop

    if (!isVisible || correct === null) return null;

    const finalPoints = correct ? Math.floor(points * multiplier) : 0;
    const showMultiplier = multiplier > 1 && correct;

    return (
        <div className={`
            fixed bottom-24 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none
            px-8 py-4 rounded-full shadow-2xl font-bold text-lg
            transition-all duration-300
            ${correct 
                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white animate-bounce scale-110' 
                : 'bg-stone-800 text-white animate-pulse'
            }
        `}>
            {correct ? (
                <div className="flex items-center gap-2">
                    <span>Correct!</span>
                    <span className="text-2xl">+{finalPoints}</span>
                    {showMultiplier && (
                        <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                            {multiplier}x
                        </span>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <span>Try Again</span>
                </div>
            )}
        </div>
    );
};
