# Universal Form Implementation

## Overview

All 5 mortgage services (HELOC, Cash Out, Refinance, Purchase, Sell) now use the same standardized 14-step form process.

## Form Steps

### Step 1: Service Selection (handled by parent pages)

Which service are you looking for?

- Options: HELOC, Cash Out, Refinance, Purchase, Sell

### Step 2: Main Goal

What's your main goal for exploring loan options?

- Options: Take cash out, Lower my monthly payment, Pay off my mortgage faster, Change my ARM loan to Fixed, Other

### Step 3: Home Type

What type of property is this?

- Options: Single family, Townhouse/condo, Mobile/trailer, Manufactured home

### Step 4: Home Value

How much is your home worth?

- Slider: $50,000 - $10,000,000

### Step 5: Mortgage Balance

Approximate Mortgage Balance

- Slider: $0 - $1,800,000

### Step 6: Additional Cash

How much additional cash do you wish to borrow?

- Options: 0, 1-5,000, 5,001-10,000, 10,001-15,000, 15,001-20,000, 20,001-25,000, 25,001-30,000, 30,001-35,000, 35,001-40,000, 40,001-45,000, 45,001-50,000, Over 50,000

### Step 7: FHA Loan Status

Do you currently have an FHA loan?

- Options: Yes, No, I don't know

### Step 8: Mortgage Lender

Who do you make your mortgage payment to?

- Options: Amerisave, Bank of America, Caliber Home Loans, Chase, Citibank, Freedom Mortgage, PennyMac, Quicken Loans, Rocket Mortgage, US Bank, USAA Federal Savings Bank, Veterans United, Wells Fargo, Other, No Lender, Don't know

### Step 9: Interest Rate

What is your mortgage interest rate? (OK to estimate)

- Options: 11+%, 10.75%, 10.50%, ... down to 2.00%

### Step 10: Employment Status

What is your employment status?

- Options: Employed, Self-employed, Retired, Other

### Step 11: Credit Rating

What's Your Credit Rating?

- Options: Excellent (680+), Good (620-679), Average (550-619), Poor (549 or below), Don't Know

### Step 12: Financial History

Have you had a bankruptcy or foreclosure in the last 7 years?

- Options: No, Bankruptcy, Foreclosure, Both

### Step 13: Property Address

Enter the address of the property

- Google Autocomplete or manual entry
- Fields: Street address, City, State, ZIP

### Step 14: Contact Information

Contact details

- Fields: First Name, Last Name, Email, Phone

## Technical Implementation

### Files Modified

- `/src/components/Heloc/UniversalService.tsx` - New universal form component
- `/src/pages/Heloc.tsx` - Updated to use UniversalService
- `/src/pages/Cashout.tsx` - Updated to use UniversalService
- `/src/pages/Refinance.tsx` - Updated to use UniversalService
- `/src/pages/Purchase.tsx` - Updated to use UniversalService
- `/src/pages/Sell.tsx` - Updated to use UniversalService

### Key Features

- **Consistent UX**: All services follow the same 14-step flow
- **Form Validation**: Step-by-step validation using react-hook-form and zod
- **Auto-advance**: Many steps auto-advance after selection for better UX
- **Progress Tracking**: Visual progress bar shows completion percentage
- **Responsive Design**: Works on both desktop and mobile
- **Error Handling**: Comprehensive validation with user-friendly error messages

### Data Schema

All forms now collect the same standardized data:

```typescript
{
  serviceType: string,
  mainGoal: string,
  homeType: string,
  homeValue: number,
  mortgageBalance: number,
  additionalCash: string,
  hasFHALoan: string,
  mortgageLender: string,
  interestRate: string,
  employmentStatus: string,
  creditRating: string,
  bankruptcy: string,
  propertyAddress: string,
  zip: string,
  city: string,
  state: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string
}
```

## Navigation

- Each page maintains its own service selection as step 1
- UniversalService handles steps 2-14 internally
- Consistent Previous/Next navigation
- Form submission handled uniformly across all services
