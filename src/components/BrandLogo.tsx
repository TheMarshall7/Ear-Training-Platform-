import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../assets/logo.png';

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
            <img 
                src={logoImage} 
                alt="Logo" 
                className="w-8 h-8 lg:w-10 lg:h-10 object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg drop-shadow-md"
            />
            {showText && (
                <span className="text-sm lg:text-base font-bold text-neutral-700 tracking-tight">
                    NextStage Studios
                </span>
            )}
        </button>
    );
};
