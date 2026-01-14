import { noteNameToMidi } from '../config/harmonyRules';
import { hardUnlock } from './unlockAudio';

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
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = 0.5; // 50% volume to prevent distortion
            this.masterGain.connect(this.context.destination);
            console.log('AudioEngine: Context initialized');
        }
        return this.context;
    }

    /**
     * MUST be called at the start of every Play/Replay handler.
     * This is the "hard unlock" that forces iOS to start the clock.
     */
    async ensureUnlocked(): Promise<void> {
        const ctx = await this.init();
        
        // If already unlocked and running, we're good
        if (this.unlocked && ctx.state === 'running') return;

        // Perform hard unlock (resume -> silent buffer -> resume)
        const success = await hardUnlock(ctx);
        if (success) {
            this.unlocked = true;
            console.log('AudioEngine: Confirming state === "running":', ctx.state === 'running');
        }
    }

    getContext() { return this.context; }

    async play(id: string, pitchShiftCents: number = 0, timeOffset: number = 0, gain: number = 1.0) {
        // Ensure audio is unlocked before any playback
        await this.ensureUnlocked();
        
        if (!this.context || !this.samples.has(id)) return;

        const sample = this.samples.get(id)!;
        const source = this.context.createBufferSource();
        source.buffer = sample;

        if (pitchShiftCents !== 0) {
            source.playbackRate.value = Math.pow(2, pitchShiftCents / 1200);
        }

        const sourceGain = this.context.createGain();
        sourceGain.gain.value = gain;
        source.connect(sourceGain);
        sourceGain.connect(this.masterGain!);
        
        this.activeSources.add(source);
        source.onended = () => {
            this.activeSources.delete(source);
            source.disconnect();
        };
        
        const startTime = Math.max(this.context.currentTime, this.context.currentTime + timeOffset);
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
