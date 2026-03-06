/**
 * Devuelve la fecha de hoy en la zona horaria LOCAL del dispositivo (YYYY-MM-DD).
 * Usa siempre esta función para obtener "el día de hoy" como clave de negocio,
 * en lugar de `new Date().toISOString().slice(0, 10)` que devuelve el día en UTC
 * y puede diferir del día local cerca de medianoche.
 */
export function getLocalIsoDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Dado un ISO date string (YYYY-MM-DD), devuelve el timestamp en ms
 * del inicio del día (00:00:00.000) en zona horaria LOCAL.
 */
export function getStartOfLocalDayMs(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0).getTime();
}

/**
 * Devuelve el ISO date string del día anterior (YYYY-MM-DD) en hora LOCAL.
 * Suma T12:00:00 para evitar ambigüedades DST al restar un día.
 */
export function getPreviousLocalIsoDate(isoDate: string): string {
  const prev = new Date(`${isoDate}T12:00:00`);
  prev.setDate(prev.getDate() - 1);
  return getLocalIsoDate(prev);
}

/**
 * Calcula cuántos días han transcurrido entre dos ISO dates (YYYY-MM-DD).
 * Ambas fechas se anclan a mediodía para evitar errores DST.
 */
export function daysBetweenLocalDates(dateA: string, dateB: string): number {
  const a = new Date(`${dateA}T12:00:00`).getTime();
  const b = new Date(`${dateB}T12:00:00`).getTime();
  return Math.floor((b - a) / (24 * 60 * 60 * 1000));
}

/**
 * Calcula el timestamp (ms) en que empieza el próximo día local (siguiente medianoche local).
 */
export function getMsUntilNextLocalMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
}
