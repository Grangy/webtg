import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || "https://grangy.ru/api";
const API_SECRET = process.env.API_SECRET || "[REDACTED]";

export async function GET() {
  try {
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
