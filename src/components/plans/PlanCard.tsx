import { Plan } from "@/types";
import { getDiscount, isPopularPlan } from "@/utils/planUtils";
import { getMonthWord } from "@/utils/formatters";

interface PlanCardProps {
  plan: Plan;
  plans: Plan[];
  isSelected: boolean;
  onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, plans, isSelected, onSelect }: PlanCardProps) {
  const discount = getDiscount(plan, plans);
  const popular = isPopularPlan(plan);

  return (
    <button
      onClick={() => onSelect(plan)}
      className={`w-full p-3 rounded-xl border-2 transition-all duration-300 active:scale-[0.98] relative overflow-hidden group ${
        isSelected
          ? "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/20"
          : "bg-zinc-900/50 border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/70 hover:shadow-md"
      }`}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
          Популярный
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected ? "border-emerald-500 bg-emerald-500" : "border-zinc-600"
            }`}
          >
            {isSelected && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div className="text-left">
            <p className="text-white font-semibold text-base">{plan.label}</p>
            <p className="text-zinc-500 text-xs">{plan.pricePerMonth} ₽/мес</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-lg">{plan.price} ₽</p>
          {discount > 0 && (
            <p className="text-emerald-400 text-xs font-medium">-{discount}%</p>
          )}
        </div>
      </div>
    </button>
  );
}
