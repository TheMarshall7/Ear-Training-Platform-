import React, { useState, useEffect } from 'react';
import { audioEngine } from '../audio/audioEngine';

/**
 * AudioEnableBanner - Minimal banner to prompt user to enable audio
 * Required for iOS Safari and mobile browsers due to autoplay policies
 * 
 * Behavior:
 * - Automatically attempts unlock on mount (no manual click needed)
 * - Shows loading state during auto-unlock
 * - Hides after successful unlock
 * - Detects iOS Silent mode and shows warning
 * - Persists unlock state for the session
 */
export const AudioEnableBanner: React.FC = () => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Start as loading
    const [showSilentWarning, setShowSilentWarning] = useState(false);

    // Auto-unlock on mount and periodically check unlock status
    useEffect(() => {
        let mounted = true;
        let checkInterval: number;

        const attemptUnlock = async () => {
            // Check if already unlocked via global listeners
            const wasUnlocked = sessionStorage.getItem('audioUnlocked') === 'true';
            if (wasUnlocked) {
                if (mounted) {
                    setIsUnlocked(true);
                    setIsLoading(false);
                }
                return;
            }

            try {
                await audioEngine.ensureUnlocked();
                if (mounted) {
                    setIsUnlocked(true);
                    sessionStorage.setItem('audioUnlocked', 'true');
                    setIsLoading(false);
                }
            } catch (error) {
                console.debug('Auto-unlock attempt failed (expected on first load):', error);
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        // Try immediate unlock
        attemptUnlock();

        // Check periodically if audio was unlocked by global listeners
        checkInterval = window.setInterval(() => {
            const wasUnlocked = sessionStorage.getItem('audioUnlocked') === 'true';
            if (wasUnlocked && mounted) {
                setIsUnlocked(true);
                setIsLoading(false);
                clearInterval(checkInterval);
            }
        }, 500);

        // Detect iOS Silent mode
        const detectSilentMode = () => {
            const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isIOS && mounted) {
                // Show warning after 2 seconds if still not unlocked
                setTimeout(() => {
                    if (!isUnlocked && mounted) {
                        setShowSilentWarning(true);
                    }
                }, 2000);
            }
        };
        detectSilentMode();

        return () => {
            mounted = false;
            if (checkInterval) clearInterval(checkInterval);
        };
    }, [isUnlocked]);

    if (isUnlocked) {
        return null; // Hide banner when audio is unlocked
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                    <p className="text-sm text-blue-900">
                        Enabling audio...
                    </p>
                </div>
            </div>
        );
    }

    // Show Silent mode warning for iOS
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

    // Banner should auto-hide, but this is a fallback
    return null;
};
