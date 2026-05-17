import React, { useRef } from 'react';

import {
  Canvas,
  useFrame,
  useLoader,
  useThree,
} from '@react-three/fiber';

import {
  OrbitControls,
  Stars,
  useGLTF,
} from '@react-three/drei';

import { TextureLoader } from 'three';

import * as THREE from 'three';

interface RoverSceneProps {
  rover: {
    x: number;
    z: number;
    rotation: number;
  };
  craters: {
    id: number;
    x: number;
    z: number;
    collected: boolean;
  }[];
}

const RoverModel: React.FC = () => {
  const { scene } = useGLTF('/assets/models/rover.glb');
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  return (
    <primitive
      object={clonedScene}
      scale={[0.5, 0.5, 0.5]}
      rotation={[0, Math.PI, 0]}
    />
  );
};

const FollowCamera: React.FC<{
  rover: {
    x: number;
    z: number;
    rotation: number;
  };
}> = ({ rover }) => {
  const { camera } = useThree();

  useFrame(() => {
    const offsetX = Math.sin(rover.rotation) * 8;
    const offsetZ = Math.cos(rover.rotation) * 8;

    const targetPosition = new THREE.Vector3(
      rover.x - offsetX,
      4.5,
      rover.z - offsetZ,
    );

    camera.position.lerp(targetPosition, 0.08);
    camera.lookAt(rover.x, 1.5, rover.z);
  });

  return null;
};

const Terrain = () => {
  const marsTexture = useLoader(
    TextureLoader,
    '/assets/textures/8k_mars.jpg'
  );

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[120, 120, 128, 128]} />
      <meshStandardMaterial
        map={marsTexture}
        roughness={1}
      />
    </mesh>
  );
};

const SceneContent: React.FC<RoverSceneProps> = ({
  rover,
  craters,
}) => {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[15, 20, 10]}
        intensity={2.5}
        color="#ffb48c"
        castShadow
      />
      <fog attach="fog" args={['#160d08', 35, 100]} />

      <Terrain />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial
          color="#4b2413"
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Craters */}
      {craters
        .filter((c) => !c.collected)
        .map((crater) => (
          <group
            key={crater.id}
            position={[crater.x, 0.2, crater.z]}
          >
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.5, 0.35, 16, 32]} />
              <meshStandardMaterial
                color="#ff7b42"
                emissive="#ff5a1f"
                emissiveIntensity={1.4}
              />
            </mesh>
          </group>
        ))}

      <group
        position={[rover.x, 0.45, rover.z]}
        rotation={[0, rover.rotation, 0]}
      >
        <RoverModel />
      </group>

      <FollowCamera rover={rover} />

      <Stars
        radius={120}
        depth={60}
        count={3000}
        factor={4}
        fade
      />
    </>
  );
};

export const RoverScene: React.FC<RoverSceneProps> = (props) => {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        background: '#0a0a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <p>3D сцена недоступна</p>
      </div>
    );
  }

  return (
    <Canvas
      shadows
      camera={{
        position: [0, 6, 10],
        fov: 55,
      }}
      onError={() => setHasError(true)}
    >
      <SceneContent {...props} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
      />
    </Canvas>
  );
};