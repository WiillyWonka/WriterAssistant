# Writer Assistant

Веб-приложение для писателей: Markdown-редактор и чат с ассистентом (Claude). Текущий текст документа передаётся в контекст модели на каждый запрос.

## Структура

- `frontend/` — Next.js (React, CodeMirror, Vercel AI SDK `useChat` + text stream)
- `backend/` — FastAPI, Anthropic API

## Docker (одна команда)

Требуются [Docker](https://docs.docker.com/get-docker/) и Docker Compose v2.

```bash
cp .env.example .env
# Укажите ANTHROPIC_API_KEY в .env
# Для развёртывания на сервере измените SERVER_IP на IP или домен вашего сервера

docker compose up --build
```

- Приложение: [http://localhost:3000](http://localhost:3000) (или `http://${SERVER_IP}:3000`)
- API: [http://localhost:8000](http://localhost:8000) (например `/health`, `/api/chat`)
- Keycloak: [http://localhost:8080](http://localhost:8080)

Все URL формируются автоматически на основе переменной `SERVER_IP` из файла `.env`.
Для локальной разработки оставьте `SERVER_IP=localhost`.
Для развёртывания на удалённом сервере укажите его IP или домен:

```env
SERVER_IP=203.0.113.50
# или
SERVER_IP=example.com
```

После изменения `SERVER_IP` пересоберите контейнеры:

```bash
docker compose down
docker compose up --build -d
```

## Бэкенд

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Укажите ANTHROPIC_API_KEY в .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Проверка: [http://localhost:8000/health](http://localhost:8000/health)

## Фронтенд

Требуются Node.js 20+ и npm.

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000). Убедитесь, что бэкенд запущен на порту из `NEXT_PUBLIC_API_URL` (по умолчанию `http://localhost:8000`).

## Переменные окружения

| Файл | Переменные |
|------|------------|
| `.env` (корень, для Docker) | см. [.env.example](.env.example). **Основная переменная:** `SERVER_IP` — IP или домен сервера. Остальные URL формируются автоматически. |
| `backend/.env` | `ANTHROPIC_API_KEY`, опционально `ANTHROPIC_MODEL`, `CORS_ORIGINS` (автоматически из `SERVER_IP`) |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` (при запуске без Docker) |

### Развёртывание на удалённом сервере

1. Скопируйте `.env.example` в `.env`:
   ```bash
   cp .env.example .env
   ```

2. Отредактируйте `.env`, указав ваш IP или домен:
   ```env
   SERVER_IP=203.0.113.50
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. Запустите контейнеры:
   ```bash
   docker compose up --build -d
   ```

Все URL (`CORS_ORIGINS`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_KEYCLOAK_URL`) будут сформированы автоматически на основе `SERVER_IP`.
