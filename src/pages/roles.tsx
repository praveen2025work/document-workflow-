import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Search, Edit, Users, Settings, Calendar, Sparkles } from 'lucide-react';
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

  const getRoleIcon = (roleName: string) => {
    const name = roleName.toLowerCase();
    if (name.includes('admin')) return Shield;
    if (name.includes('user')) return Users;
    if (name.includes('manager')) return Settings;
    return Shield;
  };

  const getRoleInitials = (roleName: string) => {
    return roleName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const headerActions = (
    <Button size="sm" onClick={() => handleOpenForm(null)} className="btn-modern shadow-glow">
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
      <div className="flex flex-col h-full">
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                      <p className="text-3xl font-bold text-foreground">
                        {rolesResponse?.totalElements || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Roles</p>
                      <p className="text-3xl font-bold text-success">
                        {filteredRoles?.filter(r => r.isActive === 'Y').length || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-success/10 border border-success/20">
                      <Settings className="h-6 w-6 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">System Roles</p>
                      <p className="text-3xl font-bold text-info">
                        {filteredRoles?.filter(r => r.createdBy === 'system').length || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-info/10 border border-info/20">
                      <Users className="h-6 w-6 text-info" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <Card className="card-modern">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search roles by name..."
                      className="pl-10 glass-subtle"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Roles Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Roles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading roles...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-16">
                    <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 inline-block mb-4">
                      <Shield className="h-8 w-8 text-destructive" />
                    </div>
                    <p className="text-destructive font-medium">{error}</p>
                  </div>
                ) : !filteredRoles || filteredRoles.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 inline-block mb-4">
                      <Shield className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Roles Found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery ? 'No roles match your search criteria.' : 'There are no roles configured in the system yet.'}
                    </p>
                    <Button onClick={() => handleOpenForm(null)} className="btn-modern">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Role
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/50 bg-muted/20">
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Created By</TableHead>
                        <TableHead className="font-semibold">Created</TableHead>
                        <TableHead className="text-right font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoles.map((role: Role, index) => {
                        const RoleIcon = getRoleIcon(role.roleName);
                        return (
                          <TableRow key={role.roleId} className="hover:bg-muted/10 transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-border/50">
                                  <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                                    {getRoleInitials(role.roleName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold text-foreground flex items-center gap-2">
                                    {role.roleName}
                                    <RoleIcon className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Role ID: {role.roleId}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={role.isActive === 'Y' ? 'default' : 'destructive'}
                                className="status-indicator"
                              >
                                <div className={`w-2 h-2 rounded-full ${role.isActive === 'Y' ? 'bg-success' : 'bg-destructive'}`} />
                                {role.isActive === 'Y' ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{role.createdBy}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {role.createdOn ? new Date(role.createdOn).toLocaleDateString() : 'N/A'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleOpenForm(role)}
                                className="hover:bg-primary/10 hover:text-primary transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="sm:max-w-[500px] glass">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingRole ? <Edit className="h-5 w-5 text-primary" /> : <Sparkles className="h-5 w-5 text-primary" />}
              {editingRole ? 'Edit Role' : 'Add New Role'}
            </DialogTitle>
            <DialogDescription>
              {editingRole ? 'Update the role information and permissions.' : 'Create a new role to assign to users and workflows.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name</Label>
              <Input
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="glass-subtle"
                placeholder="e.g., Project Manager, Reviewer, Admin"
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="space-y-1">
                <Label htmlFor="isActive" className="text-sm font-medium">Active Status</Label>
                <p className="text-xs text-muted-foreground">Enable this role for assignment</p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>Cancel</Button>
            <Button type="submit" onClick={handleSave} className="btn-modern">
              {editingRole ? 'Save Changes' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default RolesPage;