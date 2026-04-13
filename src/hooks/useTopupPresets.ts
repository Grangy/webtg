import { useState, useCallback } from "react";
import { PricingMeta } from "@/types";
import { getTelegramInitDataHeaders } from "@/lib/telegramWebApp";

type PresetsJson = {
  ok?: boolean;
  data?: unknown;
  meta?: PricingMeta;
};

async function fetchPresetsFromApi(): Promise<PresetsJson> {
  const response = await fetch("/api/topup/presets", {
    headers: { ...getTelegramInitDataHeaders() },
    cache: "no-store",
  });
  return response.json();
}

function needsUserPricingRetry(meta: PricingMeta | undefined): boolean {
  if (!meta || typeof meta.pricingResolvedBy !== "string") return false;
  return meta.pricingResolvedBy !== "user";
}

/**
 * Персональные пресеты пополнения. Без localStorage/sessionStorage — только состояние сессии.
 */
export function useTopupPresets() {
  const [presets, setPresets] = useState<unknown>(null);
  const [presetsLoading, setPresetsLoading] = useState(false);
  const [pricingWarning, setPricingWarning] = useState<string | null>(null);

  const dismissPricingWarning = useCallback(() => setPricingWarning(null), []);

  const loadPresets = useCallback(async () => {
    setPresetsLoading(true);
    setPricingWarning(null);
    try {
      let result = await fetchPresetsFromApi();
      if (result?.meta) {
        console.log("[topup/presets] meta", result.meta);
      }
      if (result.ok && result.data !== undefined) {
        setPresets(result.data);
      }

      if (result.ok && result?.meta && needsUserPricingRetry(result.meta)) {
        setPricingWarning("Пресеты без персональной скидки. Повторяем запрос…");
        await new Promise((r) => setTimeout(r, 300));
        const init = typeof window !== "undefined" ? window.Telegram?.WebApp?.initData : "";
        if (!init) {
          setPricingWarning("Откройте приложение из Telegram для персональных сумм пополнения.");
        } else {
          result = await fetchPresetsFromApi();
          if (result?.meta) {
            console.log("[topup/presets] meta (retry)", result.meta);
          }
          if (result.ok && result.data !== undefined) {
            setPresets(result.data);
          }
          if (result.ok && result?.meta && needsUserPricingRetry(result.meta)) {
            setPricingWarning("Не удалось подтвердить персональные пресеты. Откройте мини-приложение снова.");
          } else {
            setPricingWarning(null);
          }
        }
      }
    } catch (e) {
      console.error("Error loading topup presets:", e);
    } finally {
      setPresetsLoading(false);
    }
  }, []);

  return {
    presets,
    presetsLoading,
    loadPresets,
    pricingWarning,
    dismissPricingWarning,
  };
}
