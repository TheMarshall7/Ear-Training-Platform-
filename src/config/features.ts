/**
 * Feature Flags Configuration
 * Toggle features on/off without code changes
 */

import type { GameMode } from '../types/game';

export const FEATURES = {
    /**
     * Paywall System
     * Set to true to enable premium mode locking
     * Set to false for all modes free (current behavior)
     */
    PAYWALL_ENABLED: false,

    /**
     * Free Modes (when paywall is enabled)
     * Users can access these modes without payment
     */
    FREE_MODES: ['interval', 'chord'] as GameMode[],

    /**
     * Premium Price
     * One-time payment to unlock all modes
     */
    PREMIUM_PRICE: 9.99,
    PREMIUM_CURRENCY: 'USD',

    /**
     * Stripe Configuration
     * Keys are loaded from environment variables
     */
    STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
};

/**
 * Check if a mode requires premium access
 */
export const isModeLocked = (mode: GameMode, isPremium: boolean): boolean => {
    if (!FEATURES.PAYWALL_ENABLED) return false; // Paywall disabled = all free
    if (FEATURES.FREE_MODES.includes(mode)) return false; // Free modes
    return !isPremium; // Locked if not premium
};

/**
 * Get locked modes list
 */
export const getLockedModes = (isPremium: boolean): GameMode[] => {
    if (!FEATURES.PAYWALL_ENABLED || isPremium) return [];

    const allModes: GameMode[] = [
        'interval', 'chord', 'progression', 'scale',
        'keyFinder', 'numberSystem', 'melody', 'tempo'
    ];

    return allModes.filter(mode => !FEATURES.FREE_MODES.includes(mode));
};
