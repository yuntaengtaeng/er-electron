export const TIER_COLORS: Record<string, string> = {
  Unrank: '#6b7280',
  Iron: '#9ca3af',
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  Platinum: '#4dd0e1',
  Diamond: '#60a5fa',
  Meteorite: '#a78bfa',
  Mithril: '#67e8f9',
  Demigod: '#fb923c',
  Eternity: '#f43f5e',
}

export function getTierColor(tierKey: string | undefined): string {
  return TIER_COLORS[tierKey ?? 'Unrank'] ?? '#6b7280'
}
