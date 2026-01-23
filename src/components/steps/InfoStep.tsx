import { UserAccount } from "@/types";
import { GlobeIcon, RocketIcon, LockIcon, SignalIcon } from "@/components/icons/FeatureIcons";
import Image from "next/image";

interface InfoStepProps {
  user: UserAccount | null;
  onBuyClick: () => void;
  onSubscriptionsClick?: () => void;
  onInstructionsClick?: () => void;
  onPromoClick?: () => void;
}

export function InfoStep({ user, onBuyClick, onSubscriptionsClick, onInstructionsClick, onPromoClick }: InfoStepProps) {
  const activeSubscriptions = user?.subscriptions.filter((s) => s.isActive) || [];
  const hasActiveSubscriptions = activeSubscriptions.length > 0;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="text-center mb-4">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
            <Image
              src="/logo.jpg"
              alt="MaxGroot"
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1.5">Интернет без границ</h1>
        <p className="text-zinc-400 text-sm">Защита и свобода в интернете</p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { Icon: RocketIcon, title: "Высокая скорость", desc: "Быстрое подключение", color: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-400" },
          { Icon: GlobeIcon, title: "Безлимит", desc: "Без ограничений", color: "from-purple-500/20 to-pink-500/20", iconColor: "text-purple-400" },
          { Icon: LockIcon, title: "Без логов", desc: "Полная анонимность", color: "from-emerald-500/20 to-teal-500/20", iconColor: "text-emerald-400" },
          { Icon: SignalIcon, title: "Рабочий мобильный интернет", desc: "Стабильное соединение", color: "from-orange-500/20 to-red-500/20", iconColor: "text-orange-400" },
        ].map((feature, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${feature.color} border border-zinc-800/50 rounded-xl p-3 text-center animate-in fade-in slide-in-from-bottom duration-300 hover:scale-105 transition-transform cursor-default`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex justify-center mb-1 transform hover:scale-110 transition-transform">
              <feature.Icon className={`w-6 h-6 ${feature.iconColor}`} />
            </div>
            <p className="text-white font-semibold text-xs mb-0.5 leading-tight">{feature.title}</p>
            <p className="text-zinc-500 text-[10px]">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Active Subscriptions Info */}
      {hasActiveSubscriptions && onSubscriptionsClick && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-400 font-semibold text-xs mb-0.5">У вас есть активные подписки</p>
              <p className="text-zinc-400 text-xs">
                {activeSubscriptions.length} {activeSubscriptions.length === 1 ? "подписка" : "подписки"}
              </p>
            </div>
            <button
              onClick={onSubscriptionsClick}
              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition-all"
            >
              Открыть
            </button>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={onBuyClick}
        className="w-full p-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-base rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 mb-2 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="relative z-10">Купить</span>
      </button>

      {/* Promo Code Button */}
      {onPromoClick && (
        <button
          onClick={onPromoClick}
          className="w-full p-2.5 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-white font-medium text-sm rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-4"
        >
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <span>Промокод</span>
        </button>
      )}

      {/* Benefits */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-zinc-900/50 rounded-xl p-3 border border-emerald-500/20 mb-4">
        <h2 className="text-white font-semibold text-sm mb-2.5 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Преимущества
        </h2>
        <div className="space-y-2">
          {[
            "Защита данных в публичных Wi-Fi сетях",
            "Шифрование трафика для приватности",
            "Высокая скорость подключения",
            "Поддержка 24/7",
          ].map((benefit, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-4 h-4 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-zinc-300 text-xs flex-1 leading-tight">{benefit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions Button */}
      {onInstructionsClick && (
        <button
          onClick={onInstructionsClick}
          className="w-full p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 text-white font-medium rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-2"
        >
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Инструкции
        </button>
      )}

      {/* Support Button */}
      <button
        onClick={() => {
          if (typeof window !== "undefined") {
            const supportUrl = "https://t.me/supmaxgroot";
            if (window.Telegram?.WebApp?.openTelegramLink) {
              window.Telegram.WebApp.openTelegramLink(supportUrl);
            } else if (window.Telegram?.WebApp?.openLink) {
              window.Telegram.WebApp.openLink(supportUrl, { try_instant_view: false });
            } else {
              window.open(supportUrl, "_blank");
            }
            if (window.Telegram?.WebApp?.HapticFeedback) {
              window.Telegram.WebApp.HapticFeedback.selectionChanged();
            }
          }
        }}
        className="w-full p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 font-medium rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-3"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span>Техподдержка</span>
      </button>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center gap-4 text-zinc-500 text-[10px]">
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Безопасно
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          24/7
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Быстро
        </div>
      </div>
    </div>
  );
}
