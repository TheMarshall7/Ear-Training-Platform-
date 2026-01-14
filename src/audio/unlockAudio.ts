/**
 * Audio Unlock Utility for iOS Safari and Mobile Browsers
 * 
 * Handles the iOS requirement for user gesture before audio can play.
 * Creates a silent buffer and plays it once to fully unlock the audio system.
 */

let globalUnlockListeners: Array<() => void> = [];
let isGlobalUnlockAttached = false;

/**
 * Unlock audio context by resuming it and playing a silent buffer
 * @param ctx AudioContext to unlock
 * @returns Promise<boolean> - true if successfully unlocked (running state)
 */
export async function unlockAudio(ctx: AudioContext): Promise<boolean> {
    try {
        // Step 1: Resume context if not running
        if (ctx.state !== 'running') {
            await ctx.resume();
        }

        // Step 2: Create and play silent buffer (required for iOS unlock)
        const buffer = ctx.createBuffer(1, 1, 22050); // 1 channel, 1 sample, lowest safe sample rate
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        
        // Start and immediately stop to avoid any audible artifact
        source.start(0);
        source.stop(ctx.currentTime + 0.001);

        // Step 3: Disconnect to clean up
        source.disconnect();

        // Step 4: Verify state
        return ctx.state === 'running';
    } catch (error) {
        console.error('Failed to unlock audio:', error);
        return false;
    }
}

/**
 * Options for global audio unlock
 */
export interface GlobalUnlockOptions {
    audioContext: AudioContext;
    onUnlock?: () => void;
}

/**
 * Attach global one-time listeners to unlock audio on FIRST user interaction
 * Preferred order: pointerdown > touchend > click > scroll
 * These capture ANY user interaction to unlock iOS audio seamlessly
 * @param opts Options containing audioContext and optional callback
 */
export function attachGlobalAudioUnlock(opts: GlobalUnlockOptions): void {
    if (isGlobalUnlockAttached) {
        console.warn('Global audio unlock already attached');
        return;
    }

    const { audioContext, onUnlock } = opts;
    let unlocked = false;

    const handleUnlock = async (event: Event) => {
        if (unlocked) return;
        unlocked = true;

        console.log('🎵 First user interaction detected:', event.type);

        const success = await unlockAudio(audioContext);
        
        if (success) {
            console.log('✅ Audio unlocked successfully via', event.type);
            // Store in both memory flag and localStorage for persistence
            localStorage.setItem('audioUnlocked', 'true');
            sessionStorage.setItem('audioUnlocked', 'true');
            onUnlock?.();
            detachGlobalAudioUnlock();
        } else {
            console.warn('⚠️ Audio unlock failed, will retry on next interaction');
            unlocked = false; // Allow retry on next interaction
        }
    };

    // Prioritized event types - pointerdown is most reliable on modern devices
    // scroll added to catch any scrolling as interaction
    const events = ['pointerdown', 'touchend', 'click', 'scroll', 'touchstart', 'mousedown', 'keydown'];
    
    events.forEach(eventType => {
        document.addEventListener(eventType, handleUnlock, { once: true, capture: true, passive: true });
    });

    // Store cleanup functions
    globalUnlockListeners = events.map(eventType => 
        () => document.removeEventListener(eventType, handleUnlock, { capture: true })
    );

    isGlobalUnlockAttached = true;
    console.log('🎧 Audio unlock listeners ready (waiting for first interaction)');
}

/**
 * Detach global audio unlock listeners
 * Useful for cleanup on unmount or after successful unlock
 */
export function detachGlobalAudioUnlock(): void {
    globalUnlockListeners.forEach(cleanup => cleanup());
    globalUnlockListeners = [];
    isGlobalUnlockAttached = false;
}

/**
 * Setup visibility change handler to resume audio when tab becomes visible
 * Safe - does not play audible sound, only resumes context
 * @param ctx AudioContext to resume
 */
export function setupVisibilityResumeHandler(ctx: AudioContext): () => void {
    const handleVisibilityChange = async () => {
        if (document.visibilityState === 'visible' && ctx.state === 'suspended') {
            try {
                await ctx.resume();
                console.log('Audio context resumed on visibility change');
            } catch (error) {
                // Silent fail - autoplay policy may block this, that's OK
                console.debug('Could not resume on visibility change:', error);
            }
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Return cleanup function
    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
}
