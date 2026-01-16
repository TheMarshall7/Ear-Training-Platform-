import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export const PaymentCancel: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
            < div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center" >
                {/* Cancel Icon */}
                < div className="flex justify-center mb-6" >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-500 flex items-center justify-center shadow-lg">
                        <XCircle size={48} className="text-white" />
                    </div>
                </div >

                {/* Title */}
                < h1 className="text-3xl font-bold text-neutral-900 mb-3" >
                    Payment Cancelled
                </h1 >

                {/* Message */}
                < p className="text-neutral-600 mb-8" >
                    No charges were made.You can upgrade anytime to unlock all training modes.
                </p >

                {/* CTA */}
                < button
                    onClick={() => navigate('/')}
                    className="btn-primary w-full text-lg"
                >
                    Back to Home
                </button >
            </div >
        </div >
    );
};
