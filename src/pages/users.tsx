import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MainLayout from '@/components/MainLayout';
import { getUsers, createUser, updateUser, toggleUserStatus, searchUsers } from '@/lib/userApi';
import { PaginatedUsersResponse, WorkflowUserDto } from '@/types/user';
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUser } from '@/context/UserContext';

const UsersPage: NextPage = () => {
  const [usersResponse, setUsersResponse] = useState<PaginatedUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setEditUserDialogOpen] = useState(false);
>>>>>>> REPLACE
<<<<<<< SEARCH
  const [editingUser, setEditingUser] = useState<Partial<WorkflowUserDto> | null>(null);
=======
  const [selectedUser, setSelectedUser] = useState<WorkflowUserDto | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    isActive: true,
  });
  const [editingUser, setEditingUser] = useState<Partial<WorkflowUserDto> & { isActive: boolean } | null>(null);
  const { user: currentUser } = useUser();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers({ page: 0, size: 10 });
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
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewUser((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddUser = async () => {
    if (!newUser.username.trim() || !newUser.firstName.trim() || !newUser.lastName.trim() || !newUser.email.trim() || !currentUser) {
      return;
    }
    try {
      await createUser({
        ...newUser,
        isActive: newUser.isActive ? 'Y' : 'N',
        createdBy: currentUser.email,
      });
      setAddUserDialogOpen(false);
      setNewUser({ username: '', firstName: '', lastName: '', email: '', isActive: true });
      fetchUsers();
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleEditUser = (user: WorkflowUserDto) => {
    setSelectedUser(user);
    setEditingUser({ ...user, isActive: user.isActive === 'Y' });
    setEditUserDialogOpen(true);
  };

  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async (query = '') => {
    try {
      setLoading(true);
      const response = query 
        ? await searchUsers({ username: query, firstName: query, page: 0, size: 10 })
        : await getUsers({ page: 0, size: 10 });
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

  const handleUpdateUser = async () => {
    if (!selectedUser || !editingUser || !currentUser) {
      return;
    }
    try {
      const { isActive, ...updateData } = editingUser;
      await updateUser(selectedUser.userId, {
        ...updateData,
        updatedBy: currentUser.email,
      });
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

  const headerActions = (
    <Dialog open={isAddUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user and assign them permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">Username</Label>
            <Input id="username" value={newUser.username} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">First Name</Label>
            <Input id="firstName" value={newUser.firstName} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">Last Name</Label>
            <Input id="lastName" value={newUser.lastName} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" type="email" value={newUser.email} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">Active</Label>
            <Switch id="isActive" checked={newUser.isActive} onCheckedChange={(checked) => setNewUser(prev => ({...prev, isActive: checked}))} />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAddUser}>Create User</Button>
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
              <CardTitle className="text-foreground">Search Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by username or first name..."
                    className="pl-10 glass border-border"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-foreground">All Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <p>Loading users...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">
                  <p>{error}</p>
                </div>
              ) : !usersResponse || usersResponse.content.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Users Found</h3>
                  <p className="text-muted-foreground mb-4">
                    There are no users configured in the system yet.
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First User
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersResponse.content.map((user: WorkflowUserDto) => (
                      <TableRow key={user.userId}>
                        <TableCell className="font-medium">{`${user.firstName} ${user.lastName}`}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.isActive === 'Y' ? 'default' : 'destructive'}>
                            {user.isActive === 'Y' ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdOn).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
>>>>>>> REPLACE
<<<<<<< SEARCH
      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={isDeleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              "{selectedUser?.firstName} {selectedUser?.lastName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
=======
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
        </motion.div>
      </div>
      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the user's details.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">Username</Label>
                <Input id="username" value={editingUser.username} onChange={handleEditingInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firstName" className="text-right">First Name</Label>
                <Input id="firstName" value={editingUser.firstName} onChange={handleEditingInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastName" className="text-right">Last Name</Label>
                <Input id="lastName" value={editingUser.lastName} onChange={handleEditingInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" type="email" value={editingUser.email} onChange={handleEditingInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">Active</Label>
                <Switch id="isActive" checked={editingUser.isActive as boolean} onCheckedChange={(checked) => setEditingUser(prev => (prev ? {...prev, isActive: checked} : null))} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={isDeleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              "{selectedUser?.firstName} {selectedUser?.lastName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default UsersPage;