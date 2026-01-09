// Animation utility functions

export const shakeAnimation = {
    animation: 'shake 0.5s ease-in-out',
    '@keyframes shake': {
        '0%, 100%': { transform: 'translateX(0)' },
        '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
        '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' }
    }
};

export const pulseAnimation = {
    animation: 'pulse 0.5s ease-in-out',
    '@keyframes pulse': {
        '0%, 100%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.1)' }
    }
};

export const fadeInUp = {
    animation: 'fadeInUp 0.5s ease-out',
    '@keyframes fadeInUp': {
        '0%': {
            opacity: 0,
            transform: 'translateY(20px)'
        },
        '100%': {
            opacity: 1,
            transform: 'translateY(0)'
        }
    }
};

export const scaleIn = {
    animation: 'scaleIn 0.3s ease-out',
    '@keyframes scaleIn': {
        '0%': {
            opacity: 0,
            transform: 'scale(0.8)'
        },
        '100%': {
            opacity: 1,
            transform: 'scale(1)'
        }
    }
};
