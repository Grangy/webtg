import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || "https://grangy.ru/api";

function getApiSecret(): string {
  const secret = process.env.API_SECRET;
  if (!secret) {
    throw new Error("API_SECRET environment variable is required");
  }
  return secret;
}

export async function GET() {
  try {
    const API_SECRET = getApiSecret();
    const response = await fetch(`${API_URL}/plans`, {
      headers: {
        "X-Webapp-Secret": API_SECRET,
      },
      // Кэшируем на 5 минут
      next: { revalidate: 300 },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
