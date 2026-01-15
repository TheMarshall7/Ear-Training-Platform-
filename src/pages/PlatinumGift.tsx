/**
 * Platinum Gift Page
 * 
 * Premium celebration page for the Mystery Platinum Gift achievement.
 * Displays when user unlocks all achievements.
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Gift, Star, Zap, Medal } from 'lucide-react';

export const PlatinumGift: React.FC = () => {
    const navigate = useNavigate();
    const [showContent, setShowContent] = useState(false);
    const confettiRef = useRef<HTMLDivElement>(null);
    const [confettiParticles, setConfettiParticles] = useState<Array<{
        id: number;
        x: number;
        y: number;
        color: string;
        rotation: number;
        size: number;
        delay: number;
    }>>([]);

    useEffect(() => {
        // Delay content reveal for dramatic effect
        const timer = setTimeout(() => setShowContent(true), 500);
        
        // Generate confetti particles
        const particles = Array.from({ length: 150 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: -10 - Math.random() * 20,
            color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FF69B4', '#9370DB', '#FFD700', '#FFA500'][Math.floor(Math.random() * 10)],
            rotation: Math.random() * 360,
            size: 4 + Math.random() * 8,
            delay: Math.random() * 2
        }));
        setConfettiParticles(particles);
        
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        document.title = 'Platinum Gift - NextStage Studios';
    }, []);

    const handleRedeem = () => {
        window.open('https://nextstage-music.com/', '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 relative overflow-hidden flex items-center justify-center p-4">
            {/* Subtle background stars */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white/40 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${1 + Math.random() * 2}px`,
                            height: `${1 + Math.random() * 2}px`
                        }}
                    />
                ))}
            </div>

            {/* Enhanced confetti effect */}
            <div ref={confettiRef} className="absolute inset-0 pointer-events-none overflow-hidden">
                {confettiParticles.map(particle => (
                    <div
                        key={particle.id}
                        className="absolute animate-confetti-fall"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            backgroundColor: particle.color,
                            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                            transform: `rotate(${particle.rotation}deg)`,
                            animationDelay: `${particle.delay}s`
                        }}
                    />
                ))}
            </div>

            {/* Subtle floating orbs */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl" />

            {/* Main content */}
            <div className={`relative z-10 max-w-4xl w-full text-center transition-all duration-1000 ${
                showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>

                {/* Main card with premium glass morphism */}
                <div className="relative">
                    {/* Subtle outer glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 via-indigo-500/30 to-pink-500/30 rounded-3xl blur-xl" />
                    
                    {/* Glass morphism card */}
                    <div className="relative bg-gradient-to-br from-white/25 via-white/15 to-white/10 backdrop-blur-3xl rounded-3xl border-2 border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.1)] p-8 lg:p-12 overflow-hidden">
                        {/* Subtle shimmer effect - slower and less intense */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" style={{ animationDuration: '6s' }} />
                        
                        {/* Subtle grid pattern */}
                        <div className="absolute inset-0 opacity-5" style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                            backgroundSize: '50px 50px'
                        }} />

                        {/* Icon with subtle animations */}
                    <div className="relative mb-8 flex justify-center">
                        <div className="relative">
                            {/* Subtle glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/40 to-pink-500/40 rounded-full blur-2xl" />
                            
                            {/* Main icon container */}
                            <div className="relative bg-gradient-to-br from-orange-500 to-pink-500 p-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
                                <Gift className="w-16 h-16 text-white" />
                            </div>
                            
                            {/* Subtle orbiting elements */}
                            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-orange-300 animate-spin" style={{ animationDuration: '4s' }} />
                            <Star className="absolute -bottom-2 -left-2 w-5 h-5 text-pink-300" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl lg:text-7xl font-bold mb-4 text-white drop-shadow-lg">
                        🎉 CONGRATULATIONS! 🎉
                    </h1>

                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 drop-shadow-md">
                        Mystery Platinum Gift
                    </h2>

                    {/* Description */}
                    <p className="text-xl lg:text-2xl text-white mb-8 leading-relaxed">
                        You've unlocked <span className="font-bold text-orange-300">ALL ACHIEVEMENTS</span>!
                        <br />
                        Claim your exclusive reward below.
                    </p>

                    {/* Reward card with premium glass morphism */}
                    <div className="relative mb-8">
                        {/* Subtle outer glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-2xl blur-lg" />
                        
                        {/* Glass card */}
                        <div className="relative bg-gradient-to-br from-white/30 via-white/20 to-white/15 backdrop-blur-2xl rounded-2xl border-2 border-white/40 p-6 lg:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] overflow-hidden">
                            {/* Subtle shimmer */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full animate-shimmer" style={{ animationDelay: '1s', animationDuration: '8s' }} />
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <Medal className="w-14 h-14 text-orange-400 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 8px rgba(255,140,0,0.4))' }} />
                            <div>
                                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                                    Free Lesson with Jeremy Fox
                                </h3>
                                <p className="text-lg text-white/90">
                                    Vocal or Guitar Coaching
                                </p>
                            </div>
                        </div>
                        <p className="text-white text-lg mb-6">
                            Redeem your free lesson at Next Stage Music
                        </p>
                        <a
                            href="https://nextstage-music.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                        >
                            <button
                                onClick={handleRedeem}
                                className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    <Zap className="w-6 h-6" />
                                    Redeem Now at NextStageMusic.com
                                </span>
                                
                                {/* Subtle shimmer on hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            </button>
                        </a>
                    </div>

                    {/* Stats badge */}
                    <div className="flex items-center justify-center gap-2 text-white/90 mb-6">
                        <Star className="w-5 h-5 text-orange-400" />
                        <span className="text-lg">You've completed every achievement!</span>
                        <Star className="w-5 h-5 text-orange-400" />
                    </div>

                    {/* Back button */}
                    <button
                        onClick={() => navigate('/stats')}
                        className="text-white/70 hover:text-white transition-colors duration-300 underline text-lg"
                    >
                        View All Achievements
                    </button>
                    </div>
                </div>
            </div>
        </div>

            {/* Premium CSS animations */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.5); }
                }
                @keyframes confetti-fall {
                    0% {
                        transform: translateY(-100vh) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                @keyframes float {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                        opacity: 0.6;
                    }
                    33% {
                        transform: translate(30px, -30px) scale(1.1);
                        opacity: 0.8;
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                        opacity: 0.7;
                    }
                }
                @keyframes float-icon {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-10px) rotate(5deg);
                    }
                }
                .animate-shimmer {
                    animation: shimmer 6s infinite;
                }
                .animate-twinkle {
                    animation: twinkle 3s ease-in-out infinite;
                }
                .animate-confetti-fall {
                    animation: confetti-fall 5s linear infinite;
                }
            `}</style>
        </div>
    );
};
