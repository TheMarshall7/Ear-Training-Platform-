import { noteNameToMidi } from '../config/harmonyRules';
import { syncHardUnlock } from './unlockAudio';
import { rlog } from '../utils/debugLogger';

export class AudioEngine {
    private context: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private samples: Map<string, AudioBuffer> = new Map();
    private sampleUrls: Map<string, string> = new Map();
    private activeSources: Set<AudioBufferSourceNode> = new Set();
    private activeMedia: Set<HTMLAudioElement> = new Set();
    private unlocked = false;

    /**
     * Ensures ONE AudioContext exists and is initialized.
     */
    async init() {
        // #region agent log
        rlog('audioEngine.ts:init', 'init called', { contextExists: !!this.context, state: this.context?.state }, 'B');
        // #endregion
        if (!this.context || this.context.state === 'closed') {
            console.log('AudioEngine: Creating new context...');
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.context.destination);
            console.log('AudioEngine: Context created. State:', this.context.state);
            // #region agent log
            rlog('audioEngine.ts:init', 'context created', { state: this.context.state }, 'B');
            // #endregion
        }
        return this.context;
    }

    /**
     * Synchronously triggers unlock inside user gesture.
     */
    ensureUnlockedSync(): void {
        // #region agent log
        rlog('audioEngine.ts:ensureUnlockedSync', 'called', { contextExists: !!this.context, state: this.context?.state }, 'A');
        // #endregion
        if (!this.context) {
            console.warn('AudioEngine: No context to unlock. Creating one...');
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.context.destination);
        }
        
        console.log('AudioEngine: ensureUnlockedSync. State:', this.context.state);
        syncHardUnlock(this.context);
        this.unlocked = true;
        // #region agent log
        rlog('audioEngine.ts:ensureUnlockedSync', 'triggered', { state: this.context.state }, 'A');
        // #endregion
    }

    /**
     * Async ensureUnlocked for internal use
     */
    async ensureUnlocked(): Promise<void> {
        // #region agent log
        rlog('audioEngine.ts:ensureUnlocked', 'async fallback called', { unlocked: this.unlocked }, 'A');
        // #endregion
        const ctx = await this.init();
        if (this.unlocked && ctx.state === 'running') return;
        
        console.log('AudioEngine: ensureUnlocked (async fallback). State:', ctx.state);
        syncHardUnlock(ctx);
        this.unlocked = true;
        // #region agent log
        rlog('audioEngine.ts:ensureUnlocked', 'triggered', { state: ctx.state }, 'A');
        // #endregion
    }

    getContext() { return this.context; }

    async play(id: string, pitchShiftCents: number = 0, timeOffset: number = 0, gain: number = 1.0) {
        // #region agent log
        rlog('audioEngine.ts:play', 'starting play', { id, state: this.context?.state }, 'C');
        // #endregion
        if (this.shouldUseMediaElement() && this.sampleUrls.has(id)) {
            this.playMediaElement(id, pitchShiftCents, timeOffset, gain);
            return;
        }
        if (!this.context) await this.init();
        const ctx = this.context!;

        console.log(`AudioEngine: play(${id}). State:`, ctx.state);
        
        if (ctx.state !== 'running') {
            console.warn('AudioEngine: context not running during play. Attempting sync unlock.');
            syncHardUnlock(ctx);
        }

        if (!this.samples.has(id)) {
            console.error(`AudioEngine: sample not loaded: ${id}`);
            // #region agent log
            rlog('audioEngine.ts:play', 'sample not loaded', { id }, 'C');
            // #endregion
            return;
        }

        const sample = this.samples.get(id)!;
        const source = ctx.createBufferSource();
        source.buffer = sample;

        if (pitchShiftCents !== 0) {
            source.playbackRate.value = Math.pow(2, pitchShiftCents / 1200);
        }

        const sourceGain = ctx.createGain();
        sourceGain.gain.value = gain;
        source.connect(sourceGain);
        sourceGain.connect(this.masterGain!);
        
        this.activeSources.add(source);
        source.onended = () => {
            this.activeSources.delete(source);
            source.disconnect();
        };
        
        const startTime = Math.max(ctx.currentTime, ctx.currentTime + timeOffset);
        // #region agent log
        rlog('audioEngine.ts:play', 'source.start', { id, startTime, currentTime: ctx.currentTime }, 'C');
        // #endregion
        source.start(startTime);
    }

    async playNote(rootSampleId: string, midiNote: number, rootMidi: number = 60, timeOffset: number = 0, gain: number = 1.0) {
        const semitoneDiff = midiNote - rootMidi;
        await this.play(rootSampleId, semitoneDiff * 100, timeOffset, gain);
    }

    async playChordSequence(chords: number[][], tempoMs: number = 900, rootSampleId: string = 'piano_C4', rootMidi: number = 60) {
        await this.ensureUnlocked();
        if (!this.context) return;

        const tempoSeconds = tempoMs / 1000;
        chords.forEach((chord, chordIndex) => {
            const chordDelay = 0.05 + (chordIndex * tempoSeconds);
            const gainPerNote = Math.min(1.0, 1.0 / chord.length);
            chord.forEach((midiNote, noteIndex) => {
                const noteDelay = chordDelay + (noteIndex * 0.05);
                this.playNote(rootSampleId, midiNote, rootMidi, noteDelay, gainPerNote);
            });
        });
    }

    async playScale(notes: string[], tempoMs: number = 400, rootSampleId: string = 'piano_C4', rootMidi: number = 60, octave: number = 4) {
        await this.ensureUnlocked();
        const tempoSeconds = tempoMs / 1000;
        notes.forEach((note, index) => {
            const midiNote = noteNameToMidi(note, octave);
            this.playNote(rootSampleId, midiNote, rootMidi, 0.05 + (index * tempoSeconds));
        });
    }

    async playMelody(notes: string[], tempoMs: number = 400, rootSampleId: string = 'piano_C4', rootMidi: number = 60, octave: number = 4) {
        await this.playScale(notes, tempoMs, rootSampleId, rootMidi, octave);
    }

    async playNoteSequence(notes: string[], tempoMs: number = 400, rootSampleId: string = 'piano_C4', rootMidi: number = 60, octave: number = 4) {
        await this.playScale(notes, tempoMs, rootSampleId, rootMidi, octave);
    }

    async playChord(notes: string[], rootSampleId: string = 'piano_C4', rootMidi: number = 60) {
        await this.ensureUnlocked();
        const gainPerNote = Math.min(1.0, 1.0 / notes.length);
        notes.forEach((note, index) => {
            const match = note.match(/^([A-G])([#b]?)(\d+)$/);
            if (!match) return;
            const midiNote = noteNameToMidi(match[1] + match[2], parseInt(match[3]));
            this.playNote(rootSampleId, midiNote, rootMidi, 0.05 + (index * 0.02), gainPerNote);
        });
    }

    async playInterval(root: string, semitones: number, direction: 'asc' | 'desc' = 'asc', tempoMs: number = 800, rootSampleId: string = 'piano_C4', rootMidi: number = 60) {
        await this.ensureUnlocked();
        const match = root.match(/^([A-G])([#b]?)(\d+)$/);
        if (!match) return;
        const rootMidiNote = noteNameToMidi(match[1] + match[2], parseInt(match[3]));
        const targetMidiNote = rootMidiNote + (direction === 'asc' ? semitones : -semitones);
        this.playNote(rootSampleId, rootMidiNote, rootMidi, 0.05);
        this.playNote(rootSampleId, targetMidiNote, rootMidi, 0.05 + tempoMs / 1000);
    }

    stopAll() {
        this.activeSources.forEach(s => { 
            try { s.stop(); s.disconnect(); } catch {} 
        });
        this.activeSources.clear();
        this.activeMedia.forEach(media => {
            try {
                media.pause();
                media.currentTime = 0;
            } catch {}
        });
        this.activeMedia.clear();
        if (this.context && this.context.state === 'running') {
            this.context.suspend().then(() => {
                if (this.context) this.context.resume();
            });
        }
    }

    async loadSample(url: string, id: string): Promise<void> {
        const ctx = await this.init();
        this.sampleUrls.set(id, url);
        if (this.samples.has(id)) return;
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        this.samples.set(id, await ctx.decodeAudioData(arrayBuffer));
    }

    hasSample(id: string) { return this.samples.has(id); }

    private shouldUseMediaElement(): boolean {
        if (typeof navigator === 'undefined') return false;
        const ua = navigator.userAgent || '';
        const isIOS = /iPhone|iPad|iPod/i.test(ua);
        return isIOS;
    }

    private playMediaElement(id: string, pitchShiftCents: number, timeOffset: number, gain: number) {
        const url = this.sampleUrls.get(id);
        if (!url) return;
        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.volume = Math.max(0, Math.min(1, gain));
        if (pitchShiftCents !== 0) {
            audio.playbackRate = Math.pow(2, pitchShiftCents / 1200);
        }
        audio.setAttribute('playsinline', 'true');
        (audio as any).playsInline = true;

        this.activeMedia.add(audio);
        audio.onended = () => {
            this.activeMedia.delete(audio);
        };

        const start = () => {
            const playPromise = audio.play();
            if (playPromise?.catch) {
                playPromise.catch(error => {
                    console.warn('AudioEngine: media playback failed', error);
                    this.activeMedia.delete(audio);
                });
            }
        };

        if (timeOffset > 0) {
            setTimeout(start, timeOffset * 1000);
        } else {
            start();
        }
    }
}

export const audioEngine = new AudioEngine();
