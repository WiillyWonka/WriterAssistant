# Writer Assistant

Веб-приложение для писателей: Markdown-редактор и чат с ассистентом (Claude / OpenAI). Текущий текст документа передаётся в контекст модели на каждый запрос. Вход через **Keycloak** (OIDC), документ и история чата сохраняются в **Postgres** на пользователя.

## Структура

- `frontend/` — Next.js (Auth.js / `next-auth`, Vercel AI SDK `useChat` + text stream)
- `backend/` — FastAPI, проверка JWT Keycloak, SQLAlchemy async + Alembic
- `infra/` — импорт реалма Keycloak, init SQL для второй БД

## Docker (одна команда)

Требуются [Docker](https://docs.docker.com/get-docker/) и Docker Compose v2.

```bash
cp .env.example .env
# Укажите ANTHROPIC_API_KEY и/или OPENAI_API_KEY в .env

docker compose up --build
```

- Приложение: [http://localhost:3000](http://localhost:3000) (редирект на вход Keycloak)
- API: [http://localhost:8000](http://localhost:8000) (`/health`, защищённые `/api/...`)
- Keycloak: [http://localhost:8080](http://localhost:8080) (админ: `admin` / `admin`, см. `docker-compose.yml`)
- Postgres: `localhost:5432` (логин/пароль `postgres` / `postgres`, БД `writer_assistant` и `keycloak`)

`NEXT_PUBLIC_API_URL` в `.env` должен указывать на тот адрес, с которого **браузер** достучится до API. При стандартных портах оставьте `http://localhost:8000`. Публичные переменные фронта (`NEXT_PUBLIC_*`) подставляются на этапе **сборки** образа.

### Авторизация (тестовый пользователь)

После первого запуска Keycloak импортирует реалм `writer-assistant` из `infra/keycloak/realm-writer-assistant.json`.

| Поле | Значение |
|------|----------|
| Логин | `writer` |
| Пароль | `writer123` |

Клиент веб-приложения: `writer-assistant-web` (секрет по умолчанию совпадает с `KEYCLOAK_CLIENT_SECRET` в `.env.example`). Audience для API: `writer-assistant-api`.

## Бэкенд (локально)

Нужны Postgres и Keycloak (или значения `KEYCLOAK_*` / `DATABASE_URL` на ваш стенд).

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Укажите ключи LLM и при необходимости DATABASE_URL, KEYCLOAK_*
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Проверка: [http://localhost:8000/health](http://localhost:8000/health)

## Фронтенд (локально)

Требуются Node.js 20+ и npm.

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000). Убедитесь, что бэкенд доступен по `NEXT_PUBLIC_API_URL`, Keycloak — по `NEXT_PUBLIC_KEYCLOAK_URL`, а для серверных запросов Next.js заданы `KEYCLOAK_INTERNAL_URL`, `KEYCLOAK_ISSUER`, `KEYCLOAK_CLIENT_*`, `AUTH_SECRET`, `AUTH_URL`.

## Переменные окружения

| Файл | Переменные |
|------|------------|
| `.env` (корень, для Docker) | см. [.env.example](.env.example) |
| `backend/.env` | ключи LLM, `DATABASE_URL`, `KEYCLOAK_ISSUER`, `KEYCLOAK_JWKS_URL`, `KEYCLOAK_AUDIENCE`, `CORS_ORIGINS` |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_KEYCLOAK_URL`, `KEYCLOAK_*`, `AUTH_SECRET`, `AUTH_URL` |
