import React from 'react';

interface IButton {
    text: string;
    onClick: (e? : React.MouseEvent<HTMLButtonElement>) => void;
    icon?: React.ReactNode;
    color?: 'primary' | 'secondary' | 'danger' | 'success' | 'premium';
    size?: 'sm' | 'md' | 'lg';
    shape?: 'rectangle' | 'pill' | 'circle';
    glow?: boolean;
    gradient?: boolean;
    shadow?: boolean;
    hoverEffect?: 'grow' | 'shrink' | 'float' | 'colorShift';
    disabled?: boolean;
    loading?: boolean;
    className?: string;
}

const Button: React.FC<IButton> = ({
                                       text,
                                       onClick,
                                       icon,
                                       color = 'primary',
                                       size = 'md',
                                       shape = 'rectangle',
                                       glow = true,
                                       gradient = true,
                                       shadow = true,
                                       hoverEffect = 'float',
                                       disabled = false,
                                       loading = false,
                                       className = '',
                                   }) => {

    const colorMap = {
        primary: {
            base: 'bg-blue-600',
            hover: 'hover:bg-blue-700',
            gradientFrom: 'from-blue-500',
            gradientTo: 'to-blue-600',
            text: 'text-white',
        },
        secondary: {
            base: 'bg-gray-600',
            hover: 'hover:bg-gray-700',
            gradientFrom: 'from-gray-500',
            gradientTo: 'to-gray-600',
            text: 'text-white',
        },
        danger: {
            base: 'bg-red-600',
            hover: 'hover:bg-red-700',
            gradientFrom: 'from-red-500',
            gradientTo: 'to-red-600',
            text: 'text-white',
        },
        success: {
            base: 'bg-green-600',
            hover: 'hover:bg-green-700',
            gradientFrom: 'from-green-500',
            gradientTo: 'to-green-600',
            text: 'text-white',
        },
        premium: {
            base: 'bg-purple-600',
            hover: 'hover:bg-purple-700',
            gradientFrom: 'from-purple-500',
            gradientTo: 'to-pink-500',
            text: 'text-white',
        },
    };

    const sizeMap = {
        sm: 'py-1.5 px-3 text-sm',
        md: 'py-2.5 px-5 text-base',
        lg: 'py-3 px-6 text-lg',
    };

    const shapeMap = {
        rectangle: 'rounded-lg',
        pill: 'rounded-full',
        circle: 'rounded-full',
    };

    const hoverEffectMap = {
        grow: 'hover:scale-105',
        shrink: 'hover:scale-95',
        float: 'hover:-translate-y-0.5',
        colorShift: `hover:bg-opacity-90 ${colorMap[color].hover}`,
    };

    const glowEffect = glow
        ? `shadow-${color}-500/20 hover:shadow-${color}-500/40`
        : 'shadow-none';

    const gradientClasses = gradient
        ? `bg-gradient-to-r ${colorMap[color].gradientFrom} ${colorMap[color].gradientTo}`
        : colorMap[color].base;

    const shadowClasses = shadow
        ? 'shadow-md hover:shadow-lg'
        : 'shadow-none';

    const buttonClasses = ` ${gradientClasses} ${colorMap[color].text} ${sizeMap[size]} ${shapeMap[shape]} 
                        ${hoverEffectMap[hoverEffect]} ${glowEffect} ${shadowClasses} font-medium transition-all 
                        duration-300 ease-in-out transform will-change-transform relative border-none 
                        outline-none focus:ring-2 focus:ring-${color}-400 focus:ring-opacity-50 disabled:opacity-50 
                        disabled:cursor-not-allowed disabled:transform-none ${className}`;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) return;
        onClick(e);
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled || loading}
            className={buttonClasses.trim()}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {loading
                    ? (
                    <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    )
                    : (
                        <>
                            {icon && <span className="button-icon">{icon}</span>}
                            {shape !== 'circle' && text}
                        </>
                    )
                }
            </span>
        </button>
    );
};
export default Button;