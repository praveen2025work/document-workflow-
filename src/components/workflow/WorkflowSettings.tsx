import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Plus, Trash2 } from 'lucide-react';

interface Calendar {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

interface UserForRole {
  user_id: number;
  role_id: number;
}

interface WorkflowSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  settings: {
    name: string;
    trigger: 'MANUAL' | 'AUTO';
    frequency?: string;
    startTime?: string;
    start_working_day?: number;
    calendar_id?: number;
    roles?: Role[];
    usersForRoles?: UserForRole[];
  };
}

import api from '@/lib/api';

const WorkflowSettings: React.FC<WorkflowSettingsProps> = ({ isOpen, onClose, onSave, settings }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newRoleName, setNewRoleName] = useState('');

  useEffect(() => {
    setLocalSettings(settings);
    if (isOpen) {
      fetchCalendars();
      fetchUsers();
    }
  }, [settings, isOpen]);

  const fetchCalendars = async () => {
    try {
      const response = await api.get('/calendars');
      setCalendars(response.data);
    } catch (error) {
      // Error is handled by interceptor
    }
  };

  const fetchUsers = async () => {
    try {
      // Assuming an endpoint to fetch all users exists
      const response = await api.get('/users'); 
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleAddRole = () => {
    if (newRoleName.trim() !== '') {
      const newRole: Role = {
        id: Date.now(), // Temporary ID
        name: newRoleName.trim(),
      };
      const updatedRoles = [...(localSettings.roles || []), newRole];
      setLocalSettings({ ...localSettings, roles: updatedRoles });
      setNewRoleName('');
    }
  };

  const handleRemoveRole = (roleId: number) => {
    const updatedRoles = (localSettings.roles || []).filter(r => r.id !== roleId);
    const updatedUsersForRoles = (localSettings.usersForRoles || []).filter(u => u.role_id !== roleId);
    setLocalSettings({ ...localSettings, roles: updatedRoles, usersForRoles: updatedUsersForRoles });
  };

  const handleMapUserToRole = (userId: number, roleId: number) => {
    const updatedUsersForRoles = [...(localSettings.usersForRoles || []), { user_id: userId, role_id: roleId }];
    setLocalSettings({ ...localSettings, usersForRoles: updatedUsersForRoles });
  };

  const handleUnmapUserFromRole = (userId: number, roleId: number) => {
    const updatedUsersForRoles = (localSettings.usersForRoles || []).filter(
      u => !(u.user_id === userId && u.role_id === roleId)
    );
    setLocalSettings({ ...localSettings, usersForRoles: updatedUsersForRoles });
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
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
          <div className="space-y-4">
            {/* General Settings */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">General</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  value={localSettings.name || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, name: e.target.value })}
                  className="col-span-3 bg-gray-700 border-gray-600"
                  placeholder="e.g., Monthly Report Generation"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="trigger" className="text-right">Trigger</Label>
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
                    <Label htmlFor="frequency" className="text-right">Frequency</Label>
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
                    <Label htmlFor="startTime" className="text-right">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={localSettings.startTime || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, startTime: e.target.value })}
                      className="col-span-3 bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startWorkingDay" className="text-right">Start Day</Label>
                    <Input
                      id="startWorkingDay"
                      type="number"
                      value={localSettings.start_working_day || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, start_working_day: Number(e.target.value) })}
                      className="col-span-3 bg-gray-700 border-gray-600"
                      placeholder="e.g., 1"
                    />
                  </div>
                </>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="calendar" className="text-right">Calendar</Label>
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
                  <Button variant="outline" size="sm" onClick={fetchCalendars}>Refresh</Button>
                </div>
              </div>
            </div>

            {/* Roles and Users */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Roles & Users</h3>
              <div className="flex items-center gap-2">
                <Input
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="New role name"
                  className="bg-gray-700 border-gray-600"
                />
                <Button onClick={handleAddRole} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Role</Button>
              </div>
              <div className="space-y-2">
                {(localSettings.roles || []).map(role => (
                  <div key={role.id} className="p-2 border rounded border-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{role.name}</span>
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveRole(role.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-2">
                      <Label>Assign Users:</Label>
                      <Select onValueChange={(value) => handleMapUserToRole(Number(value), role.id)}>
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue placeholder="Select user to add" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.filter(user => 
                            !(localSettings.usersForRoles || []).some(ufr => ufr.role_id === role.id && ufr.user_id === user.id)
                          ).map(user => (
                            <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="mt-1 space-y-1">
                        {(localSettings.usersForRoles || []).filter(ufr => ufr.role_id === role.id).map(ufr => {
                          const user = users.find(u => u.id === ufr.user_id);
                          return (
                            <div key={ufr.user_id} className="flex items-center justify-between bg-gray-600 px-2 py-1 rounded">
                              <span>{user?.name || `User ID: ${ufr.user_id}`}</span>
                              <Button variant="ghost" size="sm" onClick={() => handleUnmapUserFromRole(ufr.user_id, role.id)}>
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkflowSettings;