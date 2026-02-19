# Modelo de Datos (SQLite)

## 5.1 Tabla: monitored_apps

| Campo              | Tipo                               | Descripcion                              |
| ------------------ | ---------------------------------- | ---------------------------------------- |
| id                 | INTEGER PK AUTOINCREMENT           | ID unico                                 |
| name               | TEXT NOT NULL                      | Nombre visible (ej: TikTok)              |
| package_name       | TEXT                               | Package Android. Null en iOS             |
| icon_emoji         | TEXT                               | Emoji representativo elegido por usuario |
| daily_goal_minutes | INTEGER                            | NOT NULL Meta diaria maxima en minutos   |
| is_active          | BOOLEAN DEFAULT 1                  | Si esta activamente monitoreada          |
| created_at         | DATETIME DEFAULT CURRENT_TIMESTAMP | Fecha de creacion                        |

## 5.2 Tabla: usage_logs

| Campo        | Tipo                                 | Descripcion                         |
| ------------ | ------------------------------------ | ----------------------------------- |
| id           | INTEGER                              | PK AUTOINCREMENT ID unico           |
| app_id       | INTEGER FK -> monitored_apps.id      | App asociada                        |
| date         | DATE NOT NULL                        | Fecha del registro (YYYY-MM-DD)     |
| minutes_used | INTEGER NOT NULL                     | Minutos usados ese dia              |
| source       | TEXT CHECK(source IN (manual, auto)) | manual = usuario, auto = UsageStats |
| goal_met     | BOOLEAN                              | Si cumplio la meta                  |
| created_at   | DATETIME DEFAULT CURRENT_TIMESTAMP   | Timestamp del registro              |

## 5.3 Tabla: user_stats

| Campo              | Tipo                   | Descripcion                                  |
| ------------------ | ---------------------- | -------------------------------------------- |
| id                 | INTEGER PK (siempre 1) | Singleton - un solo registro                 |
| current_xp         | INTEGER DEFAULT 0      | XP total acumulado                           |
| current_level      | INTEGER DEFAULT 1      | Nivel actual                                 |
| current_streak     | INTEGER DEFAULT 0      | Dias consecutivos cumpliendo todas las metas |
| longest_streak     | INTEGER DEFAULT 0      | Racha mas larga historica                    |
| total_days_tracked | INTEGER DEFAULT 0      | Total de dias con al menos un registro       |
| total_goals_met    | INTEGER DEFAULT 0      | Total de metas diarias cumplidas             |
| last_active_date   | DATE                   | Ultimo dia con actividad registrada          |

## 5.4 Tabla: achievements

| Campo       | Tipo              | Descripcion                       |
| ----------- | ----------------- | --------------------------------- |
| id          | TEXT PK           | ID unico del logro (ej: streak_7) |
| unlocked    | BOOLEAN DEFAULT 0 | Si ya fue desbloqueado            |
| unlocked_at | DATETIME          | Fecha de desbloqueo               |

## 5.5 Tabla: daily_summary

| Campo              | Tipo    | Descripcion                              |
| ------------------ | ------- | ---------------------------------------- |
| date               | DATE PK | Fecha (YYYY-MM-DD)                       |
| total_minutes_used | INTEGER | Suma de minutos en todas las apps        |
| total_minutes_goal | INTEGER | Suma de metas de todas las apps activas  |
| all_goals_met      | BOOLEAN | Si TODAS las metas se cumplieron ese dia |
| xp_earned          | INTEGER | XP ganado ese dia                        |
| streak_day         | INTEGER | Numero de racha en ese dia               |
