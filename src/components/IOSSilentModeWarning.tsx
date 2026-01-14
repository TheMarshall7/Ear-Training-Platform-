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
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-4 mb-4 shadow-lg">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-red-600"
                    >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-red-900 mb-2">
                        ⚠️ iPhone Silent Mode Will Block All Audio
                    </h3>
                    <div className="text-sm text-red-800 space-y-2">
                        <p className="font-medium">
                            If you don't hear sound, check your iPhone's <strong>physical Silent switch</strong> (on the left side of your phone):
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong>Orange visible</strong> = Silent mode ON → <span className="text-red-600 font-bold">Audio blocked by iOS</span></li>
                            <li><strong>No orange</strong> = Silent mode OFF → Audio will work</li>
                        </ul>
                        <p className="text-xs mt-2 italic text-red-700">
                            This is an iOS hardware limitation - no app can play sound when the Silent switch is ON.
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 p-1 hover:bg-red-100 rounded-full transition-colors"
                    aria-label="Dismiss"
                >
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
                        className="text-red-600"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
};
