# Интеграция Keycloak

## Настройка Docker Compose

Проект настроен для работы с Keycloak через Docker Compose. Для запуска всех сервисов:

```bash
docker-compose up --build
```

### Сервисы:

1. **Keycloak** - доступен на порту 8080
   - URL: http://localhost:8080
   - Логин администратора: `admin`
   - Пароль администратора: `admin`

2. **Backend** - API на порту 8000
3. **Frontend** - веб-интерфейс на порту 3000

## Настройка Keycloak

После запуска выполните следующие шаги в админ-панели Keycloak:

### 1. Создание Realm

1. Войдите в админ-панель Keycloak (http://localhost:8080)
2. Наведите курсор на название realm в левом верхнем углу (по умолчанию "master")
3. Выберите "Create Realm"
4. Введите имя: `writer-assistant`
5. Нажмите "Create"

### 2. Создание клиента для Backend

1. В созданном realm перейдите в раздел "Clients"
2. Нажмите "Create client"
3. Заполните:
   - Client type: `OpenID Connect`
   - Client ID: `writer-assistant-backend`
   - Name: `Writer Assistant Backend`
4. Нажмите "Next"
5. Настройте capabilities:
   - Client authentication: `ON`
   - Authorization: `OFF`
6. Нажмите "Next"
7. Настройке login settings:
   - Standard flow: `ON`
   - Direct access grants: `ON`
8. Нажмите "Save"
9. Перейдите во вкладку "Credentials":
   - Скопируйте Client Secret
   - Обновите переменную `KEYCLOAK_CLIENT_SECRET` в docker-compose.yml или .env файле

### 3. Создание клиента для Frontend

1. В разделе "Clients" нажмите "Create client"
2. Заполните:
   - Client type: `OpenID Connect`
   - Client ID: `writer-assistant-frontend`
   - Name: `Writer Assistant Frontend`
3. Нажмите "Next"
4. Настройке capabilities:
   - Client authentication: `OFF`
   - Authorization: `OFF`
5. Нажмите "Next"
6. Настройте login settings:
   - Standard flow: `ON`
   - Direct access grants: `OFF`
   - Valid redirect URIs: `http://localhost:3000/*`
   - Valid post logout redirect URIs: `http://localhost:3000/*`
   - Web origins: `http://localhost:3000`
7. Нажмите "Save"

### 4. Создание пользователя

1. Перейдите в раздел "Users"
2. Нажмите "Create new user"
3. Заполните:
   - Username: например, `testuser`
   - Email: например, `test@example.com`
   - First name и Last name (опционально)
4. Нажмите "Create"
5. Перейдите во вкладку "Credentials"
6. Нажмите "Set password"
7. Введите пароль и отключите "Temporary" если нужно
8. Нажмите "Save"

### 5. Назначение роли пользователю

1. В профиле пользователя перейдите во вкладку "Role mapping"
2. Нажмите "Assign role"
3. Выберите нужные роли или создайте новые

## Переменные окружения

### Backend (.env или docker-compose.yml):

```env
KEYCLOAK_SERVER_URL=http://keycloak:8080
KEYCLOAK_REALM=writer-assistant
KEYCLOAK_CLIENT_ID=writer-assistant-backend
KEYCLOAK_CLIENT_SECRET=<ваш-secret-из-keycloak>
```

### Frontend (.env.local или docker-compose.yml):

```env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=writer-assistant
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=writer-assistant-frontend
```

### Настройка для развёртывания на сервере

Все URL формируются автоматически из переменной `SERVER_IP` в файле `.env` в корне проекта:

```env
SERVER_IP=203.0.113.50
# или домен
SERVER_IP=example.com
```

После установки `SERVER_IP` следующие переменные будут сформированы автоматически:
- `CORS_ORIGINS=http://${SERVER_IP}:3000`
- `NEXT_PUBLIC_API_URL=http://${SERVER_IP}:8000`
- `NEXT_PUBLIC_KEYCLOAK_URL=http://${SERVER_IP}:8080`

**Важно:** После изменения `SERVER_IP` необходимо пересобрать контейнеры:

```bash
docker compose down
docker compose up --build -d
```

### Настройка Keycloak для удалённого доступа

При настройке клиентов в Keycloak укажите актуальные URL с вашим IP/доменом:

**Frontend клиент:**
- Valid redirect URIs: `http://${SERVER_IP}:3000/*`
- Valid post logout redirect URIs: `http://${SERVER_IP}:3000/*`
- Web origins: `http://${SERVER_IP}:3000`

Замените `${SERVER_IP}` на ваш фактический IP или домен.

## Как это работает

### Backend защита:

- Все запросы к `/api/chat` требуют valid JWT токен
- Токен проверяется через Keycloak Token Introspection API
- Неавторизованные пользователи получают ошибку 401 Unauthorized

### Frontend аутентификация:

- При загрузке приложения проверяется сессия Keycloak
- Если пользователь не авторизован, показывается страница входа
- После успешного входа токен автоматически добавляется ко всем API запросам
- Реализовано автоматическое обновление токена при истечении срока действия
- Кнопка выхода выполняет logout в Keycloak

## Проверка работы

1. Откройте http://localhost:3000
2. Если не авторизованы - увидите кнопку "Войти через Keycloak"
3. Нажмите кнопку и войдите под созданным пользователем
4. После успешного входа получите доступ к приложению
5. Попробуйте использовать чат - запросы будут отправляться с токеном
6. Нажмите "Выйти" для завершения сессии
