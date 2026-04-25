import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/UI/Header/Header';
import { BurgerMenu } from '../../components/UI/BurgerMenu/BurgerMenu';
import { MenuContent } from '../../components/UI/MenuContent/MenuContent';
import { SpacecraftCard } from '../../components/UI/SpacecraftCard/SpacecraftCard';
import { SpacecraftModal } from '../../components/UI/SpacecraftModal/SpacecraftModal';
import { useMenu } from '../../hooks/useMenu';
import styles from './Spacecraft.module.scss';

const SPACECRAFT_DATA = [
  { id: 'soyuz', name: 'Soyuz', nameRu: 'Союз', image: '/assets/spacecraft/soyuz.jpg', developer: 'РКК «Энергия» им. С.П. Королёва' },
  { id: 'hubble', name: 'Hubble', nameRu: 'Хаббл', image: '/assets/spacecraft/hubble.jpg', developer: 'NASA / ESA' },
  { id: 'jwst', name: 'James Webb', nameRu: 'Джеймс Уэбб', image: '/assets/spacecraft/jwst.jpg', developer: 'NASA / ESA / CSA' },
  { id: 'curiosity', name: 'Curiosity', nameRu: 'Кьюриосити', image: '/assets/spacecraft/curiosity.jpg', developer: 'NASA / JPL' },
  { id: 'voyager1', name: 'Voyager 1', nameRu: 'Вояджер-1', image: '/assets/spacecraft/voyager.jpg', developer: 'NASA / JPL' },
  { id: 'iss', name: 'ISS', nameRu: 'МКС', image: '/assets/spacecraft/iss.jpg', developer: 'NASA / Роскосмос / ESA' },
  { id: 'perseverance', name: 'Perseverance', nameRu: 'Персеверанс', image: '/assets/spacecraft/perseverance.jpg', developer: 'NASA / JPL' },
  { id: 'cassini', name: 'Cassini', nameRu: 'Кассини', image: '/assets/spacecraft/cassini.jpg', developer: 'NASA / ESA / ASI' },
  { id: 'newhorizons', name: 'New Horizons', nameRu: 'Новые горизонты', image: '/assets/spacecraft/newhorizons.jpg', developer: 'NASA / APL' },
  { id: 'sputnik1', name: 'Sputnik 1', nameRu: 'Спутник-1', image: '/assets/spacecraft/sputnik.jpg', developer: 'СССР' },
  { id: 'apollo11', name: 'Apollo 11', nameRu: 'Аполлон-11', image: '/assets/spacecraft/apollo11.jpg', developer: 'NASA' },
  { id: 'falcon9', name: 'Falcon 9', nameRu: 'Фалькон-9', image: '/assets/spacecraft/falcon9.jpg', developer: 'SpaceX' },
];

const COLS = 3;
const ROWS = 2;
const ITEMS_PER_PAGE = COLS * ROWS;  

export const Spacecraft: React.FC = () => {
  const { isMenuOpen, toggleMenu } = useMenu();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCraft, setSelectedCraft] = useState<typeof SPACECRAFT_DATA[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalPages = Math.ceil(SPACECRAFT_DATA.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const currentItems = SPACECRAFT_DATA.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleMoreClick = (craft: typeof SPACECRAFT_DATA[0]) => {
    setSelectedCraft(craft);
    setIsModalOpen(true);
  };

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
                  } ${
                    col === COLS - 1 ? styles.rightEdge : ''
                  }`}
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