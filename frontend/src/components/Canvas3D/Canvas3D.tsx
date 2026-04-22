import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Planet } from './Planet';
import { type PlanetConfig } from '../../config/planets.config';
import { type ViewMode } from '../../hooks/usePlanetInfo';
import styles from './Canvas3D.module.scss';
import * as THREE from 'three';

interface Canvas3DProps {
  activePlanet: PlanetConfig;
  viewMode?: ViewMode;
}

const SceneController = ({ viewMode, planetId }: { viewMode: ViewMode; planetId: string }) => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  
  const shouldZoom = viewMode === 'shifted' && planetId !== 'sun';

  useEffect(() => {
    if (viewMode === 'center') {
      targetPosition.current.set(0, 0, 8);
    } else {
      if (shouldZoom) {
        targetPosition.current.set(-1.5, 0.3, 4.5);  
      } else {
        targetPosition.current.set(-1.5, 0.3, 7);
      }
    }
  }, [viewMode, shouldZoom]);

  useFrame(() => {
    camera.position.lerp(targetPosition.current, 0.05);
    camera.lookAt(viewMode === 'center' ? 0 : -1.25, 0, 0);
  });

  return null;
};

export const Canvas3D: React.FC<Canvas3DProps> = ({ activePlanet, viewMode = 'center' }) => {
  const isShifted = viewMode === 'shifted';
  const isSun = activePlanet.id === 'sun';
  
  const planetOffsetX = isShifted ? -2 : 0;
  
  const getPlanetScale = () => {
    if (!isShifted) return activePlanet.scale || 1;
    
    if (isSun) {
      return 1.0;
    } else {
      return (activePlanet.scale || 1) * 1.5;  
    }
  };
  
  const planetScale = getPlanetScale();

  return (
    <div className={styles.canvasContainer}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <Suspense fallback={null}>
          {/* Освещение — ярче при приближении */}
          <ambientLight intensity={isShifted && !isSun ? 1.2 : 0.5} />
          <directionalLight position={[5, 5, 5]} intensity={isShifted && !isSun ? 1.5 : 1} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} />
          
          {/* Доп подсветка приближенных планет */}
          {isShifted && !isSun && (
            <>
              <spotLight 
                position={[-2, 3, 4]} 
                angle={0.5} 
                penumbra={0.3} 
                intensity={1.8} 
                color="#ffffff" 
              />
              <pointLight position={[-1, 1, 3]} intensity={1.0} color={activePlanet.color || '#ffffff'} />
            </>
          )}
          
          <group position={[planetOffsetX, 0, 0]} scale={planetScale}>
            <Planet config={activePlanet} />
          </group>
          
          <Stars radius={100} depth={50} count={5000} factor={4} />
          
          <OrbitControls 
            enableZoom={!isShifted}
            enablePan={!isShifted}
            enableRotate={!isShifted}
            minDistance={isShifted && !isSun ? 2 : 3}
            maxDistance={12}
            autoRotate={!isShifted}
            target={[planetOffsetX, 0, 0]}
          />
          
          <SceneController viewMode={viewMode} planetId={activePlanet.id} />
        </Suspense>
      </Canvas>
    </div>
  );
};