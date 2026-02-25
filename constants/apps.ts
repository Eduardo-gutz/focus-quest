/**
 * Apps predefinidas para el onboarding y selección de monitoreo.
 * packageName se usa en Android para tracking automático vía UsageStats.
 */
export interface PredefinedApp {
  id: string;
  name: string;
  packageName: string | null;
  iconEmoji: string;
}

export const PREDEFINED_APPS: PredefinedApp[] = [
  { id: 'tiktok', name: 'TikTok', packageName: 'com.zhiliaoapp.musically', iconEmoji: '🎵' },
  { id: 'instagram', name: 'Instagram', packageName: 'com.instagram.android', iconEmoji: '📷' },
  { id: 'youtube', name: 'YouTube', packageName: 'com.google.android.youtube', iconEmoji: '▶️' },
  { id: 'x', name: 'X', packageName: 'com.twitter.android', iconEmoji: '𝕏' },
  { id: 'whatsapp', name: 'WhatsApp', packageName: 'com.whatsapp', iconEmoji: '💬' },
  { id: 'facebook', name: 'Facebook', packageName: 'com.facebook.katana', iconEmoji: '👤' },
  { id: 'netflix', name: 'Netflix', packageName: 'com.netflix.mediaclient', iconEmoji: '🎬' },
  { id: 'spotify', name: 'Spotify', packageName: 'com.spotify.music', iconEmoji: '🎧' },
];

export const OTHER_APP_ID = 'other';

/** Opción especial "Otra app" — sin packageName, nombre editable por el usuario */
export const OTHER_APP_OPTION: PredefinedApp = {
  id: OTHER_APP_ID,
  name: 'Otra app',
  packageName: null,
  iconEmoji: '📱',
};

export const ONBOARDING_GOAL_MIN = 15;
export const ONBOARDING_GOAL_MAX = 120;
export const ONBOARDING_GOAL_DEFAULT = 30;
