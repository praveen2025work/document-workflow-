import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCalendars, createCalendar } from '@/lib/api';
import { toast } from 'sonner';

interface Calendar {
  id: number;
  name: string;
  weekend_days: number[];
  holidays: string[];
}

const CalendarManager: React.FC = () => {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [newWeekendDays, setNewWeekendDays] = useState('6,7');
  const [newHolidays, setNewHolidays] = useState('');

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    try {
      const response = await getCalendars();
      setCalendars(response.data);
    } catch (error) {
      toast.error('Failed to fetch calendars.');
    }
  };

  const handleCreateCalendar = async () => {
    if (!newCalendarName) {
      toast.error('Calendar name is required.');
      return;
    }

    const weekendDays = newWeekendDays.split(',').map(day => parseInt(day.trim(), 10)).filter(day => !isNaN(day));
    const holidays = newHolidays.split(',').map(day => day.trim()).filter(day => day);

    try {
      await createCalendar({
        name: newCalendarName,
        weekend_days: weekendDays,
        holidays: holidays,
      });
      toast.success('Calendar created successfully.');
      setNewCalendarName('');
      setNewWeekendDays('6,7');
      setNewHolidays('');
      fetchCalendars();
    } catch (error) {
      toast.error('Failed to create calendar.');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Calendar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="calendarName">Calendar Name</Label>
            <Input
              id="calendarName"
              value={newCalendarName}
              onChange={(e) => setNewCalendarName(e.target.value)}
              placeholder="e.g., Standard Calendar"
            />
          </div>
          <div>
            <Label htmlFor="weekendDays">Weekend Days (comma-separated, 1=Mon, 7=Sun)</Label>
            <Input
              id="weekendDays"
              value={newWeekendDays}
              onChange={(e) => setNewWeekendDays(e.target.value)}
              placeholder="e.g., 6,7"
            />
          </div>
          <div>
            <Label htmlFor="holidays">Holidays (comma-separated, YYYY-MM-DD)</Label>
            <Input
              id="holidays"
              value={newHolidays}
              onChange={(e) => setNewHolidays(e.target.value)}
              placeholder="e.g., 2025-12-25,2026-01-01"
            />
          </div>
          <Button onClick={handleCreateCalendar}>Create Calendar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Calendars</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {calendars.map((calendar) => (
              <li key={calendar.id} className="p-2 border rounded">
                <p><strong>Name:</strong> {calendar.name}</p>
                <p><strong>Weekend Days:</strong> {calendar.weekend_days.join(', ')}</p>
                <p><strong>Holidays:</strong> {calendar.holidays.join(', ')}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarManager;