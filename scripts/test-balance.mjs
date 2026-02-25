#!/usr/bin/env node
/**
 * Тест баланса: проверка sync и balance API.
 * Один пользователь: TELEGRAM_ID=123456 node scripts/test-balance.mjs
 * Несколько: node scripts/test-balance.mjs 683203214 467762360
 * Или: TELEGRAM_IDS=683203214,467762360 node scripts/test-balance.mjs
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";
const idsFromEnv = process.env.TELEGRAM_IDS ? process.env.TELEGRAM_IDS.split(",").map((s) => s.trim()) : [];
const idsFromArgs = process.argv.slice(2).filter(Boolean);
const TELEGRAM_IDS = idsFromArgs.length > 0 ? idsFromArgs : idsFromEnv.length > 0 ? idsFromEnv : ["683203214"];

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

async function runAuditForUser(telegramId) {
  const [balanceRes, syncRes, auditRes] = await Promise.all([
    fetchJson(`${BASE}/api/user/${telegramId}/balance`),
    fetchJson(`${BASE}/api/user/${telegramId}/sync`),
    fetchJson(`${BASE}/api/user/${telegramId}/balance/audit`),
  ]);
  const bal = (balanceRes.data?.data ?? balanceRes.data) || {};
  const sync = syncRes.data?.ok ? syncRes.data.data : null;
  const aud = auditRes.data?.parsed ? auditRes.data : null;
  return {
    telegramId,
    balanceOk: balanceRes.ok,
    rawBalance: bal.balance,
    rawBalanceReferral: bal.balanceReferral ?? bal.referralBalance ?? 0,
    rawBalanceFresh: bal.balanceFresh,
    rawTotalBalance: bal.totalBalance ?? bal.currentBalance,
    syncTotal: sync?.balance ?? null,
    syncReferral: sync?.referralBalance ?? null,
    auditMain: aud?.parsed?.mainBalance ?? null,
    auditReferral: aud?.parsed?.referralBalance ?? null,
    auditTotal: aud?.parsed?.ourComputedTotal ?? null,
    formula: aud?.parsed?.formula ?? null,
    keys: aud?.backend?.balance?.keys ?? [],
  };
}

async function main() {
  console.log("=== Аудит баланса по пользователям ===\n");
  console.log("Base URL:", BASE);
  console.log("IDs:", TELEGRAM_IDS.join(", "));
  console.log("");

  const results = [];
  for (const id of TELEGRAM_IDS) {
    process.stderr.write(`Проверяю ${id}... `);
    try {
      const r = await runAuditForUser(id);
      results.push(r);
      process.stderr.write(r.balanceOk ? "OK\n" : "FAIL\n");
    } catch (e) {
      process.stderr.write("ERROR: " + e.message + "\n");
      results.push({
        telegramId: id,
        balanceOk: false,
        error: String(e.message),
      });
    }
  }

  console.log("\n--- Итоговая таблица ---\n");
  console.log("ID         | balance(raw) | referral(raw) | balanceFresh | total(raw) | sync.total | sync.ref | audit.total | formula");
  console.log("-".repeat(120));
  for (const r of results) {
    if (r.error) {
      console.log(r.telegramId, "|", r.error);
      continue;
    }
    const row = [
      String(r.telegramId).padEnd(10),
      String(r.rawBalance ?? "—").padEnd(13),
      String(r.rawBalanceReferral ?? "—").padEnd(14),
      String(r.rawBalanceFresh ?? "—").padEnd(13),
      String(r.rawTotalBalance ?? "—").padEnd(11),
      String(r.syncTotal ?? "—").padEnd(11),
      String(r.syncReferral ?? "—").padEnd(9),
      String(r.auditTotal ?? "—").padEnd(11),
      String(r.formula ?? "—"),
    ].join(" | ");
    console.log(row);
  }

  console.log("\n--- Детали по каждому (balance API keys, referral) ---\n");
  for (const r of results) {
    if (r.error) continue;
    console.log(`ID ${r.telegramId}: keys=${(r.keys || []).join(", ")}; referral=${r.rawBalanceReferral ?? r.auditReferral ?? 0}`);
  }

  console.log("\n=== Готово ===");
  console.log("ТЗ по API: docs/API_BACKEND_SPEC.md");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
