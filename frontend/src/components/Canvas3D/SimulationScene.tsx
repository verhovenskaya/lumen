import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Planet } from './Planet';
import { OrbitingPlanet } from './OrbitingPlanet';
import { OrbitLine } from './OrbitLine';
import { AsteroidBelt } from './AsteroidBelt';
import { LoadingScreen } from '../UI/LoadingScreen/LoadingScreen';
import { SimulationControls } from '../UI/SimulationControls/SimulationControls';
import { useSimulationSpeed } from '../../hooks/useSimulationSpeed';
import { SIMULATION_PLANETS } from '../../config/simulation.config';
import styles from './Canvas3D.module.scss';

interface SceneContentProps {
  onReady: () => void;
  speed: number;
}

const SceneContent: React.FC<SceneContentProps> = ({ onReady, speed }) => {
  const sun = SIMULATION_PLANETS[0];
  const solarPlanets = SIMULATION_PLANETS.filter(p => 
    p.id !== 'sun' && !p.isMoon && !p.isAsteroidBelt
  );
  const moons = SIMULATION_PLANETS.filter(p => p.isMoon);
  const asteroidBelts = SIMULATION_PLANETS.filter(p => p.isAsteroidBelt);

  React.useEffect(() => {
    const timer = setTimeout(() => onReady(), 500);
    return () => clearTimeout(timer);
  }, [onReady]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.6} />
      
      <Planet config={sun} />
      <pointLight position={[0, 0, 0]} intensity={2.5} color="#FDB813" />
      
      {solarPlanets.filter(p => p.orbitRadius).map(planet => (
        <OrbitLine 
          key={`orbit-${planet.id}`} 
          radius={planet.orbitRadius!} 
          color={planet.orbitColor || '#ffffff'} 
        />
      ))}
      
      {asteroidBelts.map(belt => (
        <AsteroidBelt 
          key={belt.id}
          radius={belt.orbitRadius!} 
          width={0.8}
          count={1500}
          color={belt.orbitColor}
        />
      ))}
      
      {solarPlanets.map(planet => (
        <OrbitingPlanet key={planet.id} planet={planet} speed={speed} />
      ))}
      
      {moons.map(moon => (
        <OrbitingPlanet key={moon.id} planet={moon} speed={speed} />
      ))}
      
      <Stars radius={100} depth={50} count={3000} factor={4} />
      
      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={70}
        target={[0, 0, 0]}
        enableDamping={true}
        dampingFactor={0.08}
      />
    </>
  );
};

export const SimulationScene: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { speed, isPaused, effectiveSpeed, speedUp, slowDown, resetSpeed, togglePause } = useSimulationSpeed();

  return (
    <div className={styles.canvasContainer}>
      {isLoading && <LoadingScreen />}
      
      <Canvas camera={{ position: [0, 30, 5], fov: 45 }} shadows={false}>
        <Suspense fallback={null}>
          <SceneContent onReady={() => setIsLoading(false)} speed={effectiveSpeed} />
        </Suspense>
      </Canvas>
      
      {!isLoading && (
        <SimulationControls 
          speed={speed}
          isPaused={isPaused}
          onSpeedUp={speedUp}
          onSlowDown={slowDown}
          onResetSpeed={resetSpeed}
          onTogglePause={togglePause}
        />
      )}
    </div>
  );
};