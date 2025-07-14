import { NavLink } from 'react-router-dom'
import styles from './Header.module.css'
import { useRef, useState,  } from 'react'
import { useAuth } from "../context/AuthContext";

export const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuth, isAdmin, logout, currentUser } = useAuth();
  const dropdownRef = useRef(null)
 

  const toggleDropdown = () => setDropdownOpen(prev => !prev)
  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev)

 

  


  return (
    <>
  {isAuth && (  <header className={styles.header}>
      <div className={styles.logo}>
        <p>Анро<span>Тех</span>Групп</p>
      </div>

      <button className={`${styles.burger} ${isMobileMenuOpen ? styles.open : ''}`} onClick={toggleMobileMenu}>
        <span></span><span></span><span></span>
      </button>

      <ul className={`${styles.navList} ${isMobileMenuOpen ? styles.open : ''}`}>
        <li><NavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>Главное меню</NavLink></li>
        <li><NavLink to="/filters" onClick={() => setIsMobileMenuOpen(false)}>Фильтры</NavLink></li>
        <li><NavLink to="/reserves" onClick={() => setIsMobileMenuOpen(false)}>Резервы</NavLink></li>
         {/* <li><NavLink to="/docs" onClick={() => setIsMobileMenuOpen(false)}>Документы</NavLink></li> */}

      </ul>

      <div className={styles.userSection}>
        <div className={styles.avatarBox} onClick={toggleDropdown}>
          <img src={currentUser.avatar} alt="avatar" className={styles.avatar} />
          <p className={styles.userName}>{currentUser.name} {currentUser.surname}</p>
        </div>
        {dropdownOpen &&   (
          <div className={styles.dropdown} ref={dropdownRef}>
            <p>{currentUser.name}</p>
            <p>{currentUser.email}</p>
            <p>{isAdmin ? "Администратор" : "Пользователь"}</p>
            <p><NavLink to="/profile">Личный кабинет</NavLink></p>
            <button className={styles.logout} onClick={logout}>Выйти</button>
            </div>
        )}
        
      </div>
    </header>)}
    </>
  )
}