import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Stars, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { TextureLoader } from 'three';
import * as THREE from 'three';

interface RoverSceneProps {
  roverRef: React.MutableRefObject<{ x: number; z: number; rotation: number; velocity: number }>;
  keysRef: React.MutableRefObject<Record<string, boolean>>;
  craters: { id: number; x: number; z: number; collected: boolean }[];
  scanActive: boolean;
  stormActive: boolean;
  onCollect: (craterId: number) => void;
}

//контроллер движения
const RoverController: React.FC<{
  roverRef: RoverSceneProps['roverRef'];
  keysRef: RoverSceneProps['keysRef'];
}> = ({ roverRef, keysRef }) => {
  useFrame((_, delta) => {
    const k = keysRef.current;
    const r = roverRef.current;
    const dt = Math.min(delta, 0.1);

    if (k['a'] || k['ArrowLeft'] || k['ф']) r.rotation += 2.5 * dt;
    if (k['d'] || k['ArrowRight'] || k['в']) r.rotation -= 2.5 * dt;

    let target = 0;
    if (k['w'] || k['ArrowUp'] || k['ц']) target = 8;
    if (k['s'] || k['ArrowDown'] || k['ы']) target = -4;

    r.velocity += (target - r.velocity) * 6 * dt;
    r.x += Math.sin(r.rotation) * r.velocity * dt;
    r.z += Math.cos(r.rotation) * r.velocity * dt;

    const half = 35;
    r.x = Math.max(-half, Math.min(half, r.x));
    r.z = Math.max(-half, Math.min(half, r.z));
  });
  return null;
};

//ровер
const RoverGroup: React.FC<{ roverRef: RoverSceneProps['roverRef'] }> = ({ roverRef }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF('/assets/models/rover.glb');

  useFrame(() => {
    if (!groupRef.current) return;
    const r = roverRef.current;
    groupRef.current.position.set(r.x, 0.45, r.z);
    groupRef.current.rotation.y = r.rotation;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={[0.5, 0.5, 0.5]} rotation={[0, Math.PI, 0]} />
    </group>
  );
};

//камера
const FollowCamera: React.FC<{ roverRef: RoverSceneProps['roverRef'] }> = ({ roverRef }) => {
  const { camera } = useThree();
  const tp = useRef(new THREE.Vector3());
  const lt = useRef(new THREE.Vector3());

  useFrame(() => {
    const r = roverRef.current;
    tp.current.set(
      r.x - Math.sin(r.rotation) * 8,
      4.5,
      r.z - Math.cos(r.rotation) * 8
    );
    lt.current.set(r.x, 1.5, r.z);
    camera.position.lerp(tp.current, 0.05);
    camera.lookAt(lt.current);
  });
  return null;
};

const Terrain = React.memo(() => {
  const marsTexture = useLoader(TextureLoader, '/assets/textures/8k_mars.jpg');
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[120, 120, 16, 16]} />
      <meshStandardMaterial map={marsTexture} roughness={1} />
    </mesh>
  );
});

const AnimatedCrater = React.memo<{
  position: [number, number, number];
  craterId: number;
  roverRef: RoverSceneProps['roverRef'];
  onCollect: (id: number) => void;
  collected: boolean;
}>(({ position, craterId, roverRef, onCollect, collected }) => {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (!ref.current || collected) return;
    ref.current.rotation.z += 0.01;
    const r = roverRef.current;
    if (Math.hypot(r.x - position[0], r.z - position[2]) < 3.5) {
      onCollect(craterId);
    }
  });

  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.5, 0.35, 8, 16]} />
      <meshStandardMaterial color="#ff7b42" emissive="#ff5a1f" emissiveIntensity={1.5} />
    </mesh>
  );
});

//камни
const Rocks = React.memo(() => {
  const data = useMemo(
    () =>
      Array.from({ length: 50 }, () => ({
        pos: [
          (Math.random() - 0.5) * 100,
          0.3,
          (Math.random() - 0.5) * 100,
        ] as [number, number, number],
        scale: Math.random() * 1.2 + 0.4,
      })),
    []
  );

  return (
    <>
      {data.map((r, i) => (
        <mesh key={i} position={r.pos} scale={r.scale}>
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#4b2c20" roughness={1} />
        </mesh>
      ))}
    </>
  );
});

//скан
const ScanWave: React.FC<{
  roverRef: RoverSceneProps['roverRef'];
  active: boolean;
}> = ({ roverRef, active }) => {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (ref.current && active) {
      const r = roverRef.current;
      ref.current.position.set(r.x, 0.05, r.z);
    }
  });

  if (!active) return null;

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1, 12, 32]} />
      <meshBasicMaterial color="#c4b5fd" transparent opacity={0.3} />
    </mesh>
  );
};

const SceneContent: React.FC<RoverSceneProps> = ({
  roverRef,
  keysRef,
  craters,
  scanActive,
  stormActive,
  onCollect,
}) => (
  <>
    <RoverController roverRef={roverRef} keysRef={keysRef} />
    <ambientLight intensity={stormActive ? 0.25 : 0.4} />
    <directionalLight
      position={[10, 15, 8]}
      intensity={stormActive ? 1.2 : 2}
      color="#ffb48c"
    />
    <fog
      attach="fog"
      args={stormActive ? ['#8a4d2a', 6, 28] : ['#160d08', 35, 100]}
    />
    <Terrain />
    <Rocks />

    {craters
      .filter((c) => {
        if (c.collected) return false;
        if (scanActive) return true;
        const r = roverRef.current;
        return Math.hypot(r.x - c.x, r.z - c.z) < 6;
      })
      .map((c) => (
        <AnimatedCrater
          key={c.id}
          position={[c.x, 0.3, c.z]}
          craterId={c.id}
          roverRef={roverRef}
          onCollect={onCollect}
          collected={c.collected}
        />
      ))}

    <ScanWave roverRef={roverRef} active={scanActive} />
    <RoverGroup roverRef={roverRef} />
    <FollowCamera roverRef={roverRef} />
    <Stars radius={120} depth={60} count={800} factor={4} fade />

    <EffectComposer>
      <Bloom intensity={0.8} luminanceThreshold={0.25} />
      <Noise opacity={stormActive ? 0.06 : 0.02} />
      <Vignette offset={0.1} darkness={stormActive ? 1 : 0.8} />
    </EffectComposer>
  </>
);

export const RoverScene: React.FC<RoverSceneProps> = (props) => {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <p>3D сцена недоступна</p>
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 6, 10], fov: 55 }}
      onError={() => setHasError(true)}
    >
      <SceneContent {...props} />
    </Canvas>
  );
};