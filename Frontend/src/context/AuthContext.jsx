
import {
  createContext,
  useContext,
  useState,
} from "react";

import {
  loginUser,
  logoutUser,
  getCurrentUser,
  isAuthenticated,
} from "../services/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    try {
      setLoading(true);

      const response = await loginUser(credentials);

      const loggedInUser = response.user || response.data?.user;

      if (!loggedInUser) {
        throw new Error("User information was not returned by the server");
      }

      setUser(loggedInUser);

      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user && isAuthenticated()),
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
