import { useEffect, useState, useCallback } from "react";
import { UserData } from "@/types";
import { getReferralSource } from "@/lib/referral";

const TG_USER_CACHE_KEY = "tg_user_cache";

function getCachedTgUser(): UserData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(TG_USER_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserData;
  } catch {
    return null;
  }
}

function setCachedTgUser(user: UserData) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(TG_USER_CACHE_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

export function useTelegram() {
  const [mounted, setMounted] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [tgUser, setTgUser] = useState<UserData | null>(() => getCachedTgUser());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    if (window.Telegram?.WebApp) return;
    const existingScript = document.querySelector('script[src*="telegram-web-app"]');
    if (existingScript) return;
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    document.head.appendChild(script);
  }, [mounted]);

  const initTelegram = useCallback(async (): Promise<UserData | null> => {
    if (!mounted) return null;

    let attempts = 0;
    const maxAttempts = 20;

    const checkTelegram = async (): Promise<UserData | null> => {
      const tg = window.Telegram?.WebApp;

      if (tg) {
        tg.ready();
        tg.expand();
        // Сохраняем referral source (start_param, напр. happ_press) при запуске
        getReferralSource();

        const telegramUser = tg.initDataUnsafe?.user;

        if (telegramUser?.id) {
          setIsTelegram(true);
          setTgUser(telegramUser);
          setCachedTgUser(telegramUser);
          return telegramUser;
        }

        if (tg.initData && attempts >= 3) {
          try {
            const params = new URLSearchParams(tg.initData);
            const userData = params.get("user");
            if (userData) {
              const parsedUser = JSON.parse(userData);
              if (parsedUser.id) {
                setIsTelegram(true);
                setTgUser(parsedUser);
                setCachedTgUser(parsedUser);
                return parsedUser;
              }
            }
          } catch (e) {
            console.error("Error parsing initData:", e);
          }
        }
      }

      attempts++;
      if (attempts >= maxAttempts) {
        console.warn("Telegram WebApp not detected after", maxAttempts, "attempts");
        setIsTelegram(false);
        return null;
      }

      return null;
    };

    const user = await checkTelegram();
    if (user) return user;

    return new Promise<UserData | null>((resolve) => {
      const interval = setInterval(async () => {
        const foundUser = await checkTelegram();
        if (foundUser) {
          clearInterval(interval);
          resolve(foundUser);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        resolve(null);
      }, maxAttempts * 100);
    });
  }, [mounted]);

  return {
    mounted,
    isTelegram,
    tgUser,
    setTgUser,
    initTelegram,
  };
}
