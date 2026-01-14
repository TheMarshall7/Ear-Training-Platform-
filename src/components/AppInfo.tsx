/**
 * App Info Component
 * 
 * Displays app information in a premium translucent popup on hover.
 * Matches the site's glass-card styling with gradient accents.
 */

import React, { useState } from 'react';
import logoImage from '../assets/logo.png';

export const AppInfo: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="relative inline-block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button className="text-xs text-neutral-400 hover:text-orange-500 transition-all duration-300 cursor-default font-medium tracking-wide">
                App Info
            </button>
            
            {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-5 bg-gradient-to-b from-white/90 via-white/70 to-white/60 backdrop-blur-2xl rounded-2xl border border-white/30 shadow-2xl z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {/* Premium gradient accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500/40 via-red-500/30 to-rose-500/40 rounded-t-2xl"></div>
                    
                    {/* Subtle gradient overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 rounded-2xl pointer-events-none"></div>
                    
                    {/* Logo in top right corner */}
                    <div className="absolute top-3 right-3 z-10">
                        <img 
                            src={logoImage} 
                            alt="Logo" 
                            className="w-10 h-10 object-contain opacity-90 drop-shadow-md"
                        />
                    </div>
                    
                    <div className="relative text-xs text-neutral-700 space-y-3">
                        <div className="mb-3 pb-3 border-b border-neutral-200/40">
                            <div className="font-bold text-base text-neutral-900 tracking-tight mb-1">
                                Master Your Ear
                            </div>
                            <div className="text-xs text-neutral-500 font-medium">
                                Ear Training Platform
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2">
                                <span className="text-neutral-500 font-medium min-w-[80px]">Version:</span>
                                <span className="text-neutral-800 font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">1.0</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-neutral-500 font-medium min-w-[80px]">Created by:</span>
                                <span className="text-neutral-800 font-semibold">Brian Marshall</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-neutral-500 font-medium min-w-[80px]">Hosted by:</span>
                                <span className="text-neutral-800 font-semibold">Next Stage Studios</span>
                            </div>
                        </div>
                        <div className="pt-3 mt-3 border-t border-neutral-200/40">
                            <div className="text-neutral-500 text-[10px] leading-relaxed">
                                <div className="font-medium text-neutral-600 mb-1">Built with:</div>
                                <div className="font-mono text-[9px] tracking-wider bg-gradient-to-r from-neutral-600 to-neutral-500 bg-clip-text text-transparent">
                                    React 19.2 • Vite 7.2 • TypeScript 5.9
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Premium arrow pointing down with gradient */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                        <div className="w-3 h-3 bg-gradient-to-br from-white/90 via-white/70 to-white/60 border-r border-b border-white/30 rotate-45 shadow-lg"></div>
                    </div>
                </div>
            )}
        </div>
    );
};
