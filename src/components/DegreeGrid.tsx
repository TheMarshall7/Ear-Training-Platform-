import React from 'react';

interface DegreeGridProps {
    onSelect: (degree: number) => void;
    disabled: boolean;
    selectedDegrees: number[];
    correctDegrees: number[] | null; // Full correct sequence (for showing after resolution)
    wrongAtStep: number | null; // Step index where user went wrong
}

export const DegreeGrid: React.FC<DegreeGridProps> = ({
    onSelect,
    disabled,
    selectedDegrees,
    correctDegrees,
    wrongAtStep
}) => {
    const degrees = [1, 2, 3, 4, 5, 6, 7];

    const getDegreeStatus = (degree: number): string => {
        // If we have a wrong step, show feedback for the correct answer
        if (wrongAtStep !== null && correctDegrees) {
            // Find if this degree appears at the wrong step or in correct answer
            const correctAtWrongStep = correctDegrees[wrongAtStep] === degree;
            const userAtWrongStep = selectedDegrees[wrongAtStep] === degree;
            
            if (correctAtWrongStep) {
                return 'bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-400 text-green-700 font-bold shadow-lg shadow-green-500/20';
            }
            if (userAtWrongStep) {
                return 'bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-300 text-red-600 shadow-md';
            }
        }

        // Normal state: highlight if this degree is in the selected sequence
        // Check if this degree is the next expected one (for visual feedback)
        const isSelected = selectedDegrees.includes(degree);
        const lastSelected = selectedDegrees[selectedDegrees.length - 1];
        
        if (isSelected && degree === lastSelected) {
            // Most recently selected
            return 'bg-gradient-to-br from-orange-500 to-orange-600 border-2 border-orange-500 text-white font-bold shadow-lg shadow-orange-500/30';
        }

        return 'bg-white/80 backdrop-blur-sm border-2 border-white/20 text-neutral-700 hover:border-orange-400 hover:text-orange-600 hover:bg-white/90 shadow-sm';
    };

    return (
        <div className="grid grid-cols-4 md:grid-cols-4 gap-3 lg:gap-4 w-full max-w-md mx-auto p-4">
            {degrees.map((degree) => (
                <button
                    key={degree}
                    onClick={() => onSelect(degree)}
                    disabled={disabled}
                    className={`
                        h-16 lg:h-20 rounded-2xl text-xl lg:text-2xl font-bold transition-all duration-300
                        ${getDegreeStatus(degree)}
                        disabled:cursor-not-allowed disabled:opacity-50
                        active:scale-95 hover:scale-105
                    `}
                >
                    {degree}
                </button>
            ))}
        </div>
    );
};
