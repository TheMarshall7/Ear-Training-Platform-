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

        // Apply difficulty filter
        if (difficultyFilter !== 'all') {
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

    // Group by difficulty if applicable
    const groupedResources = useMemo(() => {
        if (category === 'scales' || category === 'melodies') {
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
        return null;
    }, [filteredResources, category]);

    if (groupedResources) {
        // Render with collapsible difficulty sections
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
                    {(['easy', 'medium', 'hard'] as const).map(difficulty => {
                        const items = groupedResources[difficulty];
                        if (items.length === 0) return null;

                        return (
                            <div key={difficulty}>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-3 capitalize">
                                    {difficulty}
                                </h3>
                                <div className="space-y-2">
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

                    {groupedResources.other.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-700 mb-3">
                                Other
                            </h3>
                            <div className="space-y-2">
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

            <div className="space-y-2">
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
