import React from 'react';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-neutral-200/50 bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-white/20 shadow-sm">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18V5l12-2v13"></path>
                                <circle cx="6" cy="18" r="3"></circle>
                                <circle cx="18" cy="16" r="3"></circle>
                            </svg>
                        </div>
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
