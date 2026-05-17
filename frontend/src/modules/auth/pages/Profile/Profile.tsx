import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../../../shared/components/Header/Header';
import styles from './Profile.module.scss';

export const Profile: React.FC = () => {
  const navigate = useNavigate();

  //заглушка 
  const user = {
    name: 'Исследователь',
    email: 'explorer@lumen.space',
    avatar: null,
    joined: '2024',
    favorites: 12,
    missions: 3,
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.background} />
      <div className={styles.overlay} />
      
      <Header />
      
      <button className={styles.backButton} onClick={() => navigate('/')}>
        ← Назад
      </button>

      <div className={styles.container}>
        <div className={styles.card}>
          {/* аватар */}
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {user.avatar ? (
                <img src={user.avatar} alt="Аватар" className={styles.avatarImage} />
              ) : (
                <span className={styles.avatarPlaceholder}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button className={styles.changeAvatar}>Изменить фото</button>
          </div>
          
          {/* имя */}
          <h2 className={styles.userName}>{user.name}</h2>
          <p className={styles.userEmail}>{user.email}</p>
          
          <div className={styles.divider} />
          
          {/* статистика */}
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{user.favorites}</span>
              <span className={styles.statLabel}>Избранное</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{user.missions}</span>
              <span className={styles.statLabel}>Миссии</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{user.joined}</span>
              <span className={styles.statLabel}>Год</span>
            </div>
          </div>
          
          <div className={styles.divider} />
          
          {/* кнопки */}
          <div className={styles.actions}>
            <button className={styles.actionButton}>Редактировать профиль</button>
            <button className={styles.logoutButton} onClick={() => navigate('/login')}>
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};