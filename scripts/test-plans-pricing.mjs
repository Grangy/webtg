#!/usr/bin/env node
/**
 * Проверка персональных цен /plans с заголовком X-Telegram-Init-Data.
 *
 * Для пользователя с Telegram ID 683203214: откройте мини-приложение под этим
 * аккаунтом, в DevTools → Console выполните:
 *   copy(Telegram.WebApp.initData)
 * и вставьте строку в INIT_DATA ниже (или передайте через env).
 *
 * Usage:
 *   BASE_URL=https://web.grangy.ru INIT_DATA='user=...&hash=...' node scripts/test-plans-pricing.mjs
 *   BASE_URL=http://localhost:3000 INIT_DATA='...' node scripts/test-plans-pricing.mjs
 */

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const INIT_DATA = process.env.INIT_DATA || "";

async function main() {
  const url = `${BASE_URL}/api/plans`;
  const headers = { Accept: "application/json" };
  if (INIT_DATA) headers["X-Telegram-Init-Data"] = INIT_DATA;

  console.log("GET", url);
  console.log("X-Telegram-Init-Data:", INIT_DATA ? `(length ${INIT_DATA.length})` : "(none — анонимные цены)");

  const res = await fetch(url, { headers });
  const body = await res.json().catch(() => ({}));
  console.log("status:", res.status);
  console.log("meta:", body.meta ?? "(no meta)");
  if (body.data && Array.isArray(body.data)) {
    console.log("plans count:", body.data.length);
    console.log("sample:", body.data.slice(0, 3).map((p) => ({ id: p.id, price: p.price, label: p.label })));
  } else {
    console.log("body:", JSON.stringify(body).slice(0, 500));
  }

  if (body.meta?.pricingResolvedBy === "user") {
    console.log("\nOK: pricingResolvedBy=user (персональные цены)");
    process.exit(0);
  }
  if (INIT_DATA && body.meta && body.meta.pricingResolvedBy !== "user") {
    console.error("\nWARN: initData передан, но pricingResolvedBy !== user");
    process.exit(2);
  }
  if (!INIT_DATA) {
    console.log("\nПодсказка: без INIT_DATA бэкенд может отдать базовый прайс.");
    process.exit(0);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
