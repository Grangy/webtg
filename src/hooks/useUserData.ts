import { useState, useCallback, useRef } from "react";
import { UserAccount } from "@/types";

const USER_CACHE_MS = 60 * 1000;

function getCachedUser(telegramId: string): UserAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const key = `user_cache_${telegramId}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > USER_CACHE_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function setCachedUser(telegramId: string, data: UserAccount) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`user_cache_${telegramId}`, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    /* ignore */
  }
}

/**
 * Загрузка и принудительная синхронизация баланса и подписок.
 * Кэширует данные в sessionStorage на 1 мин для ускорения.
 */
export function useUserData() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const lastSyncRef = useRef<Record<string, number>>({});

  const loadUserData = useCallback(async (telegramId: string, force = false) => {
    const cached = !force && getCachedUser(telegramId);
    if (cached) {
      setUser(cached);
      if (Date.now() - (lastSyncRef.current[telegramId] ?? 0) < USER_CACHE_MS) return;
    }
    try {
      const response = await fetch(`/api/user/${telegramId}/sync`);
      const result = await response.json();

      if (result.ok && result.data) {
        const balance =
          typeof result.data.balance === "number"
            ? result.data.balance
            : parseInt(result.data.balance) || 0;
        const referralBalance =
          typeof result.data.referralBalance === "number"
            ? result.data.referralBalance
            : undefined;

        const nextUser: UserAccount = {
          telegramId: result.data.telegramId || telegramId,
          username: result.data.username || "Unknown",
          balance,
          ...(referralBalance !== undefined && referralBalance > 0 ? { referralBalance } : {}),
          subscriptions: result.data.subscriptions || [],
        };
        setUser(nextUser);
        setCachedUser(telegramId, nextUser);
        lastSyncRef.current[telegramId] = Date.now();
      } else {
        setUser({
          telegramId,
          username: "Unknown",
          balance: 0,
          subscriptions: [],
        });
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setUser({
        telegramId,
        username: "Unknown",
        balance: 0,
        subscriptions: [],
      });
    }
  }, []);

  const syncUserData = useCallback(
    async (telegramId: string, force = false) => loadUserData(telegramId, force),
    [loadUserData]
  );

  return {
    user,
    setUser,
    loadUserData,
    syncUserData,
  };
}
