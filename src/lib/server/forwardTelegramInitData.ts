import { NextRequest } from "next/server";

/** Пробрасывает initData с клиента на бэкенд grangy.ru */
export function withTelegramInitData(
  request: NextRequest,
  headers: Record<string, string>
): Record<string, string> {
  const raw = request.headers.get("x-telegram-init-data");
  if (!raw) return headers;
  return { ...headers, "X-Telegram-Init-Data": raw };
}
