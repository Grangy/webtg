import { Plan } from "@/types";
import { PlanCard } from "./PlanCard";
import { PlanSkeleton } from "@/components/ui/PlanSkeleton";

interface PlansListProps {
  plans: Plan[];
  selectedPlan: Plan | null;
  onSelectPlan: (plan: Plan) => void;
  isLoading: boolean;
  onRetry?: () => void;
}

export function PlansList({ plans, selectedPlan, onSelectPlan, isLoading, onRetry }: PlansListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <PlanSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-8 mb-6">
        <p className="text-zinc-500">Не удалось загрузить тарифы</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-emerald-400 text-sm hover:underline"
          >
            Попробовать снова
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 mb-4">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          plans={plans}
          isSelected={selectedPlan?.id === plan.id}
          onSelect={onSelectPlan}
        />
      ))}
    </div>
  );
}
