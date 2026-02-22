import { useState, useCallback, useRef } from "react";
import { Plan } from "@/types";

const PLANS_CACHE_MS = 5 * 60 * 1000;

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const lastFetchRef = useRef<number>(0);

  const loadPlans = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && lastFetchRef.current > 0 && now - lastFetchRef.current < PLANS_CACHE_MS) {
      return;
    }
    setPlansLoading(true);
    try {
      const response = await fetch("/api/plans");
      const result = await response.json();

      if (result.ok && result.data) {
        setPlans(result.data);
        lastFetchRef.current = now;
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
