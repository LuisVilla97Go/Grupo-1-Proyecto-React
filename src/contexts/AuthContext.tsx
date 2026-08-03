/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { type User } from "../types";
import { fetchFromLocalAPI, saveToLocalAPI } from "../services/api";

interface AuthContextType {
  user: User | null;
  users: User[];
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  createUser: (newUser: User) => boolean;
  deleteUser: (username: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar usuario activo y sembrar lista de usuarios desde la API si no existe en localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Cargar sesión activa
      const savedUser = localStorage.getItem("dash_user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem("dash_user");
        }
      }

      // 2. Fetch users directly from API (source of truth)
      const data = await fetchFromLocalAPI("users.json");
      if (data) {
        setUsers(data);
        localStorage.setItem("dash_all_users", JSON.stringify(data));
      } else {
        // Fallback to localStorage if API fails
        const savedAllUsers = localStorage.getItem("dash_all_users");
        if (savedAllUsers) {
          try {
            setUsers(JSON.parse(savedAllUsers));
          } catch {
            // silent
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    // Buscar en el estado local de usuarios (que incluye los creados dinámicamente)
    const foundUser = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase(),
    );

    // Contraseña es el mismo username exacto
    if (foundUser && foundUser.username === password) {
      setUser(foundUser);
      localStorage.setItem("dash_user", JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("dash_user");
  };

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem("dash_all_users", JSON.stringify(newUsers));

    saveToLocalAPI("save-users", newUsers);
  };

  const createUser = (newUser: User): boolean => {
    // Validar duplicado
    const exists = users.some(
      (u) => u.username.toLowerCase() === newUser.username.trim().toLowerCase(),
    );
    if (exists) return false;

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    return true;
  };

  const deleteUser = (username: string) => {
    const updatedUsers = users.filter((u) => u.username !== username);
    saveUsers(updatedUsers);

    // Si el usuario borrado es el logueado actualmente, cerrar sesión
    if (user?.username === username) {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        loading,
        login,
        logout,
        createUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
