import { useState } from "react";
import { DeviceType } from "@/types";
import { AppleIcon, AndroidIcon, TvIcon, WindowsIcon } from "@/components/icons/DeviceIcons";

interface SetupWizardProps {
  subscriptionUrl: string;
  subscriptionUrl2?: string;
  onCopyUrl: (url: string) => void;
  onOpenHappLink: (url: string) => void;
  onComplete: () => void;
}

interface AppLink {
  label: string;
  url: string;
  type: "store" | "github" | "direct";
}

const deviceData: Record<DeviceType, {
  name: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  appLinks: AppLink[];
  steps: string[];
}> = {
  ios: {
    name: "iOS",
    Icon: AppleIcon,
    iconColor: "text-gray-100",
    appLinks: [
      { label: "App Store (Happ Plus)", url: "https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973", type: "store" },
      { label: "App Store (Happ) (Альтернатива)", url: "https://apps.apple.com/us/app/happ-proxy-utility/id6504287215", type: "store" },
    ],
    steps: [
      "Откройте приложение Happ Plus",
      "Нажмите «Добавить сервер» или «+»",
      "Вставьте скопированную ссылку подключения",
      "Нажмите «Подключиться» и разрешите создание профиля",
      "Готово! Подключение активировано",
    ],
  },
  macos: {
    name: "macOS",
    Icon: AppleIcon,
    iconColor: "text-gray-100",
    appLinks: [
      { label: "App Store (Happ Plus)", url: "https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973", type: "store" },
      { label: "App Store (Happ) (Альтернатива)", url: "https://apps.apple.com/us/app/happ-proxy-utility/id6504287215", type: "store" },
    ],
    steps: [
      "Откройте приложение Happ Plus",
      "Нажмите «Добавить сервер» или «+»",
      "Вставьте скопированную ссылку подключения",
      "Нажмите «Подключиться» и разрешите создание профиля",
      "Готово! Подключение активировано",
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
      "Откройте приложение Happ",
      "Нажмите «+» или «Импорт»",
      "Вставьте скопированную ссылку подключения",
      "Нажмите «Подключиться» и разрешите создание соединения",
      "Готово! Подключение активировано",
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
      "Установите приложение Happ через Google Play на TV",
      "Откройте приложение на телевизоре",
      "Используйте телефон для сканирования QR-кода или введите ссылку вручную",
      "Выберите сервер и нажмите «Подключиться»",
      "Готово! Подключение работает на вашем TV",
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
      "Скачайте установщик Happ для Windows",
      "Установите и откройте приложение",
      "Нажмите «Импорт» или «Добавить подписку»",
      "Вставьте скопированную ссылку подключения",
      "Выберите сервер и нажмите «Подключиться»",
      "Готово! Подключение работает на Windows",
    ],
  },
};

type SetupStep = "device" | "download" | "setup";

export function SetupWizard({
  subscriptionUrl,
  subscriptionUrl2,
  onCopyUrl,
  onOpenHappLink,
  onComplete,
}: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>("device");
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);
  const [appDownloaded, setAppDownloaded] = useState(false);

  const device = selectedDevice ? deviceData[selectedDevice] : null;

  const handleDeviceSelect = (device: DeviceType) => {
    setSelectedDevice(device);
    setCurrentStep("download");
  };

  const handleAppDownloaded = () => {
    setAppDownloaded(true);
    setCurrentStep("setup");
  };

  const handleSkipDownload = () => {
    setAppDownloaded(true);
    setCurrentStep("setup");
  };

  const handleComplete = () => {
    onComplete();
  };

  // Step 1: Device Selection
  if (currentStep === "device") {
    return (
      <div className="w-full max-w-full overflow-x-hidden animate-in fade-in duration-300">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Выберите устройство</h2>
          <p className="text-zinc-400 text-xs">Для какого устройства настраиваем подключение?</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {Object.entries(deviceData).map(([key, device]) => (
            <button
              key={key}
              onClick={() => handleDeviceSelect(key as DeviceType)}
              className="p-3 bg-zinc-900/50 hover:bg-zinc-900 border-2 border-zinc-800/50 hover:border-emerald-500/50 rounded-xl transition-all active:scale-95 flex flex-col items-center gap-2"
            >
              <device.Icon className={`w-6 h-6 ${device.iconColor}`} />
              <span className="text-white text-xs font-medium">{device.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Download App
  if (currentStep === "download" && device) {
    return (
      <div className="w-full max-w-full overflow-x-hidden animate-in fade-in slide-in-from-right duration-300">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <device.Icon className={`w-6 h-6 ${device.iconColor}`} />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Скачайте приложение</h2>
          <p className="text-zinc-400 text-xs">Выберите способ установки для {device.name}</p>
        </div>

        <div className="space-y-2 mb-3">
          {device.appLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/50 hover:border-emerald-500/50 rounded-xl transition-all active:scale-95 group"
            >
              {link.type === "store" ? (
                <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-zinc-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              )}
              <span className="text-white text-sm flex-1 text-left group-hover:text-emerald-400 transition-colors">{link.label}</span>
              <svg className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>

        <button
          onClick={handleAppDownloaded}
          className="w-full p-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25 mb-2"
        >
          Я скачал приложение
        </button>

        <button
          onClick={() => setCurrentStep("device")}
          className="w-full p-2.5 bg-zinc-800/30 hover:bg-zinc-800/50 text-zinc-400 hover:text-white font-medium text-sm rounded-xl transition-all active:scale-[0.98] border border-zinc-700/30"
        >
          Назад
        </button>
      </div>
    );
  }

  // Step 3: Setup Instructions
  if (currentStep === "setup" && device) {
    return (
      <div className="w-full max-w-full overflow-x-hidden animate-in fade-in slide-in-from-right duration-300">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Настройка подключения</h2>
          <p className="text-zinc-400 text-xs">Следуйте инструкциям для {device.name}</p>
        </div>

        {/* Subscription URLs */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 mb-3 overflow-hidden">
          <div className="p-2.5 border-b border-zinc-800/50">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-zinc-400 text-[10px] font-medium">Сервер 1</span>
            </div>
            <div className="flex gap-1.5 items-start">
              <div className="flex-1 min-w-0">
                <div className="bg-zinc-900/50 border border-zinc-800/30 rounded-lg p-1.5 overflow-hidden">
                  <code className="text-emerald-400 font-mono text-[9px] leading-snug block break-all overflow-wrap-anywhere">
                    {subscriptionUrl}
                  </code>
                </div>
              </div>
              <button
                onClick={() => onCopyUrl(subscriptionUrl)}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all active:scale-95 flex-shrink-0"
                title="Скопировать"
              >
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {subscriptionUrl2 && (
            <div className="p-2.5 border-b border-zinc-800/50">
              <div className="flex items-center gap-1.5 mb-1.5">
                <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-zinc-400 text-[10px] font-medium">Сервер 2 (Для Миранды)</span>
              </div>
              <div className="flex gap-1.5 items-start">
                <div className="flex-1 min-w-0">
                  <div className="bg-zinc-900/50 border border-zinc-800/30 rounded-lg p-1.5 overflow-hidden">
                    <code className="text-emerald-400 font-mono text-[9px] leading-snug block break-all overflow-wrap-anywhere">
                      {subscriptionUrl2}
                    </code>
                  </div>
                </div>
                <button
                  onClick={() => onCopyUrl(subscriptionUrl2)}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all active:scale-95 flex-shrink-0"
                  title="Скопировать"
                >
                  <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="p-2.5">
            <button
              onClick={() => onOpenHappLink(subscriptionUrl)}
              className="w-full p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Открыть в приложении
            </button>

            <button
              onClick={() => onCopyUrl(subscriptionUrl)}
              className="w-full p-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs rounded-lg transition-all active:scale-[0.98] border border-zinc-700 flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Скопировать ссылку сервера
            </button>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-3 mb-3">
          <h3 className="text-white text-xs font-semibold mb-2.5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Пошаговая инструкция:
          </h3>
          <div className="space-y-2">
            {device.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[10px] ${
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

        <button
          onClick={handleComplete}
          className="w-full p-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25"
        >
          Готово, подключил
        </button>
      </div>
    );
  }

  return null;
}
