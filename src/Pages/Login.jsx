import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Loading } from "../components/Loading";
import { validateUsername, validatePassword } from "../utils/validation";
import styles from './Login.module.css';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with:', { username, password });
    
    setIsLoading(true);
    setErrors({});
    
    // Валидация полей
    const usernameValidation = validateUsername(username);
    const passwordValidation = validatePassword(password);
    
    console.log('Validation results:', { usernameValidation, passwordValidation });
    
    if (!usernameValidation.isValid || !passwordValidation.isValid) {
      setErrors({
        username: usernameValidation.isValid ? '' : usernameValidation.message,
        password: passwordValidation.isValid ? '' : passwordValidation.message
      });
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Calling login function...');
      const result = await login(username, password);
      console.log('Login result:', result);
      
      if (result.success) {
        showSuccess(result.message);
        navigate("/");
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      showError("Произошла непредвиденная ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <div className={styles.logo}>
          <p>Анро<span>Тех</span>Групп</p>
        </div>
        <h2>Вход</h2>
        
        <div className={styles.inputGroup}>
          <label htmlFor="username" className={styles.srOnly}>Логин</label>
          <input 
            id="username"
            type="text" 
            placeholder="Логин" 
            value={username} 
            onChange={e => {
              setUsername(e.target.value);
              if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
            }}
            disabled={isLoading}
            required
            className={errors.username ? styles.inputError : ''}
            aria-describedby={errors.username ? "username-error" : undefined}
            aria-invalid={!!errors.username}
          />
          {errors.username && (
            <span id="username-error" className={styles.errorMessage} role="alert">
              {errors.username}
            </span>
          )}
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.srOnly}>Пароль</label>
          <input 
            id="password"
            type="password" 
            placeholder="Пароль" 
            value={password} 
            onChange={e => {
              setPassword(e.target.value);
              if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
            }}
            disabled={isLoading}
            required
            className={errors.password ? styles.inputError : ''}
            aria-describedby={errors.password ? "password-error" : undefined}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <span id="password-error" className={styles.errorMessage} role="alert">
              {errors.password}
            </span>
          )}
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? <Loading size="small" text="" /> : "Войти"}
        </button>
        
        <button 
          onClick={(e) => {
            e.preventDefault();
            navigate('/guest');
          }} 
          className={styles.buttonGuest}
          disabled={isLoading}
        >
          Войти как гость
        </button>
      </form>
    </div>
  );
};