import { REFERRAL_STORAGE_KEY } from "./constants";

/**
 * Получает referral source (start_param) из Telegram Web App.
 * Источники: tgWebAppStartParam в hash или initDataUnsafe.start_param.
 * При первом получении сохраняет в localStorage для использования при оплате.
 */
export function getReferralSource(): string | null {
  if (typeof window === "undefined") return null;

  // 1. Из hash (Telegram может передать tgWebAppStartParam в URL)
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const fromHash = hashParams.get("tgWebAppStartParam");

  // 2. Из initDataUnsafe (start_param)
  const fromInitData = window.Telegram?.WebApp?.initDataUnsafe?.start_param;

  const ref = fromHash || fromInitData || null;
  if (ref) {
    try {
      localStorage.setItem(REFERRAL_STORAGE_KEY, ref);
    } catch {
      // ignore localStorage errors
    }
  }
  return ref;
}

/**
 * Возвращает сохранённый referral source (из текущего запуска или localStorage).
 * Используется при оплате для передачи referral_source в API.
 */
export function getStoredReferralSource(): string | null {
  if (typeof window === "undefined") return null;
  const current = getReferralSource();
  if (current) return current;
  try {
    const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
    return stored || null;
  } catch {
    return null;
  }
}
