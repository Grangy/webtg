// Общие типы приложения

export interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface Plan {
  id: string;
  label: string;
  price: number;
  months: number;
  pricePerMonth: number;
}

export interface Subscription {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  subscriptionUrl: string;
  subscriptionUrl2: string;
  isActive: boolean;
  daysLeft: number;
}

export interface UserAccount {
  telegramId: string;
  username: string;
  balance: number;
  subscriptions: Subscription[];
}

export type Step = "loading" | "info" | "plans" | "subscriptions" | "instructions" | "payment" | "processing" | "success" | "error" | "account";

export type DeviceType = "ios" | "android" | "android-tv" | "windows" | "macos";

// Типы промокодов
export type PromoCodeType = "referral" | "admin_balance" | "admin_days";
export type PromoCategory = "money" | "days" | "referral";
export type RewardType = "balance" | "subscription";

export interface PromoReward {
  type: RewardType;
  amount?: number;
  currency?: string;
  days?: number;
  startDate?: string;
  endDate?: string;
}

export interface PromoActivationData {
  promoType: PromoCodeType;
  promoCategory: PromoCategory;
  message: string;
  code: string;
  reward: PromoReward;
  balance?: {
    current: number;
    currency: string;
  };
  subscription?: Subscription;
}

export interface PromoActivationResult {
  ok: boolean;
  message?: string;
  error?: string;
  data?: PromoActivationData;
}

export interface UserPromoInfo {
  promoCode: string;
  hasPromoCode: boolean;
  activations?: {
    count: number;
    totalAmount: number;
    list: Array<{
      id: number;
      amount: number;
      createdAt: string;
      activator: {
        id: number;
        telegramId: string;
        username?: string;
      };
    }>;
  };
  activated?: {
    amount: number;
    createdAt: string;
    codeOwner: {
      id: number;
      telegramId: string;
      username?: string;
      promoCode: string;
    };
  };
}
