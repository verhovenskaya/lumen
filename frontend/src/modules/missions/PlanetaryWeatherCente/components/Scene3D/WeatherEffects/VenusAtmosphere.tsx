import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VenusAtmosphereProps {
  activeAcidClouds: boolean;
  activeLightning: boolean;
}

interface Flash {
  position: THREE.Vector3;
  life: number;
  intensity: number;
}

export const VenusAtmosphere: React.FC<VenusAtmosphereProps> = ({ 
  activeAcidClouds, 
  activeLightning 
}) => {
  const cloudGlowRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const lastFlashTimeRef = useRef(0);

  // Позиции для возможных вспышек на облаках
  const flashPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 16; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.0;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions.push(new THREE.Vector3(x, y, z));
    }
    return positions;
  }, []);

  useFrame((_, delta) => {
    timeRef.current += delta;

    // Вращение атмосферного свечения
    if (cloudGlowRef.current) {
      cloudGlowRef.current.rotation.y += 0.001;
    }

    // Обновляем существующие вспышки
    setFlashes(prev => {
      const updated = prev
        .map(flash => ({ ...flash, life: flash.life - delta }))
        .filter(flash => flash.life > 0);
      return updated;
    });

    // Генерируем новые вспышки только если активно явление молний
    if (activeLightning) {
      // Частота вспышек: ~1-3 в секунду
      const flashInterval = 0.5 + Math.random() * 1;
      if (timeRef.current - lastFlashTimeRef.current > flashInterval) {
        lastFlashTimeRef.current = timeRef.current;
        
        const randomPos = flashPositions[Math.floor(Math.random() * flashPositions.length)];
        const intensity = 0.6 + Math.random() * 0.8;
        
        setFlashes(prev => [...prev, {
          position: randomPos,
          life: 0.12,
          intensity,
        }]);
      }
    }
  });

  // Вычисляем общую интенсивность свечения от вспышек
  const getTotalFlashIntensity = () => {
    return flashes.reduce((sum, flash) => sum + flash.intensity * (flash.life / 0.12), 0);
  };

  const totalIntensity = getTotalFlashIntensity();

  return (
    <>
      {/* Атмосферное свечение Венеры */}
      <mesh ref={cloudGlowRef}>
        <sphereGeometry args={[2.05, 64, 64]} />
        <meshStandardMaterial
          transparent
          opacity={0.12 + (activeAcidClouds ? 0.05 : 0)}
          color="#f8d890"
          emissive="#e8b860"
          emissiveIntensity={0.08 + totalIntensity * 0.3}
        />
      </mesh>

      {/* Точки света для вспышек внутри облаков */}
      {flashes.map((flash, idx) => (
        <React.Fragment key={idx}>
          {/* Визуальное свечение в облаках */}
          <mesh position={flash.position}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial
              transparent
              opacity={flash.intensity * (flash.life / 0.12) * 0.6}
              color="#ffeedd"
              emissive="#ffcc88"
              emissiveIntensity={flash.intensity * (flash.life / 0.12) * 1.5}
            />
          </mesh>
          
          {/* Точечный источник света для подсветки облаков */}
          <pointLight
            position={flash.position}
            intensity={flash.intensity * (flash.life / 0.12) * 0.8}
            color="#ffcc88"
            distance={4}
            decay={1.5}
          />
        </React.Fragment>
      ))}

      {/* Усиление свечения при кислотных облаках */}
      {activeAcidClouds && (
        <mesh scale={2.08}>
          <sphereGeometry args={[1.85, 48, 48]} />
          <meshStandardMaterial
            transparent
            opacity={0.1}
            color="#e8d0a0"
            emissive="#d4b060"
            emissiveIntensity={0.12}
          />
        </mesh>
      )}
    </>
  );
};