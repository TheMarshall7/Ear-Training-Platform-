import React, { useState, useEffect } from 'react';
import { audioEngine } from '../audio/audioEngine';

/**
 * AudioEnableBanner - Minimal banner to prompt user to enable audio
 * Required for iOS Safari and mobile browsers due to autoplay policies
 * 
 * Behavior:
 * - Shows when audio is not unlocked
 * - Hides after successful unlock
 * - Persists unlock state for the session
 * - Consistent styling with existing design
 */
export const AudioEnableBanner: React.FC = () => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check if audio was previously unlocked in this session
    useEffect(() => {
        const wasUnlocked = sessionStorage.getItem('audioUnlocked') === 'true';
        if (wasUnlocked) {
            setIsUnlocked(true);
        }
    }, []);

    const handleEnableAudio = async () => {
        setIsLoading(true);
        try {
            await audioEngine.ensureUnlocked();
            setIsUnlocked(true);
            sessionStorage.setItem('audioUnlocked', 'true');
        } catch (error) {
            console.error('Failed to enable audio:', error);
            // Don't show error to user - they can try again if needed
        } finally {
            setIsLoading(false);
        }
    };

    if (isUnlocked) {
        return null; // Hide banner when audio is unlocked
    }

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-600 flex-shrink-0"
                    >
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                    <p className="text-sm text-blue-900 font-medium">
                        Tap to enable audio
                    </p>
                </div>
                <button
                    onClick={handleEnableAudio}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    {isLoading ? 'Enabling...' : 'Enable Audio'}
                </button>
            </div>
        </div>
    );
};
