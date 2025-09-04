import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Plus, Search, Users, Settings, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import MainLayout from '@/components/MainLayout';
import { getUserGroups, getUserGroupStats } from '@/lib/userGroupApi';
import { UserGroup, mockUserGroupStats } from '@/lib/mock/userGroups';

const UserGroupsPage: NextPage = () => {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [stats, setStats] = useState(mockUserGroupStats);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [groupsResponse, statsResponse] = await Promise.all([
        getUserGroups(),
        getUserGroupStats(),
      ]);
      setGroups(groupsResponse.content);
      setStats(statsResponse);
    } catch (error) {
      console.error('Failed to fetch user groups data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredGroups = groups.filter(group =>
    group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headerActions = (
    <Button size="sm">
      <Plus className="mr-2 h-4 w-4" />
      Create Group
    </Button>
  );

  return (
    <MainLayout
      title="User Groups"
      subtitle="Manage user groups and role assignments"
      icon={UserCheck}
      headerActions={headerActions}
    >
      <div className="flex-1 p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <UserCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalGroups}</p>
                    <p className="text-sm text-muted-foreground">Total Groups</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                    <UserCheck className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.activeGroups}</p>
                    <p className="text-sm text-muted-foreground">Active Groups</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-info/10 border border-info/20">
                    <Users className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalMembers}</p>
                    <p className="text-sm text-muted-foreground">Total Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                    <Settings className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.averageGroupSize}</p>
                    <p className="text-sm text-muted-foreground">Avg Group Size</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-foreground">Search Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by group name or description..."
                    className="pl-10 glass border-border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline">Filter</Button>
              </div>
            </CardContent>
          </Card>

          {/* Groups List */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-foreground">All Groups ({filteredGroups.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Loading groups...</p>
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Groups Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'No groups match your search criteria.' : 'Create your first user group to get started.'}
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Group
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGroups.map((group) => (
                        <TableRow key={group.groupId}>
                          <TableCell className="font-medium text-foreground">
                            {group.groupName}
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-xs truncate">
                            {group.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {group.memberCount} members
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {group.roles.slice(0, 2).map((role, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {role}
                                </Badge>
                              ))}
                              {group.roles.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{group.roles.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={group.isActive === 'Y' ? 'default' : 'secondary'}
                              className={group.isActive === 'Y' ? 'bg-success/20 text-success' : ''}
                            >
                              {group.isActive === 'Y' ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(group.createdOn).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
    </MainLayout>
  );
};

export default UserGroupsPage;