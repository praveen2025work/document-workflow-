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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { getCalendars, createCalendar } from '@/lib/calendarApi';
import { PaginatedCalendarsResponse, WorkflowCalendarDto } from '@/types/calendar';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';

const CalendarManager: React.FC = () => {
  const [calendarsResponse, setCalendarsResponse] = useState<PaginatedCalendarsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [newCalendar, setNewCalendar] = useState({
    calendarName: '',
    description: '',
    startDate: '',
    endDate: '',
    recurrence: 'YEARLY' as 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY',
  });
  const { user } = useUser();

  const fetchCalendars = async () => {
    try {
      setLoading(true);
      const response = await getCalendars({ page: 0, size: 10 });
      setCalendarsResponse(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch calendars.');
      toast.error('Failed to fetch calendars.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendars();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { id: string; value: string } }) => {
    const { id, value } = e.target;
    setNewCalendar((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (value: 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY') => {
    setNewCalendar((prev) => ({ ...prev, recurrence: value }));
  };

  const handleCreate = async () => {
    if (!newCalendar.calendarName || !newCalendar.startDate || !newCalendar.endDate || !user) {
      toast.error('Please fill all required fields.');
      return;
    }
    try {
      await createCalendar({ ...newCalendar, createdBy: user.email, calendarDays: [] });
      toast.success('Calendar created successfully.');
      setAddDialogOpen(false);
      fetchCalendars();
    } catch (error) {
      toast.error('Failed to create calendar.');
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Calendar</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Label htmlFor="calendarName">Calendar Name</Label>
              <Input id="calendarName" value={newCalendar.calendarName} onChange={handleInputChange} />
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={newCalendar.description} onChange={handleInputChange} />
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={newCalendar.startDate} onChange={handleInputChange} />
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={newCalendar.endDate} onChange={handleInputChange} />
              <Label htmlFor="recurrence">Recurrence</Label>
              <Select onValueChange={handleSelectChange} defaultValue={newCalendar.recurrence}>
                <SelectTrigger>
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
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Recurrence</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calendarsResponse?.content.map((calendar) => (
                  <TableRow key={calendar.calendarId}>
                    <TableCell>{calendar.calendarName}</TableCell>
                    <TableCell>{calendar.recurrence}</TableCell>
                    <TableCell>{new Date(calendar.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(calendar.endDate).toLocaleDateString()}</TableCell>
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