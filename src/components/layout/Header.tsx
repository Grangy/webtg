import { UserAccount, UserData } from "@/types";
import Image from "next/image";

function BalanceDisplay({ balance }: { balance: number }) {
  const balanceStr = `${balance} ₽`;
  const length = balanceStr.length;
  
  // Динамический размер шрифта в зависимости от длины числа
  let fontSize = "text-sm"; // 14px по умолчанию
  
  if (length >= 12) {
    fontSize = "text-[10px]"; // 10px для очень длинных чисел (100000+ ₽)
  } else if (length >= 10) {
    fontSize = "text-xs"; // 12px для длинных чисел (10000+ ₽)
  } else if (length >= 8) {
    fontSize = "text-xs"; // 12px для средних чисел (1000+ ₽)
  }
  
  return (
    <span className={`text-emerald-400 font-bold whitespace-nowrap ${fontSize} leading-tight`}>
      {balanceStr}
    </span>
  );
}

interface HeaderProps {
  user: UserAccount | null;
  tgUser: UserData | null;
  onBack?: () => void;
  showBack?: boolean;
  onSubscriptionsClick?: () => void;
  onLogoClick?: () => void;
  onAvatarClick?: () => void;
  currentStep?: string;
  children?: React.ReactNode;
}

export function Header({ user, tgUser, onBack, showBack, onSubscriptionsClick, onLogoClick, onAvatarClick, currentStep, children }: HeaderProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
      <div className="relative px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 bg-zinc-800/80 rounded-xl flex items-center justify-center hover:bg-zinc-700 transition-all active:scale-95"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="flex-1">
            {onLogoClick ? (
              <button
                onClick={onLogoClick}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity active:scale-95"
                title="На главную"
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src="/logo.jpg"
                    alt="MaxGroot"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xl font-bold text-white">MaxGroot</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src="/logo.jpg"
                    alt="MaxGroot"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xl font-bold text-white">MaxGroot</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {user && user.subscriptions.filter(s => s.isActive).length > 0 && currentStep !== "subscriptions" && onSubscriptionsClick && (
              <button
                onClick={onSubscriptionsClick}
                className="relative p-2 bg-zinc-800/80 hover:bg-zinc-700 rounded-xl transition-all active:scale-95"
                title="Мои подписки"
              >
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              </button>
            )}
            {user && (
              <div className="flex items-center gap-2 bg-zinc-800/80 rounded-xl px-2.5 py-1.5 min-w-0 max-w-[120px] flex-shrink-0">
                <BalanceDisplay balance={user.balance} />
              </div>
            )}
            {tgUser && (
              <button
                onClick={onAvatarClick}
                className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800 flex items-center justify-center hover:opacity-80 transition-opacity active:scale-95"
                title="Мои подписки и баланс"
              >
                {tgUser.photo_url ? (
                  <Image
                    src={tgUser.photo_url}
                    alt={tgUser.first_name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-sm font-bold text-white">{tgUser.first_name[0]}</span>
                )}
              </button>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
