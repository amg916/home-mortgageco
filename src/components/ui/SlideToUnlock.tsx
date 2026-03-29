import React, { useState, useRef, useCallback, useEffect } from "react";
import { ChevronRight, Check } from "lucide-react";

interface SlideToUnlockProps {
    onUnlock: () => void;
    text?: string;
    unlockText?: string;
    className?: string;
    disabled?: boolean;
}

/**
 * Premium "Slide to Continue" component with smooth animations
 * User must slide the button to the end to unlock - bot-resistant interaction
 */
const SlideToUnlock: React.FC<SlideToUnlockProps> = ({
    onUnlock,
    text = "Slide to Continue",
    unlockText = "Opening...",
    className = "",
    disabled = false,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState(0);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const startX = useRef(0);

    const BUTTON_SIZE = 52; // Size of the circular button
    const maxPosition = containerRef.current
        ? containerRef.current.offsetWidth - BUTTON_SIZE - 8
        : 200;

    const handleStart = useCallback(
        (clientX: number) => {
            if (disabled || isUnlocked) return;
            setIsDragging(true);
            startX.current = clientX - position;
        },
        [disabled, isUnlocked, position]
    );

    const handleMove = useCallback(
        (clientX: number) => {
            if (!isDragging || disabled || isUnlocked) return;
            const newPosition = Math.max(0, Math.min(clientX - startX.current, maxPosition));
            setPosition(newPosition);
        },
        [isDragging, disabled, isUnlocked, maxPosition]
    );

    const handleEnd = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);

        // If slid more than 85%, trigger unlock
        if (position >= maxPosition * 0.85) {
            setPosition(maxPosition);
            setIsUnlocked(true);

            // Haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate([50, 30, 100]);
            }

            setTimeout(() => {
                onUnlock();
            }, 400);
        } else {
            // Spring back to start
            setPosition(0);
        }
    }, [isDragging, position, maxPosition, onUnlock]);

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => handleStart(e.clientX);
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleMouseUp = () => handleEnd();

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const handleTouchEnd = () => handleEnd();

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("touchmove", handleTouchMove);
            window.addEventListener("touchend", handleTouchEnd);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    const progress = maxPosition > 0 ? (position / maxPosition) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className={`
                relative w-full max-w-sm h-16
                bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]
                rounded-full
                overflow-hidden
                select-none
                shadow-xl
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${isUnlocked ? 'bg-gradient-to-r from-green-600 to-green-500' : ''}
                ${className}
            `}
            style={{
                boxShadow: isUnlocked
                    ? '0 8px 30px rgba(34, 197, 94, 0.4)'
                    : '0 8px 35px rgba(194, 22, 45, 0.4)'
            }}
        >
            {/* Progress background */}
            <div
                className={`absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary-glow))] to-[hsl(var(--secondary-muted))] transition-all ${
                    isDragging ? 'duration-0' : 'duration-500 ease-out'
                }`}
                style={{
                    transform: `translateX(-${100 - progress}%)`,
                }}
            />

            {/* Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white text-lg md:text-xl font-bold tracking-wide drop-shadow-lg">
                    {isUnlocked ? unlockText : text}
                </span>
            </div>

            {/* Sliding Button */}
            <div
                className={`
                    absolute left-1.5 top-1/2 -translate-y-1/2
                    w-[52px] h-[52px]
                    bg-white
                    rounded-full
                    flex items-center justify-center
                    cursor-grab
                    shadow-lg
                    transition-all
                    ${isDragging ? 'cursor-grabbing scale-105' : 'scale-100'}
                    ${isUnlocked ? 'bg-green-500' : ''}
                    ${!isDragging && !isUnlocked ? 'duration-500 ease-out' : 'duration-0'}
                `}
                style={{
                    transform: `translate(${position}px, -50%) ${isDragging ? 'scale(1.05)' : 'scale(1)'}`,
                    boxShadow: isDragging
                        ? '0 6px 25px rgba(0, 0, 0, 0.3)'
                        : '0 3px 15px rgba(0, 0, 0, 0.2)',
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                {isUnlocked ? (
                    <Check className="w-7 h-7 text-white animate-in zoom-in duration-300" />
                ) : (
                    <div className="flex items-center">
                        <ChevronRight className="w-5 h-5 text-primary" />
                        <ChevronRight className="w-5 h-5 text-primary -ml-2.5" />
                    </div>
                )}
            </div>

            {/* Glow effect when dragging */}
            {isDragging && !isUnlocked && (
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-16 h-16 rounded-full pointer-events-none"
                    style={{
                        left: position,
                        background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
                        filter: 'blur(6px)',
                    }}
                />
            )}

            {/* Success particles */}
            {isUnlocked && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full opacity-0 animate-ping"
                            style={{
                                left: '50%',
                                top: '50%',
                                animationDelay: `${i * 0.05}s`,
                                transform: `rotate(${i * 30}deg) translateX(35px)`,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SlideToUnlock;
