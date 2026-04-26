import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/UI/Header/Header';
import { BurgerMenu } from '../../components/UI/BurgerMenu/BurgerMenu';
import { MenuContent } from '../../components/UI/MenuContent/MenuContent';
import { SpacecraftCard } from '../../components/UI/SpacecraftCard/SpacecraftCard';
import { SpacecraftModal } from '../../components/UI/SpacecraftModal/SpacecraftModal';
import { LoadingScreen } from '../../components/UI/LoadingScreen/LoadingScreen';
import { useMenu } from '../../hooks/useMenu';
import { getVehicles, searchImage } from '../../api/nasaApi';
import styles from './Spacecraft.module.scss';

// запасные данные
const FALLBACK_DATA = [
  { id: 'soyuz', name: 'Soyuz', nameRu: 'Союз', image: '/assets/spacecraft/soyuz.jpg', developer: 'РКК «Энергия»' },
  { id: 'hubble', name: 'Hubble', nameRu: 'Хаббл', image: '/assets/spacecraft/hubble.jpg', developer: 'NASA / ESA' },
  { id: 'jwst', name: 'James Webb', nameRu: 'Джеймс Уэбб', image: '/assets/spacecraft/jwst.jpg', developer: 'NASA / ESA / CSA' },
  { id: 'dragon', name: 'Dragon', nameRu: 'Дракон', image: '/assets/spacecraft/dragon.jpg', developer: 'SpaceX' },
  { id: 'apollo', name: 'Apollo', nameRu: 'Аполлон', image: '/assets/spacecraft/apollo.jpg', developer: 'NASA' },
  { id: 'columbia', name: 'Columbia', nameRu: 'Колумбия', image: '/assets/spacecraft/columbia.jpg', developer: 'NASA' },
];

interface SpacecraftItem {
  id: string;
  name: string;
  nameRu: string;
  image: string;
  developer: string;
}

const COLS = 3;
const ROWS = 2;
const ITEMS_PER_PAGE = COLS * ROWS;

export const Spacecraft: React.FC = () => {
  const { isMenuOpen, toggleMenu } = useMenu();
  const navigate = useNavigate();
  
  const [spacecraftData, setSpacecraftData] = useState<SpacecraftItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCraft, setSelectedCraft] = useState<SpacecraftItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const vehicles = await getVehicles();
        
        if (vehicles.length > 0) {
          const quickData: SpacecraftItem[] = vehicles.map((v, index) => {
            const name = v.vehicle.split('/vehicle/').pop()?.replace(/%20/g, ' ') || 'Unknown';
            return {
              id: `nasa-${index}`,
              name: name,
              nameRu: name,
              image: '/assets/spacecraft/placeholder.jpg',
              developer: 'NASA',
            };
          });
          
          setSpacecraftData(quickData);
          setIsLoading(false);
          
          quickData.forEach(async (item, i) => {
            const image = await searchImage(item.name);
            if (image) {
              setSpacecraftData(prev => prev.map((p, idx) => 
                idx === i ? { ...p, image } : p
              ));
            }
          });
        } else {
          setSpacecraftData(FALLBACK_DATA);
          setIsLoading(false);
        }
      } catch {
        setSpacecraftData(FALLBACK_DATA);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const totalPages = Math.ceil(spacecraftData.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const currentItems = spacecraftData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  const handleMoreClick = (craft: SpacecraftItem) => {
    setSelectedCraft(craft);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <LoadingScreen message="Загрузка аппаратов..." />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.desktop} ${isMenuOpen ? styles.menuOpen : ''}`}>
        <div className={styles.background} />
        <div className={styles.overlay} />

        <Header />
        <BurgerMenu isOpen={isMenuOpen} onToggle={toggleMenu} />
        
        <button className={styles.backButton} onClick={() => navigate('/')}>
          ← Назад
        </button>
        
        <h1 className={styles.pageTitle}>КОСМИЧЕСКИЕ АППАРАТЫ</h1>
        
        <div className={styles.carousel}>
          <button className={`${styles.carouselArrow} ${styles.arrowLeft}`} onClick={prevPage} />
          <button className={`${styles.carouselArrow} ${styles.arrowRight}`} onClick={nextPage} />
          
          <div className={styles.grid}>
            {currentItems.map((craft, index) => {
              const col = index % COLS;
              return (
                <div 
                  key={`${craft.id}-${startIndex + index}`}
                  className={`${styles.cardWrapper} ${
                    col === 0 ? styles.leftEdge : ''
                  } ${col === COLS - 1 ? styles.rightEdge : ''}`}
                >
                  <SpacecraftCard 
                    spacecraft={craft} 
                    onMoreClick={() => handleMoreClick(craft)}
                  />
                  {col === 0 && <div className={styles.dimLeft} />}
                  {col === COLS - 1 && <div className={styles.dimRight} />}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className={styles.indicator}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === currentPage ? styles.activeDot : ''}`}
              onClick={() => setCurrentPage(i)}
            />
          ))}
        </div>
        
        <SpacecraftModal 
          spacecraft={selectedCraft} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
        
        {isMenuOpen && <MenuContent onClose={toggleMenu} />}
      </div>
    </div>
  );
};