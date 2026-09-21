import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { INITIAL_USER } from '../../services/mockData';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const STORAGE_KEY = 'aura_auth_state_v1';

const getInitialAuthState = (): AuthState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user,
        token: parsed.token,
        isAuthenticated: !!parsed.user,
        loading: false,
      };
    }
  } catch {
    // fallback
  }

  return {
    user: INITIAL_USER,
    token: 'jwt-demo-token-12345',
    isAuthenticated: true,
    loading: false,
  };
};

const initialState: AuthState = getInitialAuthState();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
      } catch {
        // ignore
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: state.user, token: state.token }));
        } catch {
          // ignore
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
