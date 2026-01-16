

/**
 * Synchronous Hard Unlock for iOS Safari
 * Requirement: Call resume() without awaiting, then immediately play a silent buffer.
 */
export function syncHardUnlock(ctx: AudioContext): void {
    console.log('🔄 syncHardUnlock start. State:', ctx.state);

    // 1. Synchronously trigger resume (don't await)
    if (ctx.state !== 'running') {
        void ctx.resume();
    }

    // 2. Immediately play silent buffer (also synchronous trigger)
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    source.stop(ctx.currentTime + 0.001);
    source.onended = () => {
        source.disconnect();
        console.log('✅ silent buffer ended. State:', ctx.state);
    };

    console.log('✅ syncHardUnlock triggered. State:', ctx.state);
}

/**
 * Legacy hardUnlock - now uses synchronous triggers for iOS safety
 */
export async function hardUnlock(ctx: AudioContext): Promise<boolean> {
    syncHardUnlock(ctx);
    // Wait a brief moment for state to potentially flip
    await new Promise(resolve => setTimeout(resolve, 50));
    return ctx.state === 'running';
}

export interface GlobalUnlockOptions {
    audioContext: AudioContext;
    onUnlock?: () => void;
}

let isGlobalUnlockAttached = false;
let globalUnlockListeners: Array<() => void> = [];

/**
 * Attach global one-time listeners to unlock audio on first user interaction
 */
export function attachGlobalAudioUnlock(opts: GlobalUnlockOptions): void {
    if (isGlobalUnlockAttached) return;

    const { audioContext, onUnlock } = opts;
    let unlocked = false;

    const handleUnlock = async (event: Event) => {
        if (unlocked) return;
        unlocked = true;

        console.log('🎵 Global Interaction:', event.type);

        syncHardUnlock(audioContext);

        // Wait for potential state change
        await new Promise(resolve => setTimeout(resolve, 100));

        if (audioContext.state === 'running') {
            console.log('✅ Global audio unlocked successfully');
            sessionStorage.setItem('audioUnlocked', 'true');
            onUnlock?.();
            detachGlobalAudioUnlock();
        } else {
            console.warn('⚠️ Global audio unlock failed, allowing retry');
            unlocked = false; // Allow retry on next tap
        }
    };

    const events = ['pointerdown', 'touchend', 'click', 'scroll', 'keydown'];
    events.forEach(type => document.addEventListener(type, handleUnlock, { once: true, capture: true, passive: true }));

    globalUnlockListeners = events.map(type => () => document.removeEventListener(type, handleUnlock, { capture: true }));
    isGlobalUnlockAttached = true;
    console.log('🎧 Audio unlock listeners ready');
}

/**
 * Detach global audio unlock listeners
 */
export function detachGlobalAudioUnlock(): void {
    globalUnlockListeners.forEach(cleanup => cleanup());
    globalUnlockListeners = [];
    isGlobalUnlockAttached = false;
}

/**
 * Setup visibility change handler for tab switching
 */
export function setupVisibilityResumeHandler(ctx: AudioContext): () => void {
    const handleVisibility = () => {
        console.log('Tab visibility changed:', document.visibilityState);
        if (document.visibilityState === 'visible' && ctx.state === 'suspended') {
            void ctx.resume();
            console.log('Tab visible: resume() called.');
        }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
}
