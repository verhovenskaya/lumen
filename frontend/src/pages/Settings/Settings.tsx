import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../shared/components/Header/Header';
import { BurgerMenu } from '../../shared/components/BurgerMenu/BurgerMenu';
import { MenuContent } from '../../modules/missions/components/MenuContent/MenuContent';
import { useMenu } from '../../modules/missions/hooks/useMenu';
import styles from './Settings.module.scss';

export const Settings: React.FC = () => {
  const { isMenuOpen, toggleMenu } = useMenu();
  const navigate = useNavigate();
  const [quality, setQuality] = useState('high');
  const [musicVolume, setMusicVolume] = useState(70);
  const [sfxVolume, setSfxVolume] = useState(80);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.desktop} ${isMenuOpen ? styles.menuOpen : ''}`}>
        <div className={styles.background} />
        <div className={styles.overlay} />

        <Header />
        <BurgerMenu isOpen={isMenuOpen} onToggle={toggleMenu} />
        
        <button className={styles.backButton} onClick={() => navigate('/')}>
          ← Назад
        </button>
        
        <h1 className={styles.pageTitle}>НАСТРОЙКИ</h1>
        
        <div className={styles.settingsContainer}>

          {/* графика */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Качество графики</h3>
            <div className={styles.options}>
              <button className={`${styles.option} ${quality === 'low' ? styles.active : ''}`} onClick={() => setQuality('low')}>Низкое</button>
              <button className={`${styles.option} ${quality === 'medium' ? styles.active : ''}`} onClick={() => setQuality('medium')}>Среднее</button>
              <button className={`${styles.option} ${quality === 'high' ? styles.active : ''}`} onClick={() => setQuality('high')}>Высокое</button>
            </div>
          </div>

          {/* звук */}
          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>
              <span className={styles.icon}>🎵</span> Музыка
            </span>
            <input type="range" min="0" max="100" value={musicVolume} onChange={(e) => setMusicVolume(Number(e.target.value))} className={styles.slider} />
            <span className={styles.sliderValue}>{musicVolume}%</span>
          </div>
          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>
              <span className={styles.icon}>🔊</span> Эффекты
            </span>
            <input type="range" min="0" max="100" value={sfxVolume} onChange={(e) => setSfxVolume(Number(e.target.value))} className={styles.slider} />
            <span className={styles.sliderValue}>{sfxVolume}%</span>
          </div>

          {/* отображение */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Отображение</h3>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Показывать орбиты</span>
              <button className={`${styles.toggle} ${showOrbits ? styles.toggleOn : styles.toggleOff}`} onClick={() => setShowOrbits(!showOrbits)}>
                <span className={styles.toggleKnob} />
              </button>
            </div>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Подписи планет</span>
              <button className={`${styles.toggle} ${showLabels ? styles.toggleOn : styles.toggleOff}`} onClick={() => setShowLabels(!showLabels)}>
                <span className={styles.toggleKnob} />
              </button>
            </div>
          </div>
        </div>
        
        {isMenuOpen && <MenuContent onClose={toggleMenu} />}
      </div>
    </div>
  );
};