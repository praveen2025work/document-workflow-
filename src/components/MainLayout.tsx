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
    <div className={`flex h-screen w-full relative z-20 ${isCanvasWorkflow ? 'bg-background' : 'bg-slate-50 dark:bg-slate-900'}`}>
      {/* Left Navigation */}
      <LeftNavigation 
        isCollapsed={isNavCollapsed}
        onToggleCollapse={toggleNavCollapse}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <MainHeader 
          title={title}
          subtitle={subtitle}
          icon={icon}
        >
          {headerActions}
        </MainHeader>
        
        {/* Page Content */}
        <main className={`flex-1 min-h-0 ${isCanvasWorkflow ? '' : 'bg-white dark:bg-slate-800'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;