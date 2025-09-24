import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { 
  Workflow, 
  Calendar, 
  Users, 
  Shield,
  BarChart3, 
  LayoutDashboard,
  ChevronRight,
  Layers,
  FileText,
  MessageSquare,
  Sparkles,
  Settings,
  PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  description: string;
  category?: 'dashboard' | 'design' | 'manage';
}

const navigationItems: NavigationItem[] = [
  {
    id: 'user-dashboard',
    label: 'User Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    description: 'Task management and execution',
    category: 'dashboard'
  },
  {
    id: 'process-owner-dashboard',
    label: 'Process Owner Dashboard',
    icon: BarChart3,
    path: '/monitoring',
    description: 'Monitor workflow execution',
    category: 'dashboard'
  },
  {
    id: 'queries',
    label: 'Query Management',
    icon: MessageSquare,
    path: '/queries',
    description: 'Manage and track queries',
    category: 'dashboard'
  },
  {
    id: 'workflow-designer',
    label: 'Workflow Designer',
    icon: Workflow,
    path: '/',
    description: 'Create and manage workflows',
    category: 'design'
  },
  {
    id: 'canvas-workflow',
    label: 'Canvas Workflow',
    icon: Layers,
    path: '/canvas-workflow',
    description: 'Visualize running workflow instances',
    category: 'design'
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: FileText,
    path: '/workflows',
    description: 'Manage and configure workflows',
    category: 'manage'
  },
  {
    id: 'calendars',
    label: 'Calendars',
    icon: Calendar,
    path: '/calendars',
    description: 'Manage calendar settings',
    category: 'manage'
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    path: '/users',
    description: 'User management',
    category: 'manage'
  },
  {
    id: 'roles',
    label: 'Roles',
    icon: Shield,
    path: '/roles',
    description: 'Manage user roles',
    category: 'manage'
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

  const groupedItems = navigationItems.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  const categoryLabels = {
    dashboard: 'Dashboard',
    design: 'Design',
    manage: 'Management'
  };

  const categoryIcons = {
    dashboard: PieChart,
    design: Sparkles,
    manage: Settings
  };

  return (
    <motion.aside
      ref={navRef}
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`${
        isCollapsed ? 'w-16' : 'w-72'
      } glass-dark border-r border-border/30 flex flex-col transition-all duration-300 shadow-2xl`}
    >
      {/* Modern Header */}
      <div className="p-6 border-b border-border/30">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <div className="p-2.5 rounded-2xl bg-gradient-primary shadow-glow">
                  <Workflow className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background animate-pulse" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">Workflow Hub</h2>
                <p className="text-xs text-muted-foreground font-medium">Modern Management</p>
              </div>
            </motion.div>
          )}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="p-2 h-9 w-9 rounded-xl hover:bg-muted/20 transition-all duration-200 hover:shadow-md"
            >
              <ChevronRight 
                className={`h-4 w-4 transition-all duration-300 ${
                  isCollapsed ? 'rotate-0' : 'rotate-180'
                }`} 
              />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Items with Categories */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => {
            const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
            
            return (
              <div key={category} className="space-y-2">
                {!isCollapsed && (
                  <div className="flex items-center gap-2 px-3 py-2">
                    {CategoryIcon && <CategoryIcon className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {categoryLabels[category as keyof typeof categoryLabels] || category}
                    </span>
                  </div>
                )}
                
                <div className="space-y-1">
                  {items.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <Tooltip key={item.id} delayDuration={isCollapsed ? 0 : 1000}>
                        <TooltipTrigger asChild>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Button
                              variant="ghost"
                              className={`w-full justify-start h-12 rounded-xl transition-all duration-200 ${
                                isCollapsed ? 'px-3' : 'px-4'
                              } ${
                                active 
                                  ? 'bg-primary/15 text-primary border border-primary/20 shadow-glow' 
                                  : 'hover:bg-muted/10 hover:shadow-soft border border-transparent'
                              } group relative overflow-hidden`}
                              onClick={() => handleNavigation(item.path)}
                            >
                              {/* Active indicator */}
                              {active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                              )}
                              
                              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} relative z-10`}>
                                <Icon className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ${
                                  active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                                }`} />
                                {!isCollapsed && (
                                  <span className={`text-sm font-medium truncate transition-colors duration-200 ${
                                    active ? 'text-primary' : 'text-foreground'
                                  }`}>
                                    {item.label}
                                  </span>
                                )}
                              </div>
                              
                              {/* Hover effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </Button>
                          </motion.div>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent side="right" className="ml-2 glass">
                            <div>
                              <p className="font-semibold">{item.label}</p>
                              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </nav>
      
      {/* Modern Footer */}
      <div className="p-4 border-t border-border/30">
        {!isCollapsed && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Workflow Management v2.0
            </p>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default LeftNavigation;