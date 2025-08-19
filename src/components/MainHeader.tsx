import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import UserInfo from '@/components/UserInfo';
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
          <UserInfo />
          <ThemeSwitcher />
        </div>
      </div>
    </motion.header>
  );
};

export default MainHeader;