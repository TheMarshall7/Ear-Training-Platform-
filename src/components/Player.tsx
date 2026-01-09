import React, { useState, useEffect } from 'react';
// User didn't ask for lucide-react, so I'll use SVGs inline to avoid extra dependency issues unless specified.
// Or I can install it. It's standard. But "No unnecessary libraries".
// I'll use inline SVGs for "vanilla" feel.

interface PlayerProps {
    onPlay: () => void;
    isPlaying?: boolean;
    label?: string;
    autoPlay?: boolean;
}

export const Player: React.FC<PlayerProps> = ({ onPlay, isPlaying, label = "Play", autoPlay = false }) => {
    const [hasPlayed, setHasPlayed] = useState(false);

    useEffect(() => {
        if (autoPlay) {
            handlePlay();
        }
    }, [autoPlay]);

    const handlePlay = () => {
        onPlay();
        setHasPlayed(true);
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 lg:p-8">
            <button
                onClick={handlePlay}
                disabled={isPlaying}
                className={`
          group relative w-24 h-24 lg:w-32 lg:h-32 rounded-full flex items-center justify-center
          transition-all duration-300 transform
          ${isPlaying 
            ? 'scale-95 bg-gradient-to-br from-orange-300 to-orange-400' 
            : 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:scale-110 shadow-xl shadow-orange-500/40'
          }
          disabled:cursor-not-allowed
        `}
            >
                {/* Glow effect */}
                {!isPlaying && (
                    <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse-glow" />
                )}

                {hasPlayed ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white lg:w-12 lg:h-12">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-white ml-1 lg:w-16 lg:h-16 lg:ml-2">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                )}
            </button>
            <div className="mt-4 lg:mt-6 text-neutral-500 font-medium tracking-wide text-sm lg:text-base">
                {isPlaying ? 'Listening...' : hasPlayed ? 'Re-listen' : label}
            </div>
        </div>
    );
};
