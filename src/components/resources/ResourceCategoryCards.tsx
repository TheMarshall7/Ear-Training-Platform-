import React from 'react';
import type { ResourceCategory } from '../../types/resources';
import { useNavigate } from 'react-router-dom';

interface CategoryCard {
    id: ResourceCategory;
    title: string;
    description: string;
    icon: React.ReactNode;
    count: number;
}

interface ResourceCategoryCardsProps {
    categories: CategoryCard[];
}

export const ResourceCategoryCards: React.FC<ResourceCategoryCardsProps> = ({ categories }) => {
    const navigate = useNavigate();

    const handleCategoryClick = (categoryId: ResourceCategory) => {
        navigate(`/resources/${categoryId}`);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
                <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="card hover:shadow-xl transition-all duration-300 text-left group hover:border-orange-300/50"
                >
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-200 transition-colors">
                            {category.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-neutral-900 mb-1 group-hover:text-orange-600 transition-colors">
                                {category.title}
                            </h3>
                            <p className="text-sm text-neutral-500 mb-2">
                                {category.description}
                            </p>
                            <p className="text-xs text-neutral-400">
                                {category.count} {category.count === 1 ? 'item' : 'items'}
                            </p>
                        </div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-neutral-400 group-hover:text-orange-500 transition-colors flex-shrink-0"
                        >
                            <path d="m9 18 6-6-6-6"></path>
                        </svg>
                    </div>
                </button>
            ))}
        </div>
    );
};
