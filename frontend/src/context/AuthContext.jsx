import {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../services/authService";

import {
  connectSocket,
  disconnectSocket,
} from "../services/socketService";

export const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveAuth = (data) => {
    localStorage.setItem(
      "collabcanvas_token",
      data.token
    );

    localStorage.setItem(
      "collabcanvas_user",
      JSON.stringify(data.user)
    );

    setUser(data.user);
  };

  const register = async (userData) => {
    const data = await registerUser(userData);

    saveAuth(data);

    return data;
  };

  const login = async (credentials) => {
    const data = await loginUser(credentials);

    saveAuth(data);

    return data;
  };

  const logout = () => {
    disconnectSocket();

    localStorage.removeItem(
      "collabcanvas_token"
    );

    localStorage.removeItem(
      "collabcanvas_user"
    );

    setUser(null);
  };

  // --------------------------------------------------
  // RESTORE SESSION
  // --------------------------------------------------

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(
        "collabcanvas_token"
      );

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser();

        setUser(data.user);
      } catch (error) {
        console.error(
          "Session restore failed:",
          error.message
        );

        disconnectSocket();

        localStorage.removeItem(
          "collabcanvas_token"
        );

        localStorage.removeItem(
          "collabcanvas_user"
        );

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // --------------------------------------------------
  // SOCKET CONNECTION
  // --------------------------------------------------

  useEffect(() => {
    if (!user) {
      return;
    }

    console.log(
      "🔌 Starting realtime connection for:",
      user.name
    );

    connectSocket(user);

    return () => {
      disconnectSocket();
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;