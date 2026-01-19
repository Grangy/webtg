import { Subscription } from "@/types";
import { formatDate } from "@/utils/formatters";
import { useState } from "react";
import { SetupWizard } from "@/components/setup/SetupWizard";

interface SuccessStepProps {
  subscription: Subscription;
  onCopyUrl: (url: string) => void;
  onOpenHappLink: (url: string) => void;
  onBack: () => void;
  onInstructionsClick?: () => void;
  isRenewal?: boolean;
}

export function SuccessStep({
  subscription,
  onCopyUrl,
  onOpenHappLink,
  onBack,
  onInstructionsClick,
  isRenewal = false,
}: SuccessStepProps) {
  const [copiedUrl1, setCopiedUrl1] = useState(false);
  const [copiedUrl2, setCopiedUrl2] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(!isRenewal); // Не показываем SetupWizard при продлении

  const handleCopyUrl1 = () => {
    onCopyUrl(subscription.subscriptionUrl);
    setCopiedUrl1(true);
    setTimeout(() => setCopiedUrl1(false), 2000);
  };

  const handleCopyUrl2 = () => {
    if (subscription.subscriptionUrl2) {
      onCopyUrl(subscription.subscriptionUrl2);
      setCopiedUrl2(true);
      setTimeout(() => setCopiedUrl2(false), 2000);
    }
  };

  // Show SetupWizard first for new subscriptions, then show success details after completion
  if (showSetupWizard && !isRenewal) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <SetupWizard
          subscriptionUrl={subscription.subscriptionUrl}
          subscriptionUrl2={subscription.subscriptionUrl2}
          onCopyUrl={onCopyUrl}
          onOpenHappLink={onOpenHappLink}
          onComplete={() => setShowSetupWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Success Header */}
      <div className="text-center mb-4">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        <h1 className="text-lg font-bold text-white mb-1">
          {isRenewal ? "Подписка продлена!" : "Подписка активирована!"}
        </h1>
        <p className="text-zinc-400 text-xs">
          {isRenewal ? "Ваша подписка успешно продлена" : "VPN готов к использованию"}
        </p>
      </div>

      {/* Subscription URLs Card - показываем только для новых покупок */}
      {!isRenewal && (
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 mb-3 overflow-hidden">
        {/* Server 1 URL */}
        <div className="p-2.5 border-b border-zinc-800/50">
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="text-zinc-400 text-[10px] font-medium">Сервер 1</span>
          </div>
          <div className="flex gap-1.5 items-start">
            <div className="flex-1 min-w-0">
              <div className="bg-zinc-900/50 border border-zinc-800/30 rounded-lg p-1.5 overflow-hidden">
                <code className="text-emerald-400 font-mono text-[9px] leading-snug block break-all overflow-wrap-anywhere">
                  {subscription.subscriptionUrl}
                </code>
              </div>
            </div>
            <button
              onClick={handleCopyUrl1}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all active:scale-95 flex-shrink-0"
              title="Скопировать"
            >
              {copiedUrl1 ? (
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Server 2 URL */}
        {subscription.subscriptionUrl2 && (
          <div className="p-2.5 border-b border-zinc-800/50">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-zinc-400 text-[10px] font-medium">Сервер 2 (Россия)</span>
            </div>
            <div className="flex gap-1.5 items-start">
              <div className="flex-1 min-w-0">
                <div className="bg-zinc-900/50 border border-zinc-800/30 rounded-lg p-1.5 overflow-hidden">
                  <code className="text-emerald-400 font-mono text-[9px] leading-snug block break-all overflow-wrap-anywhere">
                    {subscription.subscriptionUrl2}
                  </code>
                </div>
              </div>
              <button
                onClick={handleCopyUrl2}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all active:scale-95 flex-shrink-0"
                title="Скопировать"
              >
                {copiedUrl2 ? (
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Expiry Date */}
        <div className="p-2.5 bg-zinc-800/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-zinc-400 text-[10px]">Действует до</span>
            </div>
            <span className="text-white font-semibold text-[11px]">{formatDate(subscription.endDate)}</span>
          </div>
        </div>
      </div>
      )}

      {/* Action Buttons */}
      {isRenewal ? (
        // Для продления показываем только кнопку возврата
        <div className="space-y-2 mb-3">
          <button
            onClick={onBack}
            className="w-full p-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25"
          >
            Вернуться к подпискам
          </button>
        </div>
      ) : (
        // Для новой покупки показываем все кнопки
        <div className="space-y-2 mb-3">
          <button
            onClick={() => onOpenHappLink(subscription.subscriptionUrl)}
            className="w-full p-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Открыть в приложении</span>
          </button>

          <button
            onClick={() => onCopyUrl(subscription.subscriptionUrl)}
            className="w-full p-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm rounded-xl transition-all active:scale-[0.98] border border-zinc-700 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Скопировать ссылку сервера</span>
          </button>

          {onInstructionsClick && (
            <button
              onClick={onInstructionsClick}
              className="w-full p-2.5 bg-zinc-800/50 hover:bg-zinc-800 text-white font-medium text-sm rounded-xl transition-all active:scale-[0.98] border border-zinc-700/50 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Инструкции</span>
            </button>
          )}

          <button
            onClick={onBack}
            className="w-full p-2.5 bg-zinc-800/30 hover:bg-zinc-800/50 text-zinc-400 hover:text-white font-medium text-sm rounded-xl transition-all active:scale-[0.98] border border-zinc-700/30"
          >
            Вернуться к тарифам
          </button>
        </div>
      )}
    </div>
  );
}
