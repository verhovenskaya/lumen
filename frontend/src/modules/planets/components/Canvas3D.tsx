// src/modules/planets/components/Canvas3D.tsx

import React, { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Planet } from './Planet';
import { OrbitingPlanet } from '../../simulation/components/OrbitingPlanet';
import { OrbitLine } from '../../simulation/components/OrbitLine';
import { PlanetInfoPanel } from '../../simulation/components/PlanetInfoPanel/PlanetInfoPanel';
import { type PlanetConfig } from '../planets.config';
import { type ViewMode } from '../../../modules/planets/hooks/usePlanetInfo';
import { type AppMode } from '../../simulation/hooks/useSimulation';
import { SIMULATION_PLANETS } from '../../simulation/simulation.config'; 
import { useSimulationSpeed } from '../../simulation/hooks/useSimulationSpeed';
import { type SimulationPlanet } from '../../simulation/simulation.config';
import styles from './Canvas3D.module.scss';
import * as THREE from 'three';

interface Canvas3DProps {
  activePlanet: PlanetConfig;
  viewMode?: ViewMode;
  appMode?: AppMode;
}

// Глобальное хранилище позиций планет
const planetPositions: Record<string, THREE.Vector3> = {};

// Компонент для управления камерой при выборе планеты
const CameraController = ({ 
  targetPlanet, 
  isAnimating,
  onAnimationComplete,
  onCameraReady
}: { 
  targetPlanet: SimulationPlanet | null; 
  isAnimating: boolean;
  onAnimationComplete?: () => void;
  onCameraReady?: (position: THREE.Vector3, target: THREE.Vector3) => void;
}) => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const animationProgress = useRef(0);
  const startPosition = useRef(new THREE.Vector3());
  const startLookAt = useRef(new THREE.Vector3());
  const isFirstFrame = useRef(true);

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
      // Сохраняем начальные параметры
      startPosition.current.copy(camera.position);
      
      // Получаем текущую точку фокуса
      const controlsTarget = (window as any).__controlsTarget;
      if (controlsTarget) {
        startLookAt.current.copy(controlsTarget);
      } else {
        startLookAt.current.set(0, 0, 0);
      }
      
      animationProgress.current = 0;
      
      const planetPos = getPlanetPosition();
      const planetSize = targetPlanet.scale * 2;
      const distance = Math.max(4, planetSize * 2.5);
      
      // Новая точка фокуса - позиция планеты
      targetLookAt.current.copy(planetPos);
      
      // Новая позиция камеры - сбоку от планеты
      targetPosition.current.set(
        planetPos.x + distance * 0.7,
        planetPos.y + distance * 0.4,
        planetPos.z + distance
      );
      
      console.log(`Camera animating to ${targetPlanet.label}`, {
        from: startPosition.current,
        to: targetPosition.current,
        lookAt: targetLookAt.current
      });
    }
  }, [isAnimating, targetPlanet, getPlanetPosition, camera]);

  useFrame(() => {
    if (!isAnimating || !targetPlanet) return;
    
    animationProgress.current += 0.08;
    
    if (animationProgress.current >= 1) {
      animationProgress.current = 1;
      
      // Передаем финальную позицию и точку фокуса
      if (onCameraReady) {
        onCameraReady(targetPosition.current, targetLookAt.current);
      }
      if (onAnimationComplete) onAnimationComplete();
      return;
    }
    
    const easeOut = 1 - Math.pow(1 - animationProgress.current, 3);
    const planetPos = getPlanetPosition();
    
    // Обновляем точку фокуса
    targetLookAt.current.copy(planetPos);
    
    // Интерполируем позицию камеры
    camera.position.lerpVectors(startPosition.current, targetPosition.current, easeOut);
    camera.lookAt(targetLookAt.current);
  });
  
  return null;
};

const SceneController = ({ viewMode, planetId }: { viewMode: ViewMode; planetId: string }) => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 0, 8));
  const initRef = useRef(false);
  
  const shouldZoom = viewMode === 'shifted' && planetId !== 'sun';

  useEffect(() => {
    if (viewMode === 'center') {
      targetPosition.current.set(0, 0, 8);
    } else {
      targetPosition.current.set(-1.5, 0.3, shouldZoom ? 4.5 : 7);
    }
    
    if (!initRef.current) {
      initRef.current = true;
      return;
    }
  }, [viewMode, shouldZoom]);

  useFrame(() => {
    camera.position.lerp(targetPosition.current, 0.05);
    camera.lookAt(viewMode === 'center' ? 0 : -1.25, 0, 0);
  });

  return null;
};

export const Canvas3D: React.FC<Canvas3DProps> = ({ 
  activePlanet, 
  viewMode = 'center',
  appMode = 'explore' 
}) => {
  const [selectedPlanet, setSelectedPlanet] = useState<SimulationPlanet | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isCameraAnimating, setIsCameraAnimating] = useState(false);
  const [controlsTarget, setControlsTarget] = useState<[number, number, number]>([0, 0, 0]);
  const { speed, effectiveSpeed, setPaused, isPaused } = useSimulationSpeed();
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);
  
  const isShifted = viewMode === 'shifted';
  const isSimulation = appMode === 'simulation';
  const isSun = activePlanet.id === 'sun';
  
  const planetOffsetX = isShifted ? -2 : 0;
  const planetScale = isShifted
    ? (isSun ? 1.0 : (activePlanet.scale || 1) * 1.5)
    : (activePlanet.scale || 1);

  // Сохраняем target для OrbitControls в глобальную переменную
  useEffect(() => {
    (window as any).__controlsTarget = new THREE.Vector3(controlsTarget[0], controlsTarget[1], controlsTarget[2]);
  }, [controlsTarget]);

  useEffect(() => {
    if (!selectedPlanet) {
      setIsSimulationRunning(!isPaused);
    }
  }, [isPaused, selectedPlanet]);

  const handlePlanetClick = (planet: SimulationPlanet, groupRef: THREE.Group) => {
    console.log('Canvas3D - Planet clicked:', planet.label);
    
    const position = groupRef.position.clone();
    planetPositions[planet.id] = position;
    
    setIsSimulationRunning(false);
    if (!isPaused) setPaused(true);
    
    setSelectedPlanet(planet);
    setIsPanelOpen(true);
    setIsCameraAnimating(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedPlanet(null);
    setIsCameraAnimating(false);
    setIsSimulationRunning(true);
    setControlsTarget([0, 0, 0]); // Возвращаем фокус на солнце
    if (isPaused) setPaused(false);
  };

  const handleCameraReady = (position: THREE.Vector3, target: THREE.Vector3) => {
    // Устанавливаем новый target для OrbitControls - позиция планеты
    setControlsTarget([target.x, target.y, target.z]);
    console.log('Camera ready, new target:', target);
  };

  const handleCameraAnimationComplete = () => {
    console.log('Camera animation completed');
    setIsCameraAnimating(false);
  };

  // Реф для OrbitControls
  const controlsRef = useRef<any>(null);

  return (
    <div className={styles.canvasContainer}>
      <Canvas 
        camera={{ 
          position: isSimulation ? [0, 22, 35] : [0, 0, 8],
          fov: 45 
        }} 
        shadows={false}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={isSimulation ? 0.6 : (isShifted && !isSun ? 1.2 : 0.5)} />
          <directionalLight position={[5, 10, 5]} intensity={isSimulation ? 0.8 : (isShifted && !isSun ? 1.5 : 1)} />
          <pointLight position={[-5, -5, -5]} intensity={0.3} />
          
          {isSimulation ? (
            <>
              {/* Солнце */}
              <group position={[0, 0, 0]}>
                <Planet config={SIMULATION_PLANETS[0]} />
              </group>
              <pointLight position={[0, 0, 0]} intensity={2} color="#FDB813" />
              
              {/* Орбиты */}
              {SIMULATION_PLANETS.filter(p => p.orbitRadius && p.id !== 'sun' && !p.isMoon && !p.isAsteroidBelt).map(planet => (
                <OrbitLine 
                  key={`orbit-${planet.id}`} 
                  radius={planet.orbitRadius!} 
                  color={planet.orbitColor || '#ffffff'} 
                />
              ))}
              
              {/* Планеты */}
              {SIMULATION_PLANETS.filter(p => p.id !== 'sun' && !p.isMoon && !p.isAsteroidBelt).map(planet => (
                <OrbitingPlanet 
                  key={planet.id} 
                  planet={planet} 
                  speed={effectiveSpeed}
                  isSimulationRunning={isSimulationRunning && !selectedPlanet}
                  onPlanetClick={handlePlanetClick}
                  isSelected={selectedPlanet?.id === planet.id}
                />
              ))}
              
              {/* Луны */}
              {SIMULATION_PLANETS.filter(p => p.isMoon).map(moon => (
                <OrbitingPlanet 
                  key={moon.id} 
                  planet={moon} 
                  speed={effectiveSpeed}
                  isSimulationRunning={isSimulationRunning && !selectedPlanet}
                  onPlanetClick={handlePlanetClick}
                  isSelected={selectedPlanet?.id === moon.id}
                />
              ))}
            </>
          ) : (
            <>
              {isShifted && !isSun && (
                <>
                  <spotLight position={[-2, 3, 4]} angle={0.5} penumbra={0.3} intensity={1.8} color="#ffffff" />
                  <pointLight position={[-1, 1, 3]} intensity={1.0} color={activePlanet.color || '#ffffff'} />
                </>
              )}
              
              <group position={[planetOffsetX, 0, 0]} scale={planetScale}>
                <Planet config={activePlanet} />
              </group>
              
              <SceneController viewMode={viewMode} planetId={activePlanet.id} />
            </>
          )}
          
          <Stars radius={100} depth={50} count={isSimulation ? 2000 : 5000} factor={4} />
          
          <OrbitControls 
            ref={controlsRef}
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={selectedPlanet ? 1 : (isSimulation ? 5 : (isShifted && !isSun ? 2 : 3))}
            maxDistance={selectedPlanet ? 20 : (isSimulation ? 50 : 12)}
            autoRotate={false}
            target={controlsTarget}
            enableDamping={true}
            dampingFactor={0.08}
            makeDefault
          />
          
          {isCameraAnimating && selectedPlanet && (
            <CameraController 
              targetPlanet={selectedPlanet} 
              isAnimating={isCameraAnimating}
              onAnimationComplete={handleCameraAnimationComplete}
              onCameraReady={handleCameraReady}
            />
          )}
        </Suspense>
      </Canvas>
      
      {/* Панель информации */}
      {selectedPlanet && isSimulation && (
        <PlanetInfoPanel
          planetId={selectedPlanet.id}
          planetName={selectedPlanet.label}
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
        />
      )}
      
      {/* Индикатор просмотра планеты */}
      {selectedPlanet && isSimulation && !isCameraAnimating && (
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
      
      {/* Подсказка по управлению */}
      {selectedPlanet && isSimulation && !isCameraAnimating && (
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