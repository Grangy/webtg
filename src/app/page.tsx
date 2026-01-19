"use client";

import { useEffect, useState, useCallback } from "react";
import Script from "next/script";
import { Step, Plan } from "@/types";
import { useTelegram } from "@/hooks/useTelegram";
import { useUserData } from "@/hooks/useUserData";
import { usePlans } from "@/hooks/usePlans";
import { usePayment } from "@/hooks/usePayment";
import { formatHappLink } from "@/utils/formatters";

// Components
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Toast } from "@/components/ui/Toast";
import { Header } from "@/components/layout/Header";
import { StepIndicator } from "@/components/layout/StepIndicator";
import { InfoStep } from "@/components/steps/InfoStep";
import { PlansStep } from "@/components/steps/PlansStep";
import { SubscriptionsStep } from "@/components/steps/SubscriptionsStep";
import { InstructionsStep } from "@/components/steps/InstructionsStep";
import { PaymentStep } from "@/components/steps/PaymentStep";
import { ProcessingStep } from "@/components/steps/ProcessingStep";
import { SuccessStep } from "@/components/steps/SuccessStep";
import { ErrorStep } from "@/components/steps/ErrorStep";
import { Instructions } from "@/components/instructions/Instructions";
import { PromoCodeStep } from "@/components/steps/PromoCodeStep";

export default function Home() {
  // State
  const [step, setStep] = useState<Step>("loading");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [isRenewal, setIsRenewal] = useState(false);

  // Hooks
  const { mounted, isTelegram, tgUser, setTgUser, initTelegram } = useTelegram();
  const { user, setUser, loadUserData } = useUserData();
  const { plans, plansLoading, loadPlans } = usePlans();

  const payment = usePayment({
    tgUser,
    selectedPlan,
    user,
    setUser,
    setStep,
    setErrorMessage,
  });

  // Initialize
  useEffect(() => {
    if (!mounted) return;

    loadPlans();

    const init = async () => {
      // Инициализируем Telegram и получаем пользователя
      const telegramUser = await initTelegram();
      if (telegramUser) {
        await loadUserData(telegramUser.id.toString());
      }
      setStep("info"); // Начинаем с информационного экрана
    };

    init();
  }, [mounted, initTelegram, loadUserData, loadPlans]);

  // Handlers
  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    if (typeof window !== "undefined") {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    }
  };

  const handleBuyClick = () => {
    setIsRenewal(false); // Сбрасываем флаг при новой покупке
    setStep("plans");
    setShowPlans(true);
    if (typeof window !== "undefined") {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    }
  };

  const handleBack = () => {
    if (step === "subscriptions" || step === "instructions" || step === "promo") {
      setStep("info"); // Возвращаемся на информационный экран
      setShowPlans(false);
      setIsRenewal(false); // Сбрасываем флаг продления
    } else if (step === "plans") {
      setStep("info"); // Возвращаемся на информационный экран
      setShowPlans(false);
      setSelectedPlan(null);
      setIsRenewal(false); // Сбрасываем флаг продления
    } else {
      setStep("plans");
      setShowPlans(false);
      setErrorMessage("");
      payment.setPaymentUrl("");
    }
    if (typeof window !== "undefined") {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    }
  };

  const handleSubscriptionsClick = () => {
    setStep("subscriptions");
    setShowPlans(false); // Сбрасываем при переходе в подписки
    if (typeof window !== "undefined") {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    }
  };

  const handleActivatePromo = async (code: string): Promise<{ ok: boolean; message?: string; error?: string }> => {
    if (!tgUser) {
      return { ok: false, error: "Не удалось определить пользователя" };
    }

    try {
      const response = await fetch("/api/promo/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegramId: tgUser.id.toString(),
          code: code,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        // Обновляем данные пользователя после успешной активации
        await loadUserData(tgUser.id.toString());
        return { ok: true, message: data.message || "Промокод успешно активирован!" };
      } else {
        return { ok: false, error: data.error, message: data.message || "Ошибка активации промокода" };
      }
    } catch (error) {
      console.error("Error activating promo:", error);
      return { ok: false, error: "SERVER_ERROR", message: "Произошла ошибка. Попробуйте позже." };
    }
  };

  const handleInstructionsClick = () => {
    setStep("instructions");
    if (typeof window !== "undefined") {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    }
  };

  const handleAvatarClick = () => {
    // Переход в раздел промокода (личный кабинет)
    setStep("promo");
    if (typeof window !== "undefined") {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    }
  };

  const handleRenewSubscription = useCallback((subscriptionId: number) => {
    // Переходим на экран выбора планов для продления
    setIsRenewal(true); // Устанавливаем флаг продления
    setStep("plans");
    setShowPlans(true);
    setSelectedPlan(null);
    if (typeof window !== "undefined") {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (typeof window !== "undefined") {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
    }
  };

  const openSubscriptionLink = (url: string) => {
    const happLink = formatHappLink(url);
    
    if (typeof window === "undefined") return;

    // Используем простой подход с <a> элементом как в рабочем примере
    // Это самый надежный способ для открытия кастомных протоколов
    try {
      const link = document.createElement("a");
      link.href = happLink;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.style.display = "none";
      
      document.body.appendChild(link);
      
      // Кликаем программно
      link.click();
      
      // Удаляем элемент после небольшой задержки
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 100);
      
      // Haptic feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
      }
      
      // Копируем ссылку в буфер обмена как fallback
      copyToClipboard(happLink);
      
    } catch (error) {
      console.warn("Failed to open Happ link:", error);
      // Fallback: просто копируем в буфер обмена
      copyToClipboard(happLink);
      
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert(
          "Ссылка скопирована в буфер обмена.\n\nВставьте её в приложение Happ для подключения VPN."
        );
      }
    }
  };

  const handleBackToPlans = () => {
    setStep("plans");
    setSelectedPlan(null);
    setShowPlans(false); // Возвращаемся на главный экран с подписками
    setIsRenewal(false); // Сбрасываем флаг продления
    payment.setNewSubscription(null);
    if (tgUser) {
      loadUserData(tgUser.id.toString());
    }
  };

  const handleLogoClick = () => {
    // Переход на главную страницу (информационный экран)
    setStep("info");
    setSelectedPlan(null);
    setShowPlans(false);
    setErrorMessage("");
    payment.setPaymentUrl("");
    if (typeof window !== "undefined") {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    }
  };


  if (!mounted || step === "loading") {
    return (
      <>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="afterInteractive"
        />
        <LoadingSpinner message="Загрузка..." size="md" />
      </>
    );
  }

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
      />

      <main className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="min-h-screen flex flex-col">
          <Header
            user={user}
            tgUser={tgUser}
            onBack={handleBack}
            showBack={step === "payment" || step === "error" || step === "subscriptions" || step === "instructions" || step === "plans" || step === "promo"}
            onSubscriptionsClick={handleSubscriptionsClick}
            onLogoClick={handleLogoClick}
            onAvatarClick={handleAvatarClick}
            currentStep={step}
          >
            {(step === "info" || step === "plans" || step === "payment" || step === "processing" || step === "success") && step !== "info" && (
              <StepIndicator step={step} />
            )}
          </Header>

          <div className="flex-1 px-6 pb-4 overflow-y-auto overflow-x-hidden">
            <div className="relative min-h-full max-w-full">
              {step === "info" && (
                <div className="animate-in fade-in slide-in-from-right duration-300">
                  <InfoStep
                    user={user}
                    onBuyClick={handleBuyClick}
                    onSubscriptionsClick={handleSubscriptionsClick}
                    onInstructionsClick={handleInstructionsClick}
                    onPromoClick={() => {
                      setStep("promo");
                      if (typeof window !== "undefined") {
                        window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
                      }
                    }}
                  />
                </div>
              )}

              {step === "instructions" && (
                <div className="animate-in fade-in slide-in-from-right duration-300">
                  <InstructionsStep onBack={handleBack} />
                </div>
              )}

              {step === "promo" && (
                <div className="animate-in fade-in slide-in-from-right duration-300">
                  <PromoCodeStep
                    tgUser={tgUser}
                    onActivate={handleActivatePromo}
                    onBack={handleBack}
                  />
                </div>
              )}

              {step === "plans" && (
                <div className="animate-in fade-in slide-in-from-right duration-300">
                  <PlansStep
                    plans={plans}
                    selectedPlan={selectedPlan}
                    user={user}
                    plansLoading={plansLoading}
                    onSelectPlan={handleSelectPlan}
                    onCreatePayment={payment.createPayment}
                    onBuyWithBalance={payment.buyWithBalance}
                    onCopyUrl={copyToClipboard}
                    onRetryLoadPlans={loadPlans}
                    onSubscriptionsClick={handleSubscriptionsClick}
                    showPlans={showPlans}
                    onShowPlans={() => setShowPlans(true)}
                  />
                </div>
              )}

              {step === "subscriptions" && (
                <div className="animate-in fade-in slide-in-from-right duration-300">
                  <SubscriptionsStep
                    user={user}
                    onCopyUrl={copyToClipboard}
                    onOpenHappLink={openSubscriptionLink}
                    onRenewSubscription={handleRenewSubscription}
                  />
                </div>
              )}

              {step === "payment" && selectedPlan && (
                <div className="animate-in fade-in slide-in-from-right duration-300">
                  <PaymentStep
                    selectedPlan={selectedPlan}
                    paymentUrl={payment.paymentUrl}
                    checkingPayment={payment.checkingPayment}
                    onOpenPaymentUrl={payment.openPaymentUrl}
                    onCopyUrl={copyToClipboard}
                    onManualCheck={payment.manualCheck}
                    copied={copied}
                  />
                </div>
              )}

              {step === "processing" && (
                <div className="animate-in fade-in duration-300 w-full max-w-full overflow-x-hidden">
                  <ProcessingStep />
                </div>
              )}

              {step === "success" && payment.newSubscription && (
                <div className="animate-in fade-in duration-300 w-full max-w-full overflow-x-hidden">
                  <SuccessStep
                    subscription={payment.newSubscription}
                    onCopyUrl={copyToClipboard}
                    onOpenHappLink={openSubscriptionLink}
                    onBack={handleBackToPlans}
                    onInstructionsClick={handleInstructionsClick}
                    isRenewal={isRenewal}
                  />
                </div>
              )}

              {step === "error" && (
                <div className="animate-in fade-in slide-in-from-bottom duration-300">
                  <ErrorStep errorMessage={errorMessage} onRetry={handleBack} />
                </div>
              )}
            </div>
          </div>
        </div>

        <Toast message="Скопировано!" show={copied} />
      </main>
    </>
  );
}
