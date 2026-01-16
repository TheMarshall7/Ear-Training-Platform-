import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { verifyPayment } from '../utils/stripe';

export const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate();
    const { dispatch } = useGame();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const handlePaymentSuccess = async () => {
            if (!sessionId) {
                console.error('No session ID provided');
                navigate('/');
                return;
            }

            // Verify payment with backend
            const isValid = await verifyPayment(sessionId);

            if (isValid) {
                // Unlock premium features
                dispatch({ type: 'SET_PREMIUM', payload: true });
                console.log('Premium access granted!');
            } else {
                console.error('Payment verification failed');
                navigate('/payment-cancel');
            }
        };

        handlePaymentSuccess();
    }, [sessionId, dispatch, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                        <CheckCircle size={48} className="text-white" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-neutral-900 mb-3">
                    Payment Successful!
                </h1>

                {/* Message */}
                <p className="text-neutral-600 mb-8">
                    You now have lifetime access to all training modes.
                    Thank you for your support!
                </p>

                {/* CTA */}
                <button
                    onClick={() => navigate('/')}
                    className="btn-primary w-full text-lg"
                >
                    Start Training
                </button>
            </div>
        </div>
    );
};
