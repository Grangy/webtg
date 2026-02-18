import { UserAccount } from "@/types";
import Image from "next/image";

interface InfoStepProps {
  user: UserAccount | null;
  onBuyClick: () => void;
  onSubscriptionsClick?: () => void;
  onInstructionsClick?: () => void;
  onPromoClick?: () => void;
}

const features = [
  { label: "Скорость", path: "M13 10V3L4 14h7v7l9-11h-7z" },
  { label: "Защита", path: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
  { label: "Безлимит", path: "M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01" },
];

export function InfoStep({ user, onBuyClick, onSubscriptionsClick, onInstructionsClick, onPromoClick }: InfoStepProps) {
  const activeSubscriptions = user?.subscriptions.filter((s) => s.isActive) || [];
  const hasActiveSubscriptions = activeSubscriptions.length > 0;

  const openLink = (url: string) => {
    if (typeof window === "undefined") return;
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(url, { try_instant_view: false });
    } else {
      window.open(url, "_blank");
    }
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero */}
      <div className="text-center mb-6 animate-in fade-in-up duration-500">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-800/80 animate-in scale-in duration-500">
            <Image src="/logo.jpg" alt="MaxGroot" width={56} height={56} className="w-full h-full object-cover" />
          </div>
        </div>
        <h1 className="text-xl font-semibold text-white mb-1">Интернет без границ</h1>
        <p className="text-zinc-500 text-sm">Защита и свобода</p>
      </div>

      {/* Иконки — одна строка, один нейтральный цвет */}
      <div
        className="flex justify-center gap-6 mb-6 animate-in fade-in-up duration-300"
        style={{ animationDelay: "80ms" }}
      >
        {features.map((item, i) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-1.5 opacity-0 animate-in fade-in-up duration-300"
            style={{ animationDelay: `${120 + i * 70}ms` }}
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center">
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.path} />
              </svg>
            </div>
            <span className="text-[10px] text-zinc-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Активные подписки */}
      {hasActiveSubscriptions && onSubscriptionsClick && (
        <div
          className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-3 mb-4 animate-in fade-in-up duration-300"
          style={{ animationDelay: "280ms" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-zinc-300 text-sm">
              {activeSubscriptions.length} {activeSubscriptions.length === 1 ? "подписка" : "подписки"}
            </p>
            <button
              onClick={onSubscriptionsClick}
              className="px-3 py-1.5 bg-zinc-700/60 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
            >
              Открыть
            </button>
          </div>
        </div>
      )}

      {/* CTA — единственный яркий акцент */}
      <button
        onClick={onBuyClick}
        className="w-full p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 mb-3 animate-in fade-in-up duration-300 group overflow-hidden relative"
        style={{ animationDelay: "320ms" }}
      >
        <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
        <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="relative z-10">Купить</span>
      </button>

      {/* Промокод */}
      {onPromoClick && (
        <button
          onClick={onPromoClick}
          className="w-full p-2.5 bg-zinc-800/40 hover:bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 text-sm rounded-xl transition-colors active:scale-[0.99] flex items-center justify-center gap-2 mb-4 animate-in fade-in-up duration-300"
          style={{ animationDelay: "360ms" }}
        >
          <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          Промокод
        </button>
      )}

      {/* Преимущества */}
      <div
        className="bg-zinc-800/30 border border-zinc-800/60 rounded-xl p-3 mb-4 animate-in fade-in-up duration-300"
        style={{ animationDelay: "400ms" }}
      >
        <p className="text-zinc-500 text-xs mb-2">Преимущества</p>
        <ul className="space-y-1.5">
          {["Защита в Wi‑Fi", "Шифрование трафика", "Поддержка 24/7"].map((text, i) => (
            <li key={i} className="flex items-center gap-2 text-zinc-400 text-xs">
              <span className="w-1 h-1 rounded-full bg-zinc-500 flex-shrink-0" />
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* Инструкции */}
      {onInstructionsClick && (
        <button
          onClick={onInstructionsClick}
          className="w-full p-2.5 bg-zinc-800/40 hover:bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 text-sm rounded-xl transition-colors active:scale-[0.99] flex items-center justify-center gap-2 mb-2 animate-in fade-in-up duration-300"
          style={{ animationDelay: "440ms" }}
        >
          <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Инструкции
        </button>
      )}

      {/* Поддержка */}
      <button
        onClick={() => openLink("https://t.me/supmaxgroot")}
        className="w-full p-2.5 bg-zinc-800/40 hover:bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 text-sm rounded-xl transition-colors active:scale-[0.99] flex items-center justify-center gap-2 mb-2 animate-in fade-in-up duration-300"
        style={{ animationDelay: "480ms" }}
      >
        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Техподдержка
      </button>

      {/* Инфогруппа */}
      <button
        onClick={() => openLink("https://t.me/vpnmax_off")}
        className="w-full p-2.5 bg-zinc-800/40 hover:bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 text-sm rounded-xl transition-colors active:scale-[0.99] flex items-center justify-center gap-2 mb-4 animate-in fade-in-up duration-300"
        style={{ animationDelay: "520ms" }}
      >
        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Информационная группа
      </button>

      {/* Подвал */}
      <div
        className="flex items-center justify-center gap-5 text-zinc-600 text-[10px] animate-in fade-in duration-500"
        style={{ animationDelay: "600ms" }}
      >
        <span>Безопасно</span>
        <span>24/7</span>
        <span>Быстро</span>
      </div>
    </div>
  );
}
