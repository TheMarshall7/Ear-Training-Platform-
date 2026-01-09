import { noteNameToMidi } from '../config/harmonyRules';

export class AudioEngine {
    private context: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private samples: Map<string, AudioBuffer> = new Map();
    private activeSources: Set<AudioBufferSourceNode> = new Set(); // Keep references to prevent GC

    constructor() {
        // Context is initialized on user interaction to comply with browser policies
    }

    toggleMute() {
        if (this.context?.state === 'suspended') {
            this.context.resume();
        }
    }

    async init() {
        if (!this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.context.createGain();
            // Set master gain to prevent clipping when multiple notes play together
            this.masterGain.gain.value = 0.5; // 50% volume to prevent distortion
            this.masterGain.connect(this.context.destination);
        }
        if (this.context.state === 'suspended') {
            await this.context.resume();
        }
    }

    async loadSample(url: string, id: string): Promise<void> {
        await this.init(); // Ensure context is ready
        if (this.samples.has(id)) {
            console.log(`Sample ${id} already loaded`);
            return;
        }

        try {
            console.log(`Loading sample ${id} from ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context!.decodeAudioData(arrayBuffer);
            this.samples.set(id, audioBuffer);
            console.log(`Successfully loaded sample ${id}`);
        } catch (error) {
            console.error(`Failed to load sample ${url}:`, error);
            throw error;
        }
    }

    play(id: string, pitchShiftCents: number = 0, timeOffset: number = 0, gain: number = 1.0) {
        if (!this.context || !this.samples.has(id)) {
            console.warn(`Cannot play ${id}: context=${!!this.context}, hasSample=${this.samples.has(id)}`);
            return;
        }

        const source = this.context.createBufferSource();
        source.buffer = this.samples.get(id)!;

        // Simple pitch shifting if needed (playbackRate)
        // 100 cents = 1 semitone
        // rate = 2 ^ (cents / 1200)
        if (pitchShiftCents !== 0) {
            source.playbackRate.value = Math.pow(2, pitchShiftCents / 1200);
        }

        // Create individual gain node for this source to control volume
        const sourceGain = this.context.createGain();
        sourceGain.gain.value = gain;
        source.connect(sourceGain);
        sourceGain.connect(this.masterGain!);
        
        // Keep reference to prevent garbage collection
        this.activeSources.add(source);
        
        // Remove from set when finished
        source.onended = () => {
            this.activeSources.delete(source);
        };
        
        const startTime = this.context.currentTime + timeOffset;
        
        // Ensure start time is not in the past
        if (startTime < this.context.currentTime) {
            console.warn(`Start time ${startTime} is in the past (current: ${this.context.currentTime}), using currentTime`);
            source.start(this.context.currentTime);
        } else {
            source.start(startTime);
        }
    }

    // Play a note defined by midi number (assuming Middle C = 60 is the sample 'root')
    playNote(rootSampleId: string, midiNote: number, rootMidi: number = 60, timeOffset: number = 0, gain: number = 1.0) {
        const semitoneDiff = midiNote - rootMidi;
        const cents = semitoneDiff * 100;
        this.play(rootSampleId, cents, timeOffset, gain);
    }

    stopAll() {
        // In a real engine, we'd track active sources. 
        // For now, this is a placeholder if we needed to cut sound.
        // Ideally we suspend context or disconnect.
        if (this.context) {
            this.context.suspend();
            setTimeout(() => this.context?.resume(), 50);
        }
    }

    /**
     * Play a sequence of chords (root position triads)
     * @param chords Array of MIDI note arrays (each array is a chord)
     * @param tempoMs Time between chord starts in milliseconds (default 900ms)
     * @param rootSampleId Sample ID to use for pitch shifting (default 'piano_C4')
     * @param rootMidi MIDI note of the root sample (default 60 = C4)
     */
    playChordSequence(
        chords: number[][],
        tempoMs: number = 900,
        rootSampleId: string = 'piano_C4',
        rootMidi: number = 60
    ) {
        if (!this.context) {
            console.error('Audio context not initialized');
            return;
        }
        
        // Ensure context is running
        if (this.context.state === 'suspended') {
            console.log('Resuming suspended audio context');
            this.context.resume().catch(err => {
                console.error('Failed to resume audio context:', err);
            });
        }
        
        if (!this.samples.has(rootSampleId)) {
            console.error(`Sample ${rootSampleId} not loaded. Available samples:`, Array.from(this.samples.keys()));
            return;
        }

        if (!chords || chords.length === 0) {
            console.error('No chords provided to playChordSequence');
            return;
        }

        console.log(`Playing ${chords.length} chords with tempo ${tempoMs}ms`);

        // Read currentTime once and use it consistently
        const currentTime = this.context.currentTime;
        const baseDelay = 0.05; // 50ms delay to ensure context is ready
        const tempoSeconds = tempoMs / 1000;

        console.log(`Scheduling chords starting ${baseDelay.toFixed(3)}s from now (currentTime: ${currentTime.toFixed(3)})`);

        chords.forEach((chord, chordIndex) => {
            const chordDelay = baseDelay + (chordIndex * tempoSeconds);
            
            if (!chord || chord.length === 0) {
                console.warn(`Chord at index ${chordIndex} is empty`);
                return;
            }
            
            console.log(`Scheduling chord ${chordIndex} with delay ${chordDelay.toFixed(3)}s (will play at ${(currentTime + chordDelay).toFixed(3)}), notes:`, chord);
            
            // Play all notes of the chord simultaneously (with slight arpeggiation for clarity)
            // Reduce gain per note to prevent clipping when multiple notes play together
            const notesPerChord = chord.length;
            const gainPerNote = Math.min(1.0, 1.0 / notesPerChord); // Divide gain by number of notes
            
            chord.forEach((midiNote, noteIndex) => {
                const noteDelay = chordDelay + (noteIndex * 0.05); // 50ms arpeggiation
                console.log(`  Note ${noteIndex} (MIDI ${midiNote}) with delay ${noteDelay.toFixed(3)}s, gain: ${gainPerNote.toFixed(2)}`);
                this.playNote(rootSampleId, midiNote, rootMidi, noteDelay, gainPerNote);
            });
        });
        
        console.log(`Scheduled ${chords.length} chords, total duration: ${(chords.length * tempoSeconds).toFixed(2)}s`);
    }

    /**
     * Play a scale (sequence of notes)
     * @param notes Array of note names (e.g., ["C", "D", "E", "F", "G", "A", "B", "C"])
     * @param tempoMs Time between note starts in milliseconds (default 400ms)
     * @param rootSampleId Sample ID to use for pitch shifting (default 'piano_C4')
     * @param rootMidi MIDI note of the root sample (default 60 = C4)
     * @param octave Octave for note conversion (default 4)
     */
    playScale(
        notes: string[],
        tempoMs: number = 400,
        rootSampleId: string = 'piano_C4',
        rootMidi: number = 60,
        octave: number = 4
    ) {
        if (!this.context) {
            console.error('Audio context not initialized');
            return;
        }

        if (this.context.state === 'suspended') {
            this.context.resume().catch(err => {
                console.error('Failed to resume audio context:', err);
            });
        }

        if (!this.samples.has(rootSampleId)) {
            console.error(`Sample ${rootSampleId} not loaded. Available samples:`, Array.from(this.samples.keys()));
            return;
        }

        if (!notes || notes.length === 0) {
            console.error('No notes provided to playScale');
            return;
        }

        const baseDelay = 0.05;
        const tempoSeconds = tempoMs / 1000;

        notes.forEach((note, index) => {
            const noteDelay = baseDelay + (index * tempoSeconds);
            const midiNote = noteNameToMidi(note, octave);
            this.playNote(rootSampleId, midiNote, rootMidi, noteDelay);
        });
    }

    /**
     * Play a melody (sequence of notes)
     * @param notes Array of note names
     * @param tempoMs Time between note starts in milliseconds (default 400ms)
     * @param rootSampleId Sample ID to use for pitch shifting (default 'piano_C4')
     * @param rootMidi MIDI note of the root sample (default 60 = C4)
     * @param octave Octave for note conversion (default 4)
     */
    playMelody(
        notes: string[],
        tempoMs: number = 400,
        rootSampleId: string = 'piano_C4',
        rootMidi: number = 60,
        octave: number = 4
    ) {
        // Same implementation as playScale, just different default tempo
        this.playScale(notes, tempoMs, rootSampleId, rootMidi, octave);
    }
}

export const audioEngine = new AudioEngine();
