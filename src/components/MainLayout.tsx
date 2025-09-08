import React, { useState } from 'react';
import { useRouter } from 'next/router';
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
  const router = useRouter();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const toggleNavCollapse = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  // Check if current page is canvas-workflow
  const isCanvasWorkflow = router.pathname === '/canvas-workflow';

  return (
    <div className={`flex h-screen w-full relative z-20 ${isCanvasWorkflow ? 'bg-background' : 'bg-secondary/30'}`}>
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
        <main className={`flex-1 overflow-auto ${isCanvasWorkflow ? '' : 'bg-gradient-to-br from-secondary/20 to-muted/40'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;