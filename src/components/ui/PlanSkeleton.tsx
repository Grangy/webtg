export function PlanSkeleton() {
  return (
    <div className="w-full p-4 rounded-2xl border-2 border-zinc-800 bg-zinc-900/50 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-6 h-6 rounded-full border-2 border-zinc-700" />
          <div className="flex-1">
            <div className="h-5 w-24 bg-zinc-800 rounded mb-2" />
            <div className="h-4 w-20 bg-zinc-800 rounded" />
          </div>
        </div>
        <div className="text-right">
          <div className="h-6 w-16 bg-zinc-800 rounded mb-1" />
          <div className="h-4 w-12 bg-zinc-800 rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}
