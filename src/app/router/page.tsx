"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CDEK_POINTS_URL, SUPPORT_TG_URL } from "@/lib/constants";

export default function RouterPage() {
  const [address, setAddress] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
    openLink(SUPPORT_TG_URL);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-white flex flex-col">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
        <div className="relative px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-10 h-10 bg-zinc-800/80 rounded-xl flex items-center justify-center hover:bg-zinc-700 transition-all active:scale-95"
              aria-label="Назад"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
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
                className="w-full p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Оформить заказ / Оплатить
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
            <Link
              href="/"
              className="text-zinc-500 text-sm hover:text-zinc-400 transition-colors"
            >
              ← Вернуться в приложение
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
