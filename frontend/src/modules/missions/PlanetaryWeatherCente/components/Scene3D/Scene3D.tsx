import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { MarsPlanet } from './MarsPlanet';
import { VenusPlanet } from './VenusPlanet';
import { NeptunePlanet } from './NeptunePlanet';
import type { PlanetId } from '../../types';

interface Scene3DProps {
  planetId: PlanetId;
  activeEvent: string | null;
}

export const Scene3D: React.FC<Scene3DProps> = ({ planetId, activeEvent }) => {
  const renderPlanet = () => {
    switch (planetId) {
      case 'mars':
        return <MarsPlanet activeEvent={activeEvent} />;
      case 'venus':
        return <VenusPlanet activeEvent={activeEvent} />;
      case 'neptune':
        return <NeptunePlanet activeEvent={activeEvent} />;
      default:
        return <MarsPlanet activeEvent={activeEvent} />;
    }
  };

  return (
    <div className="scene3d-container" style={{ width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0, 9], fov: 45 }}
        style={{ background: 'radial-gradient(circle at center, #0a0a2a, #000000)' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />
        
        <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade />
        
        {renderPlanet()}
        
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          autoRotate={false}
          minDistance={3}
          maxDistance={15}
        />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};