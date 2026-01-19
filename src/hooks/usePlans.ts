import { useState, useCallback } from "react";
import { Plan } from "@/types";

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const loadPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const response = await fetch("/api/plans");
      const result = await response.json();

      if (result.ok && result.data) {
        setPlans(result.data);
      }
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  return {
    plans,
    plansLoading,
    loadPlans,
  };
}
