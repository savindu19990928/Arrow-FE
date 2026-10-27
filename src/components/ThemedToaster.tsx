import React from 'react';
import { Toaster } from 'sonner';
import { useTheme } from '../contexts/ThemeContext';

export function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster position="bottom-right" theme={theme} toastOptions={{ style: { fontFamily: 'Geist, Inter, sans-serif' } }} />;
}