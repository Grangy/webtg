import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "https://grangy.ru/api";

function getApiSecret(): string {
  const secret = process.env.API_SECRET;
  if (!secret) {
    throw new Error("API_SECRET environment variable is required");
  }
  return secret;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ telegramId: string }> }
) {
  const { telegramId } = await params;
  const { searchParams } = new URL(request.url);
  const active = searchParams.get("active");

  try {
    const url = active 
      ? `${API_URL}/user/${telegramId}/subscriptions?active=${active}`
      : `${API_URL}/user/${telegramId}/subscriptions`;
    
    const response = await fetch(url, {
      headers: {
        "X-Webapp-Secret": getApiSecret(),
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
