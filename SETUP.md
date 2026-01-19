# Пошаговая инструкция по запуску

## Шаг 1: Установка зависимостей

```bash
cd /Users/maksim/thapp
npm install
```

## Шаг 2: Создание бота

1. Откройте Telegram
2. Найдите @BotFather
3. Отправьте `/newbot`
4. Введите имя бота (например: "My Test App")
5. Введите username бота (например: `my_test_app_bot`)
6. Скопируйте токен

## Шаг 3: Добавьте токен

Откройте файл `.env.local` и замените:

```
BOT_TOKEN=your_bot_token_here
```

на ваш токен:

```
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

## Шаг 4: Запустите ngrok

В **отдельном терминале**:

```bash
ngrok http 3000
```

Вы увидите что-то вроде:

```
Forwarding    https://a1b2c3d4.ngrok-free.app -> http://localhost:3000
```

Скопируйте HTTPS URL.

## Шаг 5: Настройте кнопку меню в боте

### Вариант A: Через BotFather (рекомендуется)

1. Откройте @BotFather
2. Отправьте `/mybots`
3. Выберите вашего бота
4. Нажмите "Bot Settings"
5. Нажмите "Menu Button"
6. Нажмите "Configure menu button"
7. Отправьте ваш ngrok URL (например: `https://a1b2c3d4.ngrok-free.app`)
8. Отправьте название кнопки (например: "Открыть")

### Вариант B: Через API (для продвинутых)

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "Открыть",
      "web_app": {
        "url": "https://a1b2c3d4.ngrok-free.app"
      }
    }
  }'
```

## Шаг 6: Запустите приложение

```bash
npm run dev
```

## Шаг 7: Тестируйте!

1. Откройте вашего бота в Telegram
2. Нажмите кнопку меню (слева от поля ввода)
3. Mini App откроется и покажет ваши данные

---

## Частые проблемы

### "Откройте в Telegram"

Приложение открыто в браузере, а не в Telegram. Откройте его через бота.

### "BOT_TOKEN not configured"

Вы не добавили токен в `.env.local` или не перезапустили сервер после изменения.

### ngrok URL не работает

- Проверьте, что ngrok запущен
- Проверьте, что Next.js запущен на порту 3000
- При перезапуске ngrok URL меняется — обновите его в BotFather

### Кнопка меню не появляется

- Закройте и откройте чат с ботом заново
- Убедитесь, что URL начинается с `https://`
