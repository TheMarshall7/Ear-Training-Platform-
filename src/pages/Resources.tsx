import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ResourcesLayout } from '../components/resources/ResourcesLayout';
import { ResourceCategoryCards } from '../components/resources/ResourceCategoryCards';
import { ResourceList } from '../components/resources/ResourceList';
import { AudioStatusBanner } from '../components/resources/AudioStatusBanner';
import { CompactInstrumentSelector } from '../components/CompactInstrumentSelector';
import { getResourcesByCategory, getAllResources } from '../logic/resources';
import type { ResourceCategory, IntervalDirection, Difficulty } from '../types/resources';
import { audioEngine } from '../audio/audioEngine';
import { loadInstrument } from '../audio/sampleLoader';
import { useGame } from '../context/GameContext';

export const Resources: React.FC = () => {
    const { category } = useParams<{ category?: string }>();
    const { state, dispatch } = useGame();
    
    const [audioUnlocked, setAudioUnlocked] = useState(false);
    const [intervalDirection, setIntervalDirection] = useState<IntervalDirection>('asc');
    const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const handleInstrumentChange = async (instrumentId: string) => {
        dispatch({ type: 'SET_INSTRUMENT', payload: instrumentId });
        // Preload the new instrument
        await loadInstrument(instrumentId);
    };

    // Check audio context state and reload instrument when changed
    useEffect(() => {
        const checkAudioState = async () => {
            try {
                await audioEngine.init();
                setAudioUnlocked(true);
                // Preload instrument
                await loadInstrument(state.currentInstrument);
            } catch (error) {
                console.error('Audio initialization failed:', error);
                setAudioUnlocked(false);
            }
        };
        checkAudioState();
    }, [state.currentInstrument]); // Reload when instrument changes

    useEffect(() => {
        document.title = 'Resources - NextStage Studios';
    }, []);

    // Validate category
    const validCategory = category && ['scales', 'intervals', 'chords', 'progressions', 'melodies', 'vocalWarmups'].includes(category)
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
            description: 'Triads, 7ths, and jazz extensions',
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
        },
        {
            id: 'vocalWarmups' as ResourceCategory,
            title: 'Vocal Warm-Ups',
            description: 'Scales, patterns, and arpeggios for singers',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="22"></line>
                </svg>
            ),
            count: allResources.filter(r => r.category === 'vocalWarmups').length
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
                
                {/* Compact Instrument Selection */}
                <div className="mb-8 flex justify-center">
                    <CompactInstrumentSelector
                        currentInstrument={state.currentInstrument}
                        onSelectInstrument={handleInstrumentChange}
                    />
                </div>
                
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
            
            {/* Compact Instrument Selection */}
            <div className="mb-6 flex justify-center">
                <CompactInstrumentSelector
                    currentInstrument={state.currentInstrument}
                    onSelectInstrument={handleInstrumentChange}
                />
            </div>
            
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
