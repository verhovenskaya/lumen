// src/modules/planets/components/PlanetInfoPanel/PlanetInfoPanel.tsx

import React, { useEffect, useState } from 'react';
import { nasaApi, type NasaImage, type PlanetImages } from '../../../../api/nasaApi1';
import styles from './PlanetInfoPanel.module.scss';
import * as THREE from 'three';

interface PlanetInfoPanelProps {
  planetId: string;
  planetName: string;
  isOpen: boolean;
  onClose: () => void;
  planetPosition?: THREE.Vector3 | null;
}

// Добавляем локальные заглушки для планет
const PLANET_PLACEHOLDERS: Record<string, string> = {
  sun: '/assets/textures/8k_mars.jpg',
  mercury: '/assets/textures/8k_mars.jpg',
  venus: '/assets/textures/8k_mars.jpg',
  earth: '/assets/textures/8k_mars.jpg',
  mars: '/assets/textures/8k_mars.jpg',
  jupiter: '/assets/textures/8k_jupiter.jpg',
  saturn: '/assets/textures/8k_mars.jpg',
  uranus: '/assets/textures/8k_mars.jpg',
  neptune: '/assets/textures/8k_mars.jpg',
  pluto: '/assets/textures/8k_mars.jpg',
  moon: '/assets/textures/8k_mars.jpg',
};

export const PlanetInfoPanel: React.FC<PlanetInfoPanelProps> = ({
  planetId,
  planetName,
  isOpen,
  onClose,
}) => {
  const [planetImages, setPlanetImages] = useState<PlanetImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<NasaImage | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && planetId) {
      loadPlanetImages();
    }
  }, [isOpen, planetId]);

  const loadPlanetImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const images = await nasaApi.getPlanetImages(planetId);
      setPlanetImages(images);
      if (images.featured) {
        setSelectedImage(images.featured);
      }
    } catch (err) {
      setError('Не удалось загрузить изображения');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (imageUrl: string) => {
    setImageLoadErrors(prev => new Set(prev).add(imageUrl));
  };

  const getPlaceholderUrl = () => {
    return PLANET_PLACEHOLDERS[planetId] || '/planets/default-planet.jpg';
  };

  const getImageUrl = (nasaImage: NasaImage | null) => {
    if (!nasaImage) return getPlaceholderUrl();
    if (imageLoadErrors.has(nasaImage.url)) return getPlaceholderUrl();
    return nasaImage.url;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.panelOverlay}>
      <div className={styles.panel}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        
        <div className={styles.content}>
          <h2 className={styles.title}>{planetName}</h2>
          
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Загрузка изображений NASA...</p>
              {/* Показываем плейсхолдер пока грузится */}
              <img 
                src={getPlaceholderUrl()} 
                alt={planetName}
                className={styles.placeholderImage}
              />
            </div>
          )}
          
          {error && (
            <div className={styles.error}>
              <p>{error}</p>
              <button onClick={loadPlanetImages}>Повторить</button>
              {/* Показываем плейсхолдер при ошибке */}
              <img 
                src={getPlaceholderUrl()} 
                alt={planetName}
                className={styles.placeholderImage}
              />
            </div>
          )}
          
          {!loading && !error && (
            <>
              {/* Главное фото */}
              <div className={styles.featuredImage}>
                <div className={styles.featuredWrapper}>
                  <img 
                    src={getImageUrl(selectedImage)}
                    alt={selectedImage?.title || planetName}
                    className={styles.featuredImg}
                    onError={() => selectedImage && handleImageError(selectedImage.url)}
                  />
                  {selectedImage && (
                    <div className={styles.featuredOverlay}>
                      <h3>{selectedImage.title}</h3>
                      <p className={styles.date}>
                        {new Date(selectedImage.date).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  )}
                </div>
                {selectedImage?.description && (
                  <p className={styles.description}>
                    {selectedImage.description.length > 200 
                      ? selectedImage.description.slice(0, 200) + '...' 
                      : selectedImage.description}
                  </p>
                )}
              </div>
              
              {/* Галерея */}
              {planetImages?.gallery && planetImages.gallery.length > 0 && (
                <div className={styles.gallery}>
                  <h4>Другие снимки NASA</h4>
                  <div className={styles.galleryGrid}>
                    {planetImages.gallery.map((img) => (
                      <div
                        key={img.id}
                        className={`${styles.galleryItem} ${
                          selectedImage?.id === img.id ? styles.active : ''
                        }`}
                        onClick={() => setSelectedImage(img)}
                      >
                        <img 
                          src={getImageUrl(img)} 
                          alt={img.title}
                          onError={() => handleImageError(img.url)}
                        />
                        <div className={styles.galleryOverlay}>
                          <span className={styles.galleryTitle}>{img.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Информация о NASA API */}
              <div className={styles.credit}>
                <p>📷 Фото предоставлены NASA API</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};