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
    if (step === "subscriptions" || step === "instructions") {
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

    // Telegram WebApp блокирует кастомные протоколы (happ://)
    // Пробуем несколько методов для максимальной совместимости
    let opened = false;

    // Метод 1: Использование iframe (работает в некоторых браузерах)
    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.src = happLink;
      document.body.appendChild(iframe);
      
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
      opened = true;
    } catch (e) {
      console.log("Method 1 (iframe) failed:", e);
    }

    // Метод 2: window.open (может работать в некоторых случаях)
    if (!opened) {
      try {
        const newWindow = window.open(happLink, "_blank");
        if (newWindow) {
          opened = true;
          setTimeout(() => {
            try {
              newWindow.close();
            } catch (e) {
              // Игнорируем ошибки закрытия
            }
          }, 100);
        }
      } catch (e) {
        console.log("Method 2 (window.open) failed:", e);
      }
    }

    // Метод 3: location.replace (для некоторых браузеров)
    if (!opened) {
      try {
        window.location.replace(happLink);
        opened = true;
      } catch (e) {
        console.log("Method 3 (location.replace) failed:", e);
      }
    }

    // Метод 4: Создание видимого элемента <a> с user interaction
    if (!opened) {
      try {
        const link = document.createElement("a");
        link.href = happLink;
        link.style.display = "block";
        link.style.position = "absolute";
        link.style.left = "50%";
        link.style.top = "50%";
        link.style.transform = "translate(-50%, -50%)";
        link.style.width = "200px";
        link.style.height = "50px";
        link.style.background = "transparent";
        link.style.zIndex = "99999";
        link.style.opacity = "0.01";
        
        document.body.appendChild(link);
        
        // Создаем событие клика с user gesture
        const touchEvent = new TouchEvent("touchstart", {
          bubbles: true,
          cancelable: true,
          view: window,
        } as any);
        
        link.dispatchEvent(touchEvent);
        link.click();
        
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        }, 1000);
        opened = true;
      } catch (e) {
        console.log("Method 4 (visible link) failed:", e);
      }
    }

    // Haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
    }

    // Всегда копируем ссылку в буфер обмена как fallback
    copyToClipboard(happLink);

    // Показываем уведомление
    setTimeout(() => {
      if (window.Telegram?.WebApp) {
        if (opened) {
          window.Telegram.WebApp.showAlert(
            "Попытка открыть приложение...\n\nЕсли приложение не открылось, ссылка скопирована в буфер обмена."
          );
        } else {
          window.Telegram.WebApp.showAlert(
            "Ссылка скопирована в буфер обмена.\n\nВставьте её в приложение Happ для подключения VPN."
          );
        }
      }
    }, 300);
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
