import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Plus, Trash2, Pencil } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { getCalendars, createCalendarWithDays, updateCalendarWithDays, getCalendarDays } from '@/lib/calendarApi';
import { CalendarApiResponse, NewCalendarWithDays, UpdateCalendarWithDays, Calendar as CalendarType, Recurrence, CalendarDay, DayType } from '@/types/calendar';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const CalendarManager: React.FC = () => {
  const [calendarsResponse, setCalendarsResponse] = useState<CalendarApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormDialogOpen, setFormDialogOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<CalendarType | null>(null);
  const [newCalendar, setNewCalendar] = useState<Omit<NewCalendarWithDays, 'createdBy' | 'calendarDays'>>({
    calendarName: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    recurrence: 'YEARLY',
  });
  const [calendarDays, setCalendarDays] = useState<Omit<CalendarDay, 'calendarDayId' | 'calendarId'>[]>([]);
  const [newDay, setNewDay] = useState<{ dayDate: string; dayType: DayType; note: string }>({
    dayDate: format(new Date(), 'yyyy-MM-dd'),
    dayType: 'HOLIDAY',
    note: '',
  });
  const { user } = useUser();

  const fetchCalendars = async () => {
    try {
      setLoading(true);
      const response = await getCalendars({ page: 0, size: 10 });
      setCalendarsResponse(response);
      setError(null);
    } catch (err) {
      const errorMessage = 'Failed to fetch calendars.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendars();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewCalendar((prev) => ({ ...prev, [id]: value }));
  };

  const handleDateChange = (date: Date | undefined, field: 'startDate' | 'endDate') => {
    if (date) {
      setNewCalendar((prev) => ({ ...prev, [field]: format(date, 'yyyy-MM-dd') }));
    }
  };

  const handleRecurrenceChange = (value: Recurrence) => {
    setNewCalendar((prev) => ({ ...prev, recurrence: value }));
  };

  const handleAddDay = () => {
    if (!newDay.dayDate || !newDay.note) {
      toast.error('Please provide a date and note for the calendar day.');
      return;
    }
    setCalendarDays([...calendarDays, newDay]);
    setNewDay({
      dayDate: format(new Date(), 'yyyy-MM-dd'),
      dayType: 'HOLIDAY',
      note: '',
    });
  };

  const handleRemoveDay = (index: number) => {
    setCalendarDays(calendarDays.filter((_, i) => i !== index));
  };

  const handleEdit = async (calendar: CalendarType) => {
    setEditingCalendar(calendar);
    setNewCalendar({
      calendarName: calendar.calendarName,
      description: calendar.description || '',
      startDate: calendar.startDate,
      endDate: calendar.endDate,
      recurrence: calendar.recurrence,
    });
    try {
      const days = await getCalendarDays(calendar.calendarId);
      setCalendarDays(days.map(({ calendarDayId, calendarId, ...rest }) => rest));
    } catch (error) {
      toast.error('Failed to fetch calendar days.');
      console.error(error);
      setCalendarDays([]);
    }
    setFormDialogOpen(true);
  };

  const handleSave = async () => {
    if (!newCalendar.calendarName) {
      toast.error('Calendar name is required.');
      return;
    }
    try {
      if (editingCalendar) {
        const calendarData: UpdateCalendarWithDays = {
          ...newCalendar,
          calendarId: editingCalendar.calendarId,
          updatedBy: user?.email || 'system',
          calendarDays: calendarDays,
        };
        await updateCalendarWithDays(calendarData);
        toast.success('Calendar updated successfully.');
      } else {
        const calendarData: NewCalendarWithDays = {
          ...newCalendar,
          createdBy: user?.email || 'system',
          calendarDays: calendarDays,
        };
        await createCalendarWithDays(calendarData);
        toast.success('Calendar created successfully.');
      }
      setFormDialogOpen(false);
      fetchCalendars();
    } catch (error) {
      toast.error(`Failed to ${editingCalendar ? 'update' : 'create'} calendar.`);
      console.error(error);
    }
  };

  const resetForm = () => {
    setEditingCalendar(null);
    setNewCalendar({
      calendarName: '',
      description: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      recurrence: 'YEARLY',
    });
    setCalendarDays([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Calendar Management</h1>
        <Dialog open={isFormDialogOpen} onOpenChange={(open) => {
          if (!open) {
            resetForm();
          }
          setFormDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Calendar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCalendar ? 'Edit Calendar' : 'Add New Calendar'}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="calendarName">Name</Label>
                    <Input id="calendarName" value={newCalendar.calendarName} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" value={newCalendar.description || ''} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newCalendar.startDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newCalendar.startDate ? format(new Date(newCalendar.startDate), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={newCalendar.startDate ? new Date(newCalendar.startDate) : undefined} onSelect={(date) => handleDateChange(date, 'startDate')} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newCalendar.endDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newCalendar.endDate ? format(new Date(newCalendar.endDate), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={newCalendar.endDate ? new Date(newCalendar.endDate) : undefined} onSelect={(date) => handleDateChange(date, 'endDate')} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <Label htmlFor="recurrence">Recurrence</Label>
                    <Select onValueChange={handleRecurrenceChange} value={newCalendar.recurrence}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recurrence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="NONE">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Calendar Days (Holidays, etc.)</h3>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newDay.dayDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newDay.dayDate ? format(new Date(newDay.dayDate), "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={newDay.dayDate ? new Date(newDay.dayDate) : undefined} onSelect={(date) => setNewDay(prev => ({ ...prev, dayDate: date ? format(date, 'yyyy-MM-dd') : '' }))} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex-1">
                      <Label>Note</Label>
                      <Input value={newDay.note} onChange={(e) => setNewDay(prev => ({ ...prev, note: e.target.value }))} placeholder="e.g., New Year's Day" />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={newDay.dayType} onValueChange={(value: DayType) => setNewDay(prev => ({ ...prev, dayType: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HOLIDAY">Holiday</SelectItem>
                          <SelectItem value="RUNDAY">Run Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddDay} size="sm"><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="space-y-2">
                    {calendarDays.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div>
                          <p className="font-medium">{day.note}</p>
                          <p className="text-sm text-muted-foreground">{format(new Date(day.dayDate), "PPP")} - {day.dayType}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveDay(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button onClick={handleSave}>{editingCalendar ? 'Save Changes' : 'Create Calendar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Calendars</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && calendarsResponse && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Recurrence</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calendarsResponse.content.map((calendar) => (
                  <TableRow key={calendar.calendarId}>
                    <TableCell>{calendar.calendarName}</TableCell>
                    <TableCell>{calendar.description}</TableCell>
                    <TableCell>{calendar.recurrence}</TableCell>
                    <TableCell>{calendar.startDate ? format(new Date(calendar.startDate), "PPP") : 'N/A'}</TableCell>
                    <TableCell>{calendar.endDate ? format(new Date(calendar.endDate), "PPP") : 'N/A'}</TableCell>
                    <TableCell>{new Date(calendar.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(calendar)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarManager;