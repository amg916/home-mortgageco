import { useState, useRef } from 'react';
import { submitLead as submitLeadAPI } from '@/services/api';
import { useOmnisend } from './useOmnisend';  

interface UseLeadSubmissionResult {
  isSubmitting: boolean;
  error: string | null;
  submitLead: (serviceType: string, formData: any, tokens?: { jornayaLeadId?: string; trustedFormCertUrl?: string }, readyToSpeak?: boolean) => Promise<boolean>;
}

export const useLeadSubmission = (): UseLeadSubmissionResult => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackLeadSubmission } = useOmnisend();
  const submittingRef = useRef(false);

  const submitLead = async (serviceType: string, formData: any, tokens?: { jornayaLeadId?: string; trustedFormCertUrl?: string }, readyToSpeak: boolean = true): Promise<boolean> => {
    if (submittingRef.current) return false;
    submittingRef.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      // Transform form data to match backend field names
      const leadData = transformFormData(formData, serviceType, tokens);
      
      // Add readyToSpeak flag to lead data
      leadData.ready_to_speak = readyToSpeak;
      
      const lowerServiceType = serviceType.toLowerCase();
      
      // For purchase and sell flows, use contactAgent from form (not popup) to set contact_agent
      if (lowerServiceType === 'purchase' || lowerServiceType === 'sell') {
        // Use the form's contactAgent field (from the yes/no question in the form)
        // This maps to contacted_by_agent, but we also set contact_agent for LeadProsper
        const contactAgent = formData.contactAgent;
        if (contactAgent !== undefined) {
          leadData.contact_agent = contactAgent ? 'Yes' : 'No';
        }
      } else {
        // For other flows, use mortgage_specialist from popup
        leadData.mortgage_specialist = readyToSpeak ? 'Yes' : 'No';
      }

      // Single unified API call to HeftyCC
      await submitLeadAPI(leadData);

      // Track lead submission in Omnisend
      trackLeadSubmission();

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return false;
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, error, submitLead };
};

// Transform frontend form data to backend field names
const transformFormData = (formData: any, serviceType: string = '', tokens?: { jornayaLeadId?: string; trustedFormCertUrl?: string }) => {
  const transformed: any = {};
  const lowerServiceType = serviceType.toLowerCase();

  // Map form fields to backend field names
  const fieldMapping: { [key: string]: string } = {
    // Personal information
    firstName: 'first_name',
    lastName: 'last_name',
    dateOfBirth: 'date_of_birth',

    // Contact information
    propertyAddress: 'address',
    streetAddress: 'address',
    zip: 'zip_code',
    zipCode: 'zip_code',

    // Token capture fields (TrustedForm and Jornaya)
    jornayaLeadId: 'jornaya_leadid',
    trustedFormCertUrl: 'trustedform_cert_url',
    
    // Refinance/HELOC fields (matches LeadProsper API)
    homeValue: 'estimated_home_value',
    estimatedValue: 'estimated_home_value',
    estimatedHomeValue: 'estimated_home_value',
    propertyValue: 'estimated_home_value', // Legacy mapping
    
    mortgageBalance: 'first_mortgage_balance',
    firstMortgageBalance: 'first_mortgage_balance',
    
    interestRate: 'interest_rate',
    currentRate: 'interest_rate', // Legacy mapping
    
    currentLender: 'current_lender',
    mortgageLender: 'current_lender',
    
    creditRating: 'credit_grade',
    creditGrade: 'credit_grade',
    
    military: 'active_member_armed_forces',
    activeMemberArmedForces: 'active_member_armed_forces',
    
    // employmentStatus maps to different fields depending on service type
    // Purchase uses 'employment_status', Refinance uses 'occupational_status'
    employmentStatus: lowerServiceType === 'purchase' ? 'employment_status' : 'occupational_status',
    occupationalStatus: 'occupational_status',
    income: 'income',
    
    homeBuiltYear: 'home_built_year',
    yearHomePurchased: 'year_home_purchased',
    cashOut: 'cash_out',
    additionalCash: 'cash_out',
    loanAmount: 'loan_amount',
    mainGoal: 'loan_purpose', // Maps main goal to loan purpose
    loanPurpose: 'loan_purpose',
    propertyType: 'property_type',
    homeType: 'property_type',
    bankruptcy: 'bankruptcy',
    numMortgageLates: 'num_mortgage_lates',
    
    // Optional refinance fields
    propertyUse: 'property_use',
    rateType: 'rate_type',
    vaLoan: 'va_loan',
    hasFHALoan: 'fha_loan',
    
    // Home Purchase fields
    estimatedPrice: 'estimated_price',
    estimatedDownPayment: 'estimated_down_payment',
    downPaymentPct: 'estimated_down_payment',
    contactAgent: 'contacted_by_agent',
    contactedByAgent: 'contacted_by_agent',
    
    // Home Sell fields
    reasonToSell: 'reason_to_sell',
    whenToSell: 'when_to_sell',
    timeToSell: 'when_to_sell',
    propertyOccupancy: 'occupancy',
    occupancy: 'occupancy',
    behindOnMortgage: 'behind_on_mortgage',
    mortgagePayments: 'behind_on_mortgage',
    currentlyListed: 'currently_listed',
  };

  // Transform all fields
  Object.keys(formData).forEach(key => {
    if (key === 'smsConsent') {
      return;
    }

    const backendKey = fieldMapping[key] || key;
    let value = formData[key];

    // Sanitize city field to remove periods (LeadProsper only allows letters, hyphens, and spaces)
    if (key === 'city' && typeof value === 'string') {
      value = value.replace(/\./g, '');
    }

    // Map Condo/Town Home to Single Family for LeadProsper
    if ((key === 'propertyType' || key === 'homeType') && typeof value === 'string') {
      const propType = value.toLowerCase();
      if (propType.includes('condo') && propType.includes('town')) {
        value = 'Single Family';
      }
    }

    // Handle data type conversions and transformations
    
    // Convert employmentStatus for Purchase forms (lowercase-hyphenated to Title case)
    if (key === 'employmentStatus' && typeof value === 'string' && lowerServiceType === 'purchase') {
      const employmentMapping: { [key: string]: string } = {
        'full-time': 'Full-time',
        'part-time': 'Part-time',
        'seasonal': 'Seasonal',
        'temporary': 'Temporary',
      };
      value = employmentMapping[value.toLowerCase()] || value;
    }
    
    // Convert creditRating from lowercase to proper case (for Purchase forms)
    // Refinance/Cash Out/HELOC forms already store Title case values, Purchase forms use lowercase
    if (key === 'creditRating' && typeof value === 'string') {
      const creditMapping: { [key: string]: string } = {
        // Purchase form values (lowercase)
        'excellent': 'Excellent',
        'good': 'Good',
        'average': 'Average',
        'poor': 'Poor',
        'unknown': 'Fair', // Map unknown to Fair for Purchase forms
        // Refinance/Cash Out/HELOC form values (already Title case - pass through)
        'Excellent': 'Excellent',
        'Good': 'Good',
        'Average': 'Average',
        'Poor': 'Poor',
        'Very Good': 'Very Good',
        'Fair': 'Fair',
        'Needs Improvement': 'Needs Improvement',
      };
      value = creditMapping[value] || creditMapping[value.toLowerCase()] || value;
    }

    // Convert bankruptcy from lowercase to proper case (for Purchase forms if they use it)
    // Refinance/Cash Out/HELOC forms already store Title case values
    if (key === 'bankruptcy' && typeof value === 'string') {
      const bankruptcyMapping: { [key: string]: string } = {
        // Lowercase values (if any forms still use them)
        'no': 'No',
        'bankruptcy': 'Bankruptcy',
        'foreclosure': 'Foreclosure',
        'both': 'Both',
        // Title case values (already correct - pass through)
        'No': 'No',
        'Bankruptcy': 'Bankruptcy',
        'Foreclosure': 'Foreclosure',
        'Both': 'Both',
      };
      value = bankruptcyMapping[value] || bankruptcyMapping[value.toLowerCase()] || value;
    }

    // Convert additionalCash string to numeric value for cash_out
    if (key === 'additionalCash' && typeof value === 'string') {
      if (value === '0') {
        value = 0;
      } else if (value === 'Over 50,000') {
        value = 50000; // Use 50k as minimum for "Over 50,000"
      } else {
        // Parse ranges like "1 - 5,000" -> take the max value
        const match = value.match(/(\d+(?:,\d+)*)\s*-\s*(\d+(?:,\d+)*)/);
        if (match) {
          value = parseInt(match[2].replace(/,/g, ''));
        }
      }
    }

    // Convert interestRate string to number
    if (key === 'interestRate' && typeof value === 'string') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        value = numValue;
      }
    }

    if (key === 'contactAgent' && typeof value === 'boolean') {
      // Convert boolean to 'Yes'/'No' for both purchase and sell
      value = value ? 'Yes' : 'No';
    }

    if (key === 'mainGoal' && typeof value === 'string') {
      const loanPurposeMapping: { [key: string]: string } = {
        'Take cash out': 'Cash Out',
        'Lower my monthly payment': 'Lowest Payment',
        'Pay off my mortgage faster': 'Debt Consolidation',
        'Change my ARM loan to Fixed': 'Convert to Fixed Rate',
        'Other': 'Cash Out',
        'Cash Out': 'Cash Out',
        'Lowest Payment': 'Lowest Payment',
        'Debt Consolidation': 'Debt Consolidation',
        'Convert to Fixed Rate': 'Convert to Fixed Rate',
        'Home Improvement': 'Home Improvement',
        'Change in Loan Terms': 'Change in Loan Terms',
        'Convert to Adjustable Rate': 'Convert to Adjustable Rate',
        'Lower My Interest Rate': 'Lower My Interest Rate',
      };
      value = loanPurposeMapping[value] || value;
    }

    if ((key === 'mortgageLender' || key === 'currentLender') && typeof value === 'string' && lowerServiceType === 'cash out') {
      const currentLenderMapping: { [key: string]: string } = {
        'Amerisave': 'Amerisave Mortgage',
        'PennyMac': 'PennyMac Loan Services',
        'US Bank': 'US Bank Home Mortgage',
        'Veterans United': 'Veterans Unites',
        'No Lender': 'No lender (Loan Paid Off)',
        'Don\'t know': 'I don\'t know',
        'Freedom Mortgage': 'Freedom Mortgage Corp',
      };
      value = currentLenderMapping[value] || value;
    }

    // Only include non-empty values
    if (value !== undefined && value !== null && value !== '') {
      transformed[backendKey] = value;
    }
  });

  // Extract TCPA text from hidden label (like Westcap)
  const tcpaLabel = document.querySelector('label input[id="leadid_tcpa_disclosure"]')?.closest('label');
  let tcpaText = '';
  if (tcpaLabel) {
    // Get text content from the label, excluding the hidden input
    const labelText = tcpaLabel.textContent || tcpaLabel.innerText || '';
    tcpaText = labelText.trim();
  }
  
  // Fallback to default TCPA text if not found
  if (!tcpaText) {
    tcpaText = "By clicking, you authorize MortgageCo and/or one of their partners to contact you via phone, text or email.";
  }
  
  transformed.tcpa_text = tcpaText;

  // Add token capture data if provided
  if (tokens) {
    if (tokens.jornayaLeadId) {
      // Send to both jornaya_leadid and leadpoint_jornaya_leadid (same value)
      transformed.jornaya_leadid = tokens.jornayaLeadId;
      transformed.leadpoint_jornaya_leadid = tokens.jornayaLeadId;
    }
    
    // TrustedForm Cert URL with multiple fallbacks
    let trustedFormCertUrl = tokens?.trustedFormCertUrl || '';
    
    // Fallback 1: Check URL parameters (most reliable if passed via URL)
    if (!trustedFormCertUrl || !trustedFormCertUrl.trim()) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlCertUrl = urlParams.get('trustedform_cert_url');
      if (urlCertUrl && urlCertUrl.trim()) {
        trustedFormCertUrl = urlCertUrl.trim();
      }
    }
    
    // Fallback 2: Check hidden input field in DOM (TrustedForm populates this)
    // Prioritize trustedform_cert_url (old code main field)
    if (!trustedFormCertUrl || !trustedFormCertUrl.trim()) {
      const inputSelectors = [
        'input[name="trustedform_cert_url"]', // Old code main field (priority)
        'input[id="trustedform_cert_url"]',
        'input[name="xxTrustedFormCertUrl"]',
        'input[id="xxTrustedFormCertUrl"]',
        'input[name="xxTrustedFormToken"]',
        '[name*="trustedform"]',
      ];
      
      for (const selector of inputSelectors) {
        const element = document.querySelector(selector) as HTMLInputElement;
        if (element && element.value && element.value.trim() && element.value.startsWith('http')) {
          trustedFormCertUrl = element.value.trim();
          break;
        }
      }
    }
    
    // Fallback 3: Check window properties (TrustedForm script sets these)
    // Prioritize trustedform_cert_url (old code main field)
    if (!trustedFormCertUrl || !trustedFormCertUrl.trim()) {
      const windowProps = [
        'trustedform_cert_url', // Old code main field (priority)
        'xxTrustedFormCertUrl',
        'xxTrustedFormToken',
        'TrustedFormCertUrl',
      ];
      
      for (const prop of windowProps) {
        const value = (window as any)[prop];
        if (value) {
          let certUrl = '';
          if (typeof value === 'string' && value.trim() && value.startsWith('http')) {
            certUrl = value.trim();
          } else if (value && typeof value === 'object' && value.value && typeof value.value === 'string' && value.value.startsWith('http')) {
            certUrl = value.value.trim();
          }
          
          if (certUrl) {
            trustedFormCertUrl = certUrl;
            break;
          }
        }
      }
    }
    
    // Fallback 4: Check all window properties that might contain TrustedForm data
    if (!trustedFormCertUrl || !trustedFormCertUrl.trim()) {
      const windowKeys = Object.keys(window).filter(key =>
        key.toLowerCase().includes('trustedform') || key.toLowerCase().includes('trusted')
      );
      
      for (const key of windowKeys) {
        const value = (window as any)[key];
        if (typeof value === 'string' && value.startsWith('https://cert.trustedform.com/')) {
          trustedFormCertUrl = value;
          break;
        }
      }
    }
    
    // Add TrustedForm cert URL if found (or send empty string if not found but allow submission)
    if (trustedFormCertUrl && trustedFormCertUrl.trim()) {
      transformed.trustedform_cert_url = trustedFormCertUrl.trim();
    }
    // Don't block submission if TrustedForm cert is missing
    // Optionally send empty string or omit the field entirely
    // transformed.trustedform_cert_url = ''; // Uncomment if you want to send empty string
  }

  return transformed;
};
