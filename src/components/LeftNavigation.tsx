import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { 
  Workflow, 
  Calendar, 
  Users, 
  UserCheck, 
  BarChart3, 
  LayoutDashboard,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'workflow-designer',
    label: 'Workflow Designer',
    icon: Workflow,
    path: '/',
    description: 'Create and manage workflows'
  },
  {
    id: 'canvas-workflow',
    label: 'Canvas Workflow',
    icon: Layers,
    path: '/canvas-workflow',
    description: 'Visualize running workflow instances'
  },
  {
    id: 'calendars',
    label: 'Calendars',
    icon: Calendar,
    path: '/calendars',
    description: 'Manage calendar settings'
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    path: '/users',
    description: 'User management'
  },
  {
    id: 'user-groups',
    label: 'User Groups',
    icon: UserCheck,
    path: '/user-groups',
    description: 'Manage user groups and roles'
  },
  {
    id: 'process-owner-dashboard',
    label: 'Process Owner Dashboard',
    icon: BarChart3,
    path: '/monitoring',
    description: 'Monitor workflow execution'
  },
  {
    id: 'user-dashboard',
    label: 'User Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    description: 'Task management and execution'
  }
];

interface LeftNavigationProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const LeftNavigation: React.FC<LeftNavigationProps> = ({ 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);

  // Handle clicks outside the navigation to auto-collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navRef.current && 
        !navRef.current.contains(event.target as Node) && 
        !isCollapsed && 
        onToggleCollapse
      ) {
        onToggleCollapse();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCollapsed, onToggleCollapse]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(path);
  };

  return (
    <motion.aside
      ref={navRef}
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } glass border-r border-border/50 flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Workflow className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Workflow Manager</h2>
                <p className="text-xs text-muted-foreground">Navigation</p>
              </div>
            </div>
          )}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="p-1 h-8 w-8"
            >
              <ChevronRight 
                className={`h-4 w-4 transition-transform ${
                  isCollapsed ? 'rotate-0' : 'rotate-180'
                }`} 
              />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Tooltip key={item.id} delayDuration={isCollapsed ? 0 : 1000}>
                <TooltipTrigger asChild>
                  <Button
                    variant={active ? "default" : "ghost"}
                    className={`w-full justify-start h-12 ${
                      isCollapsed ? 'px-3' : 'px-4'
                    } ${
                      active 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
                    {!isCollapsed && (
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    )}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="ml-2">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>
      </nav>
    </motion.aside>
  );
};

export default LeftNavigation;