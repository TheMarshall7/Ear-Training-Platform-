import React, { useState, useEffect } from 'react';
import { audioEngine } from '../audio/audioEngine';

/**
 * AudioEnableBanner - FALLBACK banner shown only if auto-unlock fails
 * 
 * Behavior:
 * - Hidden by default (auto-unlock via global listeners should work)
 * - Only appears if audio is still locked after 3 seconds
 * - Provides manual "Enable Audio" button as fallback
 * - Detects iOS Silent mode and shows helpful warning
 * - Auto-hides when audio successfully unlocks
 */
export const AudioEnableBanner: React.FC = () => {
    const [isUnlocked, setIsUnlocked] = useState(true); // Optimistic - assume auto-unlock will work
    const [showBanner, setShowBanner] = useState(false);
    const [showSilentWarning, setShowSilentWarning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        let checkInterval: number;
        let showBannerTimeout: number;

        // Check if already unlocked
        const checkUnlockStatus = () => {
            const wasUnlocked = sessionStorage.getItem('audioUnlocked') === 'true' || 
                               localStorage.getItem('audioUnlocked') === 'true';
            return wasUnlocked;
        };

        // Initial check
        if (checkUnlockStatus()) {
            setIsUnlocked(true);
            setShowBanner(false);
            return;
        }

        // Give global listeners 3 seconds to unlock audio automatically
        // Only show banner if still not unlocked after that
        showBannerTimeout = window.setTimeout(() => {
            if (mounted && !checkUnlockStatus()) {
                console.log('⚠️ Audio not auto-unlocked, showing fallback banner');
                setShowBanner(true);
                setIsUnlocked(false);
            }
        }, 3000);

        // Poll for unlock status (in case global listeners succeed)
        checkInterval = window.setInterval(() => {
            if (checkUnlockStatus() && mounted) {
                setIsUnlocked(true);
                setShowBanner(false);
                clearInterval(checkInterval);
            }
        }, 500);

        // iOS Silent mode detection
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isIOS) {
            // Show Silent mode warning after 5 seconds if still not unlocked
            const silentTimeout = window.setTimeout(() => {
                if (mounted && !checkUnlockStatus()) {
                    setShowSilentWarning(true);
                }
            }, 5000);
            
            return () => {
                mounted = false;
                clearInterval(checkInterval);
                clearTimeout(showBannerTimeout);
                clearTimeout(silentTimeout);
            };
        }

        return () => {
            mounted = false;
            clearInterval(checkInterval);
            clearTimeout(showBannerTimeout);
        };
    }, []);

    const handleEnableAudio = async () => {
        setIsLoading(true);
        try {
            await audioEngine.ensureUnlocked();
            setIsUnlocked(true);
            setShowBanner(false);
            localStorage.setItem('audioUnlocked', 'true');
            sessionStorage.setItem('audioUnlocked', 'true');
            console.log('✅ Audio manually unlocked via fallback button');
        } catch (error) {
            console.error('Failed to enable audio:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Hide if unlocked or if we haven't determined we need to show the banner yet
    if (isUnlocked || !showBanner) {
        return null;
    }

    // Show Silent mode warning for iOS (highest priority)
    if (showSilentWarning) {
        return (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-lg p-3 mb-4 shadow-sm">
                <div className="flex items-start gap-2">
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
                        className="text-amber-600 flex-shrink-0 mt-0.5"
                    >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <div className="flex-1">
                        <p className="text-sm text-amber-900 font-medium mb-1">
                            Check your iPhone's Silent switch
                        </p>
                        <p className="text-xs text-amber-800">
                            Audio won't play when your phone is on Silent or Vibrate mode. Flip the switch on the side of your phone to enable sound.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback "Enable Audio" button (only shown if auto-unlock failed)
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
