import React from 'react';
import { X, Lock, Check } from 'lucide-react';
import { FEATURES } from '../config/features';

interface PaywallModalProps {
    onClose: () => void;
    onUpgrade: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ onClose, onUpgrade }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-slide-up">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 transition-colors"
                    aria-label="Close"
                >
                    <X size={20} className="text-neutral-500" />
                </button>

                {/* Lock Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                        <Lock size={32} className="text-white" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-neutral-900 mb-3">
                    Unlock All Training Modes
                </h2>

                {/* Subtitle */}
                <p className="text-center text-neutral-600 mb-8">
                    Get lifetime access to all 8 professional ear training modes
                </p>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                            <Check size={20} className="text-orange-500" />
                        </div>
                        <div>
                            <p className="font-medium text-neutral-900">All 8 Training Modes</p>
                            <p className="text-sm text-neutral-600">Intervals, Chords, Progressions, Scales & More</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                            <Check size={20} className="text-orange-500" />
                        </div>
                        <div>
                            <p className="font-medium text-neutral-900">Unlimited Training</p>
                            <p className="text-sm text-neutral-600">No limits, practice as much as you want</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                            <Check size={20} className="text-orange-500" />
                        </div>
                        <div>
                            <p className="font-medium text-neutral-900">Lifetime Access</p>
                            <p className="text-sm text-neutral-600">One-time payment, yours forever</p>
                        </div>
                    </div>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-neutral-900 mb-1">
                        ${FEATURES.PREMIUM_PRICE}
                    </div>
                    <div className="text-sm text-neutral-500">
                        One-time payment • {FEATURES.PREMIUM_CURRENCY}
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    onClick={onUpgrade}
                    className="btn-primary w-full text-lg mb-4"
                >
                    Unlock All Modes
                </button>

                {/* Security note */}
                <p className="text-xs text-center text-neutral-500">
                    Secured by Stripe • 30-day money-back guarantee
                </p>
            </div>
        </div>
    );
};
