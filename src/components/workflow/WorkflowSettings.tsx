import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { Workflow, WorkflowRole } from '@/types/workflow';
import { WorkflowRoleDto as Role } from '@/types/role';
import { WorkflowUserDto as User } from '@/types/user';
import { CalendarDto as Calendar } from '@/types/calendar';
import { getCalendars } from '@/lib/calendarApi';
import { getRoles } from '@/lib/roleApi';
import { getUsers } from '@/lib/userApi';
import { toast } from 'sonner';

interface WorkflowSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: Partial<Workflow>) => void;
  settings: Workflow | null;
}

const WorkflowSettings: React.FC<WorkflowSettingsProps> = ({ isOpen, onClose, onSave, settings }) => {
  const [localSettings, setLocalSettings] = useState<Partial<Workflow>>(settings || {});
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    setLocalSettings(settings || {});
    if (isOpen) {
      fetchInitialData();
    }
  }, [settings, isOpen]);

  const fetchInitialData = async () => {
    try {
      const [calendarsRes, rolesRes, usersRes] = await Promise.all([
        getCalendars({ page: 1, size: 100 }),
        getRoles({ page: 1, size: 100 }),
        getUsers({ page: 1, size: 100 }),
      ]);
      setCalendars(calendarsRes.content);
      setRoles(rolesRes.content);
      setUsers(usersRes.content);
    } catch (error) {
      toast.error("Failed to fetch initial data for settings.");
      console.error(error);
    }
  };

  const handleAddRole = (roleId: number) => {
    const role = roles.find(r => r.roleId === roleId);
    if (!role) return;

    const newWorkflowRole: WorkflowRole = {
      roleId: role.roleId,
      userId: 0, // Placeholder, user needs to be assigned
      isActive: 'Y',
      roleName: role.name,
    };

    const updatedRoles = [...(localSettings.workflowRoles || []), newWorkflowRole];
    setLocalSettings({ ...localSettings, workflowRoles: updatedRoles });
  };

  const handleRemoveRole = (roleId: number) => {
    const updatedRoles = (localSettings.workflowRoles || []).filter(r => r.roleId !== roleId);
    setLocalSettings({ ...localSettings, workflowRoles: updatedRoles });
  };

  const handleAssignUserToRole = (roleId: number, userId: number) => {
    const user = users.find(u => u.userId === userId);
    if (!user) return;

    const updatedRoles = (localSettings.workflowRoles || []).map(r => 
      r.roleId === roleId ? { ...r, userId: user.userId, userName: user.name } : r
    );
    setLocalSettings({ ...localSettings, workflowRoles: updatedRoles });
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleChange = (field: keyof Workflow, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Workflow Settings</DialogTitle>
          <DialogDescription>
            Configure high-level parameters for your workflow.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={localSettings.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Monthly Report Generation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={localSettings.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="A brief description of the workflow's purpose."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due In (minutes)</Label>
              <Input type="number" value={localSettings.dueInMins || 1440} onChange={e => handleChange('dueInMins', +e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Calendar</Label>
              <Select
                value={localSettings.calendarId?.toString() || ''}
                onValueChange={(val) => handleChange('calendarId', val ? +val : null)}
              >
                <SelectTrigger><SelectValue placeholder="Select Calendar" /></SelectTrigger>
                <SelectContent>
                  {calendars.map(c => <SelectItem key={c.calendarId} value={c.calendarId.toString()}>{c.calendarName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold pt-4 border-t">Roles & Users</h3>
          <div className="space-y-2">
            <Label>Add Role to Workflow</Label>
            <Select onValueChange={(val) => handleAddRole(+val)}>
              <SelectTrigger><SelectValue placeholder="Select a role to add" /></SelectTrigger>
              <SelectContent>
                {roles
                  .filter(r => !(localSettings.workflowRoles || []).some(wr => wr.roleId === r.roleId))
                  .map(r => <SelectItem key={r.roleId} value={r.roleId.toString()}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {(localSettings.workflowRoles || []).map(wr => (
              <div key={wr.roleId} className="p-3 border rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{roles.find(r => r.roleId === wr.roleId)?.name || `Role ID: ${wr.roleId}`}</span>
                  <Button variant="destructive" size="icon" onClick={() => handleRemoveRole(wr.roleId)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2">
                  <Label>Assigned User</Label>
                  <Select
                    value={wr.userId?.toString() || ''}
                    onValueChange={(val) => handleAssignUserToRole(wr.roleId, +val)}
                  >
                    <SelectTrigger><SelectValue placeholder="Assign a user" /></SelectTrigger>
                    <SelectContent>
                      {users.map(u => <SelectItem key={u.userId} value={u.userId.toString()}>{u.name} ({u.email})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowSettings;