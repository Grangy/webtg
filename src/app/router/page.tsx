"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CDEK_POINTS_URL, SUPPORT_TG_URL } from "@/lib/constants";

const ROUTER_PRICE = 5000;

export default function RouterPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const openLink = (url: string) => {
    if (typeof window === "undefined") return;
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(url, { try_instant_view: false });
    } else if (window.Telegram?.WebApp?.openTelegramLink && url.startsWith("https://t.me/")) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, "_blank");
    }
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted || submitting) return;
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
    setSubmitting(true);
    const initData = typeof window !== "undefined" ? window.Telegram?.WebApp?.initData : "";
    const telegramId = typeof window !== "undefined" ? window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() : "";
    try {
      await fetch("/api/router/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData, address: address.trim() }),
      });
    } catch {
      // notify continues even if order notification fails
    }
    try {
      const topupRes = await fetch("/api/topup/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId,
          amount: ROUTER_PRICE,
          referral_source: "router",
        }),
      });
      const topupData = await topupRes.json();
      const paymentUrl = topupData?.data?.paymentUrl ?? topupData?.paymentUrl;
      if (topupRes.ok && paymentUrl) {
        setSubmitted(true);
        openLink(paymentUrl);
      } else {
        window.Telegram?.WebApp?.showAlert?.(topupData?.message ?? "Ошибка создания платежа. Обратитесь в поддержку.");
        openLink(SUPPORT_TG_URL);
      }
    } catch {
      window.Telegram?.WebApp?.showAlert?.("Ошибка сети. Обратитесь в поддержку.");
      openLink(SUPPORT_TG_URL);
    } finally {
      setSubmitting(false);
    }
  };

  const goHome = () => {
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();
    router.replace("/");
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-white flex flex-col">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
        <div className="relative px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goHome}
              className="w-10 h-10 bg-zinc-800/80 rounded-xl flex items-center justify-center hover:bg-zinc-700 transition-all active:scale-95"
              aria-label="На главную"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-white">Роутер MaxGroot</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        <div className="max-w-md mx-auto animate-in fade-in duration-300">
          {/* Router image */}
          <div className="flex justify-center mb-6">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <Image
                src="/image_1771854189590.png"
                alt="Роутер MaxGroot"
                width={192}
                height={192}
                className="object-contain drop-shadow-2xl animate-in scale-in duration-500"
                priority
                unoptimized={false}
              />
            </div>
          </div>

          <p className="text-zinc-400 text-sm text-center mb-6">
            Оформите заказ с доставкой в пункт выдачи СДЭК
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Address */}
            <div>
              <label htmlFor="cdek-address" className="block text-zinc-300 text-sm font-medium mb-2">
                Адрес доставки СДЭК
              </label>
              <textarea
                id="cdek-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Город, пункт выдачи или адрес"
                rows={3}
                className="w-full px-4 py-3 bg-zinc-800/60 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none"
              />
              <a
                href={CDEK_POINTS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  openLink(CDEK_POINTS_URL);
                }}
                className="inline-flex items-center gap-1.5 mt-2 text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Найти ближайший пункт СДЭК
              </a>
            </div>

            {/* Payment CTA */}
            <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-3">
              <p className="text-zinc-400 text-xs">
                Оплата и точная стоимость доставки уточняются в поддержке. После отправки заявки с вами свяжутся.
              </p>
              <button
                type="submit"
                disabled={submitting || submitted}
                className="w-full p-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:pointer-events-none text-white font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Отправка…
                  </>
                ) : submitted ? (
                  "Заявка отправлена"
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Оформить заказ / Оплатить
                  </>
                )}
              </button>
              <p className="text-zinc-500 text-xs text-center">
                По вопросам оплаты и доставки обратитесь в{" "}
                <button
                  type="button"
                  onClick={() => openLink(SUPPORT_TG_URL)}
                  className="text-emerald-400 hover:text-emerald-300 underline"
                >
                  поддержку
                </button>
              </p>
            </div>
          </form>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={goHome}
              className="text-zinc-500 text-sm hover:text-zinc-400 transition-colors"
            >
              ← Вернуться в приложение
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
