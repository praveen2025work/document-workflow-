import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { Workflow, WorkflowRole, WorkflowRoleUser } from '@/types/workflow';
import MultiSelect from '@/components/ui/multi-select';
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
  const [configuredRoleIds, setConfiguredRoleIds] = useState<number[]>([]);
  
  useEffect(() => {
    setLocalSettings(settings || {});
    if (isOpen) {
      fetchInitialData();
      const roleIdsFromSettings = (settings?.workflowRoles || []).map(wr => wr.roleId);
      setConfiguredRoleIds([...new Set(roleIdsFromSettings)]);
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
    if (!configuredRoleIds.includes(roleId)) {
        setConfiguredRoleIds([...configuredRoleIds, roleId]);
    }
  };

  const handleRemoveRole = (roleId: number) => {
    setConfiguredRoleIds(configuredRoleIds.filter(id => id !== roleId));
    const updatedRoles = (localSettings.workflowRoles || []).filter(wr => wr.roleId !== roleId);
    setLocalSettings({ ...localSettings, workflowRoles: updatedRoles });
  };

  const handleUserAssignmentChange = (roleId: number, userIds: string[]) => {
    const updatedUsers = userIds.map(uid => ({ userId: parseInt(uid, 10) }));
    
    let existingRole = (localSettings.workflowRoles || []).find(wr => wr.roleId === roleId);
    
    let updatedRoles: WorkflowRole[];

    if (existingRole) {
        updatedRoles = (localSettings.workflowRoles || []).map(wr => 
            wr.roleId === roleId ? { ...wr, users: updatedUsers } : wr
        );
    } else {
        const newRole: WorkflowRole = {
            roleId,
            users: updatedUsers,
            isActive: 'Y',
            roleName: roles.find(r => r.roleId === roleId)?.name || ''
        };
        updatedRoles = [...(localSettings.workflowRoles || []), newRole];
    }

    setLocalSettings({ ...localSettings, workflowRoles: updatedRoles });
  };

  const handleParameterChange = (index: number, field: 'paramKey' | 'paramValue', value: string) => {
    const newParameters = [...(localSettings.parameters || [])];
    newParameters[index] = { ...newParameters[index], [field]: value };
    setLocalSettings({ ...localSettings, parameters: newParameters });
  };

  const addParameter = () => {
    const newParameters = [...(localSettings.parameters || []), { paramKey: '', paramValue: '' }];
    setLocalSettings({ ...localSettings, parameters: newParameters });
  };

  const removeParameter = (index: number) => {
    const newParameters = (localSettings.parameters || []).filter((_, i) => i !== index);
    setLocalSettings({ ...localSettings, parameters: newParameters });
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Workflow Settings</DialogTitle>
          <DialogDescription>
            Configure comprehensive parameters for your workflow including timing, escalation, and custom properties.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto p-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="space-y-2">
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                value={localSettings.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Monthly Finance Review Workflow"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={localSettings.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="A comprehensive description of the workflow's purpose and process."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <Select
                  value={localSettings.triggerType || 'MANUAL'}
                  onValueChange={(val) => handleChange('triggerType', val)}
                >
                  <SelectTrigger><SelectValue placeholder="Select Trigger Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="EVENT_BASED">Event Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Calendar</Label>
                <Select
                  value={localSettings.calendarId?.toString() || undefined}
                  onValueChange={(val) => handleChange('calendarId', val === 'none' ? null : +val)}
                >
                  <SelectTrigger><SelectValue placeholder="Select Calendar (Optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Calendar</SelectItem>
                    {calendars.map(c => <SelectItem key={c.calendarId} value={c.calendarId.toString()}>{c.calendarName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Timing & Escalation */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Timing & Escalation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due In (minutes)</Label>
                <Input 
                  type="number" 
                  value={localSettings.dueInMins || 1440} 
                  onChange={e => handleChange('dueInMins', +e.target.value)} 
                  placeholder="1440"
                />
              </div>
              <div className="space-y-2">
                <Label>Reminder Before Due (minutes)</Label>
                <Input 
                  type="number" 
                  value={localSettings.reminderBeforeDueMins || 60} 
                  onChange={e => handleChange('reminderBeforeDueMins', +e.target.value)} 
                  placeholder="60"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minutes After Due</Label>
                <Input 
                  type="number" 
                  value={localSettings.minutesAfterDue || 30} 
                  onChange={e => handleChange('minutesAfterDue', +e.target.value)} 
                  placeholder="30"
                />
              </div>
              <div className="space-y-2">
                <Label>Escalation After (minutes)</Label>
                <Input 
                  type="number" 
                  value={localSettings.escalationAfterMins || 120} 
                  onChange={e => handleChange('escalationAfterMins', +e.target.value)} 
                  placeholder="120"
                />
              </div>
            </div>
          </div>
          
          {/* Roles & Users */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Roles & Users</h3>
            <div className="space-y-2">
              <Label>Add Role to Workflow</Label>
              <Select onValueChange={(val) => handleAddRole(+val)}>
                <SelectTrigger><SelectValue placeholder="Select a role to add" /></SelectTrigger>
                <SelectContent>
                  {roles
                    .filter(r => !configuredRoleIds.includes(r.roleId))
                    .map(r => <SelectItem key={r.roleId} value={r.roleId.toString()}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {configuredRoleIds.map(roleId => {
                const role = roles.find(r => r.roleId === roleId);
                if (!role) return null;
                
                const assignedUsersForRole = (localSettings.workflowRoles || []).find(wr => wr.roleId === roleId)?.users || [];
                const selectedUserIds = assignedUsersForRole.map(u => u.userId.toString());

                return (
                  <div key={roleId} className="p-4 border rounded-lg bg-muted/30 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-md">{role.name}</h4>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemoveRole(roleId)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove Role</TooltipContent>
                      </Tooltip>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Assigned Users</Label>
                      <MultiSelect
                        options={users.map(u => ({ value: u.userId.toString(), label: `${u.name} (${u.email})` }))}
                        selected={selectedUserIds}
                        onChange={(selectedIds) => handleUserAssignmentChange(roleId, selectedIds)}
                        placeholder="Select users..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Custom Parameters */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Custom Parameters</h3>
              <Button onClick={addParameter} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />Add Parameter
              </Button>
            </div>
            <div className="space-y-2">
              {(localSettings.parameters || []).map((param, index) => (
                <div key={index} className="p-3 border rounded-md bg-muted/20">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">Parameter #{index + 1}</Label>
                    <Button size="icon" variant="destructive" onClick={() => removeParameter(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input 
                      placeholder="Parameter Key (e.g., DEPARTMENT)" 
                      value={param.paramKey} 
                      onChange={e => handleParameterChange(index, 'paramKey', e.target.value)} 
                    />
                    <Input 
                      placeholder="Parameter Value (e.g., FINANCE)" 
                      value={param.paramValue} 
                      onChange={e => handleParameterChange(index, 'paramValue', e.target.value)} 
                    />
                  </div>
                </div>
              ))}
              {(localSettings.parameters || []).length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No custom parameters defined. Click "Add Parameter" to create workflow-specific settings.
                </div>
              )}
            </div>
          </div>

          {/* Workflow Status */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Status</h3>
            <div className="flex items-center justify-between">
              <div>
                <Label>Workflow Active</Label>
                <p className="text-sm text-muted-foreground">Enable or disable this workflow</p>
              </div>
              <Select 
                value={localSettings.isActive || 'Y'} 
                onValueChange={(val) => handleChange('isActive', val)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Y">Active</SelectItem>
                  <SelectItem value="N">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
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