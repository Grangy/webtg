import { Plan } from "@/types";

// Утилиты для работы с тарифами

export function getDiscount(plan: Plan, plans: Plan[]): number {
  if (plans.length === 0) return 0;
  const basePrice = plans[0]?.pricePerMonth || plan.pricePerMonth;
  if (plan.pricePerMonth >= basePrice) return 0;
  return Math.round((1 - plan.pricePerMonth / basePrice) * 100);
}

export function isPopularPlan(plan: Plan): boolean {
  return plan.months === 6;
}
