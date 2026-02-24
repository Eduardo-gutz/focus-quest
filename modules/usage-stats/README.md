# usage-stats

Módulo nativo Expo que expone Android UsageStatsManager a JavaScript para detectar automáticamente el tiempo de uso por app.

## Requisitos

- Android 10+ (API 29+)
- `npx expo prebuild` antes de compilar

## Uso

```ts
import {
  getUsageStats,
  hasUsageStatsPermission,
  requestUsageStatsPermission,
} from 'usage-stats';

// Verificar si el usuario concedió el permiso
const hasPermission = hasUsageStatsPermission();

// Abrir Settings > Usage Access para que el usuario conceda el permiso
requestUsageStatsPermission();

// Obtener estadísticas de uso (startTime y endTime en ms, Unix timestamp)
const startOfDay = new Date().setHours(0, 0, 0, 0);
const now = Date.now();
const stats = getUsageStats(startOfDay, now);
// stats = [{ packageName: 'com.example.app', totalTimeInForeground: 3600000 }, ...]
```

## API

- `getUsageStats(startTime: number, endTime: number): UsageStatsEntry[]` - Retorna uso por packageName
- `hasUsageStatsPermission(): boolean` - Verifica si el permiso está concedido
- `requestUsageStatsPermission(): void` - Abre la pantalla de configuración

## Verificación contra Digital Wellbeing

Compara los resultados con Settings > Digital Wellbeing (Bienestar digital) para validar precisión.
