import { useState, useCallback } from "react";
import { UserAccount } from "@/types";

export function useUserData() {
  const [user, setUser] = useState<UserAccount | null>(null);

  const loadUserData = useCallback(async (telegramId: string) => {
    console.log("loadUserData called with telegramId:", telegramId);

    try {
      const url = `/api/user/${telegramId}`;
      console.log("Fetching user data from:", url);

      const response = await fetch(url);
      console.log("User data response status:", response.status);

      const result = await response.json();
      console.log("User data response:", JSON.stringify(result, null, 2));

      // Пытаемся также получить баланс отдельно (на случай кэша)
      let balanceFromBalanceEndpoint = null;
      try {
        const balanceResponse = await fetch(`/api/user/${telegramId}/balance`);
        const balanceResult = await balanceResponse.json();
        console.log("Balance endpoint response:", balanceResult);
        if (balanceResult.ok && balanceResult.data?.balance !== undefined) {
          balanceFromBalanceEndpoint =
            typeof balanceResult.data.balance === "number"
              ? balanceResult.data.balance
              : parseInt(balanceResult.data.balance) || 0;
        }
      } catch (balanceError) {
        console.warn("Failed to fetch balance separately:", balanceError);
      }

      if (result.ok && result.data) {
        console.log("Setting user data:", {
          telegramId: result.data.telegramId,
          username: result.data.username,
          balance: result.data.balance,
          balanceFromBalanceEndpoint,
          balanceType: typeof result.data.balance,
          subscriptionsCount: result.data.subscriptions?.length || 0,
        });

        // Используем баланс из отдельного endpoint если он есть, иначе из основного ответа
        const balance =
          balanceFromBalanceEndpoint !== null
            ? balanceFromBalanceEndpoint
            : typeof result.data.balance === "number"
              ? result.data.balance
              : parseInt(result.data.balance) || 0;

        setUser({
          telegramId: result.data.telegramId || telegramId,
          username: result.data.username || "Unknown",
          balance: balance,
          subscriptions: result.data.subscriptions || [],
        });

        console.log("User data set successfully, balance:", balance, "type:", typeof balance);
      } else {
        console.error("User data response not ok:", result);
        setUser({
          telegramId: telegramId,
          username: "Unknown",
          balance: 0,
          subscriptions: [],
        });
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setUser({
        telegramId: telegramId,
        username: "Unknown",
        balance: 0,
        subscriptions: [],
      });
    }
  }, []);

  return {
    user,
    setUser,
    loadUserData,
  };
}
