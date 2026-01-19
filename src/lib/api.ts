// MaxGroot API Client

const API_URL = process.env.API_URL || "https://grangy.ru/api";

function getApiSecret(): string {
  const secret = process.env.API_SECRET;
  if (!secret) {
    throw new Error("API_SECRET environment variable is required");
  }
  return secret;
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface Plan {
  id: string;
  label: string;
  price: number;
  months: number;
  pricePerMonth: number;
}

interface Subscription {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  subscriptionUrl: string;
  subscriptionUrl2: string;
  isActive: boolean;
  daysLeft: number;
}

interface User {
  id: number;
  telegramId: string;
  username: string;
  balance: number;
  createdAt: string;
  subscriptions: Subscription[];
}

interface TopupCreateResponse {
  topupId: number;
  orderId: string;
  amount: number;
  paymentUrl: string;
  isFallback: boolean;
}

interface TopupStatus {
  id: number;
  orderId: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "TIMEOUT";
  credited: boolean;
  createdAt: string;
  creditedAt?: string;
}

interface BuySubscriptionResponse {
  subscription: Subscription;
  newBalance: number;
  charged: number;
}

interface InsufficientBalanceError {
  balance: number;
  required: number;
  shortage: number;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    "X-Webapp-Secret": getApiSecret(),
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  // Merge with existing headers if any
  if (options.headers) {
    const existingHeaders = options.headers as Record<string, string>;
    Object.assign(headers, existingHeaders);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API request failed:", error);
    return {
      ok: false,
      error: "NETWORK_ERROR",
      message: "Ошибка сети. Попробуйте позже.",
    };
  }
}

// Получить данные пользователя
export async function getUser(telegramId: string): Promise<ApiResponse<User>> {
  return apiRequest<User>(`/user/${telegramId}`);
}

// Получить баланс
export async function getBalance(telegramId: string): Promise<ApiResponse<{ balance: number }>> {
  return apiRequest<{ balance: number }>(`/user/${telegramId}/balance`);
}

// Получить подписки
export async function getSubscriptions(
  telegramId: string,
  activeOnly = false
): Promise<ApiResponse<Subscription[]>> {
  const query = activeOnly ? "?active=true" : "";
  return apiRequest<Subscription[]>(`/user/${telegramId}/subscriptions${query}`);
}

// Получить тарифы
export async function getPlans(): Promise<ApiResponse<Plan[]>> {
  return apiRequest<Plan[]>("/plans");
}

// Создать платёж для пополнения
export async function createTopup(
  telegramId: string,
  amount: number
): Promise<ApiResponse<TopupCreateResponse>> {
  return apiRequest<TopupCreateResponse>("/topup/create", {
    method: "POST",
    body: JSON.stringify({ telegramId, amount }),
  });
}

// Проверить статус платежа
export async function getTopupStatus(orderId: string): Promise<ApiResponse<TopupStatus>> {
  return apiRequest<TopupStatus>(`/topup/${orderId}/status`);
}

// Купить подписку
export async function buySubscription(
  telegramId: string,
  planId: string
): Promise<ApiResponse<BuySubscriptionResponse>> {
  return apiRequest<BuySubscriptionResponse>("/subscription/buy", {
    method: "POST",
    body: JSON.stringify({ telegramId, planId }),
  });
}

// Экспорт типов
export type {
  Plan,
  Subscription,
  User,
  TopupCreateResponse,
  TopupStatus,
  BuySubscriptionResponse,
  InsufficientBalanceError,
  ApiResponse,
};
