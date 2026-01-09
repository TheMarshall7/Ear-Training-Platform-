import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BrandLogoProps {
    className?: string;
    showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', showText = true }) => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 group transition-all duration-300 hover:opacity-80 ${className}`}
        >
            <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-white/20 shadow-sm group-hover:shadow-md transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lg:w-6 lg:h-6">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                </svg>
            </div>
            {showText && (
                <span className="text-sm lg:text-base font-bold text-neutral-700 tracking-tight">
                    NextStage Studios
                </span>
            )}
        </button>
    );
};
