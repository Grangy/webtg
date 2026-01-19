import { useState } from "react";
import { DeviceType } from "@/types";
import { AppleIcon, AndroidIcon, TvIcon, WindowsIcon } from "@/components/icons/DeviceIcons";

interface InstructionsProps {
  className?: string;
}

interface AppLink {
  label: string;
  url: string;
  type: "store" | "github" | "direct";
}

const deviceInstructions: Record<DeviceType, { 
  name: string; 
  Icon: React.ComponentType<{ className?: string }>; 
  iconColor: string; 
  appLinks: AppLink[];
  steps: string[] 
}> = {
  ios: {
    name: "iOS",
    Icon: AppleIcon,
    iconColor: "text-gray-100",
    appLinks: [
      { label: "App Store (Happ)", url: "https://apps.apple.com/us/app/happ-proxy-utility/id6504287215", type: "store" },
      { label: "App Store (Happ Plus)", url: "https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973", type: "store" },
    ],
    steps: [
      "Скачайте приложение Happ из App Store (ссылки ниже)",
      "Откройте приложение и нажмите «Добавить сервер»",
      "Вставьте скопированную ссылку подключения",
      "Нажмите «Подключиться» и разрешите создание VPN-профиля",
      "Готово! VPN активирован",
    ],
  },
  macos: {
    name: "macOS",
    Icon: AppleIcon,
    iconColor: "text-gray-100",
    appLinks: [
      { label: "App Store (Happ)", url: "https://apps.apple.com/us/app/happ-proxy-utility/id6504287215", type: "store" },
      { label: "App Store (Happ Plus)", url: "https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973", type: "store" },
    ],
    steps: [
      "Скачайте приложение Happ из App Store (ссылки ниже)",
      "Откройте приложение и нажмите «Добавить сервер»",
      "Вставьте скопированную ссылку подключения",
      "Нажмите «Подключиться» и разрешите создание VPN-профиля",
      "Готово! VPN активирован",
    ],
  },
  android: {
    name: "Android",
    Icon: AndroidIcon,
    iconColor: "text-green-400",
    appLinks: [
      { label: "Google Play", url: "https://play.google.com/store/apps/details?id=com.happproxy", type: "store" },
      { label: "GitHub (APK)", url: "https://github.com/Happ-proxy/happ-android/releases/latest/download/Happ.apk", type: "github" },
    ],
    steps: [
      "Скачайте приложение Happ из Google Play или GitHub (ссылки ниже)",
      "Откройте приложение и нажмите «+» или «Импорт»",
      "Вставьте скопированную ссылку подключения",
      "Нажмите «Подключиться» и разрешите создание VPN-соединения",
      "Готово! VPN активирован",
    ],
  },
  "android-tv": {
    name: "Android TV",
    Icon: TvIcon,
    iconColor: "text-purple-400",
    appLinks: [
      { label: "Google Play", url: "https://play.google.com/store/apps/details?id=com.happproxy", type: "store" },
      { label: "GitHub (APK)", url: "https://github.com/Happ-proxy/happ-android/releases/latest/download/Happ.apk", type: "github" },
    ],
    steps: [
      "Установите приложение Happ через Google Play на TV или скачайте APK (ссылки ниже)",
      "Откройте приложение на телевизоре",
      "Используйте телефон для сканирования QR-кода или введите ссылку вручную",
      "Выберите сервер и нажмите «Подключиться»",
      "Готово! VPN работает на вашем TV",
    ],
  },
  windows: {
    name: "Windows",
    Icon: WindowsIcon,
    iconColor: "text-blue-400",
    appLinks: [
      { label: "GitHub (Setup)", url: "https://github.com/Happ-proxy/happ-desktop/releases/latest/download/setup-Happ.x64.exe", type: "github" },
    ],
    steps: [
      "Скачайте установщик Happ для Windows (ссылка ниже)",
      "Установите и откройте приложение",
      "Нажмите «Импорт» или «Добавить подписку»",
      "Вставьте скопированную ссылку подключения",
      "Выберите сервер и нажмите «Подключиться»",
      "Готово! VPN работает на Windows",
    ],
  },
};

export function Instructions({ className = "" }: InstructionsProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>("ios");
  const instructions = deviceInstructions[selectedDevice];

  return (
    <div className={`bg-zinc-900/50 rounded-2xl border border-zinc-800/50 overflow-hidden ${className}`}>
      {/* Device Selector */}
      <div className="p-3 border-b border-zinc-800/50">
        <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Инструкция по подключению
        </h3>
        <div className="grid grid-cols-3 gap-1.5">
          {Object.entries(deviceInstructions).map(([key, device]) => (
            <button
              key={key}
              onClick={() => setSelectedDevice(key as DeviceType)}
              className={`p-2 rounded-lg border-2 transition-all active:scale-95 relative overflow-hidden group ${
                selectedDevice === key
                  ? "bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                  : "bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800/40"
              }`}
            >
              <div className="flex justify-center mb-1">
                <device.Icon className={`w-5 h-5 ${device.iconColor}`} />
              </div>
              <p className={`text-[10px] font-medium ${
                selectedDevice === key ? "text-emerald-400" : "text-zinc-400"
              }`}>
                {device.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* App Links */}
      {instructions.appLinks.length > 0 && (
        <div className="p-3 border-b border-zinc-800/50 bg-zinc-900/30">
          <p className="text-zinc-400 text-xs font-medium mb-2">Ссылки на приложения:</p>
          <div className="space-y-1.5">
            {instructions.appLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-all active:scale-95 group"
              >
                {link.type === "store" ? (
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
                <span className="text-zinc-300 text-xs flex-1 group-hover:text-emerald-400 transition-colors">{link.label}</span>
                <svg className="w-3 h-3 text-zinc-500 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="p-3">
        <div className="space-y-2">
          {instructions.steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-2 animate-in fade-in slide-in-from-right duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                selectedDevice === "ios" || selectedDevice === "macos"
                  ? "bg-blue-500/20 text-blue-400"
                  : selectedDevice === "android"
                    ? "bg-green-500/20 text-green-400"
                    : selectedDevice === "android-tv"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-blue-600/20 text-blue-400"
              }`}>
                {index + 1}
              </div>
              <p className="text-zinc-300 text-xs flex-1 leading-tight">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
