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
 * Attach global one-time listeners to unlock audio on first user interaction
 * Listens for: click, touchend, pointerup
 * @param opts Options containing audioContext and optional callback
 */
export function attachGlobalAudioUnlock(opts: GlobalUnlockOptions): void {
    if (isGlobalUnlockAttached) {
        console.warn('Global audio unlock already attached');
        return;
    }

    const { audioContext, onUnlock } = opts;
    let unlocked = false;

    const handleUnlock = async () => {
        if (unlocked) return;
        unlocked = true;

        const success = await unlockAudio(audioContext);
        
        if (success) {
            console.log('Audio unlocked via global listener');
            onUnlock?.();
            detachGlobalAudioUnlock();
        }
    };

    const clickHandler = () => handleUnlock();
    const touchHandler = () => handleUnlock();
    const pointerHandler = () => handleUnlock();

    // Attach listeners with once: true for automatic cleanup
    document.addEventListener('click', clickHandler, { once: true, capture: true });
    document.addEventListener('touchend', touchHandler, { once: true, capture: true });
    document.addEventListener('pointerup', pointerHandler, { once: true, capture: true });

    // Store references for manual cleanup if needed
    globalUnlockListeners = [
        () => document.removeEventListener('click', clickHandler, { capture: true }),
        () => document.removeEventListener('touchend', touchHandler, { capture: true }),
        () => document.removeEventListener('pointerup', pointerHandler, { capture: true })
    ];

    isGlobalUnlockAttached = true;
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
