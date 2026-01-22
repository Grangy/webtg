import { Plan } from "@/types";

interface PaymentStepProps {
  selectedPlan: Plan;
  paymentUrl: string;
  checkingPayment: boolean;
  onOpenPaymentUrl: () => void;
  onCopyUrl: (url: string) => void;
  onManualCheck: () => void;
  copied: boolean;
}

export function PaymentStep({
  selectedPlan,
  paymentUrl,
  checkingPayment,
  onOpenPaymentUrl,
  onCopyUrl,
  onManualCheck,
  copied,
}: PaymentStepProps) {
  return (
    <div className="animate-in fade-in duration-300 max-w-full">
      <h1 className="text-xl font-bold text-white mb-1.5">Ожидание оплаты</h1>
      <p className="text-zinc-400 text-sm mb-5">Завершите оплату в открывшемся окне</p>

      {/* Order Info */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 overflow-hidden mb-4">
        <div className="p-3 border-b border-zinc-800/50">
          <p className="text-zinc-400 text-xs mb-1">Тариф</p>
          <p className="text-white font-semibold text-base">
            MaxGroot • {selectedPlan.label}
          </p>
        </div>
        <div className="p-3 bg-zinc-800/30">
          <div className="flex items-center justify-between">
            <p className="text-zinc-400 text-sm">К оплате</p>
            <p className="text-white font-bold text-xl">{selectedPlan.price} ₽</p>
          </div>
        </div>
      </div>

      {/* Payment URL - отображение и кнопка открытия */}
      {paymentUrl && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-4">
          <p className="text-emerald-400 text-xs font-medium mb-2.5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Ссылка для оплаты:
          </p>
          <div className="flex items-center gap-2 mb-2.5">
            <code className="text-emerald-400 font-mono text-xs flex-1 break-all bg-black/30 p-2 rounded-lg border border-emerald-500/20">
              {paymentUrl}
            </code>
            <button
              onClick={() => onCopyUrl(paymentUrl)}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all active:scale-95 flex-shrink-0"
              title={copied ? "Скопировано!" : "Скопировать"}
            >
              {copied ? (
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
          <button
            onClick={onOpenPaymentUrl}
            className="w-full p-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Открыть ссылку на оплату
          </button>
        </div>
      )}

      {/* Status */}
      <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/50 mb-4">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 border-3 border-zinc-700 border-t-emerald-500 rounded-full animate-spin mb-3" />
          <p className="text-white font-medium text-sm mb-1">Ожидаем подтверждение</p>
          <p className="text-zinc-400 text-xs text-center">
            После оплаты подписка активируется автоматически
          </p>
        </div>
      </div>

      {/* Manual Check */}
      <button
        onClick={onManualCheck}
        disabled={checkingPayment}
        className="w-full p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all active:scale-[0.98] border border-zinc-700 flex items-center justify-center gap-2"
      >
        {checkingPayment ? (
          <>
            <div className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
            <span className="text-sm">Проверяем...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm">Я уже оплатил</span>
          </>
        )}
      </button>
    </div>
  );
}
