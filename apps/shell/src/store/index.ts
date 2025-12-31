import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Auth slice - minimal
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: true, // Stub for now
    token: 'fake-token',
  },
  reducers: {
    login: (state) => { state.isLoggedIn = true; },
    logout: (state) => { state.isLoggedIn = false; state.token = ''; },
  },
});

// User slice - minimal
const userSlice = createSlice({
  name: 'user',
  initialState: {
    id: '1',
    name: 'Venkatesh',
    email: 'venkatesh@example.com',
  },
  reducers: {
    setUser: (state, action: PayloadAction<{ name: string; email: string }>) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
    },
  },
});

// Preferences slice - minimal
const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: {
    theme: 'light' as 'light' | 'dark',
    units: 'metric' as 'metric' | 'imperial',
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setUnits: (state, action: PayloadAction<'metric' | 'imperial'>) => {
      state.units = action.payload;
    },
  },
});

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    user: userSlice.reducer,
    preferences: preferencesSlice.reducer,
  },
});

export const { login, logout } = authSlice.actions;
export const { setUser } = userSlice.actions;
export const { toggleTheme, setUnits } = preferencesSlice.actions;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
