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
import { Plus } from 'lucide-react';
import { getCalendars, createCalendar } from '@/lib/calendarApi';
import { PaginatedCalendarsResponse } from '@/types/calendar';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';

const CalendarManager: React.FC = () => {
  const [calendarsResponse, setCalendarsResponse] = useState<PaginatedCalendarsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [newCalendar, setNewCalendar] = useState({
    name: '',
    description: '',
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
    if (user) {
      fetchCalendars();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewCalendar((prev) => ({ ...prev, [id]: value }));
  };

  const handleCreate = async () => {
    if (!newCalendar.name || !user) {
      toast.error('Calendar name is required.');
      return;
    }
    try {
      await createCalendar({ name: newCalendar.name, description: newCalendar.description, isActive: true });
      toast.success('Calendar created successfully.');
      setAddDialogOpen(false);
      setNewCalendar({ name: '', description: '' }); // Reset form
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Calendar</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Label htmlFor="name">Calendar Name</Label>
              <Input id="name" value={newCalendar.name} onChange={handleInputChange} />
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={newCalendar.description} onChange={handleInputChange} />
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
                {calendarsResponse.data.map((calendar) => (
                  <TableRow key={calendar.id}>
                    <TableCell>{calendar.name}</TableCell>
                    <TableCell>{calendar.description}</TableCell>
                    <TableCell>{new Date(calendar.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{calendar.isActive ? 'Active' : 'Inactive'}</TableCell>
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