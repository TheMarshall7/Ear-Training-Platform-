import React from 'react';
import type { LucideProps } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ComponentType<LucideProps>;
    subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, subtitle }) => {
    return (
        <div className="glass-card">
            <div className="flex items-start justify-between mb-3">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                    {title}
                </div>
                {Icon && (
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200/50">
                        <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" strokeWidth={2} />
                    </div>
                )}
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-1 tracking-tight">
                {value}
            </div>
            {subtitle && (
                <div className="text-xs text-neutral-500 mt-2">
                    {subtitle}
                </div>
            )}
        </div>
    );
};
