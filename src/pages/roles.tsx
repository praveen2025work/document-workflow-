import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MainLayout from '@/components/MainLayout';
import { getRoles } from '@/lib/roleApi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { PaginatedRolesResponse, WorkflowRoleDto } from '@/types/role';
import { createRole, updateRole, deleteRole } from '@/lib/roleApi';
import { useUser } from '@/context/UserContext';
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

const RolesPage: NextPage = () => {
  const [rolesResponse, setRolesResponse] = useState<PaginatedRolesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddRoleDialogOpen, setAddRoleDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setEditRoleDialogOpen] = useState(false);
  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<WorkflowRoleDto | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleIsActive, setNewRoleIsActive] = useState(true);
  const { user } = useUser();

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await getRoles({ page: 0, size: 10 });
      setRolesResponse(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch roles. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = async () => {
    if (!newRoleName.trim() || !user) {
      return;
    }
    try {
      await createRole({
        roleName: newRoleName,
        isActive: newRoleIsActive ? 'Y' : 'N',
        createdBy: user.email,
      });
      setAddRoleDialogOpen(false);
      setNewRoleName('');
      setNewRoleIsActive(true);
      fetchRoles();
    } catch (error) {
      console.error("Failed to create role:", error);
    }
  };

  const handleEditRole = (role: WorkflowRoleDto) => {
    setSelectedRole(role);
    setNewRoleName(role.roleName);
    setNewRoleIsActive(role.isActive === 'Y');
    setEditRoleDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedRole || !newRoleName.trim() || !user) {
      return;
    }
    try {
      await updateRole(selectedRole.roleId, {
        roleName: newRoleName,
        isActive: newRoleIsActive ? 'Y' : 'N',
        updatedBy: user.email,
      });
      setEditRoleDialogOpen(false);
      setSelectedRole(null);
      fetchRoles();
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleDeleteRole = (role: WorkflowRoleDto) => {
    setSelectedRole(role);
    setDeleteConfirmationOpen(true);
  };

  const confirmDeleteRole = async () => {
    if (!selectedRole) {
      return;
    }
    try {
      await deleteRole(selectedRole.roleId);
      setDeleteConfirmationOpen(false);
      setSelectedRole(null);
      fetchRoles();
    } catch (error) {
      console.error("Failed to delete role:", error);
    }
  };

  const headerActions = (
    <Dialog open={isAddRoleDialogOpen} onOpenChange={setAddRoleDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Role</DialogTitle>
          <DialogDescription>
            Create a new role to assign to users and workflows.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="roleName" className="text-right">
              Role Name
            </Label>
            <Input
              id="roleName"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., REVIEWER"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">
              Active
            </Label>
            <Switch
              id="isActive"
              checked={newRoleIsActive}
              onCheckedChange={setNewRoleIsActive}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAddRole}>Create Role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout
      title="Roles"
      subtitle="Manage user roles and their assignments"
      icon={Shield}
      headerActions={headerActions}
    >
      <div className="flex-1 p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Search and Filters */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-foreground">Search Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by role name..."
                    className="pl-10 glass border-border"
                  />
                </div>
                <Button variant="outline">Filter</Button>
              </div>
            </CardContent>
          </Card>

          {/* Roles List */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-foreground">All Roles</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <p>Loading roles...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">
                  <p>{error}</p>
                </div>
              ) : !rolesResponse || rolesResponse.content.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Roles Found</h3>
                  <p className="text-muted-foreground mb-4">
                    There are no roles configured in the system yet.
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Role
                  </Button>
                </div>
              ) : (
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Created On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rolesResponse.content.map((role: WorkflowRoleDto) => (
                        <TableRow key={role.roleId}>
                          <TableCell className="font-medium">{role.roleName}</TableCell>
                          <TableCell>
                            <Badge variant={role.isActive === 'Y' ? 'default' : 'destructive'}>
                              {role.isActive === 'Y' ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{role.createdBy}</TableCell>
                          <TableCell>{new Date(role.createdOn).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-500"
                                  onClick={() => handleDeleteRole(role)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {/* TODO: Add pagination controls */}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setEditRoleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update the details of the role.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editRoleName" className="text-right">
                Role Name
              </Label>
              <Input
                id="editRoleName"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editIsActive" className="text-right">
                Active
              </Label>
              <Switch
                id="editIsActive"
                checked={newRoleIsActive}
                onCheckedChange={setNewRoleIsActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Role Confirmation Dialog */}
      <AlertDialog open={isDeleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role
              "{selectedRole?.roleName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteRole}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default RolesPage;