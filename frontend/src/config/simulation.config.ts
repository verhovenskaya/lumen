export interface SimulationPlanet {
  id: string;
  name: string;
  label: string;
  texturePath: string;
  scale: number;
  hasRings?: boolean;
  ringTexturePath?: string;
  orbitRadius?: number;
  orbitSpeed?: number;
  orbitColor?: string;
  color?: string;
  isMoon?: boolean;
  parentPlanet?: string;
  isDwarf?: boolean;        
  isAsteroidBelt?: boolean;  
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  ringColor?: string;
  ringOpacity?: number;
  ringRotation?: [number, number, number];
}

export const SIMULATION_PLANETS: SimulationPlanet[] = [
  {
    id: 'sun',
    name: 'Sun',
    label: 'солнце',
    texturePath: '/assets/textures/8k_sun.jpg',
    scale: 0.8,
    color: '#FDB813',
    orbitRadius: 0,
    orbitSpeed: 0,
  },
  {
    id: 'mercury',
    name: 'Mercury',
    label: 'меркурий',
    texturePath: '/assets/textures/8k_mercury.jpg',
    scale: 0.2,
    color: '#8C8C8C',
    orbitRadius: 3.5,
    orbitSpeed: 0.08,       
    orbitColor: '#8C8C8C',
  },
  {
    id: 'venus',
    name: 'Venus',
    label: 'венера',
    texturePath: '/assets/textures/4k_venus.jpg',
    scale: 0.25,
    color: '#E6B800',
    orbitRadius: 5.0,
    orbitSpeed: 0.06,      
    orbitColor: '#E6B800',
  },
  {
    id: 'earth',
    name: 'Earth',
    label: 'земля',
    texturePath: '/assets/textures/8k_earth_daymap.jpg',
    scale: 0.28,
    color: '#2271B3',
    orbitRadius: 6.5,
    orbitSpeed: 0.05,       
    orbitColor: '#2271B3',
  },
  {
    id: 'moon',
    name: 'Moon',
    label: 'луна',
    texturePath: '/assets/textures/8k_moon.jpg',
    scale: 0.12,
    color: '#CCCCCC',
    isMoon: true,
    parentPlanet: 'earth',
    orbitRadius: 1.2,
    orbitSpeed: 0.15,       
    orbitColor: '#CCCCCC',
  },
  {
    id: 'mars',
    name: 'Mars',
    label: 'марс',
    texturePath: '/assets/textures/8k_mars.jpg',
    scale: 0.22,
    color: '#C1440E',
    orbitRadius: 8.0,
    orbitSpeed: 0.04,    
    orbitColor: '#C1440E',
  },
  {
    id: 'asteroid_belt',
    name: 'Asteroid Belt',
    label: 'пояс астероидов',
    texturePath: '',
    scale: 0,
    color: '#8B7355',
    orbitRadius: 9.2,
    orbitSpeed: 0,
    orbitColor: '#8B7355',
    isAsteroidBelt: true,
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    label: 'юпитер',
    texturePath: '/assets/textures/8k_jupiter.jpg',
    scale: 0.45,
    color: '#D8A27A',
    hasRings: true,
    ringInnerRadius: 0.52,
    ringOuterRadius: 0.70,
    ringColor: '#8B7355',
    ringOpacity: 0.15,
    ringRotation: [0.1, 0, 0.1],
    orbitRadius: 10.5,
    orbitSpeed: 0.025,     
    orbitColor: '#D8A27A',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    label: 'сатурн',
    texturePath: '/assets/textures/8k_saturn.jpg',
    hasRings: true,
    ringTexturePath: '/assets/textures/8k_saturn_ring_alpha.png',
    scale: 0.4,
    color: '#E0BB87',
    orbitRadius: 13.0,
    orbitSpeed: 0.018,     
    orbitColor: '#E0BB87',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    label: 'уран',
    texturePath: '/assets/textures/2k_uranus.jpg',
    scale: 0.32,
    color: '#4FD0E7',
    hasRings: true,
    ringInnerRadius: 0.48,
    ringOuterRadius: 0.65,
    ringColor: '#6A7A8A',
    ringOpacity: 0.3,
    ringRotation: [Math.PI / 2, 0, 0.3],
    orbitRadius: 15.5,
    orbitSpeed: 0.012,     
    orbitColor: '#4FD0E7',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    label: 'нептун',
    texturePath: '/assets/textures/2k_neptune.jpg',
    scale: 0.3,
    color: '#4169E1',
    hasRings: true,
    ringInnerRadius: 0.45,
    ringOuterRadius: 0.60,
    ringColor: '#5A6A8A',
    ringOpacity: 0.2,
    ringRotation: [0.15, 0, 0.15],
    orbitRadius: 18.0,
    orbitSpeed: 0.008,     
    orbitColor: '#4169E1',
  },
  {
    id: 'pluto',
    name: 'Pluto',
    label: 'плутон',
    texturePath: '/assets/textures/Pluto.jpg',
    scale: 0.08,
    color: '#D4C5A9',
    isDwarf: true,
    orbitRadius: 21.0,
    orbitSpeed: 0.005,      
    orbitColor: '#D4C5A9',
  },
];