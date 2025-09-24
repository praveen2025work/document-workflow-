import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="glass border-b border-border/30 px-8 py-5 shadow-soft"
    >
      <div className="flex items-center justify-between">
        {/* Left side - Screen info and actions */}
        <div className="flex items-center gap-6">
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {Icon && (
              <div className="relative">
                <div className="p-3 rounded-2xl bg-gradient-primary shadow-glow">
                  <Icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background animate-pulse" />
              </div>
            )}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground font-medium">{subtitle}</p>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Right side - User info and theme */}
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Separator orientation="vertical" className="h-8 bg-border/50" />
            <UserInfo />
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default MainHeader;