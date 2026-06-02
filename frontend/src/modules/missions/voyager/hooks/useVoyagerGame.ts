import { useState, useRef, useEffect, useCallback } from 'react';

type Screen = 'novel1' | 'novel2' | 'novel3' | 'briefing' | 'game';

interface TelemetryEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface DecodedPacket {
  id: number;
  content: string;
}

const VOYAGER_DATA = [
  { progress: 20, content: 'SYSTEM CHECK: NOMINAL' },
  { progress: 35, content: 'DISTANCE: 24.6 BILLION KM' },
  { progress: 50, content: 'POWER: 69.2%' },
  { progress: 65, content: 'INSTRUMENTS: 4 ACTIVE' },
  { progress: 80, content: 'PLASMA WAVE SUBSYSTEM: OK' },
  { progress: 90, content: 'MAGNETOMETER: OK' },
  { progress: 95, content: 'COSMIC RAY SUBSYSTEM: OK' },
  { progress: 100, content: 'FINAL MESSAGE: "WE WERE HERE"' },
];

interface DifficultyStage {
  minPackets: number;
  signalDrift: number;
  signalJumpInterval: number;
  fakeSpawnChance: number;
  fakeSpawnInterval: number;
  interferenceChance: number;
  interferenceInterval: number;
  interferenceDuration: number;
  packetDecayRate: number;
  maxStrengthReduction: number;
}

const DIFFICULTY_STAGES: DifficultyStage[] = [
  {
    minPackets: 0,
    signalDrift: 25,
    signalJumpInterval: 8000,
    fakeSpawnChance: 0.1,
    fakeSpawnInterval: 20000,
    interferenceChance: 0.15,
    interferenceInterval: 25000,
    interferenceDuration: 3000,
    packetDecayRate: 0.4,
    maxStrengthReduction: 0.75,
  },
  {
    minPackets: 25,
    signalDrift: 40,
    signalJumpInterval: 6000,
    fakeSpawnChance: 0.15,
    fakeSpawnInterval: 18000,
    interferenceChance: 0.25,
    interferenceInterval: 22000,
    interferenceDuration: 4000,
    packetDecayRate: 0.6,
    maxStrengthReduction: 0.65,
  },
  {
    minPackets: 50,
    signalDrift: 60,
    signalJumpInterval: 4500,
    fakeSpawnChance: 0.25,
    fakeSpawnInterval: 14000,
    interferenceChance: 0.4,
    interferenceInterval: 18000,
    interferenceDuration: 5000,
    packetDecayRate: 0.9,
    maxStrengthReduction: 0.55,
  },
  {
    minPackets: 75,
    signalDrift: 80,
    signalJumpInterval: 3000,
    fakeSpawnChance: 0.35,
    fakeSpawnInterval: 11000,
    interferenceChance: 0.55,
    interferenceInterval: 14000,
    interferenceDuration: 6000,
    packetDecayRate: 1.3,
    maxStrengthReduction: 0.45,
  },
];

const getCurrentStage = (packets: number): DifficultyStage => {
  for (let i = DIFFICULTY_STAGES.length - 1; i >= 0; i--) {
    if (packets >= DIFFICULTY_STAGES[i].minPackets) {
      return DIFFICULTY_STAGES[i];
    }
  }
  return DIFFICULTY_STAGES[0];
};

export const useVoyagerGame = (onWin?: () => void) => {
  const [screen, setScreen] = useState<Screen>('novel1');
  const [novelStep, setNovelStep] = useState(0);
  const [showDecoding, setShowDecoding] = useState(false);
  const [decodingProgress, setDecodingProgress] = useState(0);
  const [decodedMessages, setDecodedMessages] = useState<DecodedPacket[]>([]);
  const [packets, setPackets] = useState(0);
  const [signalStrength, setSignalStrength] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isInterference, setIsInterference] = useState(false);
  const [spectrum, setSpectrum] = useState('▁▁▂▁▁▂▁▁');
  const [fakeSignal, setFakeSignal] = useState({ x: 0, y: 0, active: false });
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [stageWarning, setStageWarning] = useState<string>('');
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [showDisconnectWarning, setShowDisconnectWarning] = useState(false);

  const keysPressed = useRef<Set<string>>(new Set());

  const antennaElRef = useRef<HTMLDivElement | null>(null);
  const signalElRef = useRef<HTMLDivElement | null>(null);
  const fakeSignalElRef = useRef<HTMLDivElement | null>(null);

  const antennaRef = useRef({ x: 0, y: 0 });
  const antennaVelocity = useRef({ x: 0, y: 0 });
  const signalRef = useRef({ x: 15, y: -10 });
  const signalVelocity = useRef({ x: 0, y: 0 });
  const fakeRef = useRef({ x: 0, y: 0, active: false });

  const lastSignalJumpTime = useRef(0);
  const lastStrengthCalc = useRef(0);
  const lastStageCheck = useRef(0);
  const packetsRef = useRef(0);
  const strengthRef = useRef(0);
  const currentStageRef = useRef(0);
  const disconnectTimerRef = useRef<number | null>(null);
  const disconnectSequenceRef = useRef<number | null>(null);

  const telemetryLogRef = useRef<TelemetryEntry[]>([
    { timestamp: '00:00:00', message: 'DSN CONNECTION ESTABLISHED', type: 'info' },
    { timestamp: '00:00:00', message: 'SEARCHING FOR VOYAGER-1...', type: 'info' },
  ]);
  const [telemetryLog, setTelemetryLog] = useState<TelemetryEntry[]>([...telemetryLogRef.current]);

  const addTelemetry = useCallback((message: string, type: TelemetryEntry['type'] = 'info') => {
    const now = new Date();
    const timestamp = `${now.getMinutes().toString().padStart(2, '0')}:${now
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;
    const newEntry = { timestamp, message, type };
    telemetryLogRef.current = [newEntry, ...telemetryLogRef.current].slice(0, 50);
    setTelemetryLog([...telemetryLogRef.current]);
  }, []);

  const generateSpectrum = useCallback((strength: number) => {
    const bars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    const intensity = Math.min(7, Math.floor(strength / 14));
    let result = '';
    for (let i = 0; i < 8; i++) {
      const variation = Math.random() > 0.7 ? Math.floor(Math.random() * 3) - 1 : 0;
      const index = Math.max(0, Math.min(7, intensity + variation));
      result += bars[index];
    }
    setSpectrum(result);
  }, []);

  const updateElementPosition = (
    el: HTMLDivElement | null,
    x: number,
    y: number,
    scale: number = 4,
    center: number = 210
  ) => {
    if (!el) return;
    const left = center + x * scale;
    const top = center + y * scale;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  };

  const updateFakeVisibility = (el: HTMLDivElement | null, active: boolean) => {
    if (!el) return;
    el.style.display = active ? 'block' : 'none';
  };

  const checkStageChange = useCallback((currentPackets: number) => {
    const newStage = DIFFICULTY_STAGES.findIndex(
      (stage, idx) => 
        currentPackets >= stage.minPackets && 
        (idx === DIFFICULTY_STAGES.length - 1 || currentPackets < DIFFICULTY_STAGES[idx + 1].minPackets)
    );
    
    if (newStage !== currentStageRef.current) {
      currentStageRef.current = newStage;
      setCurrentStage(newStage);
      
      const warnings = [
        '',
        '⚠ STAGE 2: SIGNAL INSTABILITY DETECTED',
        '⚠ STAGE 3: VOYAGER RESISTING ACQUISITION',
        '⚠ CRITICAL STAGE: SIGNAL DEGRADATION IMMINENT',
      ];
      
      if (warnings[newStage]) {
        setStageWarning(warnings[newStage]);
        addTelemetry(warnings[newStage], 'warning');
        setTimeout(() => setStageWarning(''), 3000);
      }
    }
  }, [addTelemetry]);

  const resetGame = useCallback(() => {
    antennaRef.current = { x: 0, y: 0 };
    antennaVelocity.current = { x: 0, y: 0 };

    signalRef.current = {
      x: 15 + (Math.random() - 0.5) * 20,
      y: -10 + (Math.random() - 0.5) * 15,
    };
    signalVelocity.current = { x: 0, y: 0 };
    fakeRef.current = { x: 0, y: 0, active: false };

    updateElementPosition(antennaElRef.current, 0, 0);
    updateElementPosition(signalElRef.current, signalRef.current.x, signalRef.current.y);
    updateFakeVisibility(fakeSignalElRef.current, false);

    packetsRef.current = 0;
    strengthRef.current = 0;
    currentStageRef.current = 0;
    setPackets(0);
    setSignalStrength(0);
    setTimeLeft(180);
    setGameOver(false);
    setGameWon(false);
    setShowTutorial(true);
    setIsInterference(false);
    setIsDisconnected(false);
    setShowDisconnectWarning(false);
    setFakeSignal({ x: 0, y: 0, active: false });
    setDecodedMessages([]);
    setShowDecoding(false);
    setDecodingProgress(0);
    setCurrentStage(0);
    setStageWarning('');

    if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
    if (disconnectSequenceRef.current) clearTimeout(disconnectSequenceRef.current);

    telemetryLogRef.current = [
      { timestamp: '00:00:00', message: 'DSN CONNECTION ESTABLISHED', type: 'info' },
      { timestamp: '00:00:00', message: 'SEARCHING FOR VOYAGER-1...', type: 'info' },
    ];
    setTelemetryLog([...telemetryLogRef.current]);

    keysPressed.current.clear();
    lastSignalJumpTime.current = performance.now();
    lastStrengthCalc.current = 0;
    lastStageCheck.current = 0;

    addTelemetry('INITIATING SIGNAL ACQUISITION', 'info');
    addTelemetry('SIGNAL LOCATED AT AZIMUTH 215°', 'success');
    setScreen('game');
  }, [addTelemetry]);

  const startGame = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const nextNovel = () => {
    setNovelStep((prev) => {
      const next = prev + 1;
      if (next === 1) setScreen('novel2');
      if (next === 2) setScreen('novel3');
      return Math.min(next, 2);
    });
  };

  const goToBriefing = () => {
    setScreen('briefing');
  };

  // Ввод
  useEffect(() => {
    if (screen !== 'game') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key) ||
        ['ц', 'ф', 'ы', 'в'].includes(key)
      ) {
        e.preventDefault();
        keysPressed.current.add(key);
        setShowTutorial(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen]);

  useEffect(() => {
    if (screen !== 'game' || gameOver || gameWon) return;

    let timeoutId: number;
    
    const scheduleFakeSpawn = () => {
      const stage = getCurrentStage(packetsRef.current);
      
      timeoutId = window.setTimeout(() => {
        if (Math.random() < stage.fakeSpawnChance && !fakeRef.current.active) {
          const newFake = {
            x: (Math.random() - 0.5) * 50,
            y: (Math.random() - 0.5) * 50,
            active: true,
          };
          fakeRef.current = newFake;
          updateElementPosition(fakeSignalElRef.current, newFake.x, newFake.y);
          updateFakeVisibility(fakeSignalElRef.current, true);
          
          setFakeSignal({ x: newFake.x, y: newFake.y, active: true });
          addTelemetry('⚠ UNKNOWN SIGNAL DETECTED', 'warning');

          setTimeout(() => {
            fakeRef.current.active = false;
            updateFakeVisibility(fakeSignalElRef.current, false);
            setFakeSignal(prev => ({ ...prev, active: false }));
          }, 5000);
        }
        
        scheduleFakeSpawn();
      }, stage.fakeSpawnInterval);
    };

    scheduleFakeSpawn();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [screen, gameOver, gameWon, addTelemetry]);

  // Динамические помехи
  useEffect(() => {
    if (screen !== 'game' || gameOver || gameWon) return;

    let timeoutId: number;
    
    const scheduleInterference = () => {
      const stage = getCurrentStage(packetsRef.current);
      
      timeoutId = window.setTimeout(() => {
        if (Math.random() < stage.interferenceChance) {
          setIsInterference(true);
          addTelemetry('⚠ SOLAR INTERFERENCE DETECTED', 'warning');
          
          setTimeout(() => setIsInterference(false), stage.interferenceDuration);
        }
        
        scheduleInterference();
      }, stage.interferenceInterval);
    };

    scheduleInterference();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [screen, gameOver, gameWon, addTelemetry]);

  useEffect(() => {
    if (screen !== 'game' || gameOver || gameWon) return;

    const checkDisconnect = () => {
      if (packetsRef.current >= 50 && !gameOver && !gameWon) {
        if (Math.random() < 0.6) {
          const disconnectDuration = 1500 + Math.random() * 1000;
          
          setIsDisconnected(true);
          setShowDisconnectWarning(true);
          
          addTelemetry('⚠⚠ SIGNAL DISCONNECT — REACQUIRING...', 'error');
          
          const newX = (Math.random() - 0.5) * 45;
          const newY = (Math.random() - 0.5) * 45;
          signalRef.current.x = newX;
          signalRef.current.y = newY;
          signalVelocity.current.x = (Math.random() - 0.5) * 80;
          signalVelocity.current.y = (Math.random() - 0.5) * 80;
          updateElementPosition(signalElRef.current, newX, newY);
          
          const packetLoss = 5 + Math.floor(Math.random() * 8);
          packetsRef.current = Math.max(0, packetsRef.current - packetLoss);
          
          disconnectTimerRef.current = window.setTimeout(() => {
            setIsDisconnected(false);
            setShowDisconnectWarning(false);
            addTelemetry('✓ SIGNAL REACQUIRED', 'success');
          }, disconnectDuration);
        }
      }
      
      disconnectSequenceRef.current = window.setTimeout(checkDisconnect, 3000);
    };

    disconnectSequenceRef.current = window.setTimeout(checkDisconnect, 3000);

    return () => {
      if (disconnectSequenceRef.current) clearTimeout(disconnectSequenceRef.current);
      if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
    };
  }, [screen, gameOver, gameWon, addTelemetry]);

  useEffect(() => {
    if (screen !== 'game' || gameOver || gameWon) return;

    let animationId: number;
    let lastTimestamp = performance.now();

    const ACCELERATION = 900;
    const MAX_SPEED = 360;
    const DAMPING_K = 8;
    const BOUNDS = 45;
    const CAPTURE_RADIUS = 12;
    const MAX_STRENGTH_DISTANCE = 35;

    let needsPacketUpdate = false;
    let needsStrengthUpdate = false;
    let lastReactUpdate = 0;
    const REACT_UPDATE_INTERVAL = 100;

    const update = (now: number) => {
      let delta = Math.min(0.033, (now - lastTimestamp) / 1000);
      if (delta <= 0) {
        animationId = requestAnimationFrame(update);
        return;
      }
      lastTimestamp = now;

      const stage = getCurrentStage(packetsRef.current);
      
      if (now - lastStageCheck.current > 500) {
        lastStageCheck.current = now;
        checkStageChange(packetsRef.current);
      }

      // Физика антенны
      let inputX = 0;
      let inputY = 0;

      if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a') || keysPressed.current.has('ф'))
        inputX -= 1;
      if (keysPressed.current.has('arrowright') || keysPressed.current.has('d') || keysPressed.current.has('в'))
        inputX += 1;
      if (keysPressed.current.has('arrowup') || keysPressed.current.has('w') || keysPressed.current.has('ц'))
        inputY -= 1;
      if (keysPressed.current.has('arrowdown') || keysPressed.current.has('s') || keysPressed.current.has('ы'))
        inputY += 1;

      const inputLen = Math.sqrt(inputX * inputX + inputY * inputY);
      if (inputLen > 0) {
        inputX /= inputLen;
        inputY /= inputLen;
      }

      antennaVelocity.current.x += inputX * ACCELERATION * delta;
      antennaVelocity.current.y += inputY * ACCELERATION * delta;

      const damp = Math.exp(-DAMPING_K * delta);
      antennaVelocity.current.x *= damp;
      antennaVelocity.current.y *= damp;

      const speed = Math.sqrt(
        antennaVelocity.current.x ** 2 + antennaVelocity.current.y ** 2
      );
      if (speed > MAX_SPEED) {
        antennaVelocity.current.x *= MAX_SPEED / speed;
        antennaVelocity.current.y *= MAX_SPEED / speed;
      }

      antennaRef.current.x += antennaVelocity.current.x * delta;
      antennaRef.current.y += antennaVelocity.current.y * delta;

      if (antennaRef.current.x > BOUNDS) {
        antennaRef.current.x = BOUNDS;
        antennaVelocity.current.x *= -0.3;
      }
      if (antennaRef.current.x < -BOUNDS) {
        antennaRef.current.x = -BOUNDS;
        antennaVelocity.current.x *= -0.3;
      }
      if (antennaRef.current.y > BOUNDS) {
        antennaRef.current.y = BOUNDS;
        antennaVelocity.current.y *= -0.3;
      }
      if (antennaRef.current.y < -BOUNDS) {
        antennaRef.current.y = -BOUNDS;
        antennaVelocity.current.y *= -0.3;
      }

      // Движение сигнала
      if (!isInterference && !gameWon) {
        signalRef.current.x += signalVelocity.current.x * delta;
        signalRef.current.y += signalVelocity.current.y * delta;

        signalVelocity.current.x += (Math.random() - 0.5) * stage.signalDrift * 1.6 * delta;
        signalVelocity.current.y += (Math.random() - 0.5) * stage.signalDrift * 1.6 * delta;

        signalVelocity.current.x *= Math.exp(-1.5 * delta);
        signalVelocity.current.y *= Math.exp(-1.5 * delta);

        const sigSpeed = Math.sqrt(
          signalVelocity.current.x ** 2 + signalVelocity.current.y ** 2
        );
        if (sigSpeed > stage.signalDrift) {
          signalVelocity.current.x *= stage.signalDrift / sigSpeed;
          signalVelocity.current.y *= stage.signalDrift / sigSpeed;
        }

        if (now - lastSignalJumpTime.current > stage.signalJumpInterval) {
          lastSignalJumpTime.current = now;
          
          const jumpRange = BOUNDS * (1.5 + stage.minPackets / 100);
          const newX = (Math.random() - 0.5) * jumpRange;
          const newY = (Math.random() - 0.5) * jumpRange;
          signalRef.current.x = Math.max(-BOUNDS, Math.min(BOUNDS, newX));
          signalRef.current.y = Math.max(-BOUNDS, Math.min(BOUNDS, newY));
          signalVelocity.current.x = (Math.random() - 0.5) * stage.signalDrift * 0.6;
          signalVelocity.current.y = (Math.random() - 0.5) * stage.signalDrift * 0.6;

          addTelemetry('⚠ SIGNAL TRAJECTORY SHIFT DETECTED', 'warning');
        }
      }

      signalRef.current.x = Math.max(-BOUNDS, Math.min(BOUNDS, signalRef.current.x));
      signalRef.current.y = Math.max(-BOUNDS, Math.min(BOUNDS, signalRef.current.y));

      updateElementPosition(antennaElRef.current, antennaRef.current.x, antennaRef.current.y);
      updateElementPosition(signalElRef.current, signalRef.current.x, signalRef.current.y);

      const dx = antennaRef.current.x - signalRef.current.x;
      const dy = antennaRef.current.y - signalRef.current.y;
      const distanceToReal = Math.sqrt(dx * dx + dy * dy);

      let isOnFake = false;
      if (fakeRef.current.active) {
        const fakeDx = antennaRef.current.x - fakeRef.current.x;
        const fakeDy = antennaRef.current.y - fakeRef.current.y;
        const distanceToFake = Math.sqrt(fakeDx * fakeDx + fakeDy * fakeDy);
        isOnFake = distanceToFake < CAPTURE_RADIUS;
      }

      let newStrength = 0;

      if (isOnFake) {
        newStrength = 40;
        packetsRef.current = Math.max(0, packetsRef.current - delta * 2);
        needsPacketUpdate = true;
        if (Math.random() < 0.05) {
          addTelemetry('⚠ LOCKED ON FALSE SIGNAL', 'error');
        }
      } else {
        if (distanceToReal < CAPTURE_RADIUS) {
          newStrength = 85 + Math.random() * 15;
          packetsRef.current = Math.min(100, packetsRef.current + delta * 9);
          needsPacketUpdate = true;
          
          if (packetsRef.current >= 100) {
            setGameWon(true);
            setGameOver(true);
            addTelemetry('✓ TRANSMISSION COMPLETE', 'success');
            addTelemetry('✓ ALL 100 PACKETS RECOVERED', 'success');
            if (onWin) onWin();
          }
        } else {
          const strengthPercent = Math.max(
            0,
            100 - (distanceToReal / MAX_STRENGTH_DISTANCE) * 100
          );
          newStrength = Math.min(70, strengthPercent);

          if (distanceToReal > CAPTURE_RADIUS * 1.5) {
            packetsRef.current = Math.max(0, packetsRef.current - delta * stage.packetDecayRate);
            needsPacketUpdate = true;
          }
        }
      }

      if (isInterference) {
        newStrength *= stage.maxStrengthReduction;
      }

      newStrength = Math.max(0, Math.min(100, newStrength));
      strengthRef.current = newStrength;
      needsStrengthUpdate = true;

      if (now - lastStrengthCalc.current > 100) {
        lastStrengthCalc.current = now;
        generateSpectrum(newStrength);
      }

      // Батчинг обновлений React
      if (now - lastReactUpdate > REACT_UPDATE_INTERVAL) {
        lastReactUpdate = now;
        if (needsPacketUpdate) {
          setPackets(Math.floor(packetsRef.current));
          needsPacketUpdate = false;
        }
        if (needsStrengthUpdate) {
          setSignalStrength(Math.floor(strengthRef.current));
          needsStrengthUpdate = false;
        }
      }

      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [screen, gameOver, gameWon, isInterference, addTelemetry, generateSpectrum, checkStageChange, onWin]);

  // Таймер
  useEffect(() => {
    if (screen !== 'game' || gameOver || gameWon) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          addTelemetry('✗ SIGNAL LOST - MISSION FAILED', 'error');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, gameOver, gameWon, addTelemetry]);

  // Расшифровка
  useEffect(() => {
    if (gameWon && !showDecoding) {
      setShowDecoding(true);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 1.5;
        setDecodingProgress(progress);

        VOYAGER_DATA.forEach((data) => {
          if (
            data.progress <= progress &&
            !decodedMessages.find((m) => m.content === data.content)
          ) {
            setDecodedMessages((prev) => [
              ...prev,
              { id: Date.now(), content: data.content },
            ]);
          }
        });

        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 70);

      return () => clearInterval(interval);
    }
  }, [gameWon, showDecoding, decodedMessages]);

  return {
    screen,
    novelStep,
    antennaElRef,
    signalElRef,
    fakeSignalElRef,
    fakeSignal,
    packets,
    totalPackets: 100,
    signalStrength,
    timeLeft,
    gameOver,
    gameWon,
    showTutorial,
    isInterference,
    isDisconnected,
    showDisconnectWarning,
    spectrum,
    telemetryLog,
    decodedMessages,
    showDecoding,
    decodingProgress,
    currentStage,
    stageWarning,
    nextNovel,
    goToBriefing,
    startGame,
  };
};