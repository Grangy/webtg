import { useState, useCallback } from "react";
import { Plan, PricingMeta } from "@/types";
import { getTelegramInitDataHeaders } from "@/lib/telegramWebApp";

type PlansJson = {
  ok?: boolean;
  data?: Plan[];
  meta?: PricingMeta;
};

async function fetchPlansFromApi(): Promise<PlansJson> {
  const response = await fetch("/api/plans", {
    headers: {
      ...getTelegramInitDataHeaders(),
    },
    cache: "no-store",
  });
  return response.json();
}

function needsUserPricingRetry(meta: PricingMeta | undefined): boolean {
  if (!meta || typeof meta.pricingResolvedBy !== "string") return false;
  return meta.pricingResolvedBy !== "user";
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [pricingWarning, setPricingWarning] = useState<string | null>(null);

  const dismissPricingWarning = useCallback(() => setPricingWarning(null), []);

  const loadPlans = useCallback(async (_force?: boolean) => {
    setPlansLoading(true);
    setPricingWarning(null);
    try {
      let result = await fetchPlansFromApi();
      if (result?.meta) {
        console.log("[plans] meta", result.meta);
      }

      if (result.ok && result.data) {
        setPlans(result.data);
      }

      if (result.ok && result?.meta && needsUserPricingRetry(result.meta)) {
        setPricingWarning("Тарифы без персональной скидки. Повторяем запрос с initData…");
        await new Promise((r) => setTimeout(r, 300));
        const init = typeof window !== "undefined" ? window.Telegram?.WebApp?.initData : "";
        if (!init) {
          setPricingWarning("Откройте приложение из Telegram, чтобы применились персональные цены.");
        } else {
          result = await fetchPlansFromApi();
          if (result?.meta) {
            console.log("[plans] meta (retry)", result.meta);
          }
          if (result.ok && result.data) {
            setPlans(result.data);
          }
          if (result.ok && result?.meta && needsUserPricingRetry(result.meta)) {
            setPricingWarning(
              "Не удалось подтвердить персональную скидку. Закройте и откройте мини-приложение снова."
            );
          } else {
            setPricingWarning(null);
          }
        }
      }
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  return {
    plans,
    plansLoading,
    loadPlans,
    pricingWarning,
    dismissPricingWarning,
  };
}
