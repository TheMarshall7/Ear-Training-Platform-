import React, { useState, useEffect } from 'react';
import type { ResourceItem, IntervalDirection } from '../../types/resources';
import { audioEngine } from '../../audio/audioEngine';
import { loadInstrument } from '../../audio/sampleLoader';
import { noteNameToMidi } from '../../config/harmonyRules';

interface ResourcePlayerRowProps {
    resource: ResourceItem;
    intervalDirection?: IntervalDirection;
    onError?: (message: string) => void;
}

export const ResourcePlayerRow: React.FC<ResourcePlayerRowProps> = ({
    resource,
    intervalDirection,
    onError
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Reset error when resource changes
        setError(null);
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
                audioEngine.playNoteSequence(
                    playSpec.notes,
                    playSpec.tempoMs,
                    'piano_C4',
                    60,
                    4
                );
                // Estimate duration
                const duration = playSpec.notes.length * playSpec.tempoMs;
                setTimeout(() => setIsPlaying(false), duration + 200);
            } else if (playSpec.type === 'interval') {
                const direction = intervalDirection || playSpec.direction || 'asc';
                const root = playSpec.root || 'C4';
                const semitones = playSpec.semitones || 0;
                audioEngine.playInterval(root, semitones, direction, playSpec.tempoMs);
                setTimeout(() => setIsPlaying(false), playSpec.tempoMs * 2 + 200);
            } else if (playSpec.type === 'chord' && playSpec.notes) {
                audioEngine.playChord(playSpec.notes, 'piano_C4', 60);
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
                audioEngine.playChordSequence(midiChords, playSpec.tempoMs, 'piano_C4', 60);
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

    return (
        <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-neutral-200/50 hover:border-orange-300/50 transition-all">
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
    );
};
