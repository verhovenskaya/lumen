// src/simulation/components/SimulationScene.tsx

import React, { Suspense, useState, useRef, useCallback, useEffect } from 'react';
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

// Глобальное хранилище позиций планет
const planetPositions: Record<string, THREE.Vector3> = {};

const CameraController = ({ 
  targetPlanet, 
  isAnimating,
  onAnimationComplete,
  onTargetReady
}: { 
  targetPlanet: SimulationPlanet | null; 
  isAnimating: boolean;
  onAnimationComplete?: () => void;
  onTargetReady?: (target: THREE.Vector3) => void;
}) => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const animationProgress = useRef(0);
  const startPosition = useRef(new THREE.Vector3());
  const startLookAt = useRef(new THREE.Vector3());

  const getPlanetPosition = useCallback(() => {
    if (!targetPlanet) return new THREE.Vector3(0, 0, 0);
    
    const savedPosition = planetPositions[targetPlanet.id];
    if (savedPosition) {
      return savedPosition.clone();
    }
    
    const savedAngle = (window as any).__planetAngles?.[targetPlanet.id] || 0;
    const orbitRadius = targetPlanet.orbitRadius || 5;
    return new THREE.Vector3(
      Math.cos(savedAngle) * orbitRadius,
      0,
      Math.sin(savedAngle) * orbitRadius
    );
  }, [targetPlanet]);

  useEffect(() => {
    if (isAnimating && targetPlanet) {
      startPosition.current.copy(camera.position);
      animationProgress.current = 0;
      
      const planetPos = getPlanetPosition();
      let distance = Math.max(3, targetPlanet.scale * 3.5);
      
      if (targetPlanet.id === 'mercury' || targetPlanet.id === 'venus') {
        distance = 5;
      } else if (targetPlanet.orbitRadius && targetPlanet.orbitRadius < 8) {
        distance = 4.5;
      }
      
      targetLookAt.current.copy(planetPos);
      
      // Камера сбоку от планеты
      targetPosition.current.set(
        planetPos.x + distance * 0.7,
        planetPos.y + distance * 0.4,
        planetPos.z + distance
      );
    }
  }, [isAnimating, targetPlanet, getPlanetPosition, camera]);

  useFrame(() => {
    if (!isAnimating || !targetPlanet) return;
    
    animationProgress.current += 0.08;
    
    if (animationProgress.current >= 1) {
      animationProgress.current = 1;
      const planetPos = getPlanetPosition();
      if (onTargetReady) onTargetReady(planetPos);
      if (onAnimationComplete) onAnimationComplete();
      return;
    }
    
    const easeOut = 1 - Math.pow(1 - animationProgress.current, 3);
    const planetPos = getPlanetPosition();
    
    targetLookAt.current.copy(planetPos);
    camera.position.lerpVectors(startPosition.current, targetPosition.current, easeOut);
    camera.lookAt(targetLookAt.current);
  });
  
  return null;
};

interface SceneContentProps {
  onReady: () => void;
  speed: number;
  isSimulationRunning: boolean;
  onPlanetClick: (planet: SimulationPlanet, groupRef: THREE.Group) => void;
  selectedPlanetId: string | null;
  controlsTarget: [number, number, number];
  onControlsTargetChange: (target: [number, number, number]) => void;
}

const SceneContent: React.FC<SceneContentProps> = ({ 
  onReady, 
  speed, 
  isSimulationRunning,
  onPlanetClick,
  selectedPlanetId,
  controlsTarget,
  onControlsTargetChange
}) => {
  const sun = SIMULATION_PLANETS[0];
  const solarPlanets = SIMULATION_PLANETS.filter(p => 
    p.id !== 'sun' && !p.isMoon && !p.isAsteroidBelt
  );
  const moons = SIMULATION_PLANETS.filter(p => p.isMoon);
  const asteroidBelts = SIMULATION_PLANETS.filter(p => p.isAsteroidBelt);

  useEffect(() => {
    const timer = setTimeout(() => onReady(), 500);
    return () => clearTimeout(timer);
  }, [onReady]);

  const handlePlanetClick = (planet: SimulationPlanet, groupRef: THREE.Group) => {
    const position = groupRef.position.clone();
    planetPositions[planet.id] = position;
    onPlanetClick(planet, groupRef);
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
          isSimulationRunning={isSimulationRunning && !selectedPlanetId}
          onPlanetClick={handlePlanetClick}
          isSelected={selectedPlanetId === planet.id}
        />
      ))}
      
      {moons.map(moon => (
        <OrbitingPlanet 
          key={moon.id} 
          planet={moon} 
          speed={speed}
          isSimulationRunning={isSimulationRunning && !selectedPlanetId}
          onPlanetClick={handlePlanetClick}
          isSelected={selectedPlanetId === moon.id}
        />
      ))}
      
      <Stars radius={100} depth={50} count={2000} factor={4} />
      
      {/* КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: target динамический */}
      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={selectedPlanetId ? 1 : 5}
        maxDistance={selectedPlanetId ? 20 : 70}
        target={controlsTarget}
        enableDamping={true}
        dampingFactor={0.08}
        makeDefault
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
  const [controlsTarget, setControlsTarget] = useState<[number, number, number]>([0, 0, 0]);
  
  const { speed, isPaused, effectiveSpeed, speedUp, slowDown, resetSpeed, togglePause, setPaused } = useSimulationSpeed();
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);

  useEffect(() => {
    if (!selectedPlanet) {
      setIsSimulationRunning(!isPaused);
    }
  }, [isPaused, selectedPlanet]);

  const handlePlanetClick = (planet: SimulationPlanet, groupRef: THREE.Group) => {
    console.log('Handle planet click:', planet.label);
    const position = groupRef.position.clone();
    
    setIsSimulationRunning(false);
    if (!isPaused) setPaused(true);
    
    setSelectedPlanet(planet);
    setSelectedPlanetPosition(position);
    setIsPanelOpen(true);
    setIsCameraAnimating(true);
  };

  const handleClosePanel = () => {
    console.log('Close panel, resuming simulation');
    
    setIsPanelOpen(false);
    setSelectedPlanet(null);
    setSelectedPlanetPosition(null);
    setIsSimulationRunning(true);
    setControlsTarget([0, 0, 0]); // Возвращаем фокус на солнце
    
    if (isPaused) setPaused(false);
    
    setTimeout(() => {
      setIsCameraAnimating(false);
    }, 100);
  };

  const handleCameraAnimationComplete = () => {
    console.log('Camera animation completed');
    setIsCameraAnimating(false);
  };

  const handleTargetReady = (target: THREE.Vector3) => {
    console.log('Setting new controls target:', target);
    setControlsTarget([target.x, target.y, target.z]);
  };

  useEffect(() => {
    console.log('State changed:', { 
      isSimulationRunning, 
      isPaused, 
      selectedPlanet: selectedPlanet?.label,
      controlsTarget
    });
  }, [isSimulationRunning, isPaused, selectedPlanet, controlsTarget]);

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
            isSimulationRunning={isSimulationRunning}
            onPlanetClick={handlePlanetClick}
            selectedPlanetId={selectedPlanet?.id || null}
            controlsTarget={controlsTarget}
            onControlsTargetChange={setControlsTarget}
          />
        </Suspense>
        
        {isCameraAnimating && selectedPlanet && (
          <CameraController 
            targetPlanet={selectedPlanet} 
            isAnimating={isCameraAnimating}
            onAnimationComplete={handleCameraAnimationComplete}
            onTargetReady={handleTargetReady}
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
      
      {!isLoading && !isCameraAnimating && !selectedPlanet && (
        <SimulationControls 
          speed={speed}
          isPaused={isPaused}
          onSpeedUp={speedUp}
          onSlowDown={slowDown}
          onResetSpeed={resetSpeed}
          onTogglePause={togglePause}
        />
      )}
      
      {selectedPlanet && !isCameraAnimating && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(0,0,0,0.85)',
          padding: '12px 20px',
          borderRadius: '12px',
          color: '#ffcc00',
          fontSize: '14px',
          zIndex: 100,
          pointerEvents: 'auto',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,204,0,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>🔍 Просмотр: <strong>{selectedPlanet.label}</strong></span>
            <span style={{ fontSize: '12px', color: '#aaa' }}>| Симуляция остановлена</span>
            <button 
              onClick={handleClosePanel}
              style={{
                background: '#ffcc00',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 12px',
                cursor: 'pointer',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
            >
              ✕ Вернуться
            </button>
          </div>
        </div>
      )}
      
      {selectedPlanet && !isCameraAnimating && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.6)',
          padding: '8px 12px',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '11px',
          zIndex: 100,
          pointerEvents: 'none',
          fontFamily: 'monospace'
        }}>
          🖱️ Мышь: вращение | ПКМ: панорамирование | Скролл: масштаб
        </div>
      )}
    </div>
  );
};