/**
 * Hard Unlock for iOS Safari
 * Performs: resume -> silent buffer -> resume again
 * This is the most reliable way to force iOS audio to start inside a gesture.
 */
export async function hardUnlock(ctx: AudioContext): Promise<boolean> {
    try {
        console.log('🔄 Attempting hard unlock... Current state:', ctx.state);
        
        // 1. Resume first
        if (ctx.state !== 'running') {
            await ctx.resume();
        }

        // 2. Play silent buffer (required for some iOS versions)
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        source.stop(ctx.currentTime + 0.001);
        source.onended = () => source.disconnect();

        // 3. Resume again (ensures state flips to "running")
        await ctx.resume();

        console.log('✅ Hard unlock finished. Final state:', ctx.state);
        return ctx.state === 'running';
    } catch (error) {
        console.error('❌ Hard unlock failed:', error);
        return false;
    }
}

export interface GlobalUnlockOptions {
    audioContext: AudioContext;
    onUnlock?: () => void;
}

let isGlobalUnlockAttached = false;
let globalUnlockListeners: Array<() => void> = [];

export function attachGlobalAudioUnlock(opts: GlobalUnlockOptions): void {
    if (isGlobalUnlockAttached) return;

    const { audioContext, onUnlock } = opts;
    let unlocked = false;

    const handleUnlock = async (event: Event) => {
        if (unlocked) return;
        unlocked = true;

        const success = await hardUnlock(audioContext);
        if (success) {
            sessionStorage.setItem('audioUnlocked', 'true');
            onUnlock?.();
            detachGlobalAudioUnlock();
        } else {
            unlocked = false; // Allow retry on next tap
        }
    };

    const events = ['pointerdown', 'touchend', 'click', 'scroll', 'keydown'];
    events.forEach(type => document.addEventListener(type, handleUnlock, { once: true, capture: true, passive: true }));

    globalUnlockListeners = events.map(type => () => document.removeEventListener(type, handleUnlock, { capture: true }));
    isGlobalUnlockAttached = true;
}

export function detachGlobalAudioUnlock(): void {
    globalUnlockListeners.forEach(cleanup => cleanup());
    globalUnlockListeners = [];
    isGlobalUnlockAttached = false;
}

export function setupVisibilityResumeHandler(ctx: AudioContext): () => void {
    const handleVisibility = async () => {
        if (document.visibilityState === 'visible' && ctx.state === 'suspended') {
            await ctx.resume();
            console.log('Tab visible: context resumed. State:', ctx.state);
        }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
}
