"use client";

import { useState, useEffect } from "react";
import { UserAccount, UserData } from "@/types";
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
  onActivatePromo: (code: string) => Promise<{ ok: boolean; message?: string; error?: string }>;
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
  const [promoMessage, setPromoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!tgUser) {
      setLoading(false);
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

    loadTopups();
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
        setPromoMessage({ type: "success", text: result.message || "Промокод успешно активирован!" });
        setPromoCode("");
        
        // Обновляем данные пользователя после успешной активации
        if (onUserDataUpdate) {
          onUserDataUpdate();
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

      {/* Promo Code Section */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-4 mb-4">
        <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          Активация промокода
        </h2>

        <form onSubmit={handlePromoSubmit} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase());
                setPromoMessage(null);
              }}
              placeholder="Введите промокод"
              className="flex-1 px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
              disabled={promoLoading}
              autoComplete="off"
              autoCapitalize="characters"
            />
            <button
              type="submit"
              disabled={promoLoading || !promoCode.trim()}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {promoLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
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
          </div>

          {promoMessage && (
            <div
              className={`p-2 rounded-lg border text-xs ${
                promoMessage.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              } animate-in fade-in duration-300`}
            >
              <div className="flex items-center gap-1.5">
                {promoMessage.type === "success" ? (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <p className="font-medium">{promoMessage.text}</p>
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
