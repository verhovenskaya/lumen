import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../../../../shared/components/Header/Header';
import { useAuth } from '../../hooks/useAuth';
import styles from './Register.module.scss';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      await register(username, password);
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Ошибка при регистрации');
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
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
          <h1 className={styles.title}>РЕГИСТРАЦИЯ</h1>
          <p className={styles.subtitle}>Присоединяйтесь к LUMEN</p>
          
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Имя пользователя</label>
              <input
                type="text"
                className={styles.input}
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Пароль</label>
              <input
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Подтверждение пароля</label>
              <input
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          
          <p className={styles.switchText}>
            Уже есть аккаунт?{' '}
            <Link to="/login" className={styles.link}>
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};