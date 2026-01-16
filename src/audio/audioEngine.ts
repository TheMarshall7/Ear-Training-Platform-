import { noteNameToMidi } from '../config/harmonyRules';
import { syncHardUnlock } from './unlockAudio';

export class AudioEngine {
    private context: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private samples: Map<string, AudioBuffer> = new Map();
    private activeSources: Set<AudioBufferSourceNode> = new Set();
    private unlocked = false;

    /**
     * Ensures ONE AudioContext exists and is initialized.
     */
    async init() {
        if (!this.context || this.context.state === 'closed') {
            console.log('AudioEngine: Creating new context...');
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.context.destination);
            console.log('AudioEngine: Context created. State:', this.context.state);
        }
        return this.context;
    }

    /**
     * Synchronously triggers unlock inside user gesture.
     */
    ensureUnlockedSync(): void {
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
    }

    /**
     * Async ensureUnlocked for internal use
     */
    async ensureUnlocked(): Promise<void> {
        const ctx = await this.init();
        if (this.unlocked && ctx.state === 'running') return;

        console.log('AudioEngine: ensureUnlocked (async fallback). State:', ctx.state);
        syncHardUnlock(ctx);
        this.unlocked = true;
    }

    getContext() { return this.context; }

    async play(
        id: string,
        pitchShiftCents: number = 0,
        timeOffset: number = 0,
        gain: number = 1.0,
        durationSeconds?: number
    ) {
        if (!this.context) await this.init();
        const ctx = this.context!;

        console.log(`AudioEngine: play(${id}). State:`, ctx.state);

        if (ctx.state !== 'running') {
            console.warn('AudioEngine: context not running during play. Attempting sync unlock.');
            syncHardUnlock(ctx);
        }

        if (!this.samples.has(id)) {
            console.error(`AudioEngine: sample not loaded: ${id}`);
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
        source.start(startTime);
        if (durationSeconds && durationSeconds > 0) {
            // Add fade-out to prevent clicking/clipping when cutting bass notes
            const fadeOutDuration = 0.05; // 50ms fade-out
            const fadeStartTime = startTime + Math.max(0, durationSeconds - fadeOutDuration);
            sourceGain.gain.setValueAtTime(gain, fadeStartTime);
            sourceGain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSeconds);
            source.stop(startTime + durationSeconds);
        }
    }

    async playNote(
        rootSampleId: string,
        midiNote: number,
        rootMidi: number = 60,
        timeOffset: number = 0,
        gain: number = 1.0,
        durationSeconds?: number
    ) {
        const semitoneDiff = midiNote - rootMidi;
        await this.play(rootSampleId, semitoneDiff * 100, timeOffset, gain, durationSeconds);
    }

    async playChordSequence(
        chords: number[][],
        tempoMs: number = 900,
        rootSampleId: string = 'piano_C4',
        rootMidi: number = 60,
        gainOverrides?: number[][],
        sustainFactor: number = 1.0  // 0.0-1.0, reduces note duration for tighter response
    ) {
        await this.ensureUnlocked();
        if (!this.context) return;

        const tempoSeconds = tempoMs / 1000;
        // TODO: Consider sourcing dry samples with less reverb for even tighter response
        const noteDuration = sustainFactor < 1.0 ? tempoSeconds * sustainFactor : undefined;

        chords.forEach((chord, chordIndex) => {
            const chordDelay = 0.05 + (chordIndex * tempoSeconds);
            const gainPerNote = Math.min(1.0, 1.0 / chord.length);
            const chordGains = gainOverrides?.[chordIndex];
            chord.forEach((midiNote, noteIndex) => {
                const noteDelay = chordDelay + (noteIndex * 0.05);
                const gain = chordGains?.[noteIndex] ?? gainPerNote;
                this.playNote(rootSampleId, midiNote, rootMidi, noteDelay, gain, noteDuration);
            });
        });
    }

    async playScale(
        notes: string[],
        tempoMs: number = 400,
        rootSampleId: string = 'piano_C4',
        rootMidi: number = 60,
        octave: number = 4,
        noteDurationMs?: number
    ) {
        await this.ensureUnlocked();
        const tempoSeconds = tempoMs / 1000;
        const durationSeconds = noteDurationMs ? noteDurationMs / 1000 : undefined;

        // Track octave adjustments to prevent register jumps
        let currentOctave = octave;
        let previousMidiNote: number | null = null;

        notes.forEach((note, index) => {
            const baseMidiNote = noteNameToMidi(note, currentOctave);

            // If this note is lower than the previous note, we've wrapped around the octave
            // Increment octave to keep ascending
            if (previousMidiNote !== null && baseMidiNote < previousMidiNote) {
                currentOctave++;
            }

            const midiNote = noteNameToMidi(note, currentOctave);
            this.playNote(
                rootSampleId,
                midiNote,
                rootMidi,
                0.05 + (index * tempoSeconds),
                1.0,
                durationSeconds
            );

            previousMidiNote = midiNote;
        });
    }

    async playMelody(
        notes: string[],
        tempoMs: number = 400,
        rootSampleId: string = 'piano_C4',
        rootMidi: number = 60,
        octave: number = 4,
        noteDurationMs?: number
    ) {
        await this.playScale(notes, tempoMs, rootSampleId, rootMidi, octave, noteDurationMs);
    }

    async playNoteSequence(
        notes: string[],
        tempoMs: number = 400,
        rootSampleId: string = 'piano_C4',
        rootMidi: number = 60,
        octave: number = 4,
        noteDurationMs?: number
    ) {
        await this.playScale(notes, tempoMs, rootSampleId, rootMidi, octave, noteDurationMs);
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
            try { s.stop(); s.disconnect(); } catch { }
        });
        this.activeSources.clear();
        if (this.context && this.context.state === 'running') {
            this.context.suspend().then(() => {
                if (this.context) this.context.resume();
            });
        }
    }

    async loadSample(url: string, id: string): Promise<void> {
        const ctx = await this.init();
        if (this.samples.has(id)) return;
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        this.samples.set(id, await ctx.decodeAudioData(arrayBuffer));
    }

    hasSample(id: string) { return this.samples.has(id); }
}

export const audioEngine = new AudioEngine();
