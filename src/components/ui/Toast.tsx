interface ToastProps {
  message: string;
  show: boolean;
  /** success — зелёный (копирование); warning — янтарный (персональные цены) */
  variant?: "success" | "warning";
  onDismiss?: () => void;
}

export function Toast({ message, show, variant = "success", onDismiss }: ToastProps) {
  if (!show) return null;

  const isWarning = variant === "warning";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom duration-300 max-w-[92vw]">
      <div
        role={onDismiss ? "button" : undefined}
        tabIndex={onDismiss ? 0 : undefined}
        onClick={onDismiss}
        onKeyDown={
          onDismiss
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") onDismiss();
              }
            : undefined
        }
        className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-lg flex items-center gap-2 backdrop-blur-sm border ${
          isWarning
            ? "bg-amber-500/95 text-zinc-900 border-amber-400/50 shadow-amber-500/20"
            : "bg-emerald-500 text-white border-emerald-400/30 shadow-emerald-500/40"
        }`}
      >
        {isWarning ? (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ) : (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        <span className="text-left">{message}</span>
        {onDismiss && (
          <span className="text-[10px] opacity-80 whitespace-nowrap hidden sm:inline">Нажмите, чтобы скрыть</span>
        )}
      </div>
    </div>
  );
}
