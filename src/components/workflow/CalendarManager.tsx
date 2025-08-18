import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Calendar {
  id: number;
  name: string;
  weekend_days: number[];
  holidays: string[];
}

interface CalendarManagerProps {
  isOpen: boolean;
  onClose: () => void;
  calendars: Calendar[];
  onAddCalendar: (calendar: Omit<Calendar, 'id'>) => void;
}

const weekDays = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

const CalendarManager: React.FC<CalendarManagerProps> = ({ isOpen, onClose, calendars, onAddCalendar }) => {
  const [newCalendarName, setNewCalendarName] = useState('');
  const [selectedWeekendDays, setSelectedWeekendDays] = useState<number[]>([]);

  const handleAddCalendar = () => {
    if (!newCalendarName) {
      toast.error('Please enter a name for the calendar.');
      return;
    }
    onAddCalendar({
      name: newCalendarName,
      weekend_days: selectedWeekendDays,
      holidays: [], // Holiday selection will be implemented later
    });
    setNewCalendarName('');
    setSelectedWeekendDays([]);
    toast.success('Calendar added successfully!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Calendar Management</DialogTitle>
          <DialogDescription>
            Create and manage calendars for your workflows.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Existing Calendars</h3>
            <div className="space-y-2">
              {calendars.map((cal) => (
                <div key={cal.id} className="flex items-center justify-between p-2 bg-gray-700 rounded-md">
                  <span>{cal.name}</span>
                  <span className="text-sm text-gray-400">
                    {cal.weekend_days.map(d => weekDays.find(wd => wd.value === d)?.label).join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4">Create New Calendar</h3>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="calendar-name" className="text-right">
                Name
              </Label>
              <Input
                id="calendar-name"
                value={newCalendarName}
                onChange={(e) => setNewCalendarName(e.target.value)}
                className="col-span-3 bg-gray-700 border-gray-600"
                placeholder="e.g., US Standard Calendar"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4 mt-4">
              <Label className="text-right">Weekend Days</Label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <Button
                    key={day.value}
                    variant={selectedWeekendDays.includes(day.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedWeekendDays((prev) =>
                        prev.includes(day.value)
                          ? prev.filter((d) => d !== day.value)
                          : [...prev, day.value]
                      );
                    }}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleAddCalendar}>Add Calendar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarManager;