/**
 * Constantes del sistema de gamificación según .context/gamification.md
 */

/** XP por registrar uso de una app (manual o automático) */
export const XP_REGISTER_USAGE = 10;

/** XP por cumplir meta diaria de una app */
export const XP_GOAL_MET = 25;

/** XP bonus por cumplir TODAS las metas del día */
export const XP_PERFECT_DAY = 50;

/** XP base por día de racha (multiplicador: +10 x streak_day, día 7 = +70 XP) */
export const XP_STREAK_PER_DAY = 10;

/** XP por desbloquear un logro nuevo */
export const XP_ACHIEVEMENT_UNLOCK = 100;

/** XP por primer registro del día (incentivo diario) */
export const XP_FIRST_LOG_OF_DAY = 5;

/** XP por reducir uso vs. ayer */
export const XP_REDUCTION_VS_YESTERDAY = 15;

/** Fórmula: XP_needed = 100 x level^1.5 (redondeado) */
export const xpNeededForLevel = (level: number): number =>
  Math.round(100 * Math.pow(level, 1.5));

/** Títulos de nivel según gamification.md */
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Novato Digital',
  2: 'Aprendiz',
  3: 'Consciente',
  5: 'Disciplinado',
  10: 'Maestro del Tiempo',
  15: 'Sabio Digital',
  20: 'Iluminado',
  25: 'Leyenda',
};

export const getLevelTitle = (level: number): string => {
  if (level <= 0)
    return LEVEL_TITLES[1] ?? 'Novato Digital';

  const exact = LEVEL_TITLES[level];
  if (exact)
    return exact;

  const keys = Object.keys(LEVEL_TITLES)
    .map(Number)
    .filter((k) => k <= level)
    .sort((a, b) => b - a);
  const nearest = keys[0];
  return nearest ? (LEVEL_TITLES[nearest] ?? 'Novato Digital') : 'Novato Digital';
};

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  hint: string;
  emoji: string;
}

/** Catálogo de logros MVP (15 mínimo) según gamification.md */
export const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  { id: 'first_log', name: 'Primer Paso', description: 'Registra tu primer uso', hint: 'Registra tu primer uso', emoji: '🎯' },
  { id: 'streak_3', name: 'En Racha', description: '3 días seguidos cumpliendo metas', hint: '3 días seguidos cumpliendo metas', emoji: '🔥' },
  { id: 'streak_7', name: 'Semana Perfecta', description: '7 días seguidos', hint: '7 días seguidos cumpliendo metas', emoji: '⭐' },
  { id: 'streak_14', name: 'Quincena de Oro', description: '14 días seguidos', hint: '14 días seguidos cumpliendo metas', emoji: '🏅' },
  { id: 'streak_30', name: 'Mes Imparable', description: '30 días seguidos', hint: '30 días seguidos cumpliendo metas', emoji: '👑' },
  { id: 'level_5', name: 'Nivel 5', description: 'Alcanza el nivel 5', hint: 'Alcanza el nivel 5', emoji: '📗' },
  { id: 'level_10', name: 'Nivel 10', description: 'Alcanza el nivel 10', hint: 'Alcanza el nivel 10', emoji: '📘' },
  { id: 'apps_3', name: 'Triple Monitor', description: 'Monitorea 3 apps simultáneamente', hint: 'Monitorea 3 apps simultáneamente', emoji: '📱' },
  { id: 'apps_5', name: 'Cinco Estrellas', description: 'Monitorea 5 apps', hint: 'Monitorea 5 apps simultáneamente', emoji: '🌟' },
  { id: 'perfect_week', name: 'Semana Sin Excesos', description: '7 días con todas las metas cumplidas', hint: '7 días con todas las metas cumplidas', emoji: '💎' },
  { id: 'xp_1000', name: 'Primer Millar', description: 'Acumula 1,000 XP', hint: 'Acumula 1,000 XP', emoji: '💫' },
  { id: 'xp_5000', name: 'Cinco Mil', description: 'Acumula 5,000 XP', hint: 'Acumula 5,000 XP', emoji: '✨' },
  { id: 'reduction_50', name: 'Mitad y Mitad', description: 'Reduce uso al 50% de tu meta', hint: 'Reduce uso al 50% de tu meta en un día', emoji: '📉' },
  { id: 'zero_day', name: 'Día Zen', description: '0 minutos en una app monitoreada', hint: '0 minutos en una app monitoreada en un día', emoji: '🧘' },
  { id: 'comeback', name: 'Regreso Triunfal', description: 'Vuelve después de perder racha', hint: 'Vuelve a cumplir metas después de perder racha', emoji: '💪' },
  { id: 'auto_tracker', name: 'Piloto Automático', description: 'Activa el tracking automático de uso', hint: 'Concede permiso de acceso a estadísticas de uso', emoji: '📡' },
];

export const ACHIEVEMENT_IDS = ACHIEVEMENT_CATALOG.map((a) => a.id);

export const TOTAL_ACHIEVEMENTS = ACHIEVEMENT_CATALOG.length;

/** Logros que se desbloquean al alcanzar un nivel específico (ej: level_5 al nivel 5) */
export const getAchievementsUnlockedAtLevel = (level: number): AchievementDefinition[] =>
  ACHIEVEMENT_CATALOG.filter((a) => {
    const match = /^level_(\d+)$/.exec(a.id);
    if (!match)
      return false;
    const requiredLevel = Number.parseInt(match[1], 10);
    return level === requiredLevel;
  });
