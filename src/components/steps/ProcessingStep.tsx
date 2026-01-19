export function ProcessingStep() {
  return (
    <div className="w-full max-w-full overflow-x-hidden flex flex-col items-center justify-center py-8">
      <div className="w-16 h-16 border-3 border-zinc-700 border-t-emerald-500 rounded-full animate-spin mb-5" />
      <h2 className="text-lg font-bold text-white mb-1.5 text-center">Активируем подписку</h2>
      <p className="text-zinc-400 text-sm text-center max-w-xs">Это займёт несколько секунд...</p>
    </div>
  );
}
