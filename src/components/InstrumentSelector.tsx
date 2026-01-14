import React from 'react';
import { instruments } from '../config/instruments';
import { Bell, Guitar, Music } from 'lucide-react';
import { PianoIcon } from './icons/InstrumentIcons';

interface InstrumentSelectorProps {
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

export const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
    currentInstrument,
    onSelectInstrument
}) => {
    return (
        <div className="glass-card hover:shadow-xl transition-all duration-300">
            <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-4">Instrument</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {instruments.map(instrument => {
                    const Icon = getInstrumentIcon(instrument.id);
                    const isSelected = currentInstrument === instrument.id;
                    
                    return (
                        <button
                            key={instrument.id}
                            onClick={() => onSelectInstrument(instrument.id)}
                            className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${
                                isSelected
                                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105'
                                    : 'bg-white/50 text-neutral-600 hover:bg-white/90 hover:text-neutral-900 hover:scale-[1.08] hover:shadow-lg border border-white/20 hover:border-orange-200/50'
                            }`}
                            title={instrument.description}
                        >
                            {isSelected && (
                                <div className="absolute inset-0 bg-white/20 translate-y-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            )}
                            <div className="flex flex-col items-center gap-2 relative">
                                <Icon 
                                    className={`w-6 h-6 group-hover:scale-110 transition-transform duration-300 ${
                                        isSelected ? 'text-white' : 'text-orange-600'
                                    }`} 
                                    strokeWidth={2} 
                                />
                                <span className="text-xs font-medium group-hover:scale-105 inline-block transition-transform duration-300">
                                    {instrument.name}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
