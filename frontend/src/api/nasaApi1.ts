const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'; 
const NASA_BASE_URL = 'https://api.nasa.gov';

export interface NasaImage {
  id: string;
  title: string;
  description: string;
  url: string;
  hdUrl?: string;
  date: string;
  mediaType: 'image' | 'video';
}

export interface PlanetImages {
  featured: NasaImage;
  gallery: NasaImage[];
}

const PLANET_SEARCH_TERMS: Record<string, string[]> = {
  sun: ['sun', 'solar dynamics'],
  mercury: ['mercury planet'],
  venus: ['venus planet'],
  earth: ['earth from space'],
  mars: ['mars planet'],
  jupiter: ['jupiter planet'],
  saturn: ['saturn planet'],
  uranus: ['uranus planet'],
  neptune: ['neptune planet'],
  pluto: ['pluto planet'],
  moon: ['moon surface'],
};

// Кэш для изображений
const imageCache = new Map<string, NasaImage[]>();
const pendingRequests = new Map<string, Promise<NasaImage[]>>();

//заглушка
const BLACK_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%231a1a2e'/%3E%3C/svg%3E";

const LOCAL_PLACEHOLDERS: Record<string, string> = {
  sun: '/assets/textures/8k_sun.jpg',
  mars: '/assets/textures/8k_mars.jpg',
  jupiter: '/assets/textures/8k_jupiter.jpg',
  default: BLACK_PLACEHOLDER,
};

export const nasaApi = {
  async searchImages(query: string, limit: number = 5): Promise<NasaImage[]> {
    const cacheKey = `${query}-${limit}`;
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey)!;
    }

    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(
          `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=${limit}`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('Failed to fetch NASA images');
        
        const data = await response.json();
        const items = data.collection?.items || [];
        
        const images = items.slice(0, limit).map((item: any) => {
          const dataItem = item.data[0];
          const links = item.links || [];
          const imageLink = links.find((l: any) => l.rel === 'preview');
          
          return {
            id: dataItem.nasa_id || dataItem.title || crypto.randomUUID(),
            title: dataItem.title || query,
            description: (dataItem.description || dataItem.title || '').slice(0, 200),
            url: imageLink?.href || BLACK_PLACEHOLDER,
            hdUrl: imageLink?.href,
            date: dataItem.date_created || new Date().toISOString(),
            mediaType: 'image' as const,
          };
        });
        
        imageCache.set(cacheKey, images);
        return images;
      } catch (error) {
        console.warn(`NASA API error for ${query}:`, error);
        return [];
      } finally {
        pendingRequests.delete(cacheKey);
      }
    })();

    pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  },

  async getAstronomyPictureOfTheDay(): Promise<NasaImage | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(
        `${NASA_BASE_URL}/planetary/apod?api_key=${NASA_API_KEY}`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Failed to fetch APOD');
      
      const data = await response.json();
      
      return {
        id: data.date,
        title: data.title || 'Astronomy Picture of the Day',
        description: (data.explanation || '').slice(0, 300),
        url: data.url || BLACK_PLACEHOLDER,
        hdUrl: data.hdurl,
        date: data.date,
        mediaType: data.media_type === 'image' ? 'image' : 'video',
      };
    } catch (error) {
      console.warn('APOD error:', error);
      return null;
    }
  },

  async getPlanetImages(planetId: string): Promise<PlanetImages> {
    const searchTerms = PLANET_SEARCH_TERMS[planetId] || [planetId];
    
    const imagePromises = searchTerms.map(term => this.searchImages(term, 3));
    
    let allImages: NasaImage[] = [];
    try {
      const results = await Promise.race([
        Promise.all(imagePromises),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
      allImages = (results as NasaImage[][]).flat();
    } catch (error) {
      console.warn('NASA API timeout or error, using placeholder');
    }
    
    const uniqueImages = allImages.filter(
      (img, index, self) => self.findIndex(i => i.id === img.id) === index
    );
    
    const gallery = uniqueImages.slice(0, 3);
    
    let featured: NasaImage | null = null;
    try {
      featured = await this.getAstronomyPictureOfTheDay();
    } catch {
      featured = null;
    }
    
    const finalFeatured = featured || gallery[0] || {
      id: planetId,
      title: planetNameMap[planetId] || planetId,
      description: `Информация о планете ${planetNameMap[planetId] || planetId}`,
      url: LOCAL_PLACEHOLDERS[planetId] || LOCAL_PLACEHOLDERS.default,
      date: new Date().toISOString(),
      mediaType: 'image',
    };
    
    return {
      featured: finalFeatured,
      gallery: gallery.length > 0 ? gallery : [],
    };
  },
};

const planetNameMap: Record<string, string> = {
  sun: 'Солнце',
  mercury: 'Меркурий',
  venus: 'Венера',
  earth: 'Земля',
  mars: 'Марс',
  jupiter: 'Юпитер',
  saturn: 'Сатурн',
  uranus: 'Уран',
  neptune: 'Нептун',
  pluto: 'Плутон',
  moon: 'Луна',
};