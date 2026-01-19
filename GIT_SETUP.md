# Инструкция по добавлению проекта в GitHub

## Шаги для добавления в репозиторий https://github.com/Grangy/webtg

### 1. Инициализация Git (если еще не инициализирован)

```bash
cd /Users/maksim/thapp
git init
```

### 2. Добавление remote репозитория

```bash
git remote add origin https://github.com/Grangy/webtg.git
```

Или если репозиторий уже существует:

```bash
git remote set-url origin https://github.com/Grangy/webtg.git
```

### 3. Проверка текущего статуса

```bash
git status
```

### 4. Добавление всех файлов

```bash
# Добавить все файлы кроме тех, что в .gitignore
git add .

# Проверить что будет добавлено
git status
```

### 5. Создание первого коммита

```bash
git commit -m "Initial commit: MaxGroot VPN Telegram Mini App

- Полная интеграция с MaxGroot VPN API
- Выбор тарифов и оплата (СБП и баланс)
- Управление подписками и продление
- Поэтапная инструкция по подключению
- Поддержка всех устройств (iOS, macOS, Android, Android TV, Windows)
- Готово к деплою на web.grangy.ru"
```

### 6. Переименование ветки в main (если нужно)

```bash
git branch -M main
```

### 7. Push в репозиторий

**Если репозиторий пустой (первый push):**

```bash
git push -u origin main
```

**Если репозиторий уже содержит файлы:**

```bash
git pull origin main --allow-unrelated-histories
# Разрешите конфликты если они есть
git push -u origin main
```

### 8. Проверка

Откройте https://github.com/Grangy/webtg и убедитесь, что все файлы загружены.

## Важно!

✅ **НЕ коммитьте:**
- `.env.local` (содержит секретные ключи)
- `node_modules/`
- `.next/`
- `api.md` (содержит секреты)

✅ **Коммитьте:**
- `.env.example` (шаблон без секретов)
- Весь исходный код
- `README.md`, `DEPLOY.md`
- Конфигурационные файлы

## Дальнейшая работа

После первого коммита:

```bash
# Создать новую ветку для изменений
git checkout -b feature/your-feature-name

# Внести изменения
# ...

# Закоммитить
git add .
git commit -m "Описание изменений"

# Отправить в репозиторий
git push origin feature/your-feature-name

# Создать Pull Request на GitHub
```
