import { useState, useCallback, useRef, Dispatch, SetStateAction } from "react";
import { Plan, Subscription, UserData, Step, UserAccount } from "@/types";
import { getStoredReferralSource } from "@/lib/referral";
import { getTelegramInitDataHeaders } from "@/lib/telegramWebApp";

interface UsePaymentProps {
  tgUser: UserData | null;
  selectedPlan: Plan | null;
  user: { telegramId: string } | null;
  setUser: Dispatch<SetStateAction<UserAccount | null>>;
  setStep: Dispatch<SetStateAction<Step>>;
  setErrorMessage: Dispatch<SetStateAction<string>>;
  onSyncAfterPayment?: () => Promise<void>;
}

export function usePayment({
  tgUser,
  selectedPlan,
  user: _user,
  setUser,
  setStep,
  setErrorMessage,
  onSyncAfterPayment,
}: UsePaymentProps) {
  const [orderId, setOrderId] = useState<string>("");
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [newSubscription, setNewSubscription] = useState<Subscription | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getTelegramId = useCallback((): string | null => {
    let telegramId: string | null = null;

    if (tgUser?.id) {
      telegramId = tgUser.id.toString();
    } else if (typeof window !== "undefined" && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      telegramId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
    } else if (typeof window !== "undefined" && window.Telegram?.WebApp?.initData) {
      try {
        const params = new URLSearchParams(window.Telegram.WebApp.initData);
        const userData = params.get("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.id) {
            telegramId = parsedUser.id.toString();
          }
        }
      } catch (e) {
        console.error("Error parsing initData:", e);
      }
    }

    return telegramId;
  }, [tgUser]);

  const buySubscription = useCallback(async () => {
    if (!selectedPlan || !tgUser) return;

    setStep("processing");

    try {
      const referralSource = getStoredReferralSource();
      const response = await fetch("/api/subscription/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getTelegramInitDataHeaders(),
        },
        body: JSON.stringify({
          telegramId: tgUser.id.toString(),
          planId: selectedPlan.id,
          ...(referralSource && { referral_source: referralSource }),
        }),
      });

      const result = await response.json();

      if (result.ok && result.data) {
        setNewSubscription(result.data.subscription);
        setUser((prev) =>
          prev ? { ...prev, balance: result.data.newBalance } : null
        );
        setStep("success");
        await onSyncAfterPayment?.();

        if (typeof window !== "undefined") {
          window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
        }
      } else {
        setErrorMessage(result.message || "Ошибка создания подписки");
        setStep("error");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setErrorMessage("Ошибка сети. Попробуйте позже.");
      setStep("error");
    }
  }, [selectedPlan, tgUser, setUser, setStep, setErrorMessage, onSyncAfterPayment]);

  const buyWithBalance = useCallback(async () => {
    await buySubscription();
  }, [buySubscription]);

  const startPaymentCheck = useCallback(
    (paymentOrderId: string) => {
    setCheckingPayment(true);

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/topup/${paymentOrderId}/status`, {
          headers: { ...getTelegramInitDataHeaders() },
          cache: "no-store",
        });
        const result = await response.json();

        if (result.ok && result.data) {
          if (result.data.status === "SUCCESS") {
            await buySubscription();
            return true;
          } else if (result.data.status === "FAILED" || result.data.status === "TIMEOUT") {
            setErrorMessage("Платёж отменён или истекло время ожидания");
            setStep("error");
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error("Status check error:", error);
        return false;
      }
    };

    const interval = setInterval(async () => {
      const done = await checkStatus();
      if (done) {
        clearInterval(interval);
        checkIntervalRef.current = null;
        setCheckingPayment(false);
      }
    }, 3000);

    checkIntervalRef.current = interval;

    setTimeout(() => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      setCheckingPayment(false);
      setStep("error");
      setErrorMessage("Истекло время ожидания оплаты");
    }, 600000);
    },
    [buySubscription, setStep, setErrorMessage]
  );

  const createPayment = useCallback(async () => {
    if (!selectedPlan) {
      console.error("No plan selected");
      return;
    }

    const telegramId = getTelegramId();
    if (!telegramId) {
      setErrorMessage("Не удалось определить ID пользователя. Откройте приложение через Telegram.");
      setStep("error");
      return;
    }

    setStep("payment");

    try {
      const referralSource = getStoredReferralSource();
      const response = await fetch("/api/topup/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getTelegramInitDataHeaders(),
        },
        body: JSON.stringify({
          telegramId,
          amount: selectedPlan.price,
          ...(referralSource && { referral_source: referralSource }),
        }),
      });

      const result = await response.json();

      if (result.ok && result.data) {
        if (!result.data.paymentUrl) {
          setErrorMessage("Ошибка: не получена ссылка на оплату");
          setStep("error");
          return;
        }

        setOrderId(result.data.orderId);
        setPaymentUrl(result.data.paymentUrl);

        const urlToOpen = result.data.paymentUrl;
        let linkOpened = false;

        if (typeof window !== "undefined" && window.Telegram?.WebApp?.openLink) {
          try {
            window.Telegram.WebApp.openLink(urlToOpen, { try_instant_view: false });
            linkOpened = true;
          } catch (err) {
            console.error("Error opening link:", err);
          }
        }

        if (!linkOpened && typeof window !== "undefined") {
          try {
            window.open(urlToOpen, "_blank");
          } catch (err) {
            console.error("Error opening link:", err);
          }
        }

        startPaymentCheck(result.data.orderId);
      } else {
        const errorMsg = result.message || result.error || "Ошибка создания платежа";
        setErrorMessage(errorMsg);
        setStep("error");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage("Ошибка сети. Попробуйте позже.");
      setStep("error");
    }
  }, [selectedPlan, getTelegramId, setStep, setErrorMessage, startPaymentCheck]);

  const manualCheck = useCallback(async () => {
    if (!orderId) return;

    setCheckingPayment(true);

    try {
      const response = await fetch(`/api/topup/${orderId}/status`, {
        headers: { ...getTelegramInitDataHeaders() },
        cache: "no-store",
      });
      const result = await response.json();

      if (result.ok && result.data) {
        if (result.data.status === "SUCCESS") {
          await buySubscription();
        } else if (result.data.status === "PENDING") {
          if (typeof window !== "undefined") {
            window.Telegram?.WebApp?.showAlert("Оплата ещё не поступила. Подождите немного.");
          }
        } else {
          setErrorMessage("Платёж отменён");
          setStep("error");
        }
      }
    } catch (error) {
      console.error("Manual check error:", error);
    } finally {
      setCheckingPayment(false);
    }
  }, [orderId, buySubscription, setStep, setErrorMessage]);

  const openPaymentUrl = useCallback(() => {
    if (!paymentUrl) return;

    const urlToOpen = paymentUrl;
    if (typeof window !== "undefined" && window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(urlToOpen, { try_instant_view: false });
    } else if (typeof window !== "undefined") {
      window.open(urlToOpen, "_blank");
    }
  }, [paymentUrl]);

  return {
    orderId,
    paymentUrl,
    newSubscription,
    checkingPayment,
    createPayment,
    buyWithBalance,
    manualCheck,
    openPaymentUrl,
    setNewSubscription,
    setPaymentUrl,
  };
}
