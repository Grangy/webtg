"use client";

import { useState } from "react";
import { UserData } from "@/types";

interface PromoCodeStepProps {
  tgUser: UserData | null;
  onActivate: (code: string) => Promise<{ ok: boolean; message?: string; error?: string }>;
  onBack: () => void;
}

export function PromoCodeStep({ tgUser, onActivate, onBack }: PromoCodeStepProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setMessage({ type: "error", text: "Введите промокод" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await onActivate(code.trim().toUpperCase());
      
      if (result.ok) {
        setMessage({ type: "success", text: result.message || "Промокод успешно активирован!" });
        setCode("");
        
        // Haptic feedback
        if (typeof window !== "undefined" && window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
        }
      } else {
        setMessage({ type: "error", text: result.message || result.error || "Ошибка активации промокода" });
        
        // Haptic feedback
        if (typeof window !== "undefined" && window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred("error");
        }
      }
    } catch (error) {
      setMessage({ type: "error", text: "Произошла ошибка. Попробуйте позже." });
      
      // Haptic feedback
      if (typeof window !== "undefined" && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1.5">Активация промокода</h1>
        <p className="text-zinc-400 text-sm">Введите промокод для получения бонусов</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="promo-code" className="block text-zinc-400 text-sm mb-2">
            Промокод
          </label>
          <input
            id="promo-code"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setMessage(null);
            }}
            placeholder="Введите промокод"
            className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            disabled={loading}
            autoComplete="off"
            autoCapitalize="characters"
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-xl border ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            } animate-in fade-in duration-300`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full p-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-base rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Активация...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Активировать</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-white font-medium rounded-xl transition-all active:scale-[0.98]"
            disabled={loading}
          >
            Назад
          </button>
        </div>
      </form>

      <div className="mt-6 p-3 bg-zinc-900/30 rounded-xl border border-zinc-800/30">
        <p className="text-zinc-400 text-xs text-center">
          💡 Промокод можно использовать один раз
        </p>
      </div>
    </div>
  );
}
