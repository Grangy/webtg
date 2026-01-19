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

export type Step = "loading" | "info" | "plans" | "subscriptions" | "instructions" | "payment" | "processing" | "success" | "error" | "promo" | "account";

export type DeviceType = "ios" | "android" | "android-tv" | "windows" | "macos";
