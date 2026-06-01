import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Planet } from '../../planets/components/Planet';
import { LoadingScreen } from '../../../shared/ui/LoadingScreen/LoadingScreen';
import { type PlanetConfig } from '../../planets/planets.config';
import { type ViewMode } from '../../planets/hooks/usePlanetInfo';
import styles from '../../planets/components/Canvas3D.module.scss';
import * as THREE from 'three';


interface MainSceneProps {
  activePlanet: PlanetConfig;
  viewMode?: ViewMode;
}

const SceneController = ({ viewMode}: { viewMode: ViewMode; planetId: string }) => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 0, 8));
  
  const shouldZoom = viewMode === 'shifted';

  useEffect(() => {
    if (viewMode === 'center') {
      targetPosition.current.set(0, 0, 8);
    } else {
      targetPosition.current.set(-1.5, 0.3, shouldZoom ? 4.5 : 7);
    }
  }, [viewMode, shouldZoom]);

  useFrame(() => {
    camera.position.lerp(targetPosition.current, 0.05);
    camera.lookAt(viewMode === 'center' ? 0 : -1.25, 0, 0);
  });

  return null;
};

const SceneContent: React.FC<{ activePlanet: PlanetConfig; viewMode: ViewMode; onReady: () => void }> = ({ 
  activePlanet, viewMode, onReady 
}) => {
  const isShifted = viewMode === 'shifted';
  const isSun = activePlanet.id === 'sun';
  const planetOffsetX = isShifted ? -2 : 0;
  const planetScale = isShifted
  ? (activePlanet.infoScale || activePlanet.scale || 1)
  : (activePlanet.scale || 1);
  
  useEffect(() => {
    const timer = setTimeout(() => onReady(), 500);
    return () => clearTimeout(timer);
  }, [onReady]);

  return (
    <>
      {isSun ? (
        <>
          <ambientLight intensity={0.8} />
          <pointLight position={[0, 0, 0]} intensity={5} color="#ffcc00" distance={80} />
          <pointLight position={[0, 0, 0]} intensity={3} color="#ff8800" distance={50} />
          <pointLight position={[0, 0, 0]} intensity={1.5} color="#ff4400" distance={25} />
          <directionalLight position={[5, 5, 5]} intensity={0.3} />
        </>
      ) : (
        <>
          <ambientLight intensity={isShifted ? 1.2 : 0.5} />
          <directionalLight position={[5, 5, 5]} intensity={isShifted ? 1.5 : 1} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} />
        </>
      )}
      
      {isShifted && !isSun && (
        <>
          <spotLight position={[-2, 3, 4]} angle={0.5} penumbra={0.3} intensity={1.8} color="#ffffff" />
          <pointLight position={[-1, 1, 3]} intensity={1.0} color={activePlanet.color || '#ffffff'} />
        </>
      )}
      
      <group position={[planetOffsetX, 0, 0]} scale={planetScale}>
        <Planet config={activePlanet} />

      </group>
      
      <Stars radius={100} depth={50} count={isSun ? 3000 : 5000} factor={4} />
      
      <OrbitControls 
        enableZoom={!isShifted}
        enablePan={!isShifted}
        enableRotate={!isShifted}
        minDistance={isSun ? 4 : (isShifted && !isSun ? 2 : 3)}
        maxDistance={isSun ? 15 : 12}
        autoRotate={!isShifted}
        target={[planetOffsetX, 0, 0]}
        enableDamping={true}
        dampingFactor={0.05}
      />
      
      <SceneController viewMode={viewMode} planetId={activePlanet.id} />
      
    </>
  );
};

export const MainScene: React.FC<MainSceneProps> = ({ activePlanet, viewMode = 'center' }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={styles.canvasContainer}>
      {isLoading && <LoadingScreen message="Загрузка планеты..." />}
      
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} shadows={false}>
        <Suspense fallback={null}>
          <SceneContent activePlanet={activePlanet} viewMode={viewMode} onReady={() => setIsLoading(false)} />
        </Suspense>
      </Canvas>
    </div>
  );
};