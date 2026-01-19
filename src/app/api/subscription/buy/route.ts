import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "https://grangy.ru/api";
const API_SECRET = process.env.API_SECRET || "[REDACTED]";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, planId } = body;

    if (!telegramId || !planId) {
      return NextResponse.json(
        { ok: false, error: "INVALID_PARAMS", message: "Укажите telegramId и planId" },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/subscription/buy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webapp-Secret": API_SECRET,
      },
      body: JSON.stringify({ telegramId, planId }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error buying subscription:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
