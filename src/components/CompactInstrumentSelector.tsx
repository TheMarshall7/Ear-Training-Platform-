import React from 'react';
import { instruments } from '../config/instruments';
import { Bell, Guitar, Music } from 'lucide-react';
import { PianoIcon } from './icons/InstrumentIcons';

interface CompactInstrumentSelectorProps {
    currentInstrument: string;
    onSelectInstrument: (instrumentId: string) => void;
}

const getInstrumentIcon = (id: string) => {
    switch (id) {
        case 'bell':
            return Bell;
        case 'guitar':
            return Guitar;
        case 'bass':
            return Music;
        case 'piano':
        default:
            return PianoIcon;
    }
};

export const CompactInstrumentSelector: React.FC<CompactInstrumentSelectorProps> = ({
    currentInstrument,
    onSelectInstrument
}) => {
    return (
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-2 border border-white/40 shadow-sm hover:shadow-md transition-all duration-300">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider px-2">
                Sound
            </span>
            <div className="flex items-center gap-1">
                {instruments.map(instrument => {
                    const Icon = getInstrumentIcon(instrument.id);
                    const isSelected = currentInstrument === instrument.id;
                    
                    return (
                        <button
                            key={instrument.id}
                            onClick={() => onSelectInstrument(instrument.id)}
                            className={`group relative rounded-full p-2 transition-all duration-300 ${
                                isSelected
                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                                    : 'bg-transparent text-neutral-400 hover:bg-white/80 hover:text-orange-600 hover:scale-110'
                            }`}
                            title={instrument.name}
                        >
                            <Icon 
                                className="w-4 h-4 transition-transform duration-300" 
                                strokeWidth={2.5} 
                            />
                            {isSelected && (
                                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
