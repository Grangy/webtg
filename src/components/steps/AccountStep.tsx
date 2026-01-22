"use client";

import { useState, useEffect } from "react";
import { UserAccount, UserData, UserPromoInfo, PromoActivationData } from "@/types";
import { formatDate } from "@/utils/formatters";

interface Topup {
  id: number;
  orderId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
}

interface AccountStepProps {
  user: UserAccount | null;
  tgUser: UserData | null;
  onSubscriptionsClick: () => void;
  onActivatePromo: (code: string) => Promise<{ ok: boolean; message?: string; error?: string; data?: PromoActivationData }>;
  onBack: () => void;
  onUserDataUpdate?: () => void;
}

export function AccountStep({
  user,
  tgUser,
  onSubscriptionsClick,
  onActivatePromo,
  onBack,
  onUserDataUpdate,
}: AccountStepProps) {
  const [topups, setTopups] = useState<Topup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ type: "success" | "error"; text: string; details?: PromoActivationData } | null>(null);
  const [userPromoInfo, setUserPromoInfo] = useState<UserPromoInfo | null>(null);
  const [loadingPromoInfo, setLoadingPromoInfo] = useState(true);

  useEffect(() => {
    if (!tgUser) {
      setLoading(false);
      setLoadingPromoInfo(false);
      return;
    }

    const loadTopups = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/${tgUser.id}/topups?limit=20`);
        const data = await response.json();

        if (data.ok && data.data) {
          setTopups(data.data);
        } else {
          setError("Не удалось загрузить историю пополнений");
        }
      } catch (err) {
        console.error("Error loading topups:", err);
        setError("Ошибка загрузки истории");
      } finally {
        setLoading(false);
      }
    };

    const loadUserPromoInfo = async () => {
      try {
        setLoadingPromoInfo(true);
        const response = await fetch(`/api/user/${tgUser.id}/promo`);
        const data = await response.json();

        if (data.ok && data.data) {
          setUserPromoInfo(data.data);
        }
      } catch (err) {
        console.error("Error loading user promo info:", err);
      } finally {
        setLoadingPromoInfo(false);
      }
    };

    loadTopups();
    loadUserPromoInfo();
  }, [tgUser]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "pending":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "failed":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-zinc-400 bg-zinc-500/10 border-zinc-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Завершено";
      case "pending":
        return "Ожидание";
      case "failed":
        return "Ошибка";
      default:
        return status;
    }
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoCode.trim()) {
      setPromoMessage({ type: "error", text: "Введите промокод" });
      return;
    }

    setPromoLoading(true);
    setPromoMessage(null);

    try {
      const result = await onActivatePromo(promoCode.trim().toUpperCase());
      
      if (result.ok) {
        // Формируем детальное сообщение на основе типа промокода
        let successMessage = result.message || "Промокод успешно активирован!";
        
        if (result.data) {
          const { promoType, promoCategory, reward, balance, subscription } = result.data;
          
          // Дополнительная информация о награде
          if (promoCategory === "money" && reward.amount) {
            successMessage = `💵 Начислено: ${reward.amount} ₽\n${balance ? `💳 Баланс: ${balance.current} ₽` : ""}`;
          } else if (promoCategory === "days" && reward.days) {
            successMessage = `✅ Вам начислена подписка на ${reward.days} дней`;
          } else if (promoCategory === "referral" && reward.days) {
            successMessage = `🎁 Вы получили подписку на ${reward.days} дня!\n💰 Ваш друг получит 20% от ваших пополнений`;
          }
        }
        
        setPromoMessage({ 
          type: "success", 
          text: successMessage,
          details: result.data
        });
        setPromoCode("");
        
        // Обновляем данные пользователя и информацию о промокоде
        if (onUserDataUpdate) {
          onUserDataUpdate();
        }
        
        // Перезагружаем информацию о промокоде пользователя
        if (tgUser) {
          const response = await fetch(`/api/user/${tgUser.id}/promo`);
          const data = await response.json();
          if (data.ok && data.data) {
            setUserPromoInfo(data.data);
          }
        }
        
        // Haptic feedback
        if (typeof window !== "undefined" && window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
        }
      } else {
        setPromoMessage({ type: "error", text: result.message || result.error || "Ошибка активации промокода" });
        
        // Haptic feedback
        if (typeof window !== "undefined" && window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred("error");
        }
      }
    } catch (error) {
      setPromoMessage({ type: "error", text: "Произошла ошибка. Попробуйте позже." });
      
      // Haptic feedback
      if (typeof window !== "undefined" && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("error");
      }
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-emerald-500/30 flex items-center justify-center">
            {tgUser?.photo_url ? (
              <img
                src={tgUser.photo_url}
                alt={tgUser.first_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {tgUser?.first_name[0] || "U"}
              </span>
            )}
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1.5">Личный кабинет</h1>
        <p className="text-zinc-400 text-sm">
          {tgUser?.first_name} {tgUser?.last_name || ""}
        </p>
      </div>

      {/* Balance Card */}
      {user && (
        <div className="bg-gradient-to-br from-emerald-500/10 to-zinc-900/50 rounded-xl p-4 border border-emerald-500/20 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-xs mb-1">Баланс</p>
              <p className="text-2xl font-bold text-emerald-400">{user.balance} ₽</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 mb-4">
        <button
          onClick={onSubscriptionsClick}
          className="w-full p-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-base rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Мои подписки</span>
        </button>
      </div>

      {/* My Referral Promo Code */}
      {loadingPromoInfo ? (
        <div className="bg-gradient-to-br from-purple-500/10 to-zinc-900/50 rounded-xl p-4 border border-purple-500/20 mb-4">
          <div className="flex items-center justify-center py-2">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
          </div>
        </div>
      ) : userPromoInfo && userPromoInfo.hasPromoCode ? (
        <div className="bg-gradient-to-br from-purple-500/10 to-zinc-900/50 rounded-xl p-4 border border-purple-500/20 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <p className="text-zinc-300 text-xs font-semibold">Ваш реферальный промокод</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(userPromoInfo.promoCode);
                if (typeof window !== "undefined" && window.Telegram?.WebApp?.HapticFeedback) {
                  window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
                }
              }}
              className="p-1.5 hover:bg-purple-500/20 rounded-lg transition-all active:scale-95"
              title="Скопировать"
            >
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <div className="bg-zinc-900/50 rounded-lg p-3 border border-purple-500/10 mb-2">
            <code className="text-purple-400 font-mono font-bold text-xl tracking-wider">{userPromoInfo.promoCode}</code>
          </div>
          <div className="space-y-1.5">
            {userPromoInfo.activations && userPromoInfo.activations.count > 0 && (
              <div className="flex items-center gap-2 text-zinc-400 text-[10px]">
                <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Активаций: <strong className="text-purple-400">{userPromoInfo.activations.count}</strong></span>
              </div>
            )}
            <p className="text-zinc-500 text-[10px] leading-tight">
              💎 Друзья получат <strong className="text-purple-400">3 дня подписки</strong>, вы — <strong className="text-purple-400">20%</strong> от их пополнений на баланс
            </p>
          </div>
        </div>
      ) : null}

      {/* Promo Code Activation Section */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-4 mb-4">
        <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          Активация промокода
        </h2>

        <form onSubmit={handlePromoSubmit} className="space-y-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value.toUpperCase());
              setPromoMessage(null);
            }}
            placeholder="Введите промокод друга или админский"
            className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
            disabled={promoLoading}
            autoComplete="off"
            autoCapitalize="characters"
          />
          
          {/* Info about promo types */}
          <div className="bg-zinc-800/30 rounded-lg p-2 border border-zinc-700/30">
            <p className="text-zinc-400 text-[10px] leading-tight">
              💡 <strong>Реферальный:</strong> 3 дня подписки вам, 20% от пополнений другу<br/>
              💰 <strong>На баланс:</strong> пополнение счета<br/>
              📅 <strong>На дни:</strong> подписка на указанное количество дней
            </p>
          </div>

          <button
            type="submit"
            disabled={promoLoading || !promoCode.trim()}
            className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {promoLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Активация...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Активировать</span>
              </>
            )}
          </button>

          {promoMessage && (
            <div
              className={`p-3 rounded-lg border w-full max-w-full overflow-x-hidden ${
                promoMessage.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-red-500/10 border-red-500/30"
              } animate-in fade-in duration-300`}
            >
              <div className="flex items-start gap-2">
                {promoMessage.type === "success" ? (
                  <svg className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className={`font-medium text-xs ${promoMessage.type === "success" ? "text-emerald-400" : "text-red-400"} whitespace-pre-line break-words overflow-wrap-anywhere`}>
                    {promoMessage.text}
                  </p>
                  {promoMessage.details && (
                    <>
                      {promoMessage.details.subscription && (
                        <div className="mt-2 pt-2 border-t border-emerald-500/20 space-y-2">
                          <p className="text-emerald-300 text-[10px] mb-1.5 font-semibold">✅ Подписка создана!</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-emerald-400 text-[10px]">
                                Действует до {formatDate(promoMessage.details.subscription.endDate)}
                              </span>
                            </div>
                            {promoMessage.details.reward.days && (
                              <div className="flex items-center gap-1.5">
                                <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-emerald-400 text-[10px]">
                                  {promoMessage.details.reward.days} {promoMessage.details.reward.days === 1 ? "день" : promoMessage.details.reward.days < 5 ? "дня" : "дней"}
                                </span>
                              </div>
                            )}
                            {/* Subscription URLs */}
                            {promoMessage.details.subscription.subscriptionUrl && (
                              <div className="space-y-1.5 pt-1">
                                <div className="bg-zinc-900/50 rounded-lg p-2 border border-zinc-800/30 overflow-hidden">
                                  <div className="flex items-center gap-1 mb-1">
                                    <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    <span className="text-zinc-400 text-[9px] font-medium">Сервер 1</span>
                                  </div>
                                  <code className="text-emerald-400 font-mono text-[9px] leading-tight block break-all overflow-wrap-anywhere min-w-0">
                                    {promoMessage.details.subscription.subscriptionUrl}
                                  </code>
                                </div>
                                {promoMessage.details.subscription.subscriptionUrl2 && (
                                  <div className="bg-zinc-900/50 rounded-lg p-2 border border-zinc-800/30 overflow-hidden">
                                    <div className="flex items-center gap-1 mb-1">
                                      <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                      </svg>
                                      <span className="text-zinc-400 text-[9px] font-medium">Сервер 2 (Россия)</span>
                                    </div>
                                    <code className="text-emerald-400 font-mono text-[9px] leading-tight block break-all overflow-wrap-anywhere min-w-0">
                                      {promoMessage.details.subscription.subscriptionUrl2}
                                    </code>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {promoMessage.details.balance && (
                        <div className="mt-2 pt-2 border-t border-emerald-500/20">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-emerald-400 text-[10px]">
                              Текущий баланс: {promoMessage.details.balance.current} ₽
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Topups History */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 overflow-hidden">
        <div className="p-3 border-b border-zinc-800/50">
          <h2 className="text-white font-semibold text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            История пополнений
          </h2>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent"></div>
              <p className="text-zinc-400 text-sm mt-2">Загрузка...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : topups.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-zinc-400 text-sm">История пополнений пуста</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {topups.map((topup) => (
                <div key={topup.id} className="p-3 hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">+{topup.amount} ₽</span>
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border ${getStatusColor(
                          topup.status
                        )}`}
                      >
                        {getStatusText(topup.status)}
                      </span>
                    </div>
                    <span className="text-zinc-400 text-xs">
                      {formatDate(topup.completedAt || topup.createdAt)}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-[10px]">ID: {topup.orderId}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full mt-4 p-3 bg-zinc-800/30 hover:bg-zinc-800/50 text-zinc-400 hover:text-white font-medium rounded-xl transition-all active:scale-[0.98] border border-zinc-700/30"
      >
        Назад
      </button>
    </div>
  );
}
