// src/simulation/components/SimulationScene.tsx

import React, { Suspense, useState, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Planet } from '../../planets/components/Planet';
import { OrbitingPlanet } from '../components/OrbitingPlanet';
import { OrbitLine } from './OrbitLine';
import { AsteroidBelt } from '../components/AsteroidBelt';
import { PlanetInfoPanel } from '../../simulation/components/PlanetInfoPanel/PlanetInfoPanel';
import { LoadingScreen } from '../../../shared/ui/LoadingScreen/LoadingScreen';
import { SimulationControls } from '../../planets/components/SimulationControls/SimulationControls';
import { useSimulationSpeed } from '../hooks/useSimulationSpeed';
import { SIMULATION_PLANETS } from '../../simulation/simulation.config';
import { type SimulationPlanet } from '../simulation.config';
import * as THREE from 'three';
import styles from '../../planets/components/Canvas3D.module.scss';

// Компонент для управления камерой при выборе планеты
const CameraController = ({ 
  targetPlanet, 
  isAnimating 
}: { 
  targetPlanet: SimulationPlanet | null; 
  isAnimating: boolean;
}) => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 20, 30));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const planetWorldPosition = useRef(new THREE.Vector3(0, 0, 0));
  
  // Получаем позицию планеты в мире
  const getPlanetPosition = useCallback(() => {
    if (!targetPlanet || !targetPlanet.orbitRadius) return new THREE.Vector3(0, 0, 0);
    
    // Здесь нужно получить актуальную позицию планеты из орбиты
    // В реальном коде можно передавать позицию через ref или context
    const angle = (Date.now() * targetPlanet.orbitSpeed! * 0.001) % (Math.PI * 2);
    return new THREE.Vector3(
      Math.cos(angle) * targetPlanet.orbitRadius,
      0,
      Math.sin(angle) * targetPlanet.orbitRadius
    );
  }, [targetPlanet]);
  
  useFrame(() => {
    if (!isAnimating || !targetPlanet) return;
    
    // Обновляем позицию планеты
    const planetPos = getPlanetPosition();
    planetWorldPosition.current.copy(planetPos);
    
    // Камера будет смотреть на планету сбоку-спереди
    // Позиция камеры: правее и немного выше планеты
    targetLookAt.current.copy(planetPos);
    
    // Камера располагается справа от планеты (по оси X) и чуть спереди (по Z)
    targetPosition.current.set(
      planetPos.x + 3.5,  // Правее планеты
      planetPos.y + 1.5,   // Чуть выше
      planetPos.z + 4      // Спереди
    );
    
    // Плавное перемещение камеры
    camera.position.lerp(targetPosition.current, 0.08);
    camera.lookAt(targetLookAt.current);
  });
  
  return null;
};

interface SceneContentProps {
  onReady: () => void;
  speed: number;
  onPlanetClick: (planet: SimulationPlanet, position: THREE.Vector3) => void;
  selectedPlanetId: string | null;
}

const SceneContent: React.FC<SceneContentProps> = ({ 
  onReady, 
  speed, 
  onPlanetClick,
  selectedPlanetId 
}) => {
  const sun = SIMULATION_PLANETS[0];
  const solarPlanets = SIMULATION_PLANETS.filter(p => 
    p.id !== 'sun' && !p.isMoon && !p.isAsteroidBelt
  );
  const moons = SIMULATION_PLANETS.filter(p => p.isMoon);
  const asteroidBelts = SIMULATION_PLANETS.filter(p => p.isAsteroidBelt);
  
  // Рефы для получения позиций планет
  const planetRefs = useRef<Map<string, THREE.Group>>(new Map());

  React.useEffect(() => {
    const timer = setTimeout(() => onReady(), 500);
    return () => clearTimeout(timer);
  }, [onReady]);

  const handlePlanetClick = (planet: SimulationPlanet, groupRef: THREE.Group) => {
    const position = groupRef.position.clone();
    onPlanetClick(planet, position);
  };

  return (
    <>
      <ambientLight intensity={0.2} />
      
      <group>
        <Planet config={sun} />
      </group>
      
      <pointLight position={[0, 0, 0]} intensity={10} color="#fff8dd" distance={80} decay={1} />
      <pointLight position={[0, 0, 0]} intensity={8} color="#ffcc88" distance={50} decay={1} />
      <pointLight position={[0, 0, 0]} intensity={4} color="#ffaa44" distance={25} decay={1} />
      
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
        <OrbitingPlanet 
          key={planet.id} 
          planet={planet} 
          speed={speed}
          onPlanetClick={handlePlanetClick}
          isSelected={selectedPlanetId === planet.id}
        />
      ))}
      
      {moons.map(moon => (
        <OrbitingPlanet 
          key={moon.id} 
          planet={moon} 
          speed={speed}
          onPlanetClick={handlePlanetClick}
          isSelected={selectedPlanetId === moon.id}
        />
      ))}
      
      <Stars radius={100} depth={50} count={2000} factor={4} />
      
      <OrbitControls 
        enableZoom={!selectedPlanetId}
        enablePan={!selectedPlanetId}
        enableRotate={!selectedPlanetId}
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
  const [selectedPlanet, setSelectedPlanet] = useState<SimulationPlanet | null>(null);
  const [selectedPlanetPosition, setSelectedPlanetPosition] = useState<THREE.Vector3 | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isCameraAnimating, setIsCameraAnimating] = useState(false);
  const { speed, isPaused, effectiveSpeed, speedUp, slowDown, resetSpeed, togglePause } = useSimulationSpeed();

  const handlePlanetClick = (planet: SimulationPlanet, position: THREE.Vector3) => {
    setSelectedPlanet(planet);
    setSelectedPlanetPosition(position);
    setIsPanelOpen(true);
    setIsCameraAnimating(true);
    
    // Опционально: остановить симуляцию при выборе планеты
    // if (!isPaused) togglePause();
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setIsCameraAnimating(false);
    setSelectedPlanet(null);
    setSelectedPlanetPosition(null);
    
    // Опционально: возобновить симуляцию
    // if (isPaused) togglePause();
  };

  return (
    <div className={styles.canvasContainer}>
      {isLoading && <LoadingScreen message="Загрузка солнечной системы..." />}
      
      <Canvas 
        camera={{ position: [0, 20, 35], fov: 45 }} 
        shadows={false}
        gl={{ 
          alpha: false,
          depth: true,         
          stencil: false,
        }}
      >
        <Suspense fallback={null}>
          <SceneContent 
            onReady={() => setIsLoading(false)} 
            speed={effectiveSpeed}
            onPlanetClick={handlePlanetClick}
            selectedPlanetId={selectedPlanet?.id || null}
          />
        </Suspense>
        
        {isCameraAnimating && selectedPlanet && (
          <CameraController 
            targetPlanet={selectedPlanet} 
            isAnimating={isCameraAnimating}
          />
        )}
      </Canvas>
      
      {selectedPlanet && (
        <PlanetInfoPanel
          planetId={selectedPlanet.id}
          planetName={selectedPlanet.label}
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          planetPosition={selectedPlanetPosition}
        />
      )}
      
      {!isLoading && !isCameraAnimating && (
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