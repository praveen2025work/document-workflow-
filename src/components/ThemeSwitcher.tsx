import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Moon, Sun, Palette } from 'lucide-react';

type Theme = 'light' | 'dark' | 'blue';

const themes = [
  { id: 'light' as Theme, name: 'Light', icon: Sun },
  { id: 'dark' as Theme, name: 'Dark', icon: Moon },
  { id: 'blue' as Theme, name: 'Blue', icon: Palette },
];

const ThemeSwitcher: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme || 'light';
    applyTheme(savedTheme);
    setCurrentTheme(savedTheme);
  }, []);

  const applyTheme = (theme: Theme) => {
    // Remove all theme classes
    document.documentElement.classList.remove('dark', 'theme-blue');
    
    // Apply new theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'blue') {
      document.documentElement.classList.add('theme-blue');
    }
    
    localStorage.setItem('theme', theme);
  };

  const handleThemeChange = (theme: Theme) => {
    applyTheme(theme);
    setCurrentTheme(theme);
  };

  const currentThemeData = themes.find(t => t.id === currentTheme) || themes[0];
  const CurrentIcon = currentThemeData.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <CurrentIcon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((theme) => {
          const Icon = theme.icon;
          return (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`flex items-center gap-2 cursor-pointer ${
                currentTheme === theme.id ? 'bg-accent' : ''
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{theme.name}</span>
              {currentTheme === theme.id && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;