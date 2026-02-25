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
 * Проверка ответов API баланса: сырые ответы бэкенда + как мы их интерпретируем.
 * Помогает понять, что реально отдаёт бэкенд (balance уже потрачен / доступен / total и т.д.).
 * GET /api/user/:telegramId/balance/audit
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ telegramId: string }> }
) {
  const { telegramId } = await params;
  const headers = {
    "X-Webapp-Secret": getApiSecret(),
    "Cache-Control": "no-store",
  };

  try {
    const [balanceRes, debugRes] = await Promise.all([
      fetch(`${API_URL}/user/${telegramId}/balance`, { headers, cache: "no-store" }),
      fetch(`${API_URL}/user/${telegramId}/balance/debug`, { headers, cache: "no-store" }).catch(
        () => null
      ),
    ]);

    const rawBalance = await balanceRes.json();
    const rawDebug = debugRes?.ok ? await debugRes.json() : { _error: "endpoint not available" };

    const bal = (rawBalance?.data ?? rawBalance) as Record<string, unknown>;
    const num = (v: unknown) => (typeof v === "number" ? v : parseInt(String(v ?? 0)) || 0);
    const main = bal ? num(bal.balance) : 0;
    const referral =
      bal &&
      (num(bal.referralBalance) ||
        num(bal.referral_balance) ||
        num(bal.balanceReferral) ||
        num(bal.balance_referral) ||
        num(bal.earnedFromReferrals) ||
        0);
    const totalFromBackend = bal?.totalBalance != null ? num(bal.totalBalance) : null;
    const currentFromBackend = bal?.currentBalance != null ? num(bal.currentBalance) : null;
    const ourTotal =
      totalFromBackend ?? currentFromBackend ?? (main + (referral ?? 0));

    return NextResponse.json({
      ok: true,
      telegramId,
      backend: {
        balance: {
          status: balanceRes.status,
          raw: rawBalance,
          keys: bal ? Object.keys(bal) : [],
        },
        balanceDebug: {
          status: debugRes?.status ?? null,
          raw: rawDebug,
        },
      },
      parsed: {
        mainBalance: main,
        referralBalance: referral ?? 0,
        totalFromBackend,
        currentBalanceFromBackend: currentFromBackend,
        ourComputedTotal: ourTotal,
        formula: totalFromBackend
          ? "totalBalance from API"
          : currentFromBackend
            ? "currentBalance from API"
            : "main + referral",
      },
      recommendation:
        "Использовать для отображения: наш ourComputedTotal. Если бэкенд отдаёт balance как 'уже потраченный' — нужен отдельный ключ availableBalance или totalBalance в API.",
    });
  } catch (e) {
    console.error("Balance audit error:", e);
    return NextResponse.json(
      { ok: false, error: "AUDIT_ERROR", message: String(e) },
      { status: 500 }
    );
  }
}
