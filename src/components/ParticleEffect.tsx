import React, { useEffect, useState, useRef } from 'react';

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    life: number;
}

interface ParticleEffectProps {
    trigger: boolean;
    count?: number;
    colors?: string[];
}

export const ParticleEffect: React.FC<ParticleEffectProps> = ({
    trigger,
    count = 30,
    colors = ['#f97316', '#fb923c', '#fdba74', '#fbbf24', '#f59e0b']
}) => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isActiveRef = useRef(false);

    useEffect(() => {
        if (!trigger) {
            // Clear any existing interval
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            isActiveRef.current = false;
            setParticles([]);
            return;
        }

        // Prevent multiple simultaneous animations
        if (isActiveRef.current) {
            return;
        }

        isActiveRef.current = true;

        const newParticles: Particle[] = [];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = 2 + Math.random() * 3;
            newParticles.push({
                id: i,
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 4 + Math.random() * 4,
                life: 1.0
            });
        }

        setParticles(newParticles);

        intervalRef.current = setInterval(() => {
            setParticles(prev => {
                if (prev.length === 0) {
                    isActiveRef.current = false;
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                    return [];
                }
                
                const updated = prev
                    .map(p => ({
                        ...p,
                        x: p.x + p.vx,
                        y: p.y + p.vy,
                        vy: p.vy + 0.2, // gravity
                        life: p.life - 0.02,
                        size: p.size * 0.98
                    }))
                    .filter(p => p.life > 0 && p.y < window.innerHeight + 50);
                
                // Clear interval if no particles left
                if (updated.length === 0) {
                    isActiveRef.current = false;
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                }
                
                return updated;
            });
        }, 16); // ~60fps

        return () => {
            isActiveRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [trigger, count]); // Removed colors from dependencies to prevent infinite loop

    if (particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-30">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${particle.x}px`,
                        top: `${particle.y}px`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: particle.color,
                        opacity: particle.life,
                        transform: `translate(-50%, -50%)`,
                        transition: 'none'
                    }}
                />
            ))}
        </div>
    );
};
