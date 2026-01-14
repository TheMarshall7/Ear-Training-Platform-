import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & {
    strokeWidth?: number;
};

export const PianoIcon: React.FC<IconProps> = ({
    className,
    strokeWidth = 2,
    ...props
}) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <line x1="7" y1="5" x2="7" y2="19" />
        <line x1="10" y1="5" x2="10" y2="19" />
        <line x1="13" y1="5" x2="13" y2="19" />
        <line x1="16" y1="5" x2="16" y2="19" />
        <rect x="8" y="5" width="2" height="7" fill="currentColor" stroke="none" />
        <rect x="11" y="5" width="2" height="7" fill="currentColor" stroke="none" />
        <rect x="14" y="5" width="2" height="7" fill="currentColor" stroke="none" />
    </svg>
);

export const BassClefIcon: React.FC<IconProps> = ({
    className,
    strokeWidth = 2,
    ...props
}) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <path d="M14 5c-4 1-6 5-4 8 1 2 3 3 5 3 3 0 4-2 4-4 0-2-1-3-3-3" />
        <circle cx="18" cy="9" r="1" fill="currentColor" stroke="none" />
        <circle cx="18" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
);

export const BassGuitarIcon: React.FC<IconProps> = ({
    className,
    strokeWidth = 2,
    ...props
}) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <path d="M4 18c2 2 6 1 8-1l6-6a3 3 0 0 0 0-4c-1-1-3-1-4 0l-6 6c-2 2-3 6-1 8z" />
        <path d="M14 8l3-3" />
        <line x1="18" y1="5" x2="21" y2="2" />
        <circle cx="20" cy="4" r="0.5" />
        <circle cx="21.5" cy="3" r="0.5" />
    </svg>
);
