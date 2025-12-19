// Centralized pricing config for Selah
// DodoPayments integration - monthly subscription only

// Premium subscription (monthly)
export const PREMIUM_PRICE_ID = process.env.NEXT_PUBLIC_DODO_PRICE_MONTHLY || "";
export const PREMIUM_AMOUNT = Number(process.env.NEXT_PUBLIC_DODO_PRICE_MONTHLY_AMOUNT) || 9.99;
export const PREMIUM_LABEL = process.env.NEXT_PUBLIC_DODO_PRICE_MONTHLY_LABEL || `$${PREMIUM_AMOUNT.toFixed(2)}/mo`;
export const PREMIUM_BUTTON_TEXT = process.env.NEXT_PUBLIC_DODO_PRICE_MONTHLY_BUTTON_TEXT || `Start 3-Day Free Trial`;

// Free trial days
export const FREE_TRIAL_DAYS = 3;

// Server-side Dodo price ids
export const SERVER_PRICE_ID_PREMIUM = process.env.DODO_PRICE_ID_MONTHLY || "";

// Legacy aliases for backwards compatibility (not used in Selah)
export const SINGLE_PRICE_ID = "";
export const SINGLE_AMOUNT = 0;
export const SINGLE_LABEL = "";
export const SINGLE_BUTTON_TEXT = "";
export const WEEKLY_PRICE_ID = "";
export const WEEKLY_AMOUNT = 0;
export const WEEKLY_LABEL = "";
export const WEEKLY_BUTTON_TEXT = "";
export const SERVER_PRICE_ID_SINGLE = "";
export const SERVER_PRICE_ID_WEEKLY = "";
export const SERVER_PRICE_ID_1 = SERVER_PRICE_ID_SINGLE;
export const SERVER_PRICE_ID_2 = SERVER_PRICE_ID_PREMIUM;

export default {
  SINGLE_PRICE_ID,
  SINGLE_AMOUNT,
  SINGLE_LABEL,
  SINGLE_BUTTON_TEXT,
  PREMIUM_PRICE_ID,
  PREMIUM_AMOUNT,
  PREMIUM_LABEL,
  PREMIUM_BUTTON_TEXT,
  SERVER_PRICE_ID_1,
  SERVER_PRICE_ID_2,
};
