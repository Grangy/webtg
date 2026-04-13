import { NextRequest, NextResponse } from "next/server";
import { withTelegramInitData } from "@/lib/server/forwardTelegramInitData";

const API_URL = process.env.API_URL || "https://grangy.ru/api";

function getApiSecret(): string {
  const secret = process.env.API_SECRET;
  if (!secret) {
    throw new Error("API_SECRET environment variable is required");
  }
  return secret;
}

/** Прокси GET /topup/presets — персональные суммы пополнения (без кэша). */
export async function GET(request: NextRequest) {
  try {
    const API_SECRET = getApiSecret();
    const headers = withTelegramInitData(request, {
      "X-Webapp-Secret": API_SECRET,
    });

    const response = await fetch(`${API_URL}/topup/presets`, {
      headers,
      cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        data?.message ? data : { ok: false, error: "API_ERROR", message: "Ошибка загрузки пресетов" },
        { status: response.status }
      );
    }
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching topup presets:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
