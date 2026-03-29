import React, { useState, useRef, useCallback, useEffect } from "react";
import { Fingerprint, Check, Loader2 } from "lucide-react";

interface HoldToUnlockProps {
    onUnlock: () => void;
    text?: string;
    holdDuration?: number; // milliseconds to hold
    className?: string;
    disabled?: boolean;
}

/**
 * Premium "Hold to Unlock" button with cool animations
 * Requires holding for a duration - impossible for bots to replicate
 */
const HoldToUnlock: React.FC<HoldToUnlockProps> = ({
    onUnlock,
    text = "Hold to Get Pre-Approved",
    holdDuration = 1500, // 1.5 seconds
    className = "",
    disabled = false,
}) => {
    const [isHolding, setIsHolding] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
    const holdTimer = useRef<NodeJS.Timeout | null>(null);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
    const startTime = useRef<number>(0);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const rippleId = useRef(0);

    const addRipple = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        let x, y;
        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        const id = rippleId.current++;
        setRipples(prev => [...prev, { id, x, y }]);
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, 1000);
    }, []);

    const startHold = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (disabled || isUnlocked) return;

        addRipple(e);
        setIsHolding(true);
        startTime.current = Date.now();

        // Progress update interval
        progressInterval.current = setInterval(() => {
            const elapsed = Date.now() - startTime.current;
            const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
            setProgress(newProgress);
        }, 16); // ~60fps

        // Completion timer
        holdTimer.current = setTimeout(() => {
            setProgress(100);
            setIsUnlocked(true);
            setIsHolding(false);

            // Haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate([50, 30, 100]);
            }

            setTimeout(() => {
                onUnlock();
            }, 400);
        }, holdDuration);
    }, [disabled, isUnlocked, holdDuration, onUnlock, addRipple]);

    const endHold = useCallback(() => {
        if (isUnlocked) return;

        setIsHolding(false);

        // Clear timers
        if (holdTimer.current) {
            clearTimeout(holdTimer.current);
            holdTimer.current = null;
        }
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
            progressInterval.current = null;
        }

        // Animate progress back to 0
        const currentProgress = progress;
        const steps = 10;
        const stepTime = 150 / steps;
        let step = 0;

        const resetInterval = setInterval(() => {
            step++;
            setProgress(currentProgress * (1 - step / steps));
            if (step >= steps) {
                clearInterval(resetInterval);
                setProgress(0);
            }
        }, stepTime);
    }, [isUnlocked, progress]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (holdTimer.current) clearTimeout(holdTimer.current);
            if (progressInterval.current) clearInterval(progressInterval.current);
        };
    }, []);

    return (
        <button
            ref={buttonRef}
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            disabled={disabled || isUnlocked}
            className={`
        relative overflow-hidden
        min-w-[280px] h-16 px-8
        rounded-full
        font-bold text-lg
        transition-all duration-300 ease-out
        select-none touch-none
        ${isUnlocked
                    ? 'bg-green-500 text-white scale-105'
                    : isHolding
                        ? 'bg-primary scale-[1.02] shadow-2xl shadow-primary/40'
                        : 'bg-white text-primary hover:shadow-xl hover:scale-[1.01]'
                }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
            style={{
                boxShadow: isHolding
                    ? `0 0 ${30 + progress * 0.5}px ${progress * 0.3}px rgba(var(--primary-rgb, 180, 30, 60), ${0.3 + progress * 0.005})`
                    : undefined
            }}
        >
            {/* Circular progress ring behind icon */}
            <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10"
                viewBox="0 0 44 44"
            >
                {/* Background circle */}
                <circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="none"
                    stroke={isUnlocked ? "rgba(255,255,255,0.3)" : isHolding ? "rgba(255,255,255,0.2)" : "rgba(180,30,60,0.1)"}
                    strokeWidth="3"
                />
                {/* Progress circle */}
                <circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="none"
                    stroke={isUnlocked ? "#fff" : isHolding ? "#fff" : "hsl(var(--primary))"}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 18}`}
                    strokeDashoffset={`${2 * Math.PI * 18 * (1 - progress / 100)}`}
                    transform="rotate(-90 22 22)"
                    className="transition-all duration-100"
                />
            </svg>

            {/* Icon in center of ring */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center">
                {isUnlocked ? (
                    <Check className="w-5 h-5 text-white animate-in zoom-in duration-300" />
                ) : isHolding ? (
                    <Fingerprint className="w-5 h-5 text-white animate-pulse" />
                ) : (
                    <Fingerprint className="w-5 h-5 text-primary" />
                )}
            </div>

            {/* Text */}
            <span className={`ml-8 transition-all duration-300 ${isHolding ? 'text-white' : ''}`}>
                {isUnlocked ? "Opening..." : isHolding ? `${Math.round(progress)}%` : text}
            </span>

            {/* Ripple effects */}
            {ripples.map(ripple => (
                <span
                    key={ripple.id}
                    className="absolute rounded-full bg-primary/30 animate-ripple pointer-events-none"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            ))}

            {/* Pulsing glow effect when holding */}
            {isHolding && (
                <div
                    className="absolute inset-0 rounded-full animate-pulse-glow pointer-events-none"
                    style={{
                        background: `radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)`,
                    }}
                />
            )}

            {/* Success particles */}
            {isUnlocked && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-white rounded-full animate-particle"
                            style={{
                                left: '50%',
                                top: '50%',
                                '--angle': `${i * 30}deg`,
                                '--delay': `${i * 0.03}s`,
                            } as React.CSSProperties}
                        />
                    ))}
                </div>
            )}
        </button>
    );
};

export default HoldToUnlock;
