interface ErrorStepProps {
  errorMessage: string;
  onRetry: () => void;
}

export function ErrorStep({ errorMessage, onRetry }: ErrorStepProps) {
  return (
    <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center py-12">
      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
        <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Ошибка</h2>
      <p className="text-zinc-500 text-center mb-6">{errorMessage}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-all"
      >
        Попробовать снова
      </button>
    </div>
  );
}
