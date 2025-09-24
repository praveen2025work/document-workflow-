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
import { Calendar as CalendarIcon, Plus, Trash2, Pencil, RefreshCw } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { searchCalendars, createCalendarWithDays, updateCalendarWithDays, getCalendarById } from '@/lib/calendarApi';
import { CalendarApiResponse, NewCalendarWithDays, UpdateCalendarWithDays, Calendar as CalendarType, Recurrence, CalendarDay, DayType, Region, YesNo } from '@/types/calendar';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Badge } from '../ui/badge';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

const RECURRENCE_TYPES: Recurrence[] = ['YEARLY', 'MONTHLY', 'WEEKLY', 'DAILY', 'NONE'];
const REGIONS: Region[] = ['US', 'EU', 'APAC', 'GLOBAL'];
const DAY_TYPES: DayType[] = ['HOLIDAY', 'RUNDAY'];
const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore', 'UTC'
];

const initialFormState: Omit<NewCalendarWithDays, 'createdBy' | 'calendarDays'> = {
  calendarName: '',
  description: '',
  startDate: format(new Date(), 'yyyy-MM-dd'),
  endDate: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  recurrence: 'YEARLY',
  cronExpression: '',
  timezone: 'UTC',
  region: 'GLOBAL',
  offsetDays: 0,
  isActive: 'Y',
};

const CalendarManager: React.FC = () => {
  const [calendarsResponse, setCalendarsResponse] = useState<CalendarApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormDialogOpen, setFormDialogOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<CalendarType | null>(null);
  const [formState, setFormState] = useState(initialFormState);
  const [calendarDays, setCalendarDays] = useState<Partial<CalendarDay>[]>([]);
  const [newDay, setNewDay] = useState<{ dayDate: string; dayType: DayType; note: string }>({
    dayDate: format(new Date(), 'yyyy-MM-dd'),
    dayType: 'HOLIDAY',
    note: '',
  });
  const { user } = useUser();

  const fetchCalendars = async () => {
    try {
      setLoading(true);
      const response = await searchCalendars({ page: 0, size: 10 });
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

  // Auto-refresh every 30 seconds
  useAutoRefresh({
    onRefresh: fetchCalendars,
    interval: 30000,
    enabled: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setFormState((prev) => ({ ...prev, [id]: type === 'number' ? parseInt(value, 10) : value }));
  };

  const handleSelectChange = (value: string, field: keyof typeof formState) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date: Date | undefined, field: 'startDate' | 'endDate') => {
    if (date) {
      setFormState((prev) => ({ ...prev, [field]: format(date, 'yyyy-MM-dd') }));
    }
  };

  const handleAddDay = () => {
    if (!newDay.dayDate || !newDay.note) {
      toast.error('Please provide a date and note for the calendar day.');
      return;
    }
    setCalendarDays([...calendarDays, newDay]);
    setNewDay({ dayDate: format(new Date(), 'yyyy-MM-dd'), dayType: 'HOLIDAY', note: '' });
  };

  const handleRemoveDay = (index: number) => {
    setCalendarDays(calendarDays.filter((_, i) => i !== index));
  };

  const handleEdit = async (calendar: CalendarType) => {
    setEditingCalendar(calendar);
    try {
      const fullCalendar = await getCalendarById(calendar.calendarId);
      setFormState({
        calendarName: fullCalendar.calendarName,
        description: fullCalendar.description || '',
        startDate: fullCalendar.startDate,
        endDate: fullCalendar.endDate,
        recurrence: fullCalendar.recurrence,
        cronExpression: fullCalendar.cronExpression || '',
        timezone: fullCalendar.timezone || 'UTC',
        region: fullCalendar.region || 'GLOBAL',
        offsetDays: fullCalendar.offsetDays || 0,
        isActive: fullCalendar.isActive || 'Y',
      });
      setCalendarDays(fullCalendar.calendarDays || []);
      setFormDialogOpen(true);
    } catch (error) {
      toast.error('Failed to fetch calendar details.');
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!formState.calendarName) {
      toast.error('Calendar name is required.');
      return;
    }
    try {
      if (editingCalendar) {
        const calendarData: UpdateCalendarWithDays = {
          ...formState,
          calendarId: editingCalendar.calendarId,
          updatedBy: user?.email || 'system',
          calendarDays: calendarDays as CalendarDay[],
        };
        await updateCalendarWithDays(editingCalendar.calendarId, calendarData);
        toast.success('Calendar updated successfully.');
      } else {
        const calendarData: NewCalendarWithDays = {
          ...formState,
          createdBy: user?.email || 'system',
          calendarDays: calendarDays.map(({ calendarDayId, calendarId, ...rest }) => rest),
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
    setFormState(initialFormState);
    setCalendarDays([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Calendar Management</h1>
        <div className="flex items-center gap-2">
          <Button 
            onClick={fetchCalendars} 
            variant="outline" 
            size="sm"
            disabled={loading}
            className="glass border-border/60 hover:bg-muted/80 hover:border-border transition-all duration-200"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={isFormDialogOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            setFormDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Calendar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editingCalendar ? 'Edit Calendar' : 'Add New Calendar'}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Name</Label><Input id="calendarName" value={formState.calendarName} onChange={handleInputChange} /></div>
                    <div><Label>Description</Label><Input id="description" value={formState.description || ''} onChange={handleInputChange} /></div>
                    <div>
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formState.startDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{formState.startDate ? format(new Date(formState.startDate), "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formState.startDate ? new Date(formState.startDate) : undefined} onSelect={(date) => handleDateChange(date, 'startDate')} initialFocus /></PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formState.endDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{formState.endDate ? format(new Date(formState.endDate), "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formState.endDate ? new Date(formState.endDate) : undefined} onSelect={(date) => handleDateChange(date, 'endDate')} initialFocus /></PopoverContent>
                      </Popover>
                    </div>
                    <div><Label>Recurrence</Label><Select onValueChange={(v: Recurrence) => handleSelectChange(v, 'recurrence')} value={formState.recurrence}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RECURRENCE_TYPES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label>Region</Label><Select onValueChange={(v: Region) => handleSelectChange(v, 'region')} value={formState.region}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
                    <div className="md:col-span-2"><Label>Timezone</Label><Select onValueChange={(v: string) => handleSelectChange(v, 'timezone')} value={formState.timezone}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIMEZONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                    <div className="md:col-span-2"><Label>CRON Expression</Label><Input id="cronExpression" value={formState.cronExpression || ''} onChange={handleInputChange} /></div>
                    <div><Label>Offset Days</Label><Input id="offsetDays" type="number" value={formState.offsetDays || 0} onChange={handleInputChange} /></div>
                    <div className="flex items-center space-x-2 pt-6"><Switch id="isActive" checked={formState.isActive === 'Y'} onCheckedChange={(c) => handleSelectChange(c ? 'Y' : 'N', 'isActive')} /><Label htmlFor="isActive">Active</Label></div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <h3 className="text-lg font-semibold">Special Days (Holidays/Run Days)</h3>
                    <div className="flex items-end gap-2">
                      <div className="flex-1"><Label>Date</Label>
                        <Popover>
                          <PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newDay.dayDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{newDay.dayDate ? format(new Date(newDay.dayDate), "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger>
                          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newDay.dayDate ? new Date(newDay.dayDate) : undefined} onSelect={(date) => setNewDay(prev => ({ ...prev, dayDate: date ? format(date, 'yyyy-MM-dd') : '' }))} initialFocus /></PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex-1"><Label>Note</Label><Input value={newDay.note} onChange={(e) => setNewDay(prev => ({ ...prev, note: e.target.value }))} placeholder="e.g., New Year's Day" /></div>
                      <div><Label>Type</Label><Select value={newDay.dayType} onValueChange={(v: DayType) => setNewDay(prev => ({ ...prev, dayType: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DAY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                      <Button onClick={handleAddDay} size="sm"><Plus className="h-4 w-4" /></Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {calendarDays.map((day, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <div><p className="font-medium">{day.note}</p><p className="text-sm text-muted-foreground">{format(new Date(day.dayDate!), "PPP")} - {day.dayType}</p></div>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveDay(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFormDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>{editingCalendar ? 'Save Changes' : 'Create Calendar'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Existing Calendars</CardTitle></CardHeader>
        <CardContent>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && calendarsResponse && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Timezone</TableHead>
                  <TableHead>Recurrence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calendarsResponse.content.map((calendar) => (
                  <TableRow key={calendar.calendarId}>
                    <TableCell className="font-medium">{calendar.calendarName}</TableCell>
                    <TableCell>{calendar.region}</TableCell>
                    <TableCell>{calendar.timezone}</TableCell>
                    <TableCell>{calendar.recurrence}</TableCell>
                    <TableCell><Badge variant={calendar.isActive === 'Y' ? 'default' : 'destructive'}>{calendar.isActive === 'Y' ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(calendar)}>
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