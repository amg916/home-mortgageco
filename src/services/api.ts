// API service for backend integration
import { LEAD_INGEST_URL } from '@/config/api';

interface BaseLeadData {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  ip_address?: string;
  user_agent?: string;
  landing_page_url?: string;
  ef_transaction_id?: string;
  jornaya_leadid?: string;
  trustedform_cert_url?: string;
  lp_subid1?: string;
  lp_subid2?: string;
  tcpa_text?: string;
}

interface RefinanceData extends BaseLeadData {
  // Core refinance fields that match backend/LeadProsper API
  estimated_home_value?: number;
  first_mortgage_balance?: number;
  interest_rate?: number;
  current_lender?: string;
  credit_grade?: string;
  bankruptcy?: string;
  active_member_armed_forces?: string;
  occupational_status?: string;
  property_type?: string;
  home_built_year?: number;
  loan_amount?: number;
  year_home_purchased?: number;
  cash_out?: number;
  loan_purpose?: string;
  
  // Optional LeadProsper fields
  property_use?: string;
  rate_type?: string;
  va_loan?: string;
  income?: number;
  ready_to_speak?: boolean;
}

interface HomePurchaseData extends BaseLeadData {
  estimated_price?: number;
  estimated_down_payment?: number;
  employment_status?: string;
  credit_grade?: string;
  contacted_by_agent?: string;
  ready_to_speak?: boolean;
}

interface HomeSellData extends BaseLeadData {
  reason_to_sell?: string;
  property_type?: string;
  when_to_sell?: string;
  occupancy?: string;
  behind_on_mortgage?: string;
  property_address?: string;
  estimated_home_value?: number;
  currently_listed?: string;
  ready_to_speak?: boolean;
}

interface CashOutEquityData extends BaseLeadData {
  property_type?: string;
  estimated_home_value?: number;
  first_mortgage_balance?: number;
  loan_amount?: number;
  cash_out_amount?: number;
  interest_rate?: number;
  current_lender?: string;
  credit_grade?: string;
  bankruptcy?: string;
  active_member_armed_forces?: string;
  occupational_status?: string;
  home_built_year?: number;
  year_home_purchased?: number;
  cash_out?: number;
  loan_purpose?: string;
  ready_to_speak?: boolean;
}

// Get user's IP address
const getUserIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return '';
  }
};

// All tracking parameter names we care about
const TRACKING_PARAMS = [
  's1', 's2', 's3', 's4', 's5',
  'sub1', 'subid1', 'click_id',
  'lp_subid1', 'lp_subid2',
  'ef_transaction_id', 'id',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'source',
  'jornaya_leadid', 'trustedform_cert_url',
  'gclid', 'fbclid', 'msclkid',
];

const STORAGE_KEY = 'mco_tracking_params';

// Capture URL params on load and persist to localStorage.
// Only writes non-empty values; never overwrites existing stored values
// (first touch wins — the landing page URL is the source of truth).
function captureTrackingParams(): void {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const stored: Record<string, string> = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    let changed = false;
    for (const key of TRACKING_PARAMS) {
      const val = urlParams.get(key);
      if (val && !stored[key]) {
        stored[key] = val;
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }
  } catch { /* localStorage unavailable — degrade gracefully */ }
}

// Run capture immediately on module load so params are stored before any
// React render or route change can strip the query string.
captureTrackingParams();

// Read stored tracking params (localStorage first, fall back to current URL)
const getTrackingParams = (): Record<string, string> => {
  let stored: Record<string, string> = {};
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { /* ignore */ }

  // Also read current URL as a live fallback
  const urlParams = new URLSearchParams(window.location.search);
  for (const key of TRACKING_PARAMS) {
    if (!stored[key]) {
      const val = urlParams.get(key);
      if (val) stored[key] = val;
    }
  }
  return stored;
};

// Build the tracking fields to merge into lead data
const getURLParams = () => {
  const p = getTrackingParams();

  // s1 fallback chain: s1 → sub1 → subid1 → click_id → lp_subid1 → utm_source
  const s1 = p.s1 || p.sub1 || p.subid1 || p.click_id || p.lp_subid1 || p.utm_source || '';

  return {
    ef_transaction_id: p.ef_transaction_id || '',
    id: p.id || '',
    lp_subid1: p.lp_subid1 || '',
    lp_subid2: p.lp_subid2 || p.s2 || '',
    s1,
    click_id: p.click_id || p.gclid || p.fbclid || p.msclkid || '',
    utm_source: p.utm_source || '',
    utm_medium: p.utm_medium || '',
    utm_campaign: p.utm_campaign || '',
    utm_term: p.utm_term || '',
    utm_content: p.utm_content || '',
    jornaya_leadid: p.jornaya_leadid || '',
    trustedform_cert_url: p.trustedform_cert_url || '',
  };
};

// Clear stored tracking params (call after successful submission)
export const clearTrackingParams = () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
};

// ── Clarity Session Integration ──────────────────────────────────────
declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}

// Get the Clarity session ID from cookies or sessionStorage
function getClaritySessionId(): string {
  try {
    // Method 1: _clsk cookie (Clarity session cookie)
    const clskCookie = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('_clsk='));
    if (clskCookie) {
      const val = clskCookie.split('=')[1]?.split('|')[0];
      if (val) return val;
    }
    // Method 2: _clck cookie (Clarity user cookie — persists across sessions)
    const clckCookie = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('_clck='));
    if (clckCookie) {
      const val = clckCookie.split('=')[1]?.split('|')[0];
      if (val) return val;
    }
  } catch { /* ignore */ }
  return '';
}

// Tag the Clarity session with custom metadata for filtering in the Clarity dashboard
function tagClaritySession(tags: Record<string, string>): void {
  try {
    if (typeof window !== 'undefined' && window.clarity) {
      for (const [key, value] of Object.entries(tags)) {
        if (value) {
          window.clarity('set', key, value);
        }
      }
    }
  } catch { /* ignore */ }
}

// Tag Clarity with initial tracking info on page load
function initClarityTagging(): void {
  try {
    const p = getTrackingParams();
    const s1 = p.s1 || p.sub1 || p.subid1 || p.click_id || p.lp_subid1 || p.utm_source || '';

    // Wait for Clarity to initialize (up to 5 seconds)
    let attempts = 0;
    const tryTag = () => {
      if (window.clarity) {
        tagClaritySession({
          source: s1 || 'direct',
          utm_source: p.utm_source || '',
          utm_campaign: p.utm_campaign || '',
          page_type: window.location.pathname.replace(/^\//, '').split('/')[0] || 'landing',
        });

        // If we have a Hefty attribution cookie, tag that too
        try {
          const heftyAttrib = localStorage.getItem('hefty_attrib_v1');
          if (heftyAttrib) {
            const attrib = JSON.parse(heftyAttrib);
            if (attrib.click_id) {
              window.clarity!('identify', attrib.click_id);
              window.clarity!('set', 'hefty_click_id', attrib.click_id);
            }
          }
        } catch { /* ignore */ }
      } else if (attempts < 50) {
        attempts++;
        setTimeout(tryTag, 100);
      }
    };
    tryTag();
  } catch { /* ignore */ }
}

// Run Clarity tagging after initial tracking param capture
initClarityTagging();

// Detect campaign source from current URL path
const getCampaignSource = (): string => {
  const validSources = ['refinance', 'cashout', 'heloc', 'purchase', 'sell', 'extras', 'thank-you', 'start'];
  const path = window.location.pathname.replace(/^\//, '').split('/')[0].toLowerCase();
  return validSources.includes(path) ? path : 'refinance';
};

// Enhance data with auto-captured fields
const enhanceLeadData = async (data: any): Promise<any> => {
  const ip_address = await getUserIP();
  const user_agent = navigator.userAgent;
  const landing_page_url = (window.location.origin + window.location.pathname).replace('//www.', '//');
  const urlParams = getURLParams();
  const session_id = data.session_id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

  // Helper function to check if a field should be overwritten
  // Only overwrite if the data value is not defined or is empty, AND urlParam has a value
  const getFieldValue = (dataValue: any, urlValue: string): string => {
    if (dataValue !== undefined && dataValue !== null && dataValue !== '') {
      return dataValue;
    }
    return urlValue;
  };

  // Capture Clarity session ID for lead-to-recording mapping
  const clarity_session_id = getClaritySessionId();

  // Tag Clarity with session + lead context for searchability
  tagClaritySession({
    session_id,
    loan_type: getCampaignSource(),
    state: data.state || '',
    zip: data.zip_code || data.zip || '',
  });

  return {
    ...data,
    ip_address,
    user_agent,
    landing_page_url,
    session_id,
    brand: 'mortgageco',
    source: getCampaignSource(),
    // Clarity session for recording link
    clarity_session_id,
    clarity_project_id: 'w48v3e4bmc',
    // Tracking params — localStorage-backed, survives full form journey
    ef_transaction_id: getFieldValue(data.ef_transaction_id, urlParams.ef_transaction_id),
    id: getFieldValue(data.id, urlParams.id),
    lp_subid1: getFieldValue(data.lp_subid1, urlParams.lp_subid1),
    lp_subid2: getFieldValue(data.lp_subid2, urlParams.lp_subid2),
    s1: getFieldValue(data.s1, urlParams.s1),
    click_id: getFieldValue(data.click_id, urlParams.click_id),
    utm_source: getFieldValue(data.utm_source, urlParams.utm_source),
    utm_medium: getFieldValue(data.utm_medium, urlParams.utm_medium),
    utm_campaign: getFieldValue(data.utm_campaign, urlParams.utm_campaign),
    utm_term: getFieldValue(data.utm_term, urlParams.utm_term),
    utm_content: getFieldValue(data.utm_content, urlParams.utm_content),
    jornaya_leadid: getFieldValue(data.jornaya_leadid, urlParams.jornaya_leadid),
    trustedform_cert_url: getFieldValue(data.trustedform_cert_url, urlParams.trustedform_cert_url),
  };
};

// Unified lead submission function
export const submitLead = async (data: any) => {
  const enhancedData = await enhanceLeadData(data);

  const response = await fetch(LEAD_INGEST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(enhancedData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || errorData.error || 'Submission failed');
  }

  // Clear stored tracking params after successful submission
  clearTrackingParams();

  return response.json();
};

// Export utility functions
export { getUserIP, getURLParams, enhanceLeadData };
