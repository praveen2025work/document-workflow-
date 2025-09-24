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
        <Button 
          variant="outline" 
          size="icon" 
          className="relative bg-background/80 border-border/60 hover:bg-muted/80 hover:border-border transition-all duration-200"
        >
          <CurrentIcon className="h-5 w-5 text-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 glass border-border/60">
        {themes.map((theme) => {
          const Icon = theme.icon;
          return (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`flex items-center gap-3 cursor-pointer transition-all duration-200 ${
                currentTheme === theme.id 
                  ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                  : 'hover:bg-muted/50 text-foreground'
              }`}
            >
              <Icon className={`h-4 w-4 ${
                currentTheme === theme.id ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <span className="font-medium">{theme.name}</span>
              {currentTheme === theme.id && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;