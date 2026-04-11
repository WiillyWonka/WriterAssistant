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

docker compose up --build
```

- Приложение: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:8000](http://localhost:8000) (например `/health`, `/api/chat`)

`NEXT_PUBLIC_API_URL` в `.env` должен указывать на тот адрес, с которого **браузер** достучится до API. При стандартных портах оставьте `http://localhost:8000`. Если меняете проброс портов в `docker-compose.yml`, пересоберите фронт с нужным значением (оно подставляется на этапе **сборки** образа).

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
| `.env` (корень, для Docker) | см. [.env.example](.env.example) |
| `backend/.env` | `ANTHROPIC_API_KEY`, опционально `ANTHROPIC_MODEL`, `CORS_ORIGINS` |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` |
