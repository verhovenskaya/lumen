import React from 'react';
import { Canvas3D } from '../Canvas3D';
import { Header } from '../UI/Header/Header';
import { PlanetSwitch } from '../UI/PlanetSwitch/PlanetSwitch';
import { NavigationArrows } from '../UI/NavigationArrows/NavigationArrows';
import { BurgerMenu } from '../UI/BurgerMenu/BurgerMenu';
import { MenuContent } from '../UI/MenuContent/MenuContent';
import { PlanetInfo } from '../UI/PlanetInfo/PlanetInfo';
import { usePlanets } from '../../hooks/usePlanets';
import { useMenu } from '../../hooks/useMenu';
import { usePlanetInfo } from '../../hooks/usePlanetInfo';
import styles from './Home.module.scss';

export const Home: React.FC = () => {
  const { planets, activePlanet, setPlanetById, nextPlanet, prevPlanet } = usePlanets();
  const { isMenuOpen, toggleMenu } = useMenu();
  const { selectedPlanet, isInfoOpen, viewMode, openInfo, closeInfo } = usePlanetInfo();

  const handlePlanetClick = (planet: typeof activePlanet) => {
    setPlanetById(planet.id);
    openInfo(planet);
  };

  const handleArrowClick = (direction: 'prev' | 'next') => {
    closeInfo();
    if (direction === 'prev') {
      prevPlanet();
    } else {
      nextPlanet();
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.desktop} ${isMenuOpen ? styles.menuOpen : ''}`}>
        <div className={styles.rectangle24} />
        <div className={styles.rectangle25} />

        <Canvas3D activePlanet={activePlanet} viewMode={viewMode} />

        <Header isShifted={viewMode === 'shifted'} />
        <BurgerMenu isOpen={isMenuOpen} onToggle={toggleMenu} />
        
        <NavigationArrows 
          onPrev={() => handleArrowClick('prev')} 
          onNext={() => handleArrowClick('next')}
          isShifted={isInfoOpen}  
        />
        
        <div className={styles.rectangle30} />
        
        {planets.map((planet) => (
          <PlanetSwitch
            key={planet.id}
            planet={planet}
            isActive={planet.id === activePlanet.id}
            onClick={() => handlePlanetClick(planet)}
          />
        ))}

        <PlanetInfo 
          planet={selectedPlanet} 
          isOpen={isInfoOpen} 
          onClose={closeInfo} 
        />

        <div className={styles.ellipse18} />
        <div className={styles.extraImage1} />
        <div className={styles.extraImage3} />
        <div className={styles.rectangle52} />
        <div className={styles.gameController} />

        {isMenuOpen && <MenuContent onClose={toggleMenu} />}
      </div>
    </div>
  );
};

export default Home;