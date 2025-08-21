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
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { getCalendars, createCalendarWithDays } from '@/lib/calendarApi';
import { PaginatedCalendarsResponse, CreateCalendarDto } from '@/types/calendar';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CalendarManager: React.FC = () => {
  const [calendarsResponse, setCalendarsResponse] = useState<PaginatedCalendarsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [newCalendar, setNewCalendar] = useState<Omit<CreateCalendarDto, 'createdBy' | 'calendarDays'>>({
    calendarName: '',
    description: '',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    recurrence: 'WEEKLY',
  });
  const { user } = useUser();

  const fetchCalendars = async () => {
    try {
      setLoading(true);
      const response = await getCalendars({ page: 1, size: 10 });
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
      setNewCalendar((prev) => ({ ...prev, [field]: date.toISOString() }));
    }
  };

  const handleRecurrenceChange = (value: 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY') => {
    setNewCalendar((prev) => ({ ...prev, recurrence: value }));
  };

  const handleCreate = async () => {
    if (!newCalendar.calendarName) {
      toast.error('Calendar name is required.');
      return;
    }
    try {
      const calendarData: CreateCalendarDto = {
        ...newCalendar,
        createdBy: user?.email || 'mock.user@workflow.com',
        calendarDays: [], // Sending empty array as per new API structure
      };
      await createCalendarWithDays(calendarData);
      toast.success('Calendar created successfully.');
      setAddDialogOpen(false);
      setNewCalendar({
        calendarName: '',
        description: '',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        recurrence: 'WEEKLY',
      }); // Reset form
      fetchCalendars(); // Refresh list
    } catch (error) {
      toast.error('Failed to create calendar.');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Calendar Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Calendar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Calendar</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="calendarName" className="text-right">Name</Label>
                <Input id="calendarName" value={newCalendar.calendarName} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input id="description" value={newCalendar.description || ''} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !newCalendar.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newCalendar.startDate ? format(new Date(newCalendar.startDate), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newCalendar.startDate ? new Date(newCalendar.startDate) : undefined}
                      onSelect={(date) => handleDateChange(date, 'startDate')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !newCalendar.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newCalendar.endDate ? format(new Date(newCalendar.endDate), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newСalendar.endDate ? new Date(newCalendar.endDate) : undefined}
                      onSelect={(date) => handleDateChange(date, 'endDate')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recurrence" className="text-right">Recurrence</Label>
                <Select onValueChange={handleRecurrenceChange} defaultValue={newCalendar.recurrence}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select recurrence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="DAILY">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Create</Button>
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
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calendarsResponse.content.map((calendar) => (
                  <TableRow key={calendar.calendarId}>
                    <TableCell>{calendar.calendarName}</TableCell>
                    <TableCell>{calendar.description}</TableCell>
                    <TableCell>{new Date(calendar.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>Active</TableCell>
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