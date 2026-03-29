// State data for pre-filling home value, mortgage balance, and income based on state selection
// Data sources:
// - Median home prices: WorldPopulationReview (March 2025)
// - Average mortgage balances: Experian (Q1 2025)
// - Annual income: State-specific data

export interface StateData {
  homeValue: number;
  mortgageBalance: number;
  income?: number; // Optional - if not provided, will show slider instead of input
}

export const stateDataMap: Record<string, StateData> = {
  AL: { homeValue: 281000, mortgageBalance: 182264, income: 47943 }, // Alabama
  AK: { homeValue: 383000, mortgageBalance: 266070, income: 69988 }, // Alaska
  AZ: { homeValue: 455000, mortgageBalance: 274792, income: 72282 }, // Arizona
  AR: { homeValue: 253000, mortgageBalance: 168761, income: 44391 }, // Arkansas
  CA: { homeValue: 833000, mortgageBalance: 449576, income: 118258 }, // California
  CO: { homeValue: 582000, mortgageBalance: 346785, income: 86952 }, // Colorado
  CT: { homeValue: 415000, mortgageBalance: 260096, income: 68324 }, // Connecticut
  DC: { homeValue: 643000, mortgageBalance: 510749, income: 134216 }, // District of Columbia
  FL: { homeValue: 412000, mortgageBalance: 257457, income: 71698 }, // Florida
  HI: { homeValue: 743000, mortgageBalance: 413755, income: 105359 }, // Hawaii
  ID: { homeValue: 485000, mortgageBalance: 257644, income: 67771 }, // Idaho
  IA: { homeValue: 228000, mortgageBalance: 160384, income: 43527 }, // Iowa
  KS: { homeValue: 279000, mortgageBalance: 173204, income: 47002 }, // Kansas
  KY: { homeValue: 263000, mortgageBalance: 159129, income: 41922 }, // Kentucky
  ME: { homeValue: 381000, mortgageBalance: 177763, income: 46700 }, // Maine
  MD: { homeValue: 415000, mortgageBalance: 288500, income: 72805 }, // Maryland
  MI: { homeValue: 249000, mortgageBalance: 162525, income: 42838 }, // Michigan
  MN: { homeValue: 354000, mortgageBalance: 214324, income: 56270 }, // Minnesota
  MO: { homeValue: 258000, mortgageBalance: 173623, income: 45533 }, // Missouri
  NE: { homeValue: 289000, mortgageBalance: 178646, income: 47005 }, // Nebraska
  NH: { homeValue: 483000, mortgageBalance: 227672, income: 56728 }, // New Hampshire
  NM: { homeValue: 357000, mortgageBalance: 197950, income: 50877 }, // New Mexico
  ND: { homeValue: 281000, mortgageBalance: 199973, income: 52184 }, // North Dakota
  OH: { homeValue: 241000, mortgageBalance: 152655, income: 39823 }, // Ohio
  OK: { homeValue: 244000, mortgageBalance: 170580, income: 44870 }, // Oklahoma
  OR: { homeValue: 505000, mortgageBalance: 289318, income: 72898 }, // Oregon
  PA: { homeValue: 283000, mortgageBalance: 178705, income: 47007 }, // Pennsylvania
  SD: { homeValue: 320000, mortgageBalance: 195947, income: 52053 }, // South Dakota
  TN: { homeValue: 380000, mortgageBalance: 224239, income: 62545 }, // Tennessee
  TX: { homeValue: 338000, mortgageBalance: 245710, income: 62452 }, // Texas
  UT: { homeValue: 548000, mortgageBalance: 312174, income: 87103 }, // Utah
  VA: { homeValue: 444000, mortgageBalance: 288102, income: 75783 }, // Virginia
  WA: { homeValue: 630000, mortgageBalance: 357849, income: 90808 }, // Washington
  WV: { homeValue: 146578, mortgageBalance: 135930, income: 35247 }, // West Virginia
  WI: { homeValue: 311000, mortgageBalance: 171362, income: 45076 }, // Wisconsin
  WY: { homeValue: 484000, mortgageBalance: 239965, income: 60843 }, // Wyoming
};

/**
 * Get state data for a given state ISO code
 * @param stateCode - Two-letter state ISO code (e.g., "CA", "NY")
 * @returns StateData object with homeValue, mortgageBalance, and optional income, or null if not found
 */
export const getStateData = (stateCode: string | null | undefined): StateData | null => {
  if (!stateCode) return null;
  const upperCode = stateCode.toUpperCase();
  return stateDataMap[upperCode] || null;
};

/**
 * Check if state has income data
 * @param stateCode - Two-letter state ISO code
 * @returns true if state has income data, false otherwise
 */
export const hasStateIncomeData = (stateCode: string | null | undefined): boolean => {
  const stateData = getStateData(stateCode);
  return stateData !== null && stateData.income !== undefined;
};

