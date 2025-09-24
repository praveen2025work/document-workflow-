import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Edit, UserCheck, Clock, Mail, Calendar, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MainLayout from '@/components/MainLayout';
import { getUsers, createUser, updateUser, toggleUserStatus, searchUsers } from '@/lib/userApi';
import { User, UserApiResponse, NewUser, UpdateUser } from '@/types/user';
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
import { useUser } from '@/context/UserContext';

const UsersPage: NextPage = () => {
  const [usersResponse, setUsersResponse] = useState<UserApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    isActive: true,
  });
  const [editingUser, setEditingUser] = useState<Partial<User> & { isActive: boolean } | null>(null);
  const { user: currentUser } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async (query = '') => {
    try {
      setLoading(true);
      const response = query
        ? await searchUsers({ username: query, firstName: query, page: 0, size: 10 })
        : await getUsers({ page: 0, size: 10, isActive: 'Y' });
      setUsersResponse(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewUser((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddUser = async () => {
    if (!newUser.username.trim() || !newUser.firstName.trim() || !newUser.lastName.trim() || !newUser.email.trim()) {
      return;
    }
    try {
      const userToCreate: NewUser = {
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        isActive: newUser.isActive ? 'Y' : 'N',
        isAdmin: 'N',
        createdBy: currentUser?.email || 'system',
      };
      await createUser(userToCreate);
      setAddUserDialogOpen(false);
      setNewUser({ username: '', firstName: '', lastName: '', email: '', isActive: true });
      fetchUsers(searchQuery);
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditingUser({ ...user, isActive: user.isActive === 'Y' });
    setEditUserDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !editingUser) {
      return;
    }
    try {
      const userToUpdate: UpdateUser = {
        firstName: editingUser.firstName || '',
        lastName: editingUser.lastName || '',
        email: editingUser.email || '',
      };
      await updateUser(selectedUser.userId, userToUpdate);

      if ((editingUser.isActive ? 'Y' : 'N') !== selectedUser.isActive) {
        await toggleUserStatus(selectedUser.userId, editingUser.isActive ? 'Y' : 'N');
      }
      setEditUserDialogOpen(false);
      setSelectedUser(null);
      setEditingUser(null);
      fetchUsers(searchQuery);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleEditingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditingUser((prev) => (prev ? { ...prev, [id]: value } : null));
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const headerActions = (
    <Dialog open={isAddUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="btn-modern shadow-glow">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            Create a new user and assign them permissions to access the system.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={newUser.firstName} onChange={handleInputChange} className="glass-subtle" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={newUser.lastName} onChange={handleInputChange} className="glass-subtle" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={newUser.username} onChange={handleInputChange} className="glass-subtle" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={newUser.email} onChange={handleInputChange} className="glass-subtle" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="space-y-1">
              <Label htmlFor="isActive" className="text-sm font-medium">Active Status</Label>
              <p className="text-xs text-muted-foreground">Enable user access to the system</p>
            </div>
            <Switch id="isActive" checked={newUser.isActive} onCheckedChange={(checked) => setNewUser(prev => ({...prev, isActive: checked}))} />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAddUser} className="btn-modern">
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout
      title="Users"
      subtitle="Manage system users and their permissions"
      icon={Users}
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
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      <p className="text-3xl font-bold text-foreground">
                        {usersResponse?.totalElements || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                      <Users className="h-6 w-6 text-primary" />
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
                      <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                      <p className="text-3xl font-bold text-success">
                        {usersResponse?.content.filter(u => u.isActive === 'Y').length || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-success/10 border border-success/20">
                      <UserCheck className="h-6 w-6 text-success" />
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
                      <p className="text-sm font-medium text-muted-foreground">Recent Logins</p>
                      <p className="text-3xl font-bold text-info">
                        {usersResponse?.content.filter(u => u.lastLogin).length || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-info/10 border border-info/20">
                      <Clock className="h-6 w-6 text-info" />
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
                      placeholder="Search users by name, username, or email..."
                      className="pl-10 glass-subtle"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  System Users
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-16">
                    <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 inline-block mb-4">
                      <Users className="h-8 w-8 text-destructive" />
                    </div>
                    <p className="text-destructive font-medium">{error}</p>
                  </div>
                ) : !usersResponse || usersResponse.content.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 inline-block mb-4">
                      <Users className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Users Found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery ? 'No users match your search criteria.' : 'There are no users configured in the system yet.'}
                    </p>
                    <DialogTrigger asChild>
                      <Button className="btn-modern">
                        <Plus className="mr-2 h-4 w-4" />
                        Add First User
                      </Button>
                    </DialogTrigger>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/50 bg-muted/20">
                        <TableHead className="font-semibold">User</TableHead>
                        <TableHead className="font-semibold">Contact</TableHead>
                        <TableHead className="font-semibold">Last Login</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Created</TableHead>
                        <TableHead className="text-right font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersResponse.content.map((user: User, index) => (
                        <TableRow key={user.userId} className="hover:bg-muted/10 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-border/50">
                                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                                  {getInitials(user.firstName, user.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-foreground">
                                  {`${user.firstName} ${user.lastName}`}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  @{user.username}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.isActive === 'Y' ? 'default' : 'destructive'}
                              className="status-indicator"
                            >
                              <div className={`w-2 h-2 rounded-full ${user.isActive === 'Y' ? 'bg-success' : 'bg-destructive'}`} />
                              {user.isActive === 'Y' ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {new Date(user.createdOn).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditUser(user)}
                              className="hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit User
            </DialogTitle>
            <DialogDescription>
              Update the user's information and permissions.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={editingUser.firstName || ''} onChange={handleEditingInputChange} className="glass-subtle" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={editingUser.lastName || ''} onChange={handleEditingInputChange} className="glass-subtle" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={editingUser.username || ''} onChange={handleEditingInputChange} className="glass-subtle" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={editingUser.email || ''} onChange={handleEditingInputChange} className="glass-subtle" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="space-y-1">
                  <Label htmlFor="isActive" className="text-sm font-medium">Active Status</Label>
                  <p className="text-xs text-muted-foreground">Enable or disable user access</p>
                </div>
                <Switch id="isActive" checked={editingUser.isActive} onCheckedChange={(checked) => setEditingUser(prev => (prev ? {...prev, isActive: checked} : null))} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateUser} className="btn-modern">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default UsersPage;