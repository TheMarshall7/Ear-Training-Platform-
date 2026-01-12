import React from 'react';
import logoImage from '../assets/logo.png';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-neutral-200/50 bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 group">
                        <img 
                            src={logoImage} 
                            alt="Logo" 
                            className="w-8 h-8 object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg drop-shadow-md"
                        />
                        <span className="text-sm font-semibold text-neutral-700">NextStage Studios</span>
                    </div>
                    <div className="text-xs text-neutral-500">
                        © {currentYear} NextStage Studios. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};
