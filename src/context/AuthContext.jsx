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
console.log(users);

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
      // Если users пуст, загружаем заново
      const usersToCheck = users.length > 0 ? users : await loadUsers();
      
      const foundUser = usersToCheck.find(
        (el) => el.login === username && String(el.password) === String(password)
      );

      if (foundUser) {
        setCurrentUser(foundUser);
        setIsAuth(true);
        setIsAdmin(!!foundUser.isAdmin);
        navigate('/')
        localStorage.setItem("authData", JSON.stringify(foundUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
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