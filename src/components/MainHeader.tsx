import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUser } from '@/context/UserContext';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { config } from '@/lib/config';

interface MainHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
}

const MainHeader: React.FC<MainHeaderProps> = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  children 
}) => {
  const { user, loading, error } = useUser();

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass border-b border-border/50 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Left side - Screen info and actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          
          {/* Environment badge */}
          {config.features.debug && (
            <Badge variant="outline" className="ml-2">
              {config.app.env.toUpperCase()}
            </Badge>
          )}
          
          {/* Page-specific actions */}
          {children && (
            <div className="flex items-center gap-2 ml-4">
              {children}
            </div>
          )}
        </div>
        
        {/* Right side - User info and theme */}
        <div className="flex items-center gap-4">
          {/* User info */}
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading user...</div>
          ) : user ? (
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
              {error && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="destructive" className="text-xs">Mock</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Using mock user data - service unavailable</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Could not load user data.</div>
          )}
          
          {/* Theme switcher */}
          <ThemeSwitcher />
        </div>
      </div>
    </motion.header>
  );
};

export default MainHeader;