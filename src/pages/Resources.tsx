import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ResourcesLayout } from '../components/resources/ResourcesLayout';
import { ResourceCategoryCards } from '../components/resources/ResourceCategoryCards';
import { ResourceList } from '../components/resources/ResourceList';
import { AudioStatusBanner } from '../components/resources/AudioStatusBanner';
import { getResourcesByCategory, getAllResources } from '../logic/resources';
import type { ResourceCategory, IntervalDirection, Difficulty } from '../types/resources';
import { audioEngine } from '../audio/audioEngine';
import { loadInstrument } from '../audio/sampleLoader';

export const Resources: React.FC = () => {
    const { category } = useParams<{ category?: string }>();
    
    const [audioUnlocked, setAudioUnlocked] = useState(false);
    const [intervalDirection, setIntervalDirection] = useState<IntervalDirection>('asc');
    const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Check audio context state
    useEffect(() => {
        const checkAudioState = async () => {
            try {
                await audioEngine.init();
                setAudioUnlocked(true);
                // Preload instrument
                await loadInstrument('piano');
            } catch (error) {
                console.error('Audio initialization failed:', error);
                setAudioUnlocked(false);
            }
        };
        checkAudioState();
    }, []);

    // Validate category
    const validCategory = category && ['scales', 'intervals', 'chords', 'progressions', 'melodies'].includes(category)
        ? category as ResourceCategory
        : undefined;

    // Get resources
    const resources = validCategory ? getResourcesByCategory(validCategory) : [];
    const allResources = getAllResources();

    // Category cards data
    const categoryCards = [
        {
            id: 'scales' as ResourceCategory,
            title: 'Scales',
            description: 'Major, minor, and modal scales',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                </svg>
            ),
            count: allResources.filter(r => r.category === 'scales').length
        },
        {
            id: 'intervals' as ResourceCategory,
            title: 'Intervals',
            description: 'Ascending and descending intervals',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                </svg>
            ),
            count: allResources.filter(r => r.category === 'intervals').length
        },
        {
            id: 'chords' as ResourceCategory,
            title: 'Chords',
            description: 'Major, minor, and other chord types',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                </svg>
            ),
            count: allResources.filter(r => r.category === 'chords').length
        },
        {
            id: 'progressions' as ResourceCategory,
            title: 'Progressions',
            description: 'Common chord progressions',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                </svg>
            ),
            count: allResources.filter(r => r.category === 'progressions').length
        },
        {
            id: 'melodies' as ResourceCategory,
            title: 'Melodies',
            description: 'Melodic patterns and phrases',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                </svg>
            ),
            count: allResources.filter(r => r.category === 'melodies').length
        }
    ];

    // Render overview
    if (!validCategory) {
        return (
            <ResourcesLayout>
                <AudioStatusBanner
                    isUnlocked={audioUnlocked}
                    onUnlock={() => setAudioUnlocked(true)}
                />
                <ResourceCategoryCards categories={categoryCards} />
                
                {/* Quick Tips */}
                <div className="mt-12 card bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/50">
                    <h3 className="font-semibold text-neutral-900 mb-3">Quick Tips</h3>
                    <ul className="space-y-2 text-sm text-neutral-700">
                        <li className="flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>Best results: 20 minutes daily.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>Replay and compare similar sounds.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>Start with Easy, move up when consistent.</span>
                        </li>
                    </ul>
                </div>
            </ResourcesLayout>
        );
    }

    // Render category view
    return (
        <ResourcesLayout category={validCategory}>
            <AudioStatusBanner
                isUnlocked={audioUnlocked}
                onUnlock={() => setAudioUnlocked(true)}
            />
            <ResourceList
                resources={resources}
                category={validCategory}
                intervalDirection={intervalDirection}
                onIntervalDirectionChange={setIntervalDirection}
                difficultyFilter={difficultyFilter}
                onDifficultyFilterChange={setDifficultyFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />
        </ResourcesLayout>
    );
};
