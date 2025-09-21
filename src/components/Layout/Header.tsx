import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Globe, Wifi, WifiOff, LogOut } from 'lucide-react';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { state: authState, logout } = useAuth();
  const { state: appState, syncData } = useApp();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'pa' : 'en');
  };

  const handleSync = async () => {
    if (appState.isOnline) {
      await syncData();
    }
  };

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <h1>HealthPortal</h1>
          </div>
          
          <div className={styles.headerActions}>
            <button 
              className={styles.langToggle} 
              onClick={toggleLanguage}
              title="Toggle Language"
            >
              <Globe size={20} />
              <span>{i18n.language.toUpperCase()}</span>
            </button>
            
            <div className={styles.statusIndicator}>
              {appState.isOnline ? (
                <Wifi size={20} className="status-online" />
              ) : (
                <WifiOff size={20} className="status-offline" />
              )}
              <span className={appState.isOnline ? "status-online" : "status-offline"}>
                {appState.isOnline ? 'Online' : t('offline')}
              </span>
            </div>
            
            {appState.pendingSync.length > 0 && (
              <button 
                className="btn btn-warning btn-sm" 
                onClick={handleSync}
                disabled={!appState.isOnline}
              >
                {t('sync')} ({appState.pendingSync.length})
              </button>
            )}
            
            {authState.user && (
              <>
                <div className={styles.userInfo}>
                  <span>{authState.user.name}</span>
                  <span className={styles.userRole}>({authState.user.role})</span>
                  <button 
                    className="btn btn-outline btn-sm" 
                    onClick={logout}
                    title={t('logout')}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;