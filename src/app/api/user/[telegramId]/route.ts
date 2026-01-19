import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "https://grangy.ru/api";
const API_SECRET = process.env.API_SECRET || "[REDACTED]";

// Моковые данные для тестирования (временно)
const USE_MOCK_DATA = false; // Переключи на false для реального API

const getMockUserData = (telegramId: string) => {
  return {
    ok: true,
    data: {
      id: 1,
      telegramId: telegramId,
      username: "@testuser",
      balance: 270,
      createdAt: "2026-01-18T00:00:00.000Z",
      subscriptions: []
    }
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ telegramId: string }> }
) {
  const { telegramId } = await params;

  console.log("API /user/[telegramId] called:", {
    telegramId,
    API_URL,
    hasSecret: !!API_SECRET,
    USE_MOCK_DATA
  });

  // Временно используем мок для тестирования
  if (USE_MOCK_DATA) {
    console.log("Using MOCK data for user:", telegramId);
    const mockData = getMockUserData(telegramId);
    return NextResponse.json(mockData);
  }

  try {
    const apiUrl = `${API_URL}/user/${telegramId}`;
    console.log("Fetching from API:", apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        "X-Webapp-Secret": API_SECRET,
      },
    });

    console.log("API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", response.status, errorText);
      return NextResponse.json(
        { 
          ok: false, 
          error: "API_ERROR", 
          message: `API вернул ошибку: ${response.status}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("API response data:", JSON.stringify(data, null, 2));
    
    // Проверяем структуру ответа
    if (!data.ok) {
      console.error("API returned ok: false", data);
    }
    if (!data.data) {
      console.warn("API response missing 'data' field", data);
    }
    if (data.data && typeof data.data.balance === "undefined") {
      console.warn("API response missing 'balance' field", data);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching user:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: `Ошибка сервера: ${errorMessage}` },
      { status: 500 }
    );
  }
}
