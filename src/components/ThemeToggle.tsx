
import React from 'react';
import { Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme } = useTheme();

  // This is now just a visual indicator with no toggle functionality
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="rounded-full w-9 h-9"
      aria-label="Dark theme"
      disabled
    >
      <Moon className="h-[1.2rem] w-[1.2rem] text-slate-800" />
    </Button>
  );
};

export default ThemeToggle;
