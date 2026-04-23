import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Planet } from './Planet';
import { OrbitingPlanet } from './OrbitingPlanet';
import { OrbitLine } from './OrbitLine';
import { type PlanetConfig } from '../../config/planets.config';
import { type ViewMode } from '../../hooks/usePlanetInfo';
import { type AppMode } from '../../hooks/useSimulation';
import { PLANETS } from '../../config/planets.config';
import styles from './Canvas3D.module.scss';
import * as THREE from 'three';

interface Canvas3DProps {
  activePlanet: PlanetConfig;
  viewMode?: ViewMode;
  appMode?: AppMode;
}

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
  const isShifted = viewMode === 'shifted';
  const isSimulation = appMode === 'simulation';
  const isSun = activePlanet.id === 'sun';
  
  const planetOffsetX = isShifted ? -2 : 0;
  
  const planetScale = isShifted
    ? (isSun ? 1.0 : (activePlanet.scale || 1) * 1.5)
    : (activePlanet.scale || 1);

  return (
    <div className={styles.canvasContainer}>
      <Canvas 
        camera={{ 
          position: isSimulation ? [0, 22, 2] : [0, 0, 8],
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
              <Planet config={PLANETS[0]} />
              <pointLight position={[0, 0, 0]} intensity={2} color="#FDB813" />
              
              {PLANETS.filter(p => p.orbitRadius && p.id !== 'sun').map(planet => (
                <OrbitLine 
                  key={`orbit-${planet.id}`} 
                  radius={planet.orbitRadius!} 
                  color={planet.orbitColor || '#ffffff'} 
                />
              ))}
              
              {PLANETS.filter(p => p.id !== 'sun').map(planet => (
                <OrbitingPlanet key={planet.id} planet={planet} />
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
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={isSimulation ? 5 : (isShifted && !isSun ? 2 : 3)}
            maxDistance={isSimulation ? 50 : 12}
            autoRotate={false}
            target={isSimulation ? [0, 0, 0] : [planetOffsetX, 0, 0]}
            enableDamping={true}
            dampingFactor={0.08}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};