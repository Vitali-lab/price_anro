// Главная страница приложения
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import styles from "./MainPage.module.css";
import { motion } from "framer-motion";
import { UploadFile } from '../components/UploadFile';
import { useCreateLoadJson } from '../hooks/use-create-load-json';
export const MainPage = () => {
  const { currentUser, isAdmin } = useAuth();
  const { handleFileUpload } = useCreateLoadJson();

  return (
    <div className={styles.mainContainer}>
      <motion.h1 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className={styles.welcomeTitle}
      >
        Добро пожаловать, {currentUser?.name || "Гость"}!
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4, duration: 0.5 }}
        className={styles.subtitle}
      >
        Вы находитесь в системе компании "АнроТехГрупп" — платформе для поиска, учета и бронирования фильтров.
      </motion.p>


      <div className={styles.grid}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link to="/filters" className={styles.card}>
            <div className={styles.cardIcon}>🔍</div>
            <h3>Поиск фильтров</h3>
            <p>Поиск по артикулу, названию и аналогам с учетом остатков и цен.</p>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Link to="/reserves" className={styles.card}>
            <div className={styles.cardIcon}>📦</div>
            <h3>Мои резервы</h3>
            <p>Управление созданными резервами и контроль сроков хранения.</p>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link to="/contragents" className={styles.card}>
            <div className={styles.cardIcon}>👥</div>
            <h3>Контрагенты</h3>
            <p>Управление базой контрагентов, добавление и редактирование данных.</p>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link to="/profile" className={styles.card}>
            <div className={styles.cardIcon}>👤</div>
            <h3>Профиль</h3>
            <p>Настройки аккаунта, смена имени и аватара.</p>
          </Link>
        </motion.div>
      </div>
       {isAdmin && (
          <div className={styles.adminSection}>
            <h2 className={styles.adminTitle}>Панель администратора</h2>
            <div className={styles.cardUpload}>
              <UploadFile handleFileUpload={handleFileUpload} />
            </div>
          </div>
        )}
    </div>
  );
};
