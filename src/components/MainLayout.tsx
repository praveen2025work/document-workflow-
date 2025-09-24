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
    <div className="flex h-screen w-full relative overflow-hidden">
      {/* Modern background with subtle patterns */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/5" />
      </div>
      
      {/* Left Navigation */}
      <div className="relative z-10">
        <LeftNavigation 
          isCollapsed={isNavCollapsed}
          onToggleCollapse={toggleNavCollapse}
        />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10">
        {/* Header */}
        <MainHeader 
          title={title}
          subtitle={subtitle}
          icon={icon}
        >
          {headerActions}
        </MainHeader>
        
        {/* Page Content */}
        <main className={`flex-1 min-h-0 relative ${
          isCanvasWorkflow 
            ? 'bg-transparent' 
            : 'bg-gradient-to-br from-background/50 to-secondary/10'
        }`}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <div className="relative z-10 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;