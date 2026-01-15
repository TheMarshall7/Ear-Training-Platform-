import React, { useState, useEffect } from 'react';

/**
 * IOSSilentModeWarning - Persistent warning for iOS users about Silent mode
 * 
 * iOS hardware limitation: When the physical Silent switch is ON,
 * iOS mutes ALL Web Audio API sounds. This CANNOT be bypassed by code.
 * 
 * This component shows an immediate, dismissible warning to iOS users.
 */
export const IOSSilentModeWarning: React.FC = () => {
    const [isDismissed, setIsDismissed] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect iOS
        const iOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        setIsIOS(iOS);

        // Check if user previously dismissed
        const wasDismissed = sessionStorage.getItem('iosSilentWarningDismissed') === 'true';
        setIsDismissed(wasDismissed);
    }, []);

    const handleDismiss = () => {
        setIsDismissed(true);
        sessionStorage.setItem('iosSilentWarningDismissed', 'true');
    };

    // Only show on iOS and if not dismissed
    if (!isIOS || isDismissed) {
        return null;
    }

    return (
        <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3 text-xs text-red-800 flex items-center gap-2">
            <span className="font-semibold">iPhone:</span>
            <span>Turn Silent off (no orange) for sound.</span>
            <button
                onClick={handleDismiss}
                className="ml-auto text-red-600 hover:text-red-700"
                aria-label="Dismiss"
            >
                ✕
            </button>
        </div>
    );
};
