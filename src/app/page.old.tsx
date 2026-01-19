"use client";

import { useEffect, useState, useCallback } from "react";
import Script from "next/script";

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface Plan {
  id: string;
  label: string;
  price: number;
  months: number;
  pricePerMonth: number;
}

interface Subscription {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  subscriptionUrl: string;
  subscriptionUrl2: string;
  isActive: boolean;
  daysLeft: number;
}

interface UserAccount {
  telegramId: string;
  username: string;
  balance: number;
  subscriptions: Subscription[];
}

type Step = "loading" | "plans" | "payment" | "processing" | "success" | "error";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [tgUser, setTgUser] = useState<UserData | null>(null);
  
  // Data State
  const [user, setUser] = useState<UserAccount | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [plansLoading, setPlansLoading] = useState(true);
  
  // Flow State
  const [step, setStep] = useState<Step>("loading");
  const [orderId, setOrderId] = useState<string>("");
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [newSubscription, setNewSubscription] = useState<Subscription | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // UI State
  const [copied, setCopied] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Загрузка данных пользователя
  const loadUserData = useCallback(async (telegramId: string) => {
    console.log("loadUserData called with telegramId:", telegramId);
    
    try {
      // Загружаем основные данные пользователя
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
          balanceFromBalanceEndpoint = typeof balanceResult.data.balance === "number" 
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
        const balance = balanceFromBalanceEndpoint !== null 
          ? balanceFromBalanceEndpoint
          : (typeof result.data.balance === "number" 
              ? result.data.balance 
              : parseInt(result.data.balance) || 0);
        
        setUser({
          telegramId: result.data.telegramId || telegramId,
          username: result.data.username || "Unknown",
          balance: balance,
          subscriptions: result.data.subscriptions || [],
        });
        
        console.log("User data set successfully, balance:", balance, "type:", typeof balance);
      } else {
        console.error("User data response not ok:", result);
        // Устанавливаем пользователя с нулевым балансом для отображения
        setUser({
          telegramId: telegramId,
          username: "Unknown",
          balance: 0,
          subscriptions: [],
        });
      }
    } catch (error) {
      console.error("Error loading user:", error);
      // Устанавливаем пользователя с нулевым балансом при ошибке
      setUser({
        telegramId: telegramId,
        username: "Unknown",
        balance: 0,
        subscriptions: [],
      });
    }
  }, []);

  // Загрузка тарифов
  const loadPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const response = await fetch("/api/plans");
      const result = await response.json();
      
      if (result.ok && result.data) {
        setPlans(result.data);
      }
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setPlansLoading(false);
    }
  }, []);


  // Инициализация
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Загружаем тарифы сразу
    loadPlans();

    const init = async () => {
      // Ждём загрузки Telegram WebApp SDK
      let attempts = 0;
      const maxAttempts = 20;
      
      const checkTelegram = async () => {
        const tg = window.Telegram?.WebApp;
        
        if (tg) {
          tg.ready();
          tg.expand();
          
          // Проверяем наличие user в initDataUnsafe (самый надежный способ)
          const telegramUser = tg.initDataUnsafe?.user;
          
          if (telegramUser?.id) {
            // Мы в Telegram и есть данные пользователя
            setIsTelegram(true);
            setTgUser(telegramUser);
            console.log("Telegram user detected:", { id: telegramUser.id, username: telegramUser.username });
            await loadUserData(telegramUser.id.toString());
            setStep("plans");
            return true;
          }
          
          // Если нет user, но есть initData - пытаемся распарсить
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
                  await loadUserData(parsedUser.id.toString());
                  setStep("plans");
                  return true;
                }
              }
            } catch (e) {
              console.error("Error parsing initData:", e);
            }
          }
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          // Таймаут — показываем страницу
          console.warn("Telegram WebApp not detected after", maxAttempts, "attempts");
          setIsTelegram(false);
          setStep("plans");
          return true;
        }
        
        return false;
      };
      
      // Первая проверка
      if (await checkTelegram()) return;
      
      // Повторные проверки каждые 100мс
      const interval = setInterval(async () => {
        if (await checkTelegram()) {
          clearInterval(interval);
        }
      }, 100);
      
      return () => clearInterval(interval);
    };

    init();
  }, [mounted, loadUserData, loadPlans]);

  // Создание платежа
  const handleCreatePayment = async () => {
    if (!selectedPlan) {
      console.error("No plan selected");
      return;
    }

    // Получаем telegramId из разных источников
    let telegramId: string | null = null;
    
    console.log("Checking for telegram ID:", {
      tgUser: tgUser ? { id: tgUser.id, first_name: tgUser.first_name } : null,
      windowTelegram: typeof window !== "undefined" ? !!window.Telegram : false,
      webApp: typeof window !== "undefined" && window.Telegram ? !!window.Telegram.WebApp : false,
      initDataUnsafe: typeof window !== "undefined" && window.Telegram?.WebApp ? !!window.Telegram.WebApp.initDataUnsafe : false,
      user: typeof window !== "undefined" && window.Telegram?.WebApp?.initDataUnsafe ? !!window.Telegram.WebApp.initDataUnsafe.user : false,
      userId: typeof window !== "undefined" && window.Telegram?.WebApp?.initDataUnsafe?.user ? window.Telegram.WebApp.initDataUnsafe.user.id : null,
    });

    // Вариант 1: из состояния tgUser
    if (tgUser?.id) {
      telegramId = tgUser.id.toString();
      console.log("Got ID from tgUser state:", telegramId);
    }
    
    // Вариант 2: из window.Telegram.WebApp.initDataUnsafe.user
    if (!telegramId && typeof window !== "undefined") {
      const tg = window.Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user?.id) {
        telegramId = tg.initDataUnsafe.user.id.toString();
        console.log("Got ID from initDataUnsafe:", telegramId);
        if (!tgUser) {
          setTgUser(tg.initDataUnsafe.user);
        }
      }
    }
    
    // Вариант 3: из initData (парсим строку)
    if (!telegramId && typeof window !== "undefined") {
      const tg = window.Telegram?.WebApp;
      if (tg?.initData) {
        try {
          const params = new URLSearchParams(tg.initData);
          const userData = params.get("user");
          if (userData) {
            const user = JSON.parse(userData);
            if (user.id) {
              telegramId = user.id.toString();
              console.log("Got ID from initData string:", telegramId);
              if (!tgUser) {
                setTgUser(user);
              }
            }
          }
        } catch (e) {
          console.error("Error parsing initData:", e);
        }
      }
    }

    if (!telegramId) {
      console.error("No telegram user ID found - Debug info:", {
        tgUser,
        windowTelegram: typeof window !== "undefined" ? window.Telegram : undefined,
        initData: typeof window !== "undefined" && window.Telegram?.WebApp ? window.Telegram.WebApp.initData : undefined,
        initDataUnsafe: typeof window !== "undefined" && window.Telegram?.WebApp ? window.Telegram.WebApp.initDataUnsafe : undefined,
      });
      setErrorMessage("Не удалось определить ID пользователя. Откройте приложение через Telegram.");
      setStep("error");
      return;
    }

    console.log("Creating payment:", { telegramId, amount: selectedPlan.price, plan: selectedPlan.id });
    setStep("payment");
    
    try {
      const response = await fetch("/api/topup/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId,
          amount: selectedPlan.price,
        }),
      });

      const result = await response.json();
      console.log("Payment creation response:", result);

      if (result.ok && result.data) {
        if (!result.data.paymentUrl) {
          console.error("No paymentUrl in response:", result);
          setErrorMessage("Ошибка: не получена ссылка на оплату");
          setStep("error");
          return;
        }
        
        setOrderId(result.data.orderId);
        setPaymentUrl(result.data.paymentUrl);
        
        // Открываем ссылку на оплату
        const paymentUrlToOpen = result.data.paymentUrl;
        console.log("Opening payment URL:", paymentUrlToOpen);
        console.log("Telegram WebApp available:", typeof window !== "undefined" && !!window.Telegram?.WebApp);
        console.log("openLink available:", typeof window !== "undefined" && !!window.Telegram?.WebApp?.openLink);
        
        // Пробуем открыть ссылку разными способами
        let linkOpened = false;
        
        if (typeof window !== "undefined" && window.Telegram?.WebApp?.openLink) {
          try {
            window.Telegram.WebApp.openLink(paymentUrlToOpen, { try_instant_view: false });
            linkOpened = true;
            console.log("Link opened via Telegram.WebApp.openLink");
          } catch (error) {
            console.error("Error opening link via openLink:", error);
          }
        }
        
        if (!linkOpened && typeof window !== "undefined") {
          try {
            window.open(paymentUrlToOpen, "_blank");
            linkOpened = true;
            console.log("Link opened via window.open");
          } catch (error) {
            console.error("Error opening link via window.open:", error);
          }
        }
        
        if (!linkOpened) {
          console.warn("Failed to open payment URL automatically - user can use the button below");
        }
        
        // Начинаем проверку статуса
        startPaymentCheck(result.data.orderId);
      } else {
        const errorMsg = result.message || result.error || "Ошибка создания платежа";
        console.error("Payment creation failed:", result);
        setErrorMessage(errorMsg);
        setStep("error");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setErrorMessage("Ошибка сети. Попробуйте позже.");
      setStep("error");
    }
  };

  // Проверка статуса платежа
  const startPaymentCheck = (paymentOrderId: string) => {
    setCheckingPayment(true);
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/topup/${paymentOrderId}/status`);
        const result = await response.json();

        if (result.ok && result.data) {
          if (result.data.status === "SUCCESS") {
            // Платёж успешен — покупаем подписку
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

    // Проверяем каждые 3 секунды
    const interval = setInterval(async () => {
      const done = await checkStatus();
      if (done) {
        clearInterval(interval);
        setCheckingPayment(false);
      }
    }, 3000);

    // Таймаут через 10 минут
    setTimeout(() => {
      clearInterval(interval);
      setCheckingPayment(false);
      if (step === "payment") {
        setErrorMessage("Истекло время ожидания оплаты");
        setStep("error");
      }
    }, 600000);
  };

  // Покупка подписки после оплаты
  const buySubscription = async () => {
    if (!selectedPlan || !tgUser) return;

    setStep("processing");

    try {
      const response = await fetch("/api/subscription/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: tgUser.id.toString(),
          planId: selectedPlan.id,
        }),
      });

      const result = await response.json();

      if (result.ok && result.data) {
        setNewSubscription(result.data.subscription);
        if (user) {
          setUser({ ...user, balance: result.data.newBalance });
        }
        setStep("success");
        
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
  };

  // Ручная проверка статуса
  const handleManualCheck = async () => {
    if (!orderId) return;
    
    setCheckingPayment(true);
    
    try {
      const response = await fetch(`/api/topup/${orderId}/status`);
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
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    if (typeof window !== "undefined") {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    }
  };

  const handleBack = () => {
    setStep("plans");
    setOrderId("");
    setPaymentUrl("");
    setErrorMessage("");
    if (typeof window !== "undefined") {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (typeof window !== "undefined") {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
    }
  };

  // Формирует ссылку для Happ в формате happ://add/URL_ENCODED
  const formatHappLink = (url: string): string => {
    const encodedUrl = encodeURIComponent(url);
    return `happ://add/${encodedUrl}`;
  };

  const openSubscriptionLink = (url: string) => {
    const happLink = formatHappLink(url);
    console.log("Opening Happ link:", happLink, "from original URL:", url);
    
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.openLink(happLink);
    } else if (typeof window !== "undefined") {
      // Пробуем открыть happ:// ссылку
      window.location.href = happLink;
    }
  };

  const getMonthWord = (months: number) => {
    if (months === 1) return "месяц";
    if (months >= 2 && months <= 4) return "месяца";
    return "месяцев";
  };

  const getDiscount = (plan: Plan) => {
    if (plans.length === 0) return 0;
    const basePrice = plans[0]?.pricePerMonth || plan.pricePerMonth;
    if (plan.pricePerMonth >= basePrice) return 0;
    return Math.round((1 - plan.pricePerMonth / basePrice) * 100);
  };

  // Загрузка Telegram WebApp SDK
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Проверяем, не загружен ли уже скрипт
    if (window.Telegram?.WebApp) {
      console.log("Telegram WebApp already loaded");
      return;
    }

    // Проверяем, не добавлен ли уже тег скрипта
    const existingScript = document.querySelector('script[src="https://telegram.org/js/telegram-web-app.js"]');
    if (existingScript) {
      console.log("Telegram script tag already exists, waiting for load...");
      // Ждём загрузки скрипта
      const checkInterval = setInterval(() => {
        if (window.Telegram?.WebApp) {
          clearInterval(checkInterval);
          console.log("Telegram WebApp loaded after waiting");
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    // Создаём и добавляем тег скрипта
    console.log("Loading Telegram WebApp SDK...");
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    script.onload = () => {
      console.log("Telegram WebApp SDK loaded successfully");
      if (window.Telegram?.WebApp) {
        console.log("window.Telegram.WebApp is available");
      } else {
        console.error("window.Telegram.WebApp is NOT available after script load");
      }
    };
    script.onerror = () => {
      console.error("Failed to load Telegram WebApp SDK");
    };
    document.head.appendChild(script);

    return () => {
      // Не удаляем скрипт при размонтировании
    };
  }, []);

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Next.js Script component loaded Telegram SDK");
        }}
        onError={() => {
          console.error("Next.js Script component failed to load Telegram SDK");
        }}
      />

      <main className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Loading */}
        {step === "loading" && (
          <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-zinc-500 mt-6 animate-pulse">Загрузка...</p>
          </div>
        )}

        {/* Main Content */}
        {step !== "loading" && (
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
              <div className="relative px-6 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  {(step === "payment" || step === "error") && (
                    <button
                      onClick={handleBack}
                      className="w-10 h-10 bg-zinc-800/80 rounded-xl flex items-center justify-center hover:bg-zinc-700 transition-all active:scale-95"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <span className="text-xl font-bold text-white">MaxGroot</span>
                    </div>
                  </div>
                  {user && (
                    <div className="flex items-center gap-2 bg-zinc-800/80 rounded-xl px-3 py-2">
                      <span className="text-emerald-400 font-bold">{user.balance} ₽</span>
                    </div>
                  )}
                  {tgUser && (
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-sm font-bold">
                      {tgUser.first_name[0]}
                    </div>
                  )}
                </div>

                {/* Step Indicator */}
                {(step === "plans" || step === "payment" || step === "processing" || step === "success") && (
                  <div className="flex items-center gap-2">
                    {[
                      { id: "plans", label: "Тариф" },
                      { id: "payment", label: "Оплата" },
                      { id: "success", label: "Готово" },
                    ].map((s, i) => {
                      const stepOrder = ["plans", "payment", "processing", "success"];
                      const currentIndex = stepOrder.indexOf(step);
                      const itemIndex = s.id === "payment" ? 1 : s.id === "success" ? 2 : 0;
                      const isActive = step === s.id || (step === "processing" && s.id === "payment");
                      const isCompleted = currentIndex > itemIndex || (step === "processing" && itemIndex < 1);

                      return (
                        <div key={s.id} className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                            isActive
                              ? "bg-emerald-500 text-white"
                              : isCompleted
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-zinc-800 text-zinc-500"
                          }`}>
                            {isCompleted ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              i + 1
                            )}
                          </div>
                          {i < 2 && (
                            <div className={`w-12 h-0.5 rounded-full transition-all ${
                              isCompleted ? "bg-emerald-500" : "bg-zinc-800"
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 pb-6">
              {/* Step 1: Plans */}
              {step === "plans" && (
                <div className="animate-in fade-in duration-300">
                  <h1 className="text-2xl font-bold text-white mb-2">Выберите тариф</h1>
                  <p className="text-zinc-500 mb-6">Безлимитный VPN для всех устройств</p>

                  {/* Active Subscriptions */}
                  {user && user.subscriptions.filter(s => s.isActive).length > 0 && (
                    <div className="mb-6">
                      <p className="text-zinc-400 text-sm font-medium mb-3">Активные подписки:</p>
                      {user.subscriptions.filter(s => s.isActive).map((sub) => (
                        <div key={sub.id} className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-emerald-400 font-semibold">{sub.type}</span>
                            <span className="text-zinc-400 text-sm">{sub.daysLeft} дней осталось</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(sub.subscriptionUrl)}
                            className="w-full p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl text-sm text-zinc-300 transition-all"
                          >
                            Скопировать ключ подключения
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Plans */}
                  {plansLoading ? (
                    <div className="flex flex-col items-center py-8 mb-6">
                      <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin mb-3" />
                      <p className="text-zinc-500 text-sm">Загрузка тарифов...</p>
                    </div>
                  ) : plans.length === 0 ? (
                    <div className="text-center py-8 mb-6">
                      <p className="text-zinc-500">Не удалось загрузить тарифы</p>
                      <button 
                        onClick={loadPlans}
                        className="mt-2 text-emerald-400 text-sm hover:underline"
                      >
                        Попробовать снова
                      </button>
                    </div>
                  ) : (
                  <div className="space-y-3 mb-6">
                    {plans.map((plan) => {
                      const discount = getDiscount(plan);
                      const isPopular = plan.months === 6;
                      
                      return (
                        <button
                          key={plan.id}
                          onClick={() => handleSelectPlan(plan)}
                          className={`w-full p-4 rounded-2xl border-2 transition-all active:scale-[0.98] relative overflow-hidden ${
                            selectedPlan?.id === plan.id
                              ? "bg-emerald-500/10 border-emerald-500"
                              : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          {isPopular && (
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                              Популярный
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                selectedPlan?.id === plan.id
                                  ? "border-emerald-500 bg-emerald-500"
                                  : "border-zinc-600"
                              }`}>
                                {selectedPlan?.id === plan.id && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <div className="text-left">
                                <p className="text-white font-semibold text-lg">{plan.label}</p>
                                <p className="text-zinc-500 text-sm">{plan.pricePerMonth} ₽/мес</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold text-xl">{plan.price} ₽</p>
                              {discount > 0 && (
                                <p className="text-emerald-400 text-sm font-medium">-{discount}%</p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  )}

                  {/* Features */}
                  <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50 mb-6">
                    <p className="text-zinc-400 text-sm font-medium mb-3">Что включено:</p>
                    <div className="space-y-2">
                      {[
                        "Безлимитный трафик",
                        "50+ локаций по всему миру",
                        "До 5 устройств одновременно",
                        "Поддержка 24/7",
                        "Без логов и отслеживания",
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-zinc-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleCreatePayment}
                    disabled={!selectedPlan}
                    className={`w-full p-4 rounded-2xl font-semibold text-lg transition-all active:scale-[0.98] ${
                      selectedPlan
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    }`}
                  >
                    {selectedPlan ? `Оплатить через СБП • ${selectedPlan.price} ₽` : "Выберите тариф"}
                  </button>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === "payment" && selectedPlan && (
                <div className="animate-in fade-in duration-300">
                  <h1 className="text-2xl font-bold text-white mb-2">Ожидание оплаты</h1>
                  <p className="text-zinc-500 mb-6">Завершите оплату в открывшемся окне</p>

                  {/* Order Info */}
                  <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 overflow-hidden mb-6">
                    <div className="p-4 border-b border-zinc-800/50">
                      <p className="text-zinc-500 text-sm">Тариф</p>
                      <p className="text-white font-semibold text-lg">
                        MaxGroot VPN • {selectedPlan.label}
                      </p>
                    </div>
                    <div className="p-4 bg-zinc-800/30">
                      <div className="flex items-center justify-between">
                        <p className="text-zinc-400">К оплате</p>
                        <p className="text-white font-bold text-2xl">{selectedPlan.price} ₽</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment URL - отображение и кнопка открытия */}
                  {paymentUrl && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-6">
                      <p className="text-emerald-400 text-sm font-medium mb-3">Ссылка для оплаты:</p>
                      <div className="flex items-center gap-2 mb-3">
                        <code className="text-emerald-400 font-mono text-xs flex-1 truncate bg-black/30 p-2 rounded">
                          {paymentUrl}
                        </code>
                        <button
                          onClick={() => copyToClipboard(paymentUrl)}
                          className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all active:scale-95 flex-shrink-0"
                        >
                          {copied ? (
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          const urlToOpen = paymentUrl;
                          console.log("Manual open payment URL:", urlToOpen);
                          
                          if (typeof window !== "undefined" && window.Telegram?.WebApp?.openLink) {
                            window.Telegram.WebApp.openLink(urlToOpen, { try_instant_view: false });
                          } else if (typeof window !== "undefined") {
                            window.open(urlToOpen, "_blank");
                          }
                        }}
                        className="w-full p-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Открыть ссылку на оплату
                      </button>
                    </div>
                  )}

                  {/* Status */}
                  <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 mb-6">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 border-4 border-zinc-700 border-t-emerald-500 rounded-full animate-spin mb-4" />
                      <p className="text-white font-medium mb-1">Ожидаем подтверждение</p>
                      <p className="text-zinc-500 text-sm text-center">
                        После оплаты подписка активируется автоматически
                      </p>
                    </div>
                  </div>

                  {/* Manual Check */}
                  <button
                    onClick={handleManualCheck}
                    disabled={checkingPayment}
                    className="w-full p-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-2xl transition-all active:scale-[0.98] border border-zinc-700 flex items-center justify-center gap-2"
                  >
                    {checkingPayment ? (
                      <>
                        <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                        Проверяем...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Я уже оплатил
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Processing */}
              {step === "processing" && (
                <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center py-12">
                  <div className="w-20 h-20 border-4 border-zinc-700 border-t-emerald-500 rounded-full animate-spin mb-6" />
                  <h2 className="text-xl font-bold text-white mb-2">Активируем подписку</h2>
                  <p className="text-zinc-500 text-center">Это займёт несколько секунд...</p>
                </div>
              )}

              {/* Success */}
              {step === "success" && newSubscription && (
                <div className="animate-in fade-in duration-300">
                  {/* Success Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <h1 className="text-2xl font-bold text-white text-center mb-2">Подписка активирована!</h1>
                  <p className="text-zinc-500 text-center mb-6">
                    VPN готов к использованию
                  </p>

                  {/* Subscription Info */}
                  <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 overflow-hidden mb-4">
                    <div className="p-4 border-b border-zinc-800/50">
                      <p className="text-zinc-500 text-sm mb-1">Ссылка для подключения (Сервер 1)</p>
                      <div className="flex items-center gap-2">
                        <code className="text-emerald-400 font-mono text-sm flex-1 truncate">
                          {newSubscription.subscriptionUrl}
                        </code>
                        <button
                          onClick={() => copyToClipboard(newSubscription.subscriptionUrl)}
                          className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all active:scale-95 flex-shrink-0"
                        >
                          <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {newSubscription.subscriptionUrl2 && (
                      <div className="p-4 border-b border-zinc-800/50">
                        <p className="text-zinc-500 text-sm mb-1">Ссылка для подключения (Сервер 2 - Россия)</p>
                        <div className="flex items-center gap-2">
                          <code className="text-emerald-400 font-mono text-sm flex-1 truncate">
                            {newSubscription.subscriptionUrl2}
                          </code>
                          <button
                            onClick={() => copyToClipboard(newSubscription.subscriptionUrl2)}
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all active:scale-95 flex-shrink-0"
                          >
                            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-zinc-500 text-sm mb-1">Действует до</p>
                      <p className="text-white font-semibold">
                        {new Date(newSubscription.endDate).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
          </p>
        </div>
                  </div>

                  {/* Quick Actions */}
                  <button
                    onClick={() => openSubscriptionLink(newSubscription.subscriptionUrl)}
                    className="w-full p-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 mb-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Открыть в приложении
                  </button>

                  <button
                    onClick={() => copyToClipboard(formatHappLink(newSubscription.subscriptionUrl))}
                    className="w-full p-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-2xl transition-all active:scale-[0.98] border border-zinc-700 mb-3"
                  >
                    Скопировать ссылку Happ
                  </button>

                  <button
                    onClick={() => {
                      setStep("plans");
                      setSelectedPlan(null);
                      setNewSubscription(null);
                      if (tgUser) {
                        loadUserData(tgUser.id.toString());
                      }
                    }}
                    className="w-full p-4 bg-zinc-800/50 hover:bg-zinc-800 text-white font-medium rounded-2xl transition-all active:scale-[0.98] border border-zinc-700/50"
                  >
                    Вернуться к тарифам
                  </button>

                  {/* Instructions */}
                  <div className="mt-6 bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
                    <p className="text-zinc-400 text-sm font-medium mb-3">Как подключиться:</p>
                    <div className="space-y-3">
                      {[
                        "Скопируйте ссылку подключения",
                        "Откройте приложение (Happ, V2rayNG, Streisand)",
                        "Добавьте конфигурацию по ссылке",
                        "Подключитесь и пользуйтесь!",
                      ].map((instruction, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-emerald-400 text-xs font-bold">{i + 1}</span>
                          </div>
                          <span className="text-zinc-300 text-sm">{instruction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {step === "error" && (
                <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center py-12">
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                    <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Ошибка</h2>
                  <p className="text-zinc-500 text-center mb-6">{errorMessage}</p>
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-all"
                  >
                    Попробовать снова
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Copied Toast */}
        {copied && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-emerald-500/25 z-50">
            Скопировано!
        </div>
        )}
      </main>
    </>
  );
}
