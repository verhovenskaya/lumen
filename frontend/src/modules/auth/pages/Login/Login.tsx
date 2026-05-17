import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../../../../shared/components/Header/Header';
import styles from './Login.module.scss';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', { email, password });
    navigate('/profile');
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
          
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            
            <button type="submit" className={styles.submitButton}>
              Войти
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