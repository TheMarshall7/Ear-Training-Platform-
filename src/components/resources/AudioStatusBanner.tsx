import React from 'react';
import { audioEngine } from '../../audio/audioEngine';

interface AudioStatusBannerProps {
    isUnlocked: boolean;
    onUnlock: () => void;
}

export const AudioStatusBanner: React.FC<AudioStatusBannerProps> = ({ isUnlocked, onUnlock }) => {
    if (isUnlocked) return null;

    const handleUnlock = async () => {
        try {
            await audioEngine.init();
            onUnlock();
        } catch (error) {
            console.error('Failed to unlock audio:', error);
        }
    };

    return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
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
                        className="text-orange-600"
                    >
                        <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                    <p className="text-sm text-orange-800">
                        Tap to enable audio playback
                    </p>
                </div>
                <button
                    onClick={handleUnlock}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                >
                    Enable Audio
                </button>
            </div>
        </div>
    );
};
