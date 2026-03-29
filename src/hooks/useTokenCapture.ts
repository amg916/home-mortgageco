import { useState, useEffect, useRef } from 'react';

interface TokenCaptureState {
  jornayaLeadId: string;
  trustedFormCertUrl: string;
  isLoading: boolean;
}

/**
 * Hook to capture Jornaya LeadID and TrustedForm Certificate URL
 * Scripts are loaded from index.html, so we only poll for tokens
 */
export const useTokenCapture = (): TokenCaptureState => {
  const [jornayaLeadId, setJornayaLeadId] = useState<string>('');
  const [trustedFormCertUrl, setTrustedFormCertUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const jornayaCapturedRef = useRef<boolean>(false);
  const trustedFormCapturedRef = useRef<boolean>(false);
  const jornayaPollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const trustedFormPollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const trustedFormObserverRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    // Scripts are already loaded from index.html, so we just need to capture tokens
    
    // Function to check for Jornaya token immediately
    const checkJornayaToken = (): boolean => {
      // Check window.LeadiD.token (primary source)
      if ((window as any).LeadiD && (window as any).LeadiD.token) {
        const token = (window as any).LeadiD.token;
        if (token && typeof token === 'string' && token.trim() && !jornayaCapturedRef.current) {
          jornayaCapturedRef.current = true;
          setJornayaLeadId(token);
          // Also populate hidden input fields
          const universalField = document.querySelector('input[name="universal_leadid"]') as HTMLInputElement;
          if (universalField) {
            universalField.value = token;
          }
          const leadidTokenField = document.querySelector('input[id="leadid_token"], input[name="leadid_token"]') as HTMLInputElement;
          if (leadidTokenField) {
            leadidTokenField.value = token;
          }
          const jornayaField = document.querySelector('input[name="jornaya_leadid"]') as HTMLInputElement;
          if (jornayaField) {
            jornayaField.value = token;
          }
          const leadpointField = document.querySelector('input[name="leadpoint_jornaya_leadid"]') as HTMLInputElement;
          if (leadpointField) {
            leadpointField.value = token;
          }
          return true;
        }
      }
      
      // Check localStorage
      const storageKey = Object.keys(localStorage).find(key =>
        key.startsWith('leadid_token-')
      );
      if (storageKey) {
        const storedToken = localStorage.getItem(storageKey);
        if (storedToken && storedToken.trim() && !jornayaCapturedRef.current) {
          jornayaCapturedRef.current = true;
          setJornayaLeadId(storedToken);
          // Populate hidden fields
          const universalField = document.querySelector('input[name="universal_leadid"]') as HTMLInputElement;
          if (universalField) universalField.value = storedToken;
          const leadidTokenField = document.querySelector('input[id="leadid_token"], input[name="leadid_token"]') as HTMLInputElement;
          if (leadidTokenField) leadidTokenField.value = storedToken;
          const jornayaField = document.querySelector('input[name="jornaya_leadid"]') as HTMLInputElement;
          if (jornayaField) jornayaField.value = storedToken;
          const leadpointField = document.querySelector('input[name="leadpoint_jornaya_leadid"]') as HTMLInputElement;
          if (leadpointField) leadpointField.value = storedToken;
          return true;
        }
      }
      
      // Check input fields
      const universalField = document.querySelector('input[name="universal_leadid"]') as HTMLInputElement;
      if (universalField && universalField.value && universalField.value.trim() && !jornayaCapturedRef.current) {
        jornayaCapturedRef.current = true;
        setJornayaLeadId(universalField.value.trim());
        return true;
      }
      
      const leadidTokenField = document.querySelector('input[id="leadid_token"], input[name="leadid_token"]') as HTMLInputElement;
      if (leadidTokenField && leadidTokenField.value && leadidTokenField.value.trim() && !jornayaCapturedRef.current) {
        jornayaCapturedRef.current = true;
        setJornayaLeadId(leadidTokenField.value.trim());
        return true;
      }
      
      const jornayaField = document.querySelector('input[name="jornaya_leadid"]') as HTMLInputElement;
      if (jornayaField && jornayaField.value && jornayaField.value.trim() && !jornayaCapturedRef.current) {
        jornayaCapturedRef.current = true;
        setJornayaLeadId(jornayaField.value.trim());
        return true;
      }
      
      const leadpointField = document.querySelector('input[name="leadpoint_jornaya_leadid"]') as HTMLInputElement;
      if (leadpointField && leadpointField.value && leadpointField.value.trim() && !jornayaCapturedRef.current) {
        jornayaCapturedRef.current = true;
        setJornayaLeadId(leadpointField.value.trim());
        return true;
      }
      
      return false;
    };

    // Function to extract TrustedForm cert URL (like old code)
    const getTrustedFormCertUrl = (): string | null => {
      // Check input fields - prioritize trustedform_cert_url (old code main field)
      const inputSelectors = [
        'input[name="trustedform_cert_url"]',
        'input[id="trustedform_cert_url"]',
        'input[name="xxTrustedFormCertUrl"]',
        'input[id="xxTrustedFormCertUrl"]',
        'input[name="xxTrustedFormToken"]',
        'input[data-trustedform-cert]',
        '[name*="trustedform"]',
        '[name*="trusted"]',
      ];

      for (const selector of inputSelectors) {
        const element = document.querySelector(selector) as HTMLInputElement;
        if (
          element &&
          element.value &&
          typeof element.value === 'string' &&
          element.value.trim() &&
          element.value.startsWith('http')
        ) {
          return element.value;
        }
      }

      // Check window properties (old code checked these)
      const extractStringValue = (value: any): string | null => {
        if (typeof value === 'string' && value.trim() && value.startsWith('http')) return value;
        if (value && value.value && typeof value.value === 'string' && value.value.trim() && value.value.startsWith('http')) {
          return value.value;
        }
        return null;
      };

      if ((window as any).trustedform_cert_url) {
        const certUrl = extractStringValue((window as any).trustedform_cert_url);
        if (certUrl) return certUrl;
      }
      
      if ((window as any).xxTrustedFormCertUrl) {
        const certUrl = extractStringValue((window as any).xxTrustedFormCertUrl);
        if (certUrl) return certUrl;
      }
      
      if ((window as any).xxTrustedFormToken) {
        const certUrl = extractStringValue((window as any).xxTrustedFormToken);
        if (certUrl) return certUrl;
      }

      // Check all window properties that contain "trustedform" or "trusted"
      const trustedFormKeys = Object.keys(window).filter(
        (key) =>
          key.toLowerCase().includes('trustedform') ||
          key.toLowerCase().includes('trusted')
      );

      for (const key of trustedFormKeys) {
        const value = (window as any)[key];
        if (typeof value === 'string' && value.startsWith('https://cert.trustedform.com/')) {
          return value;
        }
      }

      return null;
    };

    // Check immediately for both tokens
    const jornayaFound = checkJornayaToken();
    const initialCertUrl = getTrustedFormCertUrl();
    if (initialCertUrl) {
      trustedFormCapturedRef.current = true;
      setTrustedFormCertUrl(initialCertUrl);
    }

    // Start polling for Jornaya token if not captured
    const startJornayaPolling = () => {
      let pollAttempts = 0;
      const maxAttempts = 150; // 30 seconds (200ms * 150)

      jornayaPollIntervalRef.current = setInterval(() => {
        pollAttempts++;

        if (jornayaCapturedRef.current) {
          if (jornayaPollIntervalRef.current) {
            clearInterval(jornayaPollIntervalRef.current);
            jornayaPollIntervalRef.current = null;
          }
          return;
        }

        if (checkJornayaToken()) {
          if (jornayaPollIntervalRef.current) {
            clearInterval(jornayaPollIntervalRef.current);
            jornayaPollIntervalRef.current = null;
          }
          return;
        }

        if (pollAttempts >= maxAttempts) {
          if (jornayaPollIntervalRef.current) {
            clearInterval(jornayaPollIntervalRef.current);
            jornayaPollIntervalRef.current = null;
          }
        }
      }, 200);
    };

    // Start polling for TrustedForm cert URL if not captured
    const startTrustedFormPolling = () => {
      let pollAttempts = 0;
      const maxAttempts = 150; // 30 seconds

      trustedFormPollIntervalRef.current = setInterval(() => {
        pollAttempts++;

        const certUrl = getTrustedFormCertUrl();
        if (certUrl) {
          trustedFormCapturedRef.current = true;
          setTrustedFormCertUrl(certUrl);
          if (trustedFormPollIntervalRef.current) {
            clearInterval(trustedFormPollIntervalRef.current);
            trustedFormPollIntervalRef.current = null;
          }
          if (trustedFormObserverRef.current) {
            trustedFormObserverRef.current.disconnect();
            trustedFormObserverRef.current = null;
          }
          return;
        }

        if (pollAttempts >= maxAttempts) {
          if (trustedFormPollIntervalRef.current) {
            clearInterval(trustedFormPollIntervalRef.current);
            trustedFormPollIntervalRef.current = null;
          }
        }
      }, 200);

      // Backup: Use MutationObserver to watch for DOM changes
      trustedFormObserverRef.current = new MutationObserver(() => {
        const certUrl = getTrustedFormCertUrl();
        if (certUrl) {
          trustedFormCapturedRef.current = true;
          setTrustedFormCertUrl(certUrl);
          if (trustedFormPollIntervalRef.current) {
            clearInterval(trustedFormPollIntervalRef.current);
            trustedFormPollIntervalRef.current = null;
          }
          if (trustedFormObserverRef.current) {
            trustedFormObserverRef.current.disconnect();
            trustedFormObserverRef.current = null;
          }
        }
      });

      setTimeout(() => {
        if (trustedFormObserverRef.current) {
          trustedFormObserverRef.current.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: false,
            characterData: false,
          });
        }
      }, 100);
    };

    // Start polling after a delay to give scripts time to initialize
    setTimeout(() => {
      if (!jornayaCapturedRef.current) {
        startJornayaPolling();
      }
      if (!trustedFormCapturedRef.current) {
        startTrustedFormPolling();
      }
    }, 500);

    setIsLoading(false);

    // Cleanup
    return () => {
      // Don't remove scripts from index.html - they should stay
      // Just clean up polling intervals and observers
      
      if (jornayaPollIntervalRef.current) {
        clearInterval(jornayaPollIntervalRef.current);
        jornayaPollIntervalRef.current = null;
      }
      
      if (trustedFormPollIntervalRef.current) {
        clearInterval(trustedFormPollIntervalRef.current);
        trustedFormPollIntervalRef.current = null;
      }
      
      if (trustedFormObserverRef.current) {
        trustedFormObserverRef.current.disconnect();
        trustedFormObserverRef.current = null;
      }
    };
  }, []);

  return {
    jornayaLeadId,
    trustedFormCertUrl,
    isLoading,
  };
};
