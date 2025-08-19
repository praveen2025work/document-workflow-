import React, { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import LeftNavigation from '@/components/LeftNavigation';
import MainHeader from '@/components/MainHeader';

interface MainLayoutProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  title,
  subtitle,
  icon,
  headerActions,
  children
}) => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  const toggleNavCollapse = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full bg-background">
        {/* Left Navigation */}
        <LeftNavigation 
          isCollapsed={isNavCollapsed}
          onToggleCollapse={toggleNavCollapse}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <MainHeader 
            title={title}
            subtitle={subtitle}
            icon={icon}
          >
            {headerActions}
          </MainHeader>
          
          {/* Page Content */}
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MainLayout;