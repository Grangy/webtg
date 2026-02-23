"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface BalancePopoverProps {
  /** Общий баланс (основной + реферальный) */
  total: number;
  /** Заработано с рефералов */
  referral?: number;
  children: React.ReactNode;
  className?: string;
}

export function BalancePopover({ total, referral = 0, children, className = "" }: BalancePopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const main = total - referral;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const trigger = triggerRef.current;
      const popover = popoverRef.current;
      if (!trigger || !popover) return;
      const rect = trigger.getBoundingClientRect();
      popover.style.top = `${rect.bottom + 8}px`;
      popover.style.right = `${window.innerWidth - rect.right}px`;
      popover.style.left = "auto";
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    const raf = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  return (
    <div ref={triggerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
          }
          setOpen((v) => !v);
        }}
        className="w-full text-left p-0 border-0 bg-transparent cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-lg min-w-0"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {children}
      </button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[9999] min-w-[200px] rounded-xl bg-zinc-800 border border-zinc-600 shadow-xl py-3 px-4 animate-in fade-in duration-150"
            role="dialog"
            aria-label="Разбивка баланса"
            style={{
              top: 0,
              right: 0,
              left: "auto",
            }}
          >
            <div className="space-y-2 text-left">
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide">Баланс</p>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Основной</span>
                  <span className="text-white font-medium">{main} ₽</span>
                </div>
                {referral > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">С рефералов</span>
                    <span className="text-emerald-400 font-medium">{referral} ₽</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1.5 border-t border-zinc-700">
                  <span className="text-zinc-300 font-medium">Общий</span>
                  <span className="text-emerald-400 font-bold">{total} ₽</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
