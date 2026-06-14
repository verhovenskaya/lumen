import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../../../shared/components/Header/Header';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../../auth/hooks/useAuth';
import styles from './Profile.module.scss';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, stats, loading, error, uploadAvatar, refreshProfile } = useProfile();
  const { logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadAvatar(file);
        refreshProfile();
      } catch (err) {
        console.error('Avatar upload error:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.background} />
        <div className={styles.overlay} />
        <div className={styles.container}>
          <div className={styles.card}>
            <p className={styles.userName}>Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.background} />
        <div className={styles.overlay} />
        <div className={styles.container}>
          <div className={styles.card}>
            <p className={styles.userName}>Ошибка: {error}</p>
            <button onClick={refreshProfile} className={styles.actionButton}>
              Повторить
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '2024';
    return new Date(dateString).getFullYear().toString();
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
            <div className={styles.avatar} onClick={handleAvatarClick}>
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Аватар" className={styles.avatarImage} />
              ) : (
                <span className={styles.avatarPlaceholder}>
                  {profile?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <button className={styles.changeAvatar} onClick={handleAvatarClick}>
              Изменить фото
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
          
          {/* имя */}
          <h2 className={styles.userName}>{profile?.username || 'Пользователь'}</h2>
          <p className={styles.userEmail}>{profile?.email || 'email@example.com'}</p>
          
          <div className={styles.divider} />
          
          {/* статистика */}
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats?.favoriteMissions || 0}</span>
              <span className={styles.statLabel}>Избранное</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {stats?.completedMissions || 0}/{stats?.totalMissions || 0}
              </span>
              <span className={styles.statLabel}>Миссии</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{formatDate(profile?.createdAt)}</span>
              <span className={styles.statLabel}>Год</span>
            </div>
          </div>
          
          <div className={styles.divider} />
          
          {/* кнопки */}
          <div className={styles.actions}>
            <button className={styles.actionButton}>Редактировать профиль</button>
            <button className={styles.logoutButton} onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};