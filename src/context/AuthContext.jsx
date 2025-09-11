import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from '../fireBase/fireBase-get-users'

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [users, setUsers] = useState([]) 
  const [currentUser, setCurrentUser] = useState({})
  const [isLoading, setIsLoading] = useState(true);    
  const navigate = useNavigate()     

  const loadUsers = async () => {
    try {
      const usersFromData = await getAllUsers()
      setUsers(usersFromData)
      return usersFromData; // Возвращаем загруженных пользователей
    } catch (error) {
      console.error("Error loading users:", error);
      return [];
    }
  }

  useEffect(() => {
    // Загружаем пользователей при инициализации
    loadUsers();
  }, []);

  useEffect(() => {
    console.log('Loaded users:', users);
  }, [users]);

  useEffect(() => {
    const checkAuth = async () => {
      const stored = localStorage.getItem("authData");
      
      if (stored) {
        const user = JSON.parse(stored);
        const loadedUsers = await loadUsers(); // Ждем загрузки пользователей
        
        // Проверяем, есть ли пользователь в загруженном списке
        const foundUser = loadedUsers.find(u => u.id === user.id);
        
        if (foundUser) {
          setCurrentUser(foundUser);
          setIsAuth(true);
          setIsAdmin(!!foundUser.isAdmin);
        } else {
          // Если пользователь не найден, разлогиниваем
          localStorage.removeItem("authData");
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      // Валидация входных данных
      if (!username?.trim() || !password?.trim()) {
        throw new Error("Логин и пароль не могут быть пустыми");
      }

      console.log('Attempting login for:', username);
      
      // Если users пуст, загружаем заново
      const usersToCheck = users.length > 0 ? users : await loadUsers();
      
      console.log('Available users:', usersToCheck);
      
      const foundUser = usersToCheck.find(
        (el) => el.login === username && String(el.password) === String(password)
      );

      console.log('Found user:', foundUser);

      if (foundUser) {
        setCurrentUser(foundUser);
        setIsAuth(true);
        setIsAdmin(!!foundUser.isAdmin);
        navigate('/')
        localStorage.setItem("authData", JSON.stringify(foundUser));
        return { success: true, message: "Успешный вход в систему" };
      }

      return { success: false, message: "Неверный логин или пароль" };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        message: error.message || "Произошла ошибка при входе в систему" 
      };
    }
  };
  
  const logout = () => {
    setIsAuth(false);
    setIsAdmin(false);
    setCurrentUser(null);
    navigate("/login");
    localStorage.removeItem("authData");
  };

  return (
    <AuthContext.Provider value={{ 
      isAuth, 
      isAdmin, 
      login, 
      logout,
      currentUser,
      users, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);