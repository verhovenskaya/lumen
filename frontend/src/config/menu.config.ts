export interface MenuItemConfig {
  key: string;
  label: string;
  icon: string;
  top: string;
}

export const MENU_ITEMS: MenuItemConfig[] = [
  { key: 'Missions', label: 'МИССИИ', icon: 'goalIcon', top: '15%' },
  { key: 'Spacecraft', label: 'КОСМИЧЕСКИЕ АППАРАТЫ', icon: 'satelliteIcon', top: '27%' },
  { key: 'Satellites', label: 'СПУТНИКИ', icon: 'planetMenuIcon', top: '39%' },
  { key: 'Chat', label: 'ЧАТ', icon: 'chatIcon', top: '51%' },
  { key: 'Settings', label: 'НАСТРОЙКИ', icon: 'settingsIcon', top: '63%' },
];