import { NextRequest, NextResponse } from "next/server";
import { validateTelegramInitData, parseUserFromInitData } from "@/lib/telegram";

function formatOrderMessage(params: {
  username: string;
  userId: string;
  firstName: string;
  lastName?: string;
  address: string;
  when: string;
}) {
  const who = params.username
    ? `@${params.username}`
    : `${params.firstName}${params.lastName ? ` ${params.lastName}` : ""}`.trim() || "—";
  return [
    "🛒 Заказ роутера",
    "",
    `👤 Кто: ${who} (ID: ${params.userId})`,
    `📅 Когда: ${params.when}`,
    `📍 Адрес доставки СДЭК: ${params.address || "—"}`,
  ].join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initData, address } = body as { initData?: string; address?: string };

    if (!initData || typeof initData !== "string") {
      return NextResponse.json({ error: "initData required" }, { status: 400 });
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const { valid, data } = validateTelegramInitData(initData, botToken);
    if (!valid || !data) {
      return NextResponse.json({ error: "Invalid initData" }, { status: 401 });
    }

    const user = parseUserFromInitData(data);
    if (!user?.id) {
      return NextResponse.json({ error: "User not found in initData" }, { status: 400 });
    }

    const sendToken = process.env.ROUTER_ORDER_BOT_TOKEN;
    const chatIds: string[] = [];
    if (process.env.ROUTER_ORDER_CHAT_ID) chatIds.push(process.env.ROUTER_ORDER_CHAT_ID);
    if (process.env.ADMIN_GROUP_ID) chatIds.push(process.env.ADMIN_GROUP_ID);
    if (!sendToken || chatIds.length === 0) {
      return NextResponse.json(
        { error: "Router order notification not configured" },
        { status: 503 }
      );
    }

    const when = new Date().toLocaleString("ru-RU", {
      dateStyle: "short",
      timeStyle: "medium",
      timeZone: "Europe/Moscow",
    });

    const text = formatOrderMessage({
      username: (user as { username?: string }).username ?? "",
      userId: String(user.id),
      firstName: (user as { first_name?: string }).first_name ?? "",
      lastName: (user as { last_name?: string }).last_name,
      address: typeof address === "string" ? address.trim() : "",
      when,
    });

    for (const chatId of chatIds) {
      const res = await fetch(
        `https://api.telegram.org/bot${sendToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId.trim(),
            text,
            disable_web_page_preview: true,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.text();
        console.error("Telegram sendMessage error:", res.status, chatId, err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Router order API error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
