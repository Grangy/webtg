import crypto from "crypto";

/**
 * Проверяет подпись initData от Telegram
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramInitData(
  initData: string,
  botToken: string
): { valid: boolean; data: Record<string, string> | null } {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");

    if (!hash) {
      return { valid: false, data: null };
    }

    // Удаляем hash из параметров для проверки
    params.delete("hash");

    // Сортируем параметры и создаём строку для проверки
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    // Создаём secret key из токена бота
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    // Вычисляем hash
    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (calculatedHash !== hash) {
      return { valid: false, data: null };
    }

    // Парсим данные
    const data: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      data[key] = value;
    }

    return { valid: true, data };
  } catch (error) {
    console.error("Error validating Telegram init data:", error);
    return { valid: false, data: null };
  }
}

/**
 * Парсит данные пользователя из initData
 */
export function parseUserFromInitData(data: Record<string, string>) {
  try {
    if (data.user) {
      return JSON.parse(data.user);
    }
    return null;
  } catch {
    return null;
  }
}
