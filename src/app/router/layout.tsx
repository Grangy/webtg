import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Роутер MaxGroot — Заказ с доставкой СДЭК",
  description: "Оформление заказа роутера MaxGroot с доставкой в пункт выдачи СДЭК.",
};

export default function RouterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
