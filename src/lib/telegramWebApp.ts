/**
 * Заголовок X-Telegram-Init-Data для запросов из Telegram Mini App.
 * Всегда брать из Telegram.WebApp.initData (подписанная строка).
 */
export function getTelegramInitDataHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const raw = window.Telegram?.WebApp?.initData ?? "";
  if (!raw) return {};
  return { "X-Telegram-Init-Data": raw };
}
