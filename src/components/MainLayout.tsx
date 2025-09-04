import React, { useState } from 'react';
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
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const toggleNavCollapse = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  return (
    <div className="flex h-screen w-full bg-background relative z-20">
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
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;