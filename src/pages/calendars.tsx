import type { NextPage } from 'next';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import CalendarManager from '@/components/workflow/CalendarManager';

const CalendarsPage: NextPage = () => {
  return (
    <MainLayout
      title="Calendars"
      subtitle="Manage calendar settings and schedules"
      icon={Calendar}
    >
      <div className="flex-1 p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-xl p-6"
        >
          <CalendarManager />
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default CalendarsPage;