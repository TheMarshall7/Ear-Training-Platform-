import React from 'react';

interface PaywallProps {
    visible: boolean;
    onUnlock: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ visible, onUnlock }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 bg-stone-900/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">Session Limit Reached</h2>
                <p className="text-stone-500 mb-8">
                    You've completed your free daily sets. Unlock unlimited training to continue mastering your ear.
                </p>
                <button
                    onClick={onUnlock}
                    className="w-full btn-primary mb-3 bg-gradient-to-r from-orange-500 to-red-500 border-none"
                >
                    Unlock Unlimited Access
                </button>
                <button className="text-sm text-stone-400 underline hover:text-stone-600">
                    Restore Purchase
                </button>
            </div>
        </div>
    );
};
