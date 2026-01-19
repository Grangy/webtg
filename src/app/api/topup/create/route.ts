import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "https://grangy.ru/api";
const API_SECRET = process.env.API_SECRET || "[REDACTED]";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, amount } = body;

    console.log("Topup create request:", { telegramId, amount, API_URL, hasSecret: !!API_SECRET });

    if (!telegramId || !amount) {
      console.error("Missing params:", { telegramId, amount });
      return NextResponse.json(
        { ok: false, error: "INVALID_PARAMS", message: "Укажите telegramId и amount" },
        { status: 400 }
      );
    }

    const apiUrl = `${API_URL}/topup/create`;
    console.log("Calling API:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webapp-Secret": API_SECRET,
      },
      body: JSON.stringify({ telegramId, amount }),
    });

    console.log("API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", response.status, errorText);
      return NextResponse.json(
        { ok: false, error: "API_ERROR", message: `Ошибка API: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("API response data:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating topup:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: `Ошибка сервера: ${errorMessage}` },
      { status: 500 }
    );
  }
}
