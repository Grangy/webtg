import { UserAccount } from "@/types";

interface ActiveSubscriptionsProps {
  user: UserAccount;
  onCopyUrl: (url: string) => void;
}

export function ActiveSubscriptions({ user, onCopyUrl }: ActiveSubscriptionsProps) {
  const activeSubscriptions = user.subscriptions.filter((s) => s.isActive);

  if (activeSubscriptions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <p className="text-zinc-400 text-sm font-medium mb-3">Активные подписки:</p>
      {activeSubscriptions.map((sub) => (
        <div key={sub.id} className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-400 font-semibold">{sub.type}</span>
            <span className="text-zinc-400 text-sm">{sub.daysLeft} дней осталось</span>
          </div>
          <button
            onClick={() => onCopyUrl(sub.subscriptionUrl)}
            className="w-full p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl text-sm text-zinc-300 transition-all"
          >
            Скопировать ключ подключения
          </button>
        </div>
      ))}
    </div>
  );
}
