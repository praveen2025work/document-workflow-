import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Search, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MainLayout from '@/components/MainLayout';
import { getRoles, createRole, updateRole } from '@/lib/roleApi';
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
import { Role, RoleApiResponse, NewRole } from '@/types/role';
import { useUser } from '@/context/UserContext';

const RolesPage: NextPage = () => {
  const [rolesResponse, setRolesResponse] = useState<RoleApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleOpenForm = (role: Role | null) => {
    setEditingRole(role);
    if (role) {
      setRoleName(role.roleName);
      setIsActive(role.isActive === 'Y');
    } else {
      setRoleName('');
      setIsActive(true);
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingRole(null);
    setRoleName('');
    setIsActive(true);
  };

  const handleSave = async () => {
    if (!roleName.trim() || !user) {
      return;
    }
    try {
      if (editingRole) {
        const roleToUpdate: Role = {
          ...editingRole,
          roleName,
          isActive: isActive ? 'Y' : 'N',
        };
        await updateRole(roleToUpdate);
      } else {
        const roleToCreate: NewRole = {
          roleName,
          isActive: isActive ? 'Y' : 'N',
          createdBy: user.email,
        };
        await createRole(roleToCreate);
      }
      handleCloseForm();
      fetchRoles();
    } catch (error) {
      console.error("Failed to save role:", error);
    }
  };

  const filteredRoles = rolesResponse?.content.filter(role =>
    role.roleName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const headerActions = (
    <Button size="sm" onClick={() => handleOpenForm(null)}>
      <Plus className="mr-2 h-4 w-4" />
      Add Role
    </Button>
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
              ) : !filteredRoles || filteredRoles.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Roles Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? "No roles match your search." : "There are no roles configured in the system yet."}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => handleOpenForm(null)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Role
                    </Button>
                  )}
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
                      {filteredRoles.map((role: Role) => (
                        <TableRow key={role.roleId}>
                          <TableCell className="font-medium">{role.roleName}</TableCell>
                          <TableCell>
                            <Badge variant={role.isActive === 'Y' ? 'default' : 'destructive'}>
                              {role.isActive === 'Y' ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{role.createdBy}</TableCell>
                          <TableCell>{new Date().toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenForm(role)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
            <DialogDescription>
              {editingRole ? 'Update the details of this role.' : 'Create a new role to assign to users and workflows.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roleName" className="text-right">
                Role Name
              </Label>
              <Input
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
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
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>Cancel</Button>
            <Button type="submit" onClick={handleSave}>
              {editingRole ? 'Save Changes' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default RolesPage;