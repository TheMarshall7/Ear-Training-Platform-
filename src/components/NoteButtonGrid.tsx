import React from 'react';

interface NoteButtonGridProps {
    notes: string[];
    onSelect: (note: string) => void;
    disabled: boolean;
    selectedNote?: string | null;
    correctNote?: string | null;
}

export const NoteButtonGrid: React.FC<NoteButtonGridProps> = ({
    notes,
    onSelect,
    disabled,
    selectedNote,
    correctNote
}) => {
    return (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-2xl mx-auto p-4">
            {notes.map((note) => {
                let statusClass = "bg-white/80 backdrop-blur-sm border-2 border-white/20 text-neutral-700 hover:border-orange-400 hover:text-orange-600 hover:bg-white/90 shadow-sm";

                if (selectedNote === note) {
                    if (correctNote === note) {
                        statusClass = "bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-400 text-green-700 font-bold shadow-lg shadow-green-500/20";
                    } else if (correctNote !== null) {
                        statusClass = "bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-300 text-red-600 shadow-md";
                    } else {
                        statusClass = "bg-white/90 border-2 border-orange-400 text-orange-600 font-semibold shadow-md";
                    }
                }

                // Show correct answer if wrong one was picked
                if (selectedNote && correctNote === note && selectedNote !== note) {
                    statusClass = "bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-300 text-green-700 shadow-md";
                }

                return (
                    <button
                        key={note}
                        onClick={() => onSelect(note)}
                        disabled={disabled}
                        className={`
                            h-16 lg:h-20 rounded-2xl text-xl lg:text-2xl font-bold transition-all duration-300
                            ${statusClass}
                            disabled:cursor-not-allowed disabled:transform-none
                            active:scale-95 hover:scale-105
                        `}
                    >
                        {note}
                    </button>
                );
            })}
        </div>
    );
};
