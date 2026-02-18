import { useState, useCallback } from "react";
import { UserAccount } from "@/types";

/**
 * Загрузка и принудительная синхронизация баланса и подписок.
 * Использует /api/user/[id]/sync — всегда берёт данные из API,
 * суммирует основной баланс + реферальный.
 */
export function useUserData() {
  const [user, setUser] = useState<UserAccount | null>(null);

  const loadUserData = useCallback(async (telegramId: string) => {
    try {
      const response = await fetch(`/api/user/${telegramId}/sync`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache, no-store" },
      });
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

        setUser({
          telegramId: result.data.telegramId || telegramId,
          username: result.data.username || "Unknown",
          balance,
          ...(referralBalance !== undefined && referralBalance > 0 ? { referralBalance } : {}),
          subscriptions: result.data.subscriptions || [],
        });
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
    async (telegramId: string) => loadUserData(telegramId),
    [loadUserData]
  );

  return {
    user,
    setUser,
    loadUserData,
    syncUserData,
  };
}
