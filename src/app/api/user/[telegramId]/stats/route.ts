import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "https://grangy.ru/api";
const API_SECRET = process.env.API_SECRET || "[REDACTED]";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ telegramId: string }> }
) {
  const { telegramId } = await params;

  try {
    const response = await fetch(`${API_URL}/user/${telegramId}/stats`, {
      headers: {
        "X-Webapp-Secret": API_SECRET,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
