import { useEffect, useState, useCallback } from "react";
import { UserData } from "@/types";

export function useTelegram() {
  const [mounted, setMounted] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [tgUser, setTgUser] = useState<UserData | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Загрузка Telegram WebApp SDK
    if (typeof window === "undefined") return;

    if (window.Telegram?.WebApp) {
      console.log("Telegram WebApp already loaded");
      return;
    }

    const existingScript = document.querySelector('script[src="https://telegram.org/js/telegram-web-app.js"]');
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if (window.Telegram?.WebApp) {
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

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

        const telegramUser = tg.initDataUnsafe?.user;

        if (telegramUser?.id) {
          setIsTelegram(true);
          setTgUser(telegramUser);
          console.log("Telegram user detected:", { id: telegramUser.id, username: telegramUser.username });
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
                console.log("Telegram user parsed from initData:", { id: parsedUser.id, username: parsedUser.username });
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
