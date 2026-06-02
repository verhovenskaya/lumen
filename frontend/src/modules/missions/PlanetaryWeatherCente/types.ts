export type PlanetId = 'mars' | 'neptune' | 'venus' | 'jupiter' | 'saturn';

export interface PlanetData {
  id: PlanetId;
  name: string;
  nameEn: string;
  color: string;
  textureUrl: string;
  normalMapUrl?: string;
  specularMapUrl?: string;
  cloudTextureUrl?: string;
  size: number;
  rotationSpeed: number;
  orbitSpeed: number;
}

export interface AtmosphereData {
  temperature: string;
  pressure: string;
  windSpeed: string;
  visibility: string;
  composition: string;
  source: string;
}

export interface WeatherEvent {
  id: string;
  title: string;
  description: string;
  atmosphereData: AtmosphereData;
}

export interface PlanetaryWeatherCenterProps {
  onClose: () => void;
}