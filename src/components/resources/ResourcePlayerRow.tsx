import React, { useState, useEffect } from 'react';
import type { ResourceItem, IntervalDirection, ScaleDirection } from '../../types/resources';
import { audioEngine } from '../../audio/audioEngine';
import { loadInstrument, getInstrumentSampleId } from '../../audio/sampleLoader';
import { noteNameToMidi } from '../../config/harmonyRules';
import { useGame } from '../../context/GameContext';

interface ResourcePlayerRowProps {
    resource: ResourceItem;
    intervalDirection?: IntervalDirection;
    onError?: (message: string) => void;
}

/**
 * Process scale notes based on direction
 * Ensures notes ascend/descend properly without octave jumps
 */
function processScaleNotes(notes: string[], direction: ScaleDirection, baseOctave: number = 4): string[] {
    if (!notes || notes.length === 0) return notes;

    // Convert notes to MIDI values in the same octave, keeping track of original note names
    const noteMidiPairs = notes.map(note => ({
        note,
        midi: noteNameToMidi(note, baseOctave)
    }));

    let processed: typeof noteMidiPairs;

    if (direction === 'ascending') {
        // Keep original order, but ensure ascending by adjusting octaves
        const result: typeof noteMidiPairs = [];
        let currentOctave = baseOctave;
        let lastMidi = -1;
        
        noteMidiPairs.forEach((pair, index) => {
            let noteOctave = currentOctave;
            let midi = noteNameToMidi(pair.note, noteOctave);
            
            // If this note is lower than or equal to the last note, move to next octave
            if (index > 0 && midi <= lastMidi) {
                noteOctave = currentOctave + 1;
                midi = noteNameToMidi(pair.note, noteOctave);
            }
            
            result.push({ note: pair.note, midi });
            lastMidi = midi;
            currentOctave = noteOctave;
        });
        
        processed = result;
    } else if (direction === 'descending') {
        // Reverse the order, then ensure descending by adjusting octaves
        const reversed = [...noteMidiPairs].reverse();
        const result: typeof noteMidiPairs = [];
        let currentOctave = baseOctave;
        let lastMidi = 200; // Start high
        
        reversed.forEach((pair, index) => {
            let noteOctave = currentOctave;
            let midi = noteNameToMidi(pair.note, noteOctave);
            
            // If this note is higher than or equal to the last note, move to previous octave
            if (index > 0 && midi >= lastMidi) {
                noteOctave = Math.max(0, currentOctave - 1);
                midi = noteNameToMidi(pair.note, noteOctave);
            }
            
            result.push({ note: pair.note, midi });
            lastMidi = midi;
            currentOctave = noteOctave;
        });
        
        processed = result;
    } else if (direction === 'scrambled-asc') {
        // Shuffle notes, then sort ascending
        const shuffled = [...noteMidiPairs].sort(() => Math.random() - 0.5);
        processed = shuffled.sort((a, b) => {
            if (a.midi !== b.midi) return a.midi - b.midi;
            return 0;
        });
        
        // Ensure ascending order by adjusting octaves
        const result: typeof noteMidiPairs = [];
        let currentOctave = baseOctave;
        let lastMidi = -1;
        
        processed.forEach((pair, index) => {
            let noteOctave = currentOctave;
            let midi = noteNameToMidi(pair.note, noteOctave);
            
            if (index > 0 && midi <= lastMidi) {
                noteOctave = currentOctave + 1;
                midi = noteNameToMidi(pair.note, noteOctave);
            }
            
            result.push({ note: pair.note, midi });
            lastMidi = midi;
            currentOctave = noteOctave;
        });
        
        processed = result;
    } else if (direction === 'scrambled-desc') {
        // Shuffle notes, then sort descending
        const shuffled = [...noteMidiPairs].sort(() => Math.random() - 0.5);
        processed = shuffled.sort((a, b) => {
            if (a.midi !== b.midi) return b.midi - a.midi;
            return 0;
        });
        
        // Ensure descending order by adjusting octaves
        const result: typeof noteMidiPairs = [];
        let currentOctave = baseOctave;
        let lastMidi = 200;
        
        processed.forEach((pair, index) => {
            let noteOctave = currentOctave;
            let midi = noteNameToMidi(pair.note, noteOctave);
            
            if (index > 0 && midi >= lastMidi) {
                noteOctave = Math.max(0, currentOctave - 1);
                midi = noteNameToMidi(pair.note, noteOctave);
            }
            
            result.push({ note: pair.note, midi });
            lastMidi = midi;
            currentOctave = noteOctave;
        });
        
        processed = result;
    } else {
        processed = noteMidiPairs;
    }

    // Convert back to note names with octave numbers for proper playback
    // The audio engine will handle the octave from the MIDI value
    // But we need to pass notes with octave info
    return processed.map(pair => {
        // Extract base note name (without octave)
        const baseNote = pair.note.replace(/[#b]/, '').toUpperCase();
        const hasSharp = pair.note.includes('#');
        const hasFlat = pair.note.includes('b');
        const accidental = hasSharp ? '#' : (hasFlat ? 'b' : '');
        
        // Calculate octave from MIDI value (MIDI 60 = C4)
        // MIDI note 0 = C-1, so octave = floor(midi / 12) - 1
        const octave = Math.floor(pair.midi / 12) - 1;
        
        return baseNote + accidental + octave;
    });
}

export const ResourcePlayerRow: React.FC<ResourcePlayerRowProps> = ({
    resource,
    intervalDirection,
    onError
}) => {
    const { state } = useGame();
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scaleDirection, setScaleDirection] = useState<ScaleDirection>('ascending');

    useEffect(() => {
        // Reset error when resource changes
        setError(null);
        // Reset scale direction when resource changes
        setScaleDirection('ascending');
    }, [resource.id]);

    const playResource = async () => {
        if (isPlaying) return;

        try {
            setIsPlaying(true);
            setError(null);

            // Initialize audio and load sample
            await audioEngine.init();
            await loadInstrument('piano');
            await new Promise(resolve => setTimeout(resolve, 100));

            const playSpec = resource.playSpec;

            // Handle different playSpec types
            if (playSpec.type === 'noteSequence' && playSpec.notes) {
                // For scales, process notes based on selected direction
                if (resource.category === 'scales') {
                    const processedNotes = processScaleNotes(playSpec.notes, scaleDirection, 4);
                    // Play notes individually with their specific octaves
                    const baseDelay = 0.05;
                    const tempoSeconds = playSpec.tempoMs / 1000;
                    
                    processedNotes.forEach((noteWithOctave, index) => {
                        // Parse note with octave (e.g., "C4" or "C#4")
                        const match = noteWithOctave.match(/^([A-G])([#b]?)(\d+)$/);
                        if (match) {
                            const [, baseNote, accidental, octaveStr] = match;
                            const noteName = baseNote + accidental;
                            const octave = parseInt(octaveStr, 10);
                            const midiNote = noteNameToMidi(noteName, octave);
                            const noteDelay = baseDelay + (index * tempoSeconds);
                            const sampleId = getInstrumentSampleId(state.currentInstrument);
                            audioEngine.playNote(sampleId, midiNote, 60, noteDelay);
                        }
                    });
                    
                    const duration = processedNotes.length * playSpec.tempoMs;
                    setTimeout(() => setIsPlaying(false), duration + 200);
                } else {
                    // For non-scales, use normal playback
                    const sampleId = getInstrumentSampleId(state.currentInstrument);
                    audioEngine.playNoteSequence(
                        playSpec.notes,
                        playSpec.tempoMs,
                        sampleId,
                        60,
                        4
                    );
                    // Estimate duration
                    const duration = playSpec.notes.length * playSpec.tempoMs;
                    setTimeout(() => setIsPlaying(false), duration + 200);
                }
            } else if (playSpec.type === 'interval') {
                const direction = intervalDirection || playSpec.direction || 'asc';
                const root = playSpec.root || 'C4';
                const semitones = playSpec.semitones || 0;
                audioEngine.playInterval(root, semitones, direction, playSpec.tempoMs);
                setTimeout(() => setIsPlaying(false), playSpec.tempoMs * 2 + 200);
            } else if (playSpec.type === 'chord' && playSpec.notes) {
                const sampleId = getInstrumentSampleId(state.currentInstrument);
                audioEngine.playChord(playSpec.notes, sampleId, 60);
                setTimeout(() => setIsPlaying(false), 1000);
            } else if (playSpec.type === 'chordSequence' && playSpec.chords) {
                // Convert chord notes to MIDI arrays
                const midiChords = playSpec.chords.map(chord => {
                    return chord.notes.map(note => {
                        const match = note.match(/^([A-G])([#b]?)(\d+)$/);
                        if (!match) return 60; // Fallback to C4
                        const [, baseNote, accidental, octaveStr] = match;
                        const noteName = baseNote + accidental;
                        return noteNameToMidi(noteName, parseInt(octaveStr, 10));
                    });
                });
                const sampleId = getInstrumentSampleId(state.currentInstrument);
                audioEngine.playChordSequence(midiChords, playSpec.tempoMs, sampleId, 60);
                const duration = playSpec.chords.length * playSpec.tempoMs;
                setTimeout(() => setIsPlaying(false), duration + 200);
            } else {
                throw new Error('Invalid playSpec type or missing data');
            }
        } catch (err) {
            console.error('Error playing resource:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to play audio';
            setError(errorMessage);
            if (onError) {
                onError(errorMessage);
            }
            setIsPlaying(false);
        }
    };

    const difficultyColor = {
        easy: 'bg-green-100 text-green-700',
        medium: 'bg-yellow-100 text-yellow-700',
        hard: 'bg-red-100 text-red-700'
    };

    const isScale = resource.category === 'scales';

    return (
        <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-neutral-200/50 hover:border-orange-300/50 transition-all">
            <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-neutral-900 truncate">
                            {resource.title}
                        </h3>
                        {resource.difficulty && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${difficultyColor[resource.difficulty]}`}>
                                {resource.difficulty}
                            </span>
                        )}
                    </div>
                    {resource.subtitle && (
                        <p className="text-sm text-neutral-500 truncate">
                            {resource.subtitle}
                        </p>
                    )}
                    {error && (
                        <p className="text-xs text-red-600 mt-1">
                            {error}
                        </p>
                    )}
                </div>
                <button
                    onClick={playResource}
                    disabled={isPlaying}
                    className={`ml-4 px-6 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
                        isPlaying
                            ? 'bg-orange-300 text-white cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg'
                    }`}
                >
                    {isPlaying ? 'Playing...' : 'Play'}
                </button>
            </div>
            
            {/* Scale direction tabs */}
            {isScale && (
                <div className="flex gap-2 mt-3 flex-wrap">
                    <button
                        onClick={() => setScaleDirection('ascending')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            scaleDirection === 'ascending'
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'bg-white/80 text-neutral-600 hover:bg-white border border-neutral-200/50'
                        }`}
                    >
                        Ascending
                    </button>
                    <button
                        onClick={() => setScaleDirection('descending')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            scaleDirection === 'descending'
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'bg-white/80 text-neutral-600 hover:bg-white border border-neutral-200/50'
                        }`}
                    >
                        Descending
                    </button>
                    <button
                        onClick={() => setScaleDirection('scrambled-asc')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            scaleDirection === 'scrambled-asc'
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'bg-white/80 text-neutral-600 hover:bg-white border border-neutral-200/50'
                        }`}
                    >
                        Random ↑
                    </button>
                    <button
                        onClick={() => setScaleDirection('scrambled-desc')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            scaleDirection === 'scrambled-desc'
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'bg-white/80 text-neutral-600 hover:bg-white border border-neutral-200/50'
                        }`}
                    >
                        Random ↓
                    </button>
                </div>
            )}
        </div>
    );
};
