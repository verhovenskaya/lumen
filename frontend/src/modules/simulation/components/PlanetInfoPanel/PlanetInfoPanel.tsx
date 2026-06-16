import React, { useEffect, useState } from 'react';
import { nasaApi, type NasaImage, type PlanetImages } from '../../../../api/nasaApi1';
import styles from './PlanetInfoPanel.module.scss';

interface PlanetInfoPanelProps {
  planetId: string;
  planetName: string;
  isOpen: boolean;
  onClose: () => void;
}

// Черная заглушка
const BLACK_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%230a0a1a'/%3E%3C/svg%3E";

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

  const getImageUrl = (nasaImage: NasaImage | null): string => {
    if (!nasaImage) return BLACK_PLACEHOLDER;
    if (imageLoadErrors.has(nasaImage.url)) return BLACK_PLACEHOLDER;
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

          {/* Главное фото */}
          <div className={styles.featuredImage}>
            <div className={styles.featuredWrapper}>
              <img
                src={selectedImage ? getImageUrl(selectedImage) : BLACK_PLACEHOLDER}
                alt={selectedImage?.title || planetName}
                className={styles.featuredImg}
                onError={() => selectedImage && handleImageError(selectedImage.url)}
              />
              {!loading && selectedImage && (
                <div className={styles.featuredOverlay}>
                  <h3>{selectedImage.title}</h3>
                  <p className={styles.date}>
                    {new Date(selectedImage.date).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              )}
            </div>
            {!loading && selectedImage?.description && (
              <p className={styles.description}>
                {selectedImage.description.length > 200
                  ? selectedImage.description.slice(0, 200) + '...'
                  : selectedImage.description}
              </p>
            )}
          </div>

          <div className={styles.divider} />

          {/* Индикатор загрузки */}
          {loading && (
            <div className={styles.loadingSmall}>
              <div className={styles.spinnerSmall} />
              <p>Загрузка изображений...</p>
            </div>
          )}

          {/* Ошибка */}
          {error && !loading && (
            <div className={styles.errorSmall}>
              <p>{error}</p>
              <button onClick={loadPlanetImages}>Повторить</button>
            </div>
          )}

          {/* Галерея */}
          {!loading && planetImages?.gallery && planetImages.gallery.length > 0 && (
            <>
              <div className={styles.gallery}>
                <h4>Другие снимки</h4>
                <div className={styles.galleryGrid}>
                  {planetImages.gallery.slice(0, 6).map((img) => (
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
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.credit}>
                <p>© NASA / JPL-Caltech</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};