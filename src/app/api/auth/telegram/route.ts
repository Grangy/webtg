import { NextRequest, NextResponse } from "next/server";
import { validateTelegramInitData, parseUserFromInitData } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();

    if (!initData) {
      return NextResponse.json(
        { error: "initData is required" },
        { status: 400 }
      );
    }

    const botToken = process.env.BOT_TOKEN;

    if (!botToken || botToken === "your_bot_token_here") {
      // В режиме разработки без токена — показываем данные без проверки
      console.warn("⚠️ BOT_TOKEN not configured, skipping validation");
      
      const params = new URLSearchParams(initData);
      const userData = params.get("user");
      
      return NextResponse.json({
        valid: false,
        warning: "BOT_TOKEN not configured - validation skipped",
        user: userData ? JSON.parse(userData) : null,
        raw: initData,
      });
    }

    const { valid, data } = validateTelegramInitData(initData, botToken);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid initData signature" },
        { status: 401 }
      );
    }

    const user = parseUserFromInitData(data!);

    return NextResponse.json({
      valid: true,
      user,
      auth_date: data?.auth_date,
      query_id: data?.query_id,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
