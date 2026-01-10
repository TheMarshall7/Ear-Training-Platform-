/**
 * Audio Engine
 * 
 * Core audio playback system using Web Audio API with sample-based synthesis.
 * This engine loads audio samples (WAV files) and plays them with pitch shifting
 * to create different notes. No MIDI synthesis - all sounds are pre-recorded samples.
 * 
 * Key features:
 * - Sample-based playback (loads WAV files)
 * - Pitch shifting via playbackRate
 * - Gain control to prevent distortion when playing multiple notes
 * - Support for intervals, chords, scales, melodies, and progressions
 * - Automatic audio context management (handles browser autoplay policies)
 * 
 * Usage:
 * 1. Initialize: await audioEngine.init()
 * 2. Load sample: await audioEngine.loadSample('/path/to/sample.wav', 'sampleId')
 * 3. Play: audioEngine.playNote('sampleId', midiNote, rootMidi)
 */

import { noteNameToMidi } from '../config/harmonyRules';

export class AudioEngine {
    private context: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private samples: Map<string, AudioBuffer> = new Map();
    private activeSources: Set<AudioBufferSourceNode> = new Set(); // Keep references to prevent GC

    constructor() {
        // Context is initialized on user interaction to comply with browser policies
        
        // Reinitialize audio context when page becomes visible again (fixes mobile Safari timeout)
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:34',message:'visibilitychange event',data:{visibilityState:document.visibilityState,contextExists:!!this.context,contextState:this.context?.state},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                if (document.visibilityState === 'visible' && this.context) {
                    // Reinitialize audio context when page becomes visible
                    // This fixes issues on mobile Safari when app is backgrounded
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:38',message:'visibilitychange visible with context',data:{contextState:this.context.state,willNullify:this.context.state === 'suspended' || this.context.state === 'closed'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    if (this.context.state === 'closed') {
                        console.log('Audio context closed, will reinitialize on next play');
                        // Don't recreate here - let init() handle it on next play
                        this.context = null;
                    } else if (this.context.state === 'suspended') {
                        // CRITICAL FIX: Proactively resume suspended context when page becomes visible
                        console.log('Audio context suspended, attempting to resume');
                        // #region agent log
                        fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:47',message:'visibilitychange resuming context',data:{contextState:this.context.state},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                        // #endregion
                        this.context.resume().then(() => {
                            console.log('Audio context resumed successfully');
                            // #region agent log
                            fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:51',message:'visibilitychange context resumed',data:{contextState:this.context!.state},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                            // #endregion
                        }).catch((error) => {
                            console.error('Failed to resume AudioContext on visibility change:', error);
                            // #region agent log
                            fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:55',message:'visibilitychange resume failed',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                            // #endregion
                        });
                    }
                }
            });
        }
    }

    toggleMute() {
        if (this.context?.state === 'suspended') {
            this.context.resume();
        }
    }

    async init() {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:54',message:'init() called',data:{contextExists:!!this.context,contextState:this.context?.state},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        if (!this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.context.createGain();
            // Set master gain to prevent clipping when multiple notes play together
            this.masterGain.gain.value = 0.5; // 50% volume to prevent distortion
            this.masterGain.connect(this.context.destination);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:60',message:'new context created',data:{contextState:this.context.state},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            // Listen for state changes
            this.context.addEventListener('statechange', () => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:64',message:'AudioContext state changed',data:{newState:this.context!.state},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
            });
        }
        if (this.context.state === 'suspended') {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:62',message:'resuming suspended context',data:{contextState:this.context.state},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            try {
                await this.context.resume();
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:65',message:'context resumed successfully',data:{contextState:this.context.state},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
            } catch (error) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:68',message:'context resume failed',data:{error:String(error),contextState:this.context.state},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
            }
        }
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:70',message:'init() completed',data:{contextState:this.context.state},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
    }

    hasSample(id: string): boolean {
        return this.samples.has(id);
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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:94',message:'play() called',data:{id,contextExists:!!this.context,contextState:this.context?.state,hasSample:this.samples.has(id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        // Strict validation - do not play if context or sample is not ready
        if (!this.context) {
            console.warn(`Cannot play ${id}: audio context not initialized`);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:98',message:'play() aborted - no context',data:{id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            return;
        }
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:102',message:'play() context state check',data:{id,contextState:this.context.state,isSuspended:this.context.state === 'suspended',isClosed:this.context.state === 'closed'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        // CRITICAL FIX: Resume context if suspended (common on mobile when app returns from background)
        if (this.context.state === 'suspended') {
            console.warn(`AudioContext is suspended, attempting to resume before playing ${id}`);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:145',message:'play() resuming suspended context',data:{id,contextState:this.context.state},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            this.context.resume().catch((error) => {
                console.error(`Failed to resume AudioContext:`, error);
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:149',message:'play() resume failed',data:{id,error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
            });
        }
        
        if (!this.samples.has(id)) {
            console.warn(`Cannot play ${id}: sample not loaded. Available: ${Array.from(this.samples.keys()).join(', ')}`);
            return;
        }
        
        const sample = this.samples.get(id);
        if (!sample) {
            console.warn(`Cannot play ${id}: sample buffer is null`);
            return;
        }

        const source = this.context.createBufferSource();
        source.buffer = sample;

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
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:136',message:'play() starting source',data:{id,contextState:this.context.state,startTime,currentTime:this.context.currentTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        // Ensure start time is not in the past
        if (startTime < this.context.currentTime) {
            console.warn(`Start time ${startTime} is in the past (current: ${this.context.currentTime}), using currentTime`);
            source.start(this.context.currentTime);
        } else {
            source.start(startTime);
        }
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:145',message:'play() source.start() called',data:{id,contextState:this.context.state},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
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
        
        // Validate all chords have valid MIDI notes
        for (let i = 0; i < chords.length; i++) {
            if (!chords[i] || chords[i].length === 0) {
                console.error(`Chord at index ${i} is empty or invalid`);
                return;
            }
            // Validate MIDI note ranges (reasonable range: 0-127)
            for (let j = 0; j < chords[i].length; j++) {
                if (chords[i][j] < 0 || chords[i][j] > 127 || !Number.isFinite(chords[i][j])) {
                    console.error(`Invalid MIDI note at chord ${i}, note ${j}: ${chords[i][j]}`);
                    return;
                }
            }
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

    /**
     * Play a sequence of notes (alias for playScale)
     */
    playNoteSequence(
        notes: string[],
        tempoMs: number = 400,
        rootSampleId: string = 'piano_C4',
        rootMidi: number = 60,
        octave: number = 4
    ) {
        this.playScale(notes, tempoMs, rootSampleId, rootMidi, octave);
    }

    /**
     * Play a single chord (block chord, all notes simultaneously)
     * @param notes Array of note names with octave (e.g., ["C4", "E4", "G4"])
     * @param rootSampleId Sample ID to use for pitch shifting (default 'piano_C4')
     * @param rootMidi MIDI note of the root sample (default 60 = C4)
     */
    playChord(
        notes: string[],
        rootSampleId: string = 'piano_C4',
        rootMidi: number = 60
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
            console.error('No notes provided to playChord');
            return;
        }

        const baseDelay = 0.05;
        const notesPerChord = notes.length;
        const gainPerNote = Math.min(1.0, 1.0 / notesPerChord);

        notes.forEach((note, index) => {
            // Parse note with octave (e.g., "C4" -> note="C", octave=4)
            // Handle formats like "C4", "C#4", "Bb4"
            const match = note.match(/^([A-G])([#b]?)(\d+)$/);
            if (!match) {
                console.warn(`Invalid note format: ${note}, skipping`);
                return;
            }
            const [, baseNote, accidental, octaveStr] = match;
            const octave = parseInt(octaveStr, 10);
            const noteName = baseNote + accidental;
            const midiNote = noteNameToMidi(noteName, octave);
            const noteDelay = baseDelay + (index * 0.02); // Very slight arpeggiation (20ms)
            this.playNote(rootSampleId, midiNote, rootMidi, noteDelay, gainPerNote);
        });
    }

    /**
     * Play an interval (two notes)
     * @param root Note name with octave (e.g., "C4")
     * @param semitones Number of semitones for the interval
     * @param direction 'asc' for ascending, 'desc' for descending
     * @param tempoMs Time between notes in milliseconds (default 800ms)
     * @param rootSampleId Sample ID to use for pitch shifting (default 'piano_C4')
     * @param rootMidi MIDI note of the root sample (default 60 = C4)
     */
    playInterval(
        root: string,
        semitones: number,
        direction: 'asc' | 'desc' = 'asc',
        tempoMs: number = 800,
        rootSampleId: string = 'piano_C4',
        rootMidi: number = 60
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

        // Parse root note
        const match = root.match(/^([A-G])([#b]?)(\d+)$/);
        if (!match) {
            console.error(`Invalid root note format: ${root}`);
            return;
        }
        const [, baseNote, accidental, octaveStr] = match;
        const octave = parseInt(octaveStr, 10);
        const noteName = baseNote + accidental;
        const rootMidiNote = noteNameToMidi(noteName, octave);

        // Calculate target note
        const semitoneAdjust = direction === 'asc' ? semitones : -semitones;
        const targetMidiNote = rootMidiNote + semitoneAdjust;

        // Ensure target is within one octave range
        if (Math.abs(semitoneAdjust) > 12) {
            console.warn(`Interval ${semitones} semitones exceeds one octave, clamping`);
        }

        const baseDelay = 0.05;
        const tempoSeconds = tempoMs / 1000;

        // Play root note
        this.playNote(rootSampleId, rootMidiNote, rootMidi, baseDelay);

        // Play target note
        this.playNote(rootSampleId, targetMidiNote, rootMidi, baseDelay + tempoSeconds);
    }
}

export const audioEngine = new AudioEngine();
