import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "https://grangy.ru/api";

function getApiSecret(): string {
  const secret = process.env.API_SECRET;
  if (!secret) {
    throw new Error("API_SECRET environment variable is required");
  }
  return secret;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, planId, referral_source: referralSource } = body;

    if (!telegramId || !planId) {
      return NextResponse.json(
        { ok: false, error: "INVALID_PARAMS", message: "Укажите telegramId и planId" },
        { status: 400 }
      );
    }

    const apiBody: Record<string, unknown> = { telegramId, planId };
    if (referralSource) apiBody.referral_source = referralSource;

    const response = await fetch(`${API_URL}/subscription/buy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webapp-Secret": getApiSecret(),
      },
      body: JSON.stringify(apiBody),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        data?.message ? data : { ok: false, error: "API_ERROR", message: "Ошибка покупки подписки" },
        { status: response.status }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error buying subscription:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
