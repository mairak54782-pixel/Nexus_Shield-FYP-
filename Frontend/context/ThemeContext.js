import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // default dark

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('appTheme');
      if (saved !== null) {
        setIsDark(saved === 'dark');
      }
    } catch (e) {}
  };

  const toggleTheme = async () => {
    const newMode = !isDark;
    setIsDark(newMode);
    await AsyncStorage.setItem('appTheme', newMode ? 'dark' : 'light');
  };

  const theme = {
    dark: {
      gradient: ['#121026', '#1e1a3a'],
      background: '#121026',
      text: '#FFFFFF',
      card: '#1e1a3a',
      cardBorder: 'rgba(0, 210, 255, 0.2)',
      border: 'rgba(255,255,255,0.1)',
      accent: '#00d2ff',
      inputBg: 'rgba(0, 0, 0, 0.2)',
      placeholder: 'rgba(255,255,255,0.4)',
      statusBar: 'light-content',
      avatarBg: '#00d2ff',
      headerBg: 'transparent',
    },
    light: {
      gradient: ['#F8FAFC', '#E2E8F0'],   // light gray gradient
      background: '#F8FAFC',
      text: '#1E293B',                    // dark slate
      card: '#FFFFFF',                    // pure white card
      cardBorder: '#E2E8F0',              // soft border
      border: '#CBD5E1',
      accent: '#0891b2',                  // teal/blue accent
      inputBg: '#F1F5F9',
      placeholder: '#94A3B8',
      statusBar: 'dark-content',
      avatarBg: '#0891b2',
      headerBg: '#FFFFFF',
    },
  };

  const current = isDark ? theme.dark : theme.light;

  return (
    <ThemeContext.Provider value={{ theme: current, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);