import React, { useState } from 'react';

import { MainScene } from '../../modules/simulation/components/MainScene';
import { SimulationScene } from '../../modules/simulation/components/SimulationScene';

import { Header } from '../../shared/components/Header/Header';
import { BurgerMenu } from '../../shared/components/BurgerMenu/BurgerMenu';

import { NavigationArrows } from '../../shared/ui/NavigationArrows/NavigationArrows';

import { PlanetSwitch } from '../../modules/planets/components/PlanetSwitch/PlanetSwitch';
import { PlanetInfo } from '../../modules/planets/components/PlanetInfo/PlanetInfo';

import { MenuContent } from '../../modules/missions/components/MenuContent/MenuContent';
import { MissionPanel } from '../../modules/missions/components/MissionPanel/MissionPanel';

import { usePlanets } from '../../modules/planets/hooks/usePlanets';
import { useMenu } from '../../modules/missions/hooks/useMenu';
import { usePlanetInfo } from '../../modules/planets/hooks/usePlanetInfo';
import { useSimulation } from '../../modules/simulation/hooks/useSimulation';
import { useMissions } from '../../modules/missions/hooks/useMissions';

import styles from './Home.module.scss';

export const Home: React.FC = () => {
  const {
    planets,
    activePlanet,
    setPlanetById,
    nextPlanet,
    prevPlanet,
  } = usePlanets();

  const { isMenuOpen, toggleMenu } = useMenu();

  const {
    selectedPlanet,
    isInfoOpen,
    viewMode,
    openInfo,
    closeInfo,
  } = usePlanetInfo();

  const {
    isSimulation,
    toggleMode,
  } = useSimulation();

  const [isMissionsOpen, setIsMissionsOpen] = useState(false);

  const {
    missions,
    markPlanetViewed,        
    completeMission,
  } = useMissions();

  const handlePlanetClick = (planet: typeof activePlanet) => {
    setPlanetById(planet.id);
    openInfo(planet);
    markPlanetViewed(planet.id);
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

        {isSimulation ? (
          <SimulationScene />
        ) : (
          <MainScene
            activePlanet={activePlanet}
            viewMode={viewMode}
          />
        )}

        <Header
          isShifted={viewMode === 'shifted' && !isSimulation}
          isMissionsOpen={isMissionsOpen}
          onMissionsToggle={() => setIsMissionsOpen(prev => !prev)}
          onSimulationClick={toggleMode}
        />

        <BurgerMenu
          isOpen={isMenuOpen}
          onToggle={toggleMenu}
        />

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

        <MissionPanel
          missions={missions}
          isOpen={isMissionsOpen}
          onClose={() => setIsMissionsOpen(false)}
          onCompleteMission={completeMission}
        />

        <div className={styles.ellipse18} />
        <div className={styles.extraImage1} />
        <div className={styles.extraImage3} />

        {isMenuOpen && (
          <MenuContent onClose={toggleMenu} />
        )}
      </div>
    </div>
  );
};

export default Home;