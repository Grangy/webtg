import { Plan, UserAccount } from "@/types";
import { PlansList } from "@/components/plans/PlansList";

interface PlansStepProps {
  plans: Plan[];
  selectedPlan: Plan | null;
  user: UserAccount | null;
  plansLoading: boolean;
  onSelectPlan: (plan: Plan) => void;
  onCreatePayment: () => void;
  onBuyWithBalance?: () => void;
  onCopyUrl: (url: string) => void;
  onRetryLoadPlans: () => void;
  onSubscriptionsClick?: () => void;
  showPlans?: boolean;
  onShowPlans?: () => void;
}

export function PlansStep({
  plans,
  selectedPlan,
  user,
  plansLoading,
  onSelectPlan,
  onCreatePayment,
  onBuyWithBalance,
  onCopyUrl,
  onRetryLoadPlans,
  onSubscriptionsClick,
  showPlans = true,
  onShowPlans,
}: PlansStepProps) {
  const activeSubscriptions = user?.subscriptions.filter((s) => s.isActive) || [];
  const hasActiveSubscriptions = activeSubscriptions.length > 0;
  
  // Если есть подписки и не показаны планы - показываем главный экран с подписками
  const shouldShowSubscriptionsFirst = hasActiveSubscriptions && !showPlans;

  return (
    <div className="animate-in fade-in duration-300">
      {shouldShowSubscriptionsFirst ? (
        // Экран когда есть активные подписки
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Добро пожаловать!</h1>
            <p className="text-zinc-500 mb-6">У вас есть активные подписки VPN</p>
          </div>

          {/* Кнопка перехода в подписки */}
          {onSubscriptionsClick && (
            <button
              onClick={onSubscriptionsClick}
              className="w-full p-6 bg-emerald-500/10 border-2 border-emerald-500/30 hover:border-emerald-500/50 rounded-2xl transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold text-lg">Мои подписки</p>
                    <p className="text-zinc-400 text-sm">
                      {activeSubscriptions.length} {activeSubscriptions.length === 1 ? "активная подписка" : activeSubscriptions.length < 5 ? "активные подписки" : "активных подписок"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-lg">
                    {activeSubscriptions.length}
                  </span>
                  <svg className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          )}

          {/* Кнопка купить еще одну */}
          <button
            onClick={onShowPlans}
            className="w-full p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 text-white font-medium rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Купить еще одну подписку
          </button>
        </div>
      ) : (
        // Экран выбора тарифов (как было)
        <>
          <h1 className="text-xl font-bold text-white mb-1">Выберите тариф</h1>
          <p className="text-zinc-500 text-sm mb-4">Безлимитный VPN для всех устройств</p>

          <PlansList
            plans={plans}
            selectedPlan={selectedPlan}
            onSelectPlan={onSelectPlan}
            isLoading={plansLoading}
            onRetry={onRetryLoadPlans}
          />

          {/* CTA Buttons */}
          {selectedPlan && (
            <div className="space-y-2">
              {/* Check if user has enough balance */}
              {user && user.balance >= selectedPlan.price && onBuyWithBalance ? (
                <>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 mb-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Баланс:</span>
                      <span className="text-emerald-400 font-semibold">{user.balance} ₽</span>
                    </div>
                  </div>
                  <button
                    onClick={onBuyWithBalance}
                    className="w-full p-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 relative overflow-hidden group mb-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="relative z-10">Оплатить с баланса • {selectedPlan.price} ₽</span>
                  </button>
                  <button
                    onClick={onCreatePayment}
                    className="w-full p-2.5 bg-zinc-800/50 hover:bg-zinc-800 text-white font-medium text-sm rounded-xl transition-all active:scale-[0.98] border border-zinc-700/50"
                  >
                    Или оплатить через СБП
                  </button>
                </>
              ) : (
                <button
                  onClick={onCreatePayment}
                  disabled={!selectedPlan}
                  className={`w-full p-3 rounded-xl font-semibold text-base transition-all active:scale-[0.98] relative overflow-hidden ${
                    selectedPlan
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/30 group"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  {selectedPlan && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  )}
                  <span className="relative z-10">
                    {selectedPlan ? `Оплатить через СБП • ${selectedPlan.price} ₽` : "Выберите тариф"}
                  </span>
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
