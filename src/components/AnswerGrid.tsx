import React from 'react';

interface Option {
    id: string;
    name: string;
}

interface AnswerGridProps {
    options: Option[];
    onSelect: (id: string) => void;
    disabled: boolean;
    correctId?: string | null;
    selectedId?: string | null;
}

export const AnswerGrid: React.FC<AnswerGridProps> = ({
    options,
    onSelect,
    disabled,
    correctId,
    selectedId
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mx-auto p-4">
            {options.map((option) => {
                let statusClass = "bg-white/80 backdrop-blur-sm border-2 border-white/20 text-neutral-700 hover:border-orange-400 hover:text-orange-600 hover:bg-white/90 shadow-sm";

                if (selectedId === option.id) {
                    if (correctId === option.id) {
                        statusClass = "bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-400 text-green-700 font-bold shadow-lg shadow-green-500/20";
                    } else if (correctId !== null) {
                        statusClass = "bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-300 text-red-600 shadow-md";
                    } else {
                        // Selected but not validated yet (immediate feedback usually comes with validation)
                        statusClass = "bg-white/90 border-2 border-orange-400 text-orange-600 font-semibold shadow-md";
                    }
                }

                // Show correct answer if wrong one was picked
                if (selectedId && correctId === option.id && selectedId !== option.id) {
                    statusClass = "bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-300 text-green-700 shadow-md";
                }

                return (
                    <button
                        key={option.id}
                        onClick={() => onSelect(option.id)}
                        disabled={disabled}
                        className={`
              h-16 lg:h-20 rounded-2xl text-base lg:text-lg font-medium transition-all duration-300
              ${statusClass}
              disabled:cursor-not-allowed disabled:transform-none
              active:scale-95 hover:scale-105
            `}
                    >
                        {option.name}
                    </button>
                );
            })}
        </div>
    );
};
