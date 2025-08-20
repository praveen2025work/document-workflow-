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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, MoreHorizontal, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { getCalendars, createCalendar, updateCalendar, deleteCalendar } from '@/lib/calendarApi';
import { PaginatedCalendarsResponse, WorkflowCalendarDto } from '@/types/calendar';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';

const CalendarManager: React.FC = () => {
  const [calendarsResponse, setCalendarsResponse] = useState<PaginatedCalendarsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<WorkflowCalendarDto | null>(null);
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
      await createCalendar({ ...newCalendar, createdBy: user.email });
      toast.success('Calendar created successfully.');
      setAddDialogOpen(false);
      fetchCalendars();
    } catch (error) {
      toast.error('Failed to create calendar.');
    }
  };

  const handleEdit = (calendar: WorkflowCalendarDto) => {
    setSelectedCalendar(calendar);
    setNewCalendar({
      calendarName: calendar.calendarName,
      description: calendar.description || '',
      startDate: calendar.startDate.split('T')[0],
      endDate: calendar.endDate.split('T')[0],
      recurrence: calendar.recurrence,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedCalendar || !user) return;
    try {
      await updateCalendar(selectedCalendar.calendarId, { ...newCalendar, updatedBy: user.email });
      toast.success('Calendar updated successfully.');
      setEditDialogOpen(false);
      fetchCalendars();
    } catch (error) {
      toast.error('Failed to update calendar.');
    }
  };

  const handleDelete = (calendar: WorkflowCalendarDto) => {
    setSelectedCalendar(calendar);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCalendar) return;
    try {
      await deleteCalendar(selectedCalendar.calendarId);
      toast.success('Calendar deleted successfully.');
      setDeleteDialogOpen(false);
      fetchCalendars();
    } catch (error) {
      toast.error('Failed to delete calendar.');
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
              {/* Form fields */}
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calendarsResponse?.content.map((calendar) => (
                  <TableRow key={calendar.calendarId}>
                    <TableCell>{calendar.calendarName}</TableCell>
                    <TableCell>{calendar.recurrence}</TableCell>
                    <TableCell>{new Date(calendar.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(calendar.endDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(calendar)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(calendar)} className="text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Calendar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Form fields */}
            <Label htmlFor="calendarName">Calendar Name</Label>
            <Input id="calendarName" value={newCalendar.calendarName} onChange={handleInputChange} />
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={newCalendar.description} onChange={handleInputChange} />
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" value={newCalendar.startDate} onChange={handleInputChange} />
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" value={newCalendar.endDate} onChange={handleInputChange} />
            <Label htmlFor="recurrence">Recurrence</Label>
            <Select onValueChange={handleSelectChange} value={newCalendar.recurrence}>
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
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the calendar "{selectedCalendar?.calendarName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CalendarManager;