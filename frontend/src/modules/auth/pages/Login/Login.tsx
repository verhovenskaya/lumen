import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../../../../shared/components/Header/Header';
import { useAuth } from '../../hooks/useAuth';
import styles from './Login.module.scss';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Ошибка при входе');
      console.error('Login error:', err);
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
          <h1 className={styles.title}>АВТОРИЗАЦИЯ</h1>
          <p className={styles.subtitle}>Добро пожаловать в LUMEN</p>
          
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
            
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          
          <p className={styles.switchText}>
            Нет аккаунта?{' '}
            <Link to="/register" className={styles.link}>
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};