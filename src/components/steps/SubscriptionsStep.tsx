import { UserAccount } from "@/types";
import { formatHappLink, formatDate } from "@/utils/formatters";
import { Instructions } from "@/components/instructions/Instructions";

interface SubscriptionsStepProps {
  user: UserAccount | null;
  onCopyUrl: (url: string) => void;
  onOpenHappLink: (url: string) => void;
  onRenewSubscription?: (subscriptionId: number) => void;
}

export function SubscriptionsStep({
  user,
  onCopyUrl,
  onOpenHappLink,
  onRenewSubscription,
}: SubscriptionsStepProps) {
  if (!user) {
    return (
      <div className="animate-in fade-in duration-300">
        <h1 className="text-2xl font-bold text-white mb-2">Мои подписки</h1>
        <p className="text-zinc-500 mb-6">Загрузка данных...</p>
      </div>
    );
  }

  const activeSubscriptions = user.subscriptions.filter((s) => s.isActive);
  const inactiveSubscriptions = user.subscriptions.filter((s) => !s.isActive);

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="text-2xl font-bold text-white mb-2">Мои подписки</h1>
      <p className="text-zinc-500 mb-6">
        {activeSubscriptions.length > 0
          ? `У вас ${activeSubscriptions.length} активных подписк${activeSubscriptions.length === 1 ? "а" : activeSubscriptions.length < 5 ? "и" : ""}`
          : "У вас нет активных подписок"}
      </p>

      {/* Active Subscriptions */}
      {activeSubscriptions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Активные
          </h2>
          <div className="space-y-4">
            {activeSubscriptions.map((sub, index) => (
              <div
                key={sub.id}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-400 font-semibold text-lg">
                        {sub.type}
                      </span>
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg">
                        Активна
                      </span>
                    </div>
                    <div className="text-zinc-400 text-sm space-y-1">
                      <p>
                        Действует до:{" "}
                        <span className="text-white font-medium">
                          {formatDate(sub.endDate)}
                        </span>
                      </p>
                      <p>
                        Осталось дней:{" "}
                        <span className="text-emerald-400 font-semibold">
                          {sub.daysLeft ?? "—"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subscription URLs */}
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-zinc-500 text-xs mb-2">Сервер 1:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-emerald-400 font-mono text-xs flex-1 truncate bg-black/30 p-2 rounded">
                        {sub.subscriptionUrl}
                      </code>
                      <button
                        onClick={() => onCopyUrl(sub.subscriptionUrl)}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all active:scale-95 flex-shrink-0"
                      >
                        <svg
                          className="w-5 h-5 text-zinc-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {sub.subscriptionUrl2 && (
                    <div>
                      <p className="text-zinc-500 text-xs mb-2">Сервер 2 (Россия):</p>
                      <div className="flex items-center gap-2">
                        <code className="text-emerald-400 font-mono text-xs flex-1 truncate bg-black/30 p-2 rounded">
                          {sub.subscriptionUrl2}
                        </code>
                        <button
                          onClick={() => onCopyUrl(sub.subscriptionUrl2)}
                          className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all active:scale-95 flex-shrink-0"
                        >
                          <svg
                            className="w-5 h-5 text-zinc-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {onRenewSubscription && (
                    <button
                      onClick={() => onRenewSubscription(sub.id)}
                      className="w-full p-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Продлить подписку
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onOpenHappLink(sub.subscriptionUrl)}
                      className="flex-1 p-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm rounded-xl transition-all active:scale-[0.98] border border-zinc-700 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Открыть в Happ
                    </button>
                    <button
                      onClick={() => onCopyUrl(sub.subscriptionUrl)}
                      className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all active:scale-95 border border-zinc-700"
                      title="Скопировать ссылку сервера"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Subscriptions */}
      {inactiveSubscriptions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-400 mb-4">История</h2>
          <div className="space-y-3">
            {inactiveSubscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 opacity-60"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 font-medium">{sub.type}</p>
                    <p className="text-zinc-600 text-sm">
                      Истекла {formatDate(sub.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeSubscriptions.length === 0 && inactiveSubscriptions.length === 0 && (
        <div className="text-center py-12 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-zinc-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <p className="text-zinc-500 text-lg mb-2">Нет активных подписок</p>
          <p className="text-zinc-600 text-sm">
            Выберите тариф, чтобы начать пользоваться VPN
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6">
        <Instructions />
      </div>
    </div>
  );
}
