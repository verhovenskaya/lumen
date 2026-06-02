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
  sun: ['sun', 'solar dynamics', 'corona'],
  mercury: ['mercury planet', 'messenger mission'],
  venus: ['venus planet', 'magellan mission'],
  earth: ['earth from space', 'blue marble', 'earth rise'],
  mars: ['mars planet', 'curiosity rover', 'mars surface', 'perseverance'],
  jupiter: ['jupiter planet', 'juno mission', 'great red spot'],
  saturn: ['saturn planet', 'cassini mission', 'rings of saturn'],
  uranus: ['uranus planet', 'voyager 2 uranus'],
  neptune: ['neptune planet', 'voyager 2 neptune'],
  pluto: ['pluto planet', 'new horizons pluto'],
  moon: ['moon surface', 'lunar', 'apollo mission'],
};

export const nasaApi = {
  async searchImages(query: string, limit: number = 10): Promise<NasaImage[]> {
    try {
      // Используем NASA Image and Video Library API
      const response = await fetch(
        `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`
      );
      
      if (!response.ok) throw new Error('Failed to fetch NASA images');
      
      const data = await response.json();
      
      const items = data.collection?.items || [];
      
      return items.slice(0, limit).map((item: any) => {
        const dataItem = item.data[0];
        const links = item.links || [];
        const imageLink = links.find((l: any) => l.rel === 'preview');
        
        return {
          id: dataItem.nasa_id || dataItem.title,
          title: dataItem.title,
          description: dataItem.description || dataItem.title,
          url: imageLink?.href || '',
          hdUrl: imageLink?.href,
          date: dataItem.date_created,
          mediaType: 'image',
        };
      });
    } catch (error) {
      console.error('NASA API error:', error);
      return [];
    }
  },

  async getAstronomyPictureOfTheDay(): Promise<NasaImage | null> {
    try {
      const response = await fetch(
        `${NASA_BASE_URL}/planetary/apod?api_key=${NASA_API_KEY}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch APOD');
      
      const data = await response.json();
      
      return {
        id: data.date,
        title: data.title,
        description: data.explanation,
        url: data.url,
        hdUrl: data.hdurl,
        date: data.date,
        mediaType: data.media_type === 'image' ? 'image' : 'video',
      };
    } catch (error) {
      console.error('APOD error:', error);
      return null;
    }
  },

  async getPlanetImages(planetId: string): Promise<PlanetImages> {
    const searchTerms = PLANET_SEARCH_TERMS[planetId] || [planetId];
    
    const featured = await this.getAstronomyPictureOfTheDay();
    
    const allImages: NasaImage[] = [];
    
    for (const term of searchTerms) {
      const images = await this.searchImages(term, 5);
      allImages.push(...images);
    }
    
    const uniqueImages = allImages.filter(
      (img, index, self) => self.findIndex(i => i.url === img.url) === index
    );
    
    const gallery = uniqueImages.slice(0, 4);
    
    const finalFeatured = featured || gallery[0] || null;
    
    return {
      featured: finalFeatured as NasaImage,
      gallery,
    };
  },
};