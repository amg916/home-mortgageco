import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Custom hook to preserve query parameters during navigation
 * Automatically appends tracking parameters (ef_transaction_id, id, etc.) to all navigations
 */
export const usePreserveParams = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const navigateWithParams = useCallback(
    (path: string, options?: any) => {
      // Parameters to preserve across navigation
      const paramsToPreserve = [
        'ef_transaction_id',
        'id',
        'lp_subid1',
        'lp_subid2',
        's1',
        'sub1',
        'click_id',
        'subid1',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'jornaya_leadid',
        'trustedform_cert_url',
      ];

      // Build query string from existing params
      const params = new URLSearchParams();
      paramsToPreserve.forEach((param) => {
        const value = searchParams.get(param);
        if (value) {
          params.set(param, value);
        }
      });

      // Construct the new path with query params
      const queryString = params.toString();
      const pathWithParams = queryString ? `${path}?${queryString}` : path;

      // Navigate with preserved params
      navigate(pathWithParams, options);
    },
    [navigate, searchParams]
  );

  return navigateWithParams;
};
