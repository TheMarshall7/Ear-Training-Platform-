import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ResourceCategory } from '../../types/resources';
import { BrandLogo } from '../BrandLogo';
import { AppInfo } from '../AppInfo';

interface ResourcesLayoutProps {
    children: React.ReactNode;
    category?: ResourceCategory;
}

const categories: { id: ResourceCategory; label: string }[] = [
    { id: 'scales', label: 'Scales' },
    { id: 'intervals', label: 'Intervals' },
    { id: 'chords', label: 'Chords' },
    { id: 'progressions', label: 'Progressions' },
    { id: 'melodies', label: 'Melodies' }
];

export const ResourcesLayout: React.FC<ResourcesLayoutProps> = ({ children, category }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isOverview = location.pathname === '/resources' || location.pathname === '/resources/';

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 relative flex flex-col">
            {/* Background gradient */}
            <div className="fixed inset-0 -z-0">
                <div className="absolute -translate-x-1/2 -translate-y-1/2 animate-pulse-glow bg-gradient-to-br from-orange-400/20 via-red-500/15 to-rose-600/15 opacity-60 mix-blend-multiply w-[500px] h-[500px] rounded-full top-1/4 left-1/4 blur-3xl"></div>
                <div className="absolute translate-x-1/2 translate-y-1/2 animate-pulse-glow bg-gradient-to-br from-orange-400/20 via-red-500/15 to-rose-600/15 opacity-60 mix-blend-multiply w-[500px] h-[500px] rounded-full bottom-1/4 right-1/4 blur-3xl"></div>
            </div>

            {/* Top Left Branding */}
            <div className="absolute top-6 left-4 lg:top-8 lg:left-8 z-50">
                <BrandLogo showText={false} />
            </div>

            {/* Header */}
            <div className="relative z-10 pt-20 pb-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-2">
                                Resources
                            </h1>
                            <p className="text-neutral-500 text-lg">
                                Hear how things sound before you train.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="group flex items-center gap-2 text-neutral-400 hover:text-neutral-600 font-medium text-sm transition-all duration-300 hover:gap-3"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform duration-300">
                                <path d="m12 19-7-7 7-7"></path>
                                <path d="M19 12H5"></path>
                            </svg>
                            <span>Home</span>
                        </button>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2 border-b border-neutral-200">
                        <button
                            onClick={() => navigate('/resources')}
                            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                                isOverview
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                            }`}
                        >
                            Overview
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => navigate(`/resources/${cat.id}`)}
                                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                                    category === cat.id
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-neutral-500 hover:text-neutral-700'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 px-4 pb-8">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </div>

            {/* App Info - Hidden Attribution */}
            <div className="relative z-10 pt-4 pb-6 px-4">
                <div className="max-w-6xl mx-auto flex justify-center">
                    <AppInfo />
                </div>
            </div>
        </div>
    );
};
