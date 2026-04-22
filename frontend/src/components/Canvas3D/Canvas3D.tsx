import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Planet } from './Planet';
import { type PlanetConfig } from '../../config/planets.config';
import styles from './Canvas3D.module.scss';

interface Canvas3DProps {
  activePlanet: PlanetConfig;
}

export const Canvas3D: React.FC<Canvas3DProps> = ({ activePlanet }) => {
  return (
    <div className={styles.canvasContainer}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} />
          
          <Planet config={activePlanet} />
          
          <Stars radius={100} depth={50} count={5000} factor={4} />
          <OrbitControls 
            enableZoom={true} 
            enablePan={false}
            minDistance={3}
            maxDistance={12}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};