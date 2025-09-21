import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import styles from './AuthForm.module.css';

const AuthForm: React.FC = () => {
  const { t } = useTranslation();
  const { login, signup, state } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient' as UserRole
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>HealthPortal</h1>
          <p>{isLogin ? t('welcomeBack') : t('createAccount')}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                {t('name')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              {t('email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              {t('password')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  required={!isLogin}
                />
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">
                  {t('selectRole')}
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="form-select"
                  required={!isLogin}
                >
                  <option value="patient">{t('patient')}</option>
                  <option value="chw">{t('chw')}</option>
                  <option value="doctor">{t('doctor')}</option>
                  <option value="pharmacy">{t('pharmacy')}</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={state.isLoading}
          >
            {state.isLoading ? (
              <>
                <div className="spinner" />
                {t('loading')}
              </>
            ) : (
              isLogin ? t('login') : t('signup')
            )}
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? t('signup') : t('login')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;