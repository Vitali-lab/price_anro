import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  formatBirthday,
  calculateAge,
  daysUntilBirthday,
  getUpcomingBirthdays,
  getTodayBirthdays
} from '../utils/birthdayUtils';
import styles from './BirthdayNotifications.module.css';

export const BirthdayNotifications = () => {
  const { users, currentUser } = useAuth();
  const { showSuccess, showInfo } = useToast();
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [todayBirthdays, setTodayBirthdays] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (users && users.length > 0) {
      const upcoming = getUpcomingBirthdays(users);
      const today = getTodayBirthdays(users);

      setUpcomingBirthdays(upcoming);
      setTodayBirthdays(today);

      // Показываем уведомления о днях рождения сегодня
      if (today.length > 0) {
        today.forEach(user => {
          if (user.id === currentUser.id) {
            showSuccess(`🎉 Поздравляем! Сегодня ваш день рождения!`);
          } else {
            showSuccess(`🎉 Сегодня день рождения у ${user.name}!`);
          }
        });
      }

      // Показываем уведомления о ближайших днях рождения
      if (upcoming.length > 0) {
        upcoming.forEach(user => {
          const daysUntil = daysUntilBirthday(user.birthday);
          if (daysUntil <= 3 && daysUntil > 0) {
            if (user.id === currentUser.id) {
              showInfo(`📅 Через ${daysUntil} ${daysUntil === 1 ? 'день' : 'дня'} ваш день рождения!`);
            } else {
              showInfo(`📅 Через ${daysUntil} ${daysUntil === 1 ? 'день' : 'дня'} день рождения у ${user.name}`);
            }
          }
        });
      }
    }
  }, [users, showSuccess, showInfo, currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const getDaysText = (days) => {
    if (days === 0) return 'сегодня';
    if (days === 1) return 'завтра';
    if (days === 2) return 'послезавтра';
    return `через ${days} ${days < 5 ? 'дня' : 'дней'}`;
  };

  const getAgeText = (birthday) => {
    return calculateAge(birthday);
  };

  if (!users || users.length === 0) return null;

  const hasBirthdays = todayBirthdays.length > 0 || upcomingBirthdays.length > 0;

  return (
    <div className={styles.container}>
      <button
        ref={buttonRef}
        className={styles.toggleButton}
        onClick={toggleNotifications}
        title="Дни рождения"
      >
        🎂
        {todayBirthdays.length > 0 && (
          <span className={styles.todayCount}>{todayBirthdays.length}</span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={styles.notificationsPanel}
          >
            <div className={styles.header}>
              <h3>Дни рождения</h3>
              <button onClick={toggleNotifications} className={styles.closeButton} title="Закрыть">
                ×
              </button>
            </div>

            <div className={styles.content}>
              {todayBirthdays.length > 0 && (
                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>Сегодня</h4>
                  {todayBirthdays.map(user => (
                    <div key={user.id} className={styles.birthdayItem}>
                      <div className={styles.userInfo}>
                        <span className={styles.name}>
                          {user.id === currentUser.id ? 'Вы' : user.name}
                        </span>
                        <span className={styles.age}>
                          {getAgeText(user.birthday)}
                        </span>
                      </div>
                      <div className={styles.date}>
                        {formatBirthday(user.birthday)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {upcomingBirthdays.length > 0 && (
                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>Ближайшие</h4>
                  {upcomingBirthdays.map(user => (
                    <div key={user.id} className={styles.birthdayItem}>
                      <div className={styles.userInfo}>
                        <span className={styles.name}>
                          {user.id === currentUser.id ? 'Вы' : user.name}
                        </span>
                        <span className={styles.age}>
                          {getAgeText(user.birthday)}
                        </span>
                      </div>
                      <div className={styles.date}>
                        {formatBirthday(user.birthday)}
                      </div>
                      <div className={styles.daysUntil}>
                        {getDaysText(daysUntilBirthday(user.birthday))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
