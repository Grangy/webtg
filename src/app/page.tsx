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

export default function Home() {
  // State
  const [step, setStep] = useState<Step>("loading");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

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

  const handleBack = () => {
    if (step === "subscriptions" || step === "instructions") {
      setStep("info"); // Возвращаемся на информационный экран
      setShowPlans(false);
    } else if (step === "plans") {
      setStep("info"); // Возвращаемся на информационный экран
      setShowPlans(false);
      setSelectedPlan(null);
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

  const handleInstructionsClick = () => {
    setStep("instructions");
    if (typeof window !== "undefined") {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    }
  };

  const handleAvatarClick = () => {
    setStep("subscriptions");
    setShowPlans(false);
    if (typeof window !== "undefined") {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    }
  };

  const handleRenewSubscription = (subscriptionId: number) => {
    // Переходим на экран выбора планов для продления
    setStep("plans");
    setShowPlans(true);
    setSelectedPlan(null);
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

  const openSubscriptionLink = (url: string) => {
    const happLink = formatHappLink(url);
    
    if (typeof window === "undefined") return;

    // Telegram WebApp блокирует кастомные протоколы (happ://)
    // Используем создание скрытого <a> элемента и клик по нему
    // Это самый надежный способ для мобильных браузеров
    try {
      // Создаем временный элемент <a>
      const link = document.createElement("a");
      link.href = happLink;
      link.style.position = "fixed";
      link.style.left = "-9999px";
      link.style.top = "-9999px";
      link.style.opacity = "0";
      link.style.pointerEvents = "none";
      
      // Добавляем в DOM
      document.body.appendChild(link);
      
      // Создаем событие клика
      const clickEvent = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      
      // Кликаем программно
      link.dispatchEvent(clickEvent);
      
      // Haptic feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
      }
      
      // Удаляем элемент через задержку
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 1000);
      
      // Копируем ссылку в буфер на всякий случай
      // (если приложение не откроется, пользователь сможет вставить вручную)
      copyToClipboard(happLink);
    } catch (error) {
      // Fallback: просто копируем в буфер обмена
      console.warn("Failed to open Happ link:", error);
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

  const handleBuyClick = () => {
    // Переход от информационного экрана к выбору тарифов
    setStep("plans");
    setShowPlans(true);
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
            showBack={step === "payment" || step === "error" || step === "subscriptions" || step === "instructions" || step === "plans"}
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
                  />
                </div>
              )}

              {step === "instructions" && (
                <div className="animate-in fade-in slide-in-from-right duration-300">
                  <InstructionsStep onBack={handleBack} />
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
