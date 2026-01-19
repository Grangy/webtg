import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "https://grangy.ru/api";
const API_SECRET = process.env.API_SECRET || "[REDACTED]";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ telegramId: string }> }
) {
  const { telegramId } = await params;

  console.log("API /user/[telegramId]/promo called:", {
    telegramId,
    API_URL,
    hasSecret: !!API_SECRET,
  });

  try {
    const apiUrl = `${API_URL}/user/${telegramId}/promo`;
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
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching user promo:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        ok: false, 
        error: "SERVER_ERROR", 
        message: `Ошибка сервера: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
}
