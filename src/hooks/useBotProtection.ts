import { useRef, useCallback } from 'react';

/**
 * Bot protection hook
 * Implements honeypot strategies:
 * 1. Timing-based detection (bots click too fast)
 * 2. Hidden field honeypot check (bots fill hidden fields)
 */
export const useBotProtection = () => {
    const pageLoadTime = useRef<number>(Date.now());

    /**
     * Check if the visitor is likely a bot
     * Returns true if bot detected, false if likely human
     */
    const isBotDetected = useCallback((): boolean => {
        // Check 1: Timing - did they interact impossibly fast? (less than 500ms)
        // Bots can click instantly, humans need at least half a second to find the button
        const timeSpent = Date.now() - pageLoadTime.current;
        if (timeSpent < 500) {
            console.log('[Bot Protection] Failed: Interaction under 500ms - likely automated');
            return true;
        }

        // Check 2: Honeypot field - check if hidden field was filled
        const honeypotField = document.getElementById('hp_website') as HTMLInputElement;
        if (honeypotField && honeypotField.value) {
            console.log('[Bot Protection] Failed: Honeypot field filled');
            return true;
        }

        // Check 3: Secondary honeypot
        const honeypotField2 = document.getElementById('hp_phone2') as HTMLInputElement;
        if (honeypotField2 && honeypotField2.value) {
            console.log('[Bot Protection] Failed: Secondary honeypot filled');
            return true;
        }

        // Check 4: Fax honeypot (bots love filling fax fields)
        const honeypotField3 = document.getElementById('hp_fax') as HTMLInputElement;
        if (honeypotField3 && honeypotField3.value) {
            console.log('[Bot Protection] Failed: Fax honeypot filled');
            return true;
        }

        console.log('[Bot Protection] Passed: Human verified ✓');
        return false;
    }, []);

    /**
     * Get time spent on page in milliseconds
     */
    const getTimeOnPage = useCallback((): number => {
        return Date.now() - pageLoadTime.current;
    }, []);

    return {
        isBotDetected,
        getTimeOnPage,
    };
};

export default useBotProtection;

