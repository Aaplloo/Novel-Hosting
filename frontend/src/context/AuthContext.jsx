import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    case 'LOGOUT':
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'TOKEN_SET':
        return {
            ...state,
            token: action.payload,
        }
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    user: null,
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (localStorage.token) {
        setAuthToken(localStorage.token);
        loadUser();
    }
  }, []);

  // Load User
  const loadUser = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me');
      dispatch({ type: 'USER_LOADED', payload: res.data });
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  // Login User
  const login = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData, config);
      const token = res.data.token;
      localStorage.setItem('token', token);
      dispatch({ type: 'TOKEN_SET', payload: token });
      setAuthToken(token);
      await loadUser();
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      throw err; // re-throw error to be caught in the component
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;