import { Step } from "@/types";

interface StepIndicatorProps {
  step: Step;
}

const steps = [
  { id: "plans" as const, label: "Тариф" },
  { id: "payment" as const, label: "Оплата" },
  { id: "success" as const, label: "Готово" },
];

export function StepIndicator({ step }: StepIndicatorProps) {
  const stepOrder: Step[] = ["plans", "payment", "processing", "success"];
  const currentIndex = stepOrder.indexOf(step);

  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const itemIndex = s.id === "payment" ? 1 : s.id === "success" ? 2 : 0;
        const isActive = step === s.id || (step === "processing" && s.id === "payment");
        const isCompleted = currentIndex > itemIndex || (step === "processing" && itemIndex < 1);

        return (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                isActive
                  ? "bg-emerald-500 text-white"
                  : isCompleted
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i < 2 && (
              <div
                className={`w-12 h-0.5 rounded-full transition-all ${
                  isCompleted ? "bg-emerald-500" : "bg-zinc-800"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
