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
    const { telegramId, code } = body;
    const API_SECRET = getApiSecret();

    console.log("Promo activate request:", { telegramId, code, API_URL, hasSecret: !!API_SECRET });

    if (!telegramId || !code) {
      console.error("Missing params:", { telegramId, code });
      return NextResponse.json(
        { ok: false, error: "INVALID_PARAMS", message: "Укажите telegramId и code" },
        { status: 400 }
      );
    }

    const apiUrl = `${API_URL}/promo/activate`;
    console.log("Calling API:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webapp-Secret": API_SECRET,
      },
      body: JSON.stringify({ telegramId, code }),
    });

    console.log("API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", response.status, errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      return NextResponse.json(
        { ok: false, error: "API_ERROR", message: errorData.message || `Ошибка API: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("API response data:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error activating promo:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: `Ошибка сервера: ${errorMessage}` },
      { status: 500 }
    );
  }
}
