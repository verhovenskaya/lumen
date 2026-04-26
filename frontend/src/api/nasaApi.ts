const BASE_URL = '/nasa-api';
const IMAGE_API = 'https://images-api.nasa.gov';

export interface NasaVehicle {
  vehicle: string;
}

export interface NasaVehicleDetail {
  id: string;
  identifier: string;
  identifierLowercase: string;
  files: Array<{
    id: string;
    fullPath: string;
    description: string;
    fileSize: number;
  }>;
  parents?: {
    mission?: Array<{ mission: string }>;
  };
}

export const getVehicles = async (): Promise<NasaVehicle[]> => {
  try {
    const res = await fetch(`${BASE_URL}/vehicles`);
    if (!res.ok) throw new Error(`Ошибка ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.warn('NASA API недоступно:', error);
    return [];
  }
};

export const searchImage = async (query: string): Promise<string | null> => {
  try {
    const searchQuery = `${query} spacecraft NASA`;
    const res = await fetch(`${IMAGE_API}/search?q=${encodeURIComponent(searchQuery)}&media_type=image&page_size=1`);
    if (!res.ok) return null;
    const json = await res.json();
    const items = json.collection?.items;
    if (items && items.length > 0) {
      return items[0].links?.[0]?.href || null;
    }
    return null;
  } catch {
    return null;
  }
};

export const getVehicleDetail = async (urlOrId: string): Promise<NasaVehicleDetail | null> => {
  try {
    const id = urlOrId.includes('/vehicle/') 
      ? urlOrId.split('/vehicle/').pop()?.replace(/%20/g, ' ') 
      : urlOrId;
    
    const res = await fetch(`${BASE_URL}/vehicle/${encodeURIComponent(id || '')}`);
    if (!res.ok) throw new Error(`Ошибка ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn(`Не удалось загрузить аппарат:`, error);
    return null;
  }
};