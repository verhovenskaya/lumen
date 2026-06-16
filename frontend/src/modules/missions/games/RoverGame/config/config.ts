export const MAP_SIZE = 70;

export const NOVEL_SCENES = [
  {
    text: 'Марс — четвёртая планета Солнечной системы. Диаметр: 6 779 км. Атмосфера на 95% состоит из углекислого газа. Средняя температура поверхности: −63°C. Гравитация составляет 38% земной.',
    bgClass: 'novelScene1',
  },
  {
    text: 'Поверхность Марса покрыта ударными кратерами, вулканическими плато и системами каньонов. Здесь находится крупнейший вулкан в Солнечной системе — гора Олимп высотой 21,9 км.',
    bgClass: 'novelScene2',
  },
  {
    text: 'С 2021 года на Марсе работает ровер Perseverance. Он собирает образцы грунта и ищет признаки древней микробной жизни. Ваша миссия — симуляция работы оператора марсианского ровера.',
    bgClass: 'novelScene3',
  },
];

export const generateCraters = () =>
  Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * MAP_SIZE * 0.8,
    z: (Math.random() - 0.5) * MAP_SIZE * 0.8,
    collected: false,
  }));

export interface Crater {
  id: number;
  x: number;
  z: number;
  collected: boolean;
}

export type Screen = 'novel1' | 'novel2' | 'novel3' | 'briefing' | 'game';