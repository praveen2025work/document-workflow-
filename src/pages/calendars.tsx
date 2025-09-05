import type { NextPage } from 'next';
import { Calendar } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import CalendarManager from '@/components/workflow/CalendarManager';

const CalendarsPage: NextPage = () => {
  return (
    <MainLayout
      title="Calendars"
      subtitle="Manage your organization's calendars and schedules"
      icon={Calendar}
    >
      <div className="flex-1 p-6 overflow-auto">
        <CalendarManager />
      </div>
    </MainLayout>
  );
};

export default CalendarsPage;