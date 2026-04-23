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
import { useSimulation } from '../../hooks/useSimulation';
import styles from './Home.module.scss';

export const Home: React.FC = () => {
  const { planets, activePlanet, setPlanetById, nextPlanet, prevPlanet } = usePlanets();
  const { isMenuOpen, toggleMenu } = useMenu();
  const { selectedPlanet, isInfoOpen, viewMode, openInfo, closeInfo } = usePlanetInfo();
  const { mode, isSimulation, toggleMode } = useSimulation();

  const handlePlanetClick = (planet: typeof activePlanet) => {
    setPlanetById(planet.id);
    openInfo(planet);
  };

  const handleArrowClick = (direction: 'prev' | 'next') => {
    closeInfo();
    if (direction === 'prev') prevPlanet();
    else nextPlanet();
  };

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.desktop} ${isMenuOpen ? styles.menuOpen : ''}`}>
        <div className={styles.rectangle24} />
        <div className={styles.rectangle25} />

        <Canvas3D 
          activePlanet={activePlanet} 
          viewMode={viewMode} 
          appMode={mode}
        />

        <Header isShifted={viewMode === 'shifted' && !isSimulation} />
        <BurgerMenu isOpen={isMenuOpen} onToggle={toggleMenu} />
        
        <button 
          className={styles.simulationButton}
          onClick={toggleMode}
          title={isSimulation ? 'Вернуться к исследованию' : 'Открыть симуляцию'}
        >
          <span className={styles.gamepadIcon}>🎮</span>
        </button>
        
        {!isSimulation && (
          <>
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
          </>
        )}

        {isSimulation && (
          <button className={styles.backButton} onClick={toggleMode}>
            ← Назад
          </button>
        )}

        <div className={styles.ellipse18} />
        <div className={styles.extraImage1} />
        <div className={styles.extraImage3} />

        {isMenuOpen && <MenuContent onClose={toggleMenu} />}
      </div>
    </div>
  );
};

export default Home;