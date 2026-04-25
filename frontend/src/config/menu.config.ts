export interface MenuItemConfig {
  key: string;
  label: string;
  icon: string;
  top: string;
}

export const MENU_ITEMS: MenuItemConfig[] = [
  { key: 'Missions', label: 'МИССИИ', icon: '🎯', top: '15%' },
  { key: 'Spacecraft', label: 'КОСМИЧЕСКИЕ АППАРАТЫ', icon: '🚀', top: '27%' },
  { key: 'Satellites', label: 'СПУТНИКИ', icon: '🛰️', top: '39%' },
  { key: 'Chat', label: 'ЧАТ', icon: '💬', top: '51%' },
  { key: 'Settings', label: 'НАСТРОЙКИ', icon: '⚙️', top: '63%' },
];