// Главная страница приложения
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import styles from "./MainPage.module.css";
import { motion } from "framer-motion";
import { UploadFile } from '../components/UploadFile'

export const MainPage = () => {
  const { currentUser, isAdmin } = useAuth();

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
        <Link to="/filters" className={styles.card}>
          <h3>🔍 Поиск фильтров</h3>
          <p>Поиск по артикулу, названию и аналогам с учетом остатков и цен.</p>
        </Link>

        <Link to="/reserves" className={styles.card}>
          <h3>📦 Мои резервы</h3>
          <p>Управление созданными резервами и контроль сроков хранения.</p>
        </Link>

        <Link to="/profile" className={styles.card}>
          <h3>👤 Профиль</h3>
          <p>Настройки аккаунта, смена имени и аватара.</p>
        </Link>

        {/* <Link to="/docs" className={styles.card}>
          <h3>📄 Генерация договоров</h3>
          <p>Создание договоров на основе шаблонов (временно недоступно).</p>
        </Link> */}
      </div>
       {isAdmin && (
          <div className={styles.cardUpload}>
            <p>Прикрепите файл для обновления остатков</p>
          <UploadFile />
          </div>
        )}
    </div>
  );
};
