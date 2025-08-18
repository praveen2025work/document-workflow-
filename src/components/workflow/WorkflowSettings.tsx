import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CalendarManager from './CalendarManager';

interface Calendar {
  id: number;
  name: string;
  weekend_days: number[];
  holidays: string[];
}

interface WorkflowSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  settings: any;
}

const mockCalendars: Calendar[] = [
  { id: 1, name: 'Standard Calendar', weekend_days: [6, 7], holidays: [] },
  { id: 2, name: 'Trading Desk Calendar', weekend_days: [], holidays: [] },
];

const WorkflowSettings: React.FC<WorkflowSettingsProps> = ({ isOpen, onClose, onSave, settings }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isCalendarManagerOpen, setIsCalendarManagerOpen] = useState(false);
  const [calendars, setCalendars] = useState<Calendar[]>(mockCalendars);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleAddCalendar = (calendar: Omit<Calendar, 'id'>) => {
    const newCalendar = { ...calendar, id: Date.now() };
    setCalendars([...calendars, newCalendar]);
  };

  const handleTriggerChange = (value: string) => {
    const newSettings = { ...localSettings, trigger: value };
    if (value === 'MANUAL') {
      delete newSettings.frequency;
      delete newSettings.startTime;
    }
    setLocalSettings(newSettings);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[525px] bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Workflow Settings</DialogTitle>
            <DialogDescription>
              Configure high-level parameters for your workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={localSettings.name || ''}
                onChange={(e) => setLocalSettings({ ...localSettings, name: e.target.value })}
                className="col-span-3 bg-gray-700 border-gray-600"
                placeholder="e.g., Monthly Report Generation"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trigger" className="text-right">
                Trigger
              </Label>
              <Select value={localSettings.trigger || 'MANUAL'} onValueChange={handleTriggerChange}>
                <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                  <SelectItem value="AUTO">Automatic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {localSettings.trigger === 'AUTO' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="frequency" className="text-right">
                    Frequency
                  </Label>
                  <Select
                    value={localSettings.frequency || ''}
                    onValueChange={(value) => setLocalSettings({ ...localSettings, frequency: value })}
                  >
                    <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startTime" className="text-right">
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={localSettings.startTime || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, startTime: e.target.value })}
                    className="col-span-3 bg-gray-700 border-gray-600"
                  />
                </div>
              </>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="calendar" className="text-right">
                Calendar
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Select
                  value={localSettings.calendar_id ? String(localSettings.calendar_id) : ''}
                  onValueChange={(value) => setLocalSettings({ ...localSettings, calendar_id: Number(value) })}
                >
                  <SelectTrigger className="flex-1 bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select a calendar" />
                  </SelectTrigger>
                  <SelectContent>
                    {calendars.map((cal) => (
                      <SelectItem key={cal.id} value={String(cal.id)}>{cal.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => setIsCalendarManagerOpen(true)}>
                  Manage
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CalendarManager
        isOpen={isCalendarManagerOpen}
        onClose={() => setIsCalendarManagerOpen(false)}
        calendars={calendars}
        onAddCalendar={handleAddCalendar}
      />
    </>
  );
};

export default WorkflowSettings;