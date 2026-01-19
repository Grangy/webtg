// Утилиты для форматирования данных

export function getMonthWord(months: number): string {
  if (months === 1) return "месяц";
  if (months >= 2 && months <= 4) return "месяца";
  return "месяцев";
}

export function formatDate(date: string | Date | null | undefined, locale = "ru-RU"): string {
  if (!date) {
    return "—";
  }
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  // Проверяем валидность даты
  if (!(d instanceof Date) || isNaN(d.getTime())) {
    return "—";
  }
  
  return d.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatHappLink(url: string): string {
  const encodedUrl = encodeURIComponent(url);
  return `happ://add/${encodedUrl}`;
}
