# MaxGroot VPN — Telegram Mini App

Telegram Mini App для продажи VPN подписок с интеграцией MaxGroot VPN API.

## 🚀 Возможности

- ✅ Выбор тарифов (1, 3, 6, 12 месяцев)
- ✅ Оплата через СБП (Platega) или с баланса
- ✅ Управление подписками
- ✅ Продление подписок
- ✅ Поэтапная инструкция по подключению для всех устройств
- ✅ Поддержка iOS, macOS, Android, Android TV, Windows
- ✅ Интеграция с Happ VPN клиентом

## 📋 Требования

- Node.js 18+ 
- npm или yarn
- Telegram Bot Token (от @BotFather)
- Доступ к MaxGroot VPN API

## 🔧 Установка

### 1. Клонируйте репозиторий

```bash
git clone https://github.com/Grangy/webtg.git
cd webtg
```

### 2. Установите зависимости

```bash
npm install
```

### 3. Настройте переменные окружения

Скопируйте `.env.example` в `.env.local`:

```bash
cp .env.example .env.local
```

Отредактируйте `.env.local` и укажите:

```env
BOT_TOKEN=your_bot_token_here
API_URL=https://grangy.ru/api
API_SECRET=your_api_secret_here
```

### 4. Запустите в режиме разработки

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:3000`

## 🌐 Продакшен деплой

### Для web.grangy.ru

1. **Настройте переменные окружения на сервере:**
   ```env
   BOT_TOKEN=your_bot_token
   API_URL=https://grangy.ru/api
   API_SECRET=your_api_secret
   NEXT_PUBLIC_APP_URL=https://web.grangy.ru
   ```

2. **Соберите проект:**
   ```bash
   npm run build
   ```

3. **Запустите продакшен сервер:**
   ```bash
   npm start
   ```

4. **Настройте Telegram Bot:**
   - Откройте [@BotFather](https://t.me/BotFather)
   - Используйте `/setmenubutton` или настройте через Bot Settings
   - Укажите URL: `https://web.grangy.ru`

### Деплой на сервер (93.123.39.210, PM2: webapp)

На сервере проект уже развёрнут и запущен в PM2 под именем `webapp`. Для обновления используйте скрипт:

```bash
# По умолчанию: хост 93.123.39.210, ключ ~/.ssh/shared_server_key, путь /var/www/webapp
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

Переменные окружения (при необходимости):

- `DEPLOY_HOST` — хост (по умолчанию 93.123.39.210)
- `DEPLOY_USER` — пользователь SSH (по умолчанию root)
- `DEPLOY_PATH` — путь к проекту на сервере (по умолчанию /var/www/webapp)
- `SSH_KEY` — путь к SSH-ключу (по умолчанию ~/.ssh/shared_server_key)
- `PM2_APP` — имя приложения в PM2 (по умолчанию webapp)

Пример с другим путём:

```bash
DEPLOY_PATH=/home/user/webapp SSH_KEY=~/.ssh/shared_server_key ./scripts/deploy.sh
```

### Docker (опционально)

```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 📁 Структура проекта

```
src/
├── app/
│   ├── api/              # API routes (прокси к MaxGroot API)
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Главная страница
├── components/
│   ├── layout/           # Header, StepIndicator
│   ├── steps/            # Шаги приложения (Info, Plans, Payment, Success)
│   ├── plans/            # Компоненты планов
│   ├── subscriptions/    # Компоненты подписок
│   ├── setup/            # SetupWizard для настройки подключения
│   ├── instructions/     # Инструкции по подключению
│   └── ui/               # UI компоненты
├── hooks/                # Custom hooks
├── lib/                  # API клиент и утилиты
├── types/                # TypeScript типы
└── utils/                # Утилиты форматирования
```

## 🔐 Безопасность

- ✅ Все API запросы проходят через серверные routes (не напрямую с клиента)
- ✅ Telegram `initData` проверяется на сервере
- ✅ Секретные ключи хранятся только в `.env.local` (не коммитятся)
- ✅ Используются security headers

## 📚 API Endpoints

Все endpoints проксируются через Next.js API routes:

- `/api/user/[telegramId]` - данные пользователя
- `/api/user/[telegramId]/subscriptions` - подписки
- `/api/user/[telegramId]/balance` - баланс
- `/api/plans` - доступные тарифы
- `/api/subscription/buy` - покупка подписки
- `/api/topup/create` - создание платежа
- `/api/topup/[orderId]/status` - статус платежа

## 🛠️ Разработка

### Запуск в dev режиме

```bash
npm run dev
```

### Сборка для продакшена

```bash
npm run build
npm start
```

### Линтинг

```bash
npm run lint
```

## 📝 Лицензия

Private — не для публичного использования

## 🤝 Поддержка

Для вопросов и поддержки обращайтесь к команде MaxGroot.
