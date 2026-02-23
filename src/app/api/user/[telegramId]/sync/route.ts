import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "https://grangy.ru/api";

function getApiSecret(): string {
  const secret = process.env.API_SECRET;
  if (!secret) {
    throw new Error("API_SECRET environment variable is required");
  }
  return secret;
}

/**
 * Принудительная синхронизация баланса и подписок из API.
 * Баланс: основной + реферальный (если API возвращает отдельно).
 * Без кэширования — всегда свежие данные.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ telegramId: string }> }
) {
  const { telegramId } = await params;
  const API_SECRET = getApiSecret();

  const headers = {
    "X-Webapp-Secret": API_SECRET,
    "Cache-Control": "no-store, no-cache",
  };

  try {
    // Параллельно получаем баланс, пользователя и подписки
    const [balanceRes, userRes, subsRes] = await Promise.all([
      fetch(`${API_URL}/user/${telegramId}/balance`, { headers, cache: "no-store" }),
      fetch(`${API_URL}/user/${telegramId}`, { headers, cache: "no-store" }),
      fetch(`${API_URL}/user/${telegramId}/subscriptions`, { headers, cache: "no-store" }),
    ]);

    const [balanceData, userData, subsData] = await Promise.all([
      balanceRes.json(),
      userRes.json(),
      subsRes.json(),
    ]);

    if (!balanceRes.ok) {
      console.error("Sync: balance API error", balanceRes.status, balanceData);
      return NextResponse.json(
        {
          ok: false,
          error: "SYNC_ERROR",
          message: (balanceData as { message?: string })?.message || "Ошибка загрузки баланса",
        },
        { status: balanceRes.status >= 500 ? 502 : balanceRes.status }
      );
    }

    // Баланс: общий = основной + реферальный. Бэкенд отдаёт balance (основной) и balanceReferral отдельно.
    let totalBalance = 0;
    let referralBalance = 0;
    const bal = (balanceData?.data ?? balanceData) as Record<string, unknown>;
    if (bal) {
      const num = (v: unknown) => (typeof v === "number" ? v : parseInt(String(v ?? 0)) || 0);
      const main = num(bal.balance);
      referralBalance =
        num(bal.referralBalance) ||
        num(bal.referral_balance) ||
        num(bal.balanceReferral) ||
        num(bal.balance_referral) ||
        num(bal.earnedFromReferrals) ||
        0;
      totalBalance = bal.totalBalance != null ? num(bal.totalBalance) : main + referralBalance;
    }

    // Подписки: только из /subscriptions (источник правды)
    let subscriptions: unknown[] = [];
    if (Array.isArray(subsData?.data)) {
      subscriptions = subsData.data;
    } else if (Array.isArray(subsData)) {
      subscriptions = subsData;
    } else if (Array.isArray(userData?.data?.subscriptions)) {
      subscriptions = userData.data.subscriptions;
    }

    return NextResponse.json({
      ok: true,
      data: {
        telegramId,
        username: userData?.data?.username ?? "Unknown",
        balance: totalBalance,
        referralBalance,
        subscriptions,
      },
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Ошибка синхронизации" },
      { status: 500 }
    );
  }
}
