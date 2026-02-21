#!/usr/bin/env node
/**
 * Тест баланса: проверка sync и balance API.
 * Использование: TELEGRAM_ID=123456 node scripts/test-balance.mjs
 * Или: node scripts/test-balance.mjs 123456
 */

const TELEGRAM_ID = process.env.TELEGRAM_ID || process.argv[2] || "683203214";
const BASE = process.env.BASE_URL || "http://localhost:3000";

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  console.log("=== Тест баланса ===\n");
  console.log("Telegram ID:", TELEGRAM_ID);
  console.log("Base URL:", BASE);
  console.log("");

  // 1. Прямой balance (прокси к grangy.ru)
  console.log("1. GET /api/user/:id/balance (raw from backend)");
  const { ok: balOk, status: balStatus, data: balData } = await fetchJson(
    `${BASE}/api/user/${TELEGRAM_ID}/balance`
  );
  console.log("   Status:", balStatus, balOk ? "OK" : "FAIL");
  console.log("   Response:", JSON.stringify(balData, null, 2));
  console.log("");

  // 2. Sync (parsed balance + subscriptions)
  console.log("2. GET /api/user/:id/sync (parsed total, referral, subscriptions)");
  const { ok: syncOk, status: syncStatus, data: syncData } = await fetchJson(
    `${BASE}/api/user/${TELEGRAM_ID}/sync`
  );
  console.log("   Status:", syncStatus, syncOk ? "OK" : "FAIL");
  if (syncData?.ok && syncData?.data) {
    console.log("   balance (total):", syncData.data.balance);
    console.log("   referralBalance:", syncData.data.referralBalance);
    console.log("   subscriptions count:", syncData.data.subscriptions?.length ?? 0);
  } else {
    console.log("   Response:", JSON.stringify(syncData, null, 2));
  }
  console.log("");

  // 3. Debug (если бэкенд поддерживает)
  console.log("3. GET /api/user/:id/balance/debug");
  const { ok: dbgOk, status: dbgStatus, data: dbgData } = await fetchJson(
    `${BASE}/api/user/${TELEGRAM_ID}/balance/debug`
  );
  console.log("   Status:", dbgStatus, dbgOk ? "OK" : "FAIL");
  if (dbgOk) {
    console.log("   Response:", JSON.stringify(dbgData, null, 2).slice(0, 500) + "...");
  }
  console.log("");

  console.log("=== Готово ===");
  console.log("Сравни balance из sync с тем, что показывает бот.");
  console.log("Если различаются — бот и приложение используют разные источники (GET /user vs GET /user/balance).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
