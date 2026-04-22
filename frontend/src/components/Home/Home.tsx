import React from 'react';
import { Canvas3D } from '../Canvas3D';
import { Header } from '../UI/Header/Header';
import { PlanetSwitch } from '../UI/PlanetSwitch/PlanetSwitch';
import { NavigationArrows } from '../UI/NavigationArrows/NavigationArrows';
import { BurgerMenu } from '../UI/BurgerMenu/BurgerMenu';
import { MenuContent } from '../UI/MenuContent/MenuContent';
import { usePlanets } from '../../hooks/usePlanets';
import { useMenu } from '../../hooks/useMenu';
import styles from './Home.module.scss';

export const Home: React.FC = () => {
  const { planets, activePlanet, setPlanetById, nextPlanet, prevPlanet } = usePlanets();
  console.log('planets:', planets);
  const { isMenuOpen, toggleMenu } = useMenu();

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.desktop} ${isMenuOpen ? styles.menuOpen : ''}`}>
        
        <Canvas3D activePlanet={activePlanet} />
        <Header />
        <BurgerMenu isOpen={isMenuOpen} onToggle={toggleMenu} />
        <NavigationArrows onPrev={prevPlanet} onNext={nextPlanet} />
        
        <div className={styles.rectangle30} />
        
        {planets.map((planet) => (
          <PlanetSwitch
            key={planet.id}
            planet={planet}
            isActive={planet.id === activePlanet.id}
            onClick={() => setPlanetById(planet.id)}
          />
        ))}

        {isMenuOpen && <MenuContent onClose={toggleMenu} />}
      </div>
    </div>
  );
};
export default Home;