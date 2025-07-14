import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from './Login.module.css';

export const Login = () => {
  const { login , } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      navigate("/");
    } else {
      setError("Неверный логин или пароль");
    }
  };

  return (
    <div className={styles.loginContainer}>
     
      <form onSubmit={handleSubmit} className={styles.loginForm}>
         <div className={styles.logo}>
              <p>Анро<span>Тех</span>Групп</p>
            </div>
        <h2>Вход</h2>
        {error && <p className={styles.error}>{error}</p>}
        <input type="text" placeholder="Логин" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Войти</button>
        <button onClick={(e)=>{
          e.preventDefault()
          navigate('/guest')}} className={styles.buttonGuest}>Войти как гость</button>
      </form>
    </div>
  );
};