import React, { useMemo } from 'react';
import type { ResourceItem, IntervalDirection, Difficulty } from '../../types/resources';
import { ResourcePlayerRow } from './ResourcePlayerRow';
import { ResourceFilters } from './ResourceFilters';

interface ResourceListProps {
    resources: ResourceItem[];
    category: 'scales' | 'intervals' | 'chords' | 'progressions' | 'melodies';
    intervalDirection: IntervalDirection;
    onIntervalDirectionChange: (direction: IntervalDirection) => void;
    difficultyFilter: Difficulty | 'all';
    onDifficultyFilterChange: (difficulty: Difficulty | 'all') => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export const ResourceList: React.FC<ResourceListProps> = ({
    resources,
    category,
    intervalDirection,
    onIntervalDirectionChange,
    difficultyFilter,
    onDifficultyFilterChange,
    searchQuery,
    onSearchChange
}) => {
    const filteredResources = useMemo(() => {
        let filtered = [...resources];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(resource =>
                resource.title.toLowerCase().includes(query) ||
                resource.subtitle?.toLowerCase().includes(query)
            );
        }

        // Apply difficulty filter (intervals are the only category without difficulty)
        if (difficultyFilter !== 'all' && category !== 'intervals') {
            filtered = filtered.filter(resource => resource.difficulty === difficultyFilter);
        }

        // Sort: by difficulty (easy -> medium -> hard), then alphabetically
        filtered.sort((a, b) => {
            const difficultyOrder: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
            const aDiff = a.difficulty ? difficultyOrder[a.difficulty] : 999;
            const bDiff = b.difficulty ? difficultyOrder[b.difficulty] : 999;
            
            if (aDiff !== bDiff) {
                return aDiff - bDiff;
            }
            return a.title.localeCompare(b.title);
        });

        return filtered;
    }, [resources, searchQuery, difficultyFilter]);

    // Group by difficulty if applicable, or by length for progressions
    const groupedResources = useMemo(() => {
        if (category === 'scales' || category === 'melodies' || category === 'chords') {
            const groups: Record<string, ResourceItem[]> = {
                easy: [],
                medium: [],
                hard: [],
                other: []
            };

            filteredResources.forEach(resource => {
                const key = resource.difficulty || 'other';
                if (groups[key]) {
                    groups[key].push(resource);
                } else {
                    groups.other.push(resource);
                }
            });

            return groups;
        }
        
        if (category === 'progressions') {
            // Separate cadences from regular progressions
            const cadences: ResourceItem[] = [];
            const regularProgressions: ResourceItem[] = [];
            
            filteredResources.forEach(resource => {
                if (resource.metadata?.isCadence === true) {
                    cadences.push(resource);
                } else {
                    regularProgressions.push(resource);
                }
            });
            
            // Group regular progressions by length (number of chords)
            const groups: Record<string, ResourceItem[]> = {
                'cadences': cadences,
                '2-chord': [],
                '3-chord': [],
                '4-chord': [],
                '5-chord': [],
                '6+ chord': []
            };

            regularProgressions.forEach(resource => {
                const degrees = resource.metadata?.degrees as number[] | undefined;
                if (degrees) {
                    const length = degrees.length;
                    if (length === 2) {
                        groups['2-chord'].push(resource);
                    } else if (length === 3) {
                        groups['3-chord'].push(resource);
                    } else if (length === 4) {
                        groups['4-chord'].push(resource);
                    } else if (length === 5) {
                        groups['5-chord'].push(resource);
                    } else {
                        groups['6+ chord'].push(resource);
                    }
                }
            });

            return groups;
        }
        
        return null;
    }, [filteredResources, category]);

    if (groupedResources) {
        // Render with grouped sections
        return (
            <div>
                <ResourceFilters
                    category={category}
                    intervalDirection={intervalDirection}
                    onIntervalDirectionChange={onIntervalDirectionChange}
                    difficultyFilter={difficultyFilter}
                    onDifficultyFilterChange={onDifficultyFilterChange}
                    searchQuery={searchQuery}
                    onSearchChange={onSearchChange}
                />

                <div className="space-y-6">
                    {category === 'progressions' ? (
                        <>
                            {/* Show cadences first if they exist */}
                            {groupedResources['cadences'] && groupedResources['cadences'].length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-neutral-700 mb-3">
                                        Cadential Progressions
                                    </h3>
                                    <div className="space-y-2 px-4 lg:px-0">
                                        {groupedResources['cadences'].map(resource => (
                                            <ResourcePlayerRow
                                                key={resource.id}
                                                resource={resource}
                                                intervalDirection={intervalDirection}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Then show regular progressions grouped by length */}
                            {(['2-chord', '3-chord', '4-chord', '5-chord', '6+ chord'] as const).map(groupKey => {
                                const items = groupedResources[groupKey];
                                if (items.length === 0) return null;

                                return (
                                    <div key={groupKey}>
                                        <h3 className="text-lg font-semibold text-neutral-700 mb-3">
                                            {groupKey.charAt(0).toUpperCase() + groupKey.slice(1)} Progressions
                                        </h3>
                                        <div className="space-y-2 px-4 lg:px-0">
                                            {items.map(resource => (
                                                <ResourcePlayerRow
                                                    key={resource.id}
                                                    resource={resource}
                                                    intervalDirection={intervalDirection}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        // Group by difficulty for scales, melodies, and chords
                        <>
                            {(['easy', 'medium', 'hard'] as const).map(difficulty => {
                                const items = groupedResources[difficulty];
                                if (items.length === 0) return null;

                                // Custom titles for chords category
                                let title = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
                                let subtitle = '';
                                
                                if (category === 'chords') {
                                    if (difficulty === 'easy') {
                                        title = 'Basic Triads';
                                        subtitle = 'Major, Minor, Diminished, Augmented';
                                    } else if (difficulty === 'medium') {
                                        title = '7th Chords & Extensions';
                                        subtitle = 'Maj7, Min7, Dom7, Sus, Add9';
                                    } else if (difficulty === 'hard') {
                                        title = 'Jazz Extensions & Altered Chords';
                                        subtitle = '9ths, 11ths, 13ths, Altered Dominants (♭5, ♯5, ♭9, ♯9)';
                                    }
                                }

                                return (
                                    <div key={difficulty}>
                                        <div className="mb-3">
                                            <h3 className="text-lg font-semibold text-neutral-700">
                                                {title}
                                            </h3>
                                            {subtitle && (
                                                <p className="text-sm text-neutral-500 mt-1">
                                                    {subtitle}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2 px-4 lg:px-0">
                                            {items.map(resource => (
                                                <ResourcePlayerRow
                                                    key={resource.id}
                                                    resource={resource}
                                                    intervalDirection={intervalDirection}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {groupedResources.other && groupedResources.other.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-neutral-700 mb-3">
                                        Other
                                    </h3>
                                    <div className="space-y-2 px-4 lg:px-0">
                                        {groupedResources.other.map(resource => (
                                            <ResourcePlayerRow
                                                key={resource.id}
                                                resource={resource}
                                                intervalDirection={intervalDirection}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {filteredResources.length === 0 && (
                    <div className="text-center py-12 text-neutral-500">
                        No resources found matching your filters.
                    </div>
                )}
            </div>
        );
    }

    // Render flat list
    return (
        <div>
            <ResourceFilters
                category={category}
                intervalDirection={intervalDirection}
                onIntervalDirectionChange={onIntervalDirectionChange}
                difficultyFilter={difficultyFilter}
                onDifficultyFilterChange={onDifficultyFilterChange}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
            />

            <div className="space-y-2 px-4 lg:px-0">
                {filteredResources.map(resource => (
                    <ResourcePlayerRow
                        key={resource.id}
                        resource={resource}
                        intervalDirection={intervalDirection}
                    />
                ))}
            </div>

            {filteredResources.length === 0 && (
                <div className="text-center py-12 text-neutral-500">
                    No resources found matching your filters.
                </div>
            )}
        </div>
    );
};
