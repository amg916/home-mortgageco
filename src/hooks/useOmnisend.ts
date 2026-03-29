import { useEffect } from 'react';

declare global {
  interface Window {
    omnisend?: any[];
    handleLeadSubmit?: () => void;
  }
}

/**
 * Hook to handle Omnisend tracking
 * Provides functions to track page views and lead submissions
 */
export const useOmnisend = () => {
  useEffect(() => {
    // Ensure Omnisend is initialized (script loads from index.html)
    // The script is already loaded, so we just need to ensure the function exists
    if (typeof window !== 'undefined' && window.omnisend && !window.handleLeadSubmit) {
      // Function is already defined in index.html, but we can add a TypeScript-safe wrapper
      window.handleLeadSubmit = () => {
        if (window.omnisend) {
          window.omnisend.push([
            "track", "lead_submitted",
            {
              eventVersion: "v4",
              origin: "api",
              properties: {
                value: 1,
                url: window.location.href
              }
            }
          ]);
        }
      };
    }
  }, []);

  /**
   * Track a lead submission event
   */
  const trackLeadSubmission = () => {
    if (typeof window !== 'undefined' && window.handleLeadSubmit) {
      window.handleLeadSubmit();
    } else if (typeof window !== 'undefined' && window.omnisend) {
      // Fallback if handleLeadSubmit isn't available
      window.omnisend.push([
        "track", "lead_submitted",
        {
          eventVersion: "v4",
          origin: "api",
          properties: {
            value: 1,
            url: window.location.href
          }
        }
      ]);
    }
  };

  return {
    trackLeadSubmission
  };
};

