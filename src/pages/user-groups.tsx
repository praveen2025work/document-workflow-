import type { NextPage } from 'next';
import { motion } from 'framer-motion';
import { UserCheck, Plus, Search, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MainLayout from '@/components/MainLayout';

const UserGroupsPage: NextPage = () => {
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
                  />
                </div>
                <Button variant="outline">Filter</Button>
              </div>
            </CardContent>
          </Card>

          {/* Groups List */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-foreground">All Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Group Management</h3>
                <p className="text-muted-foreground mb-4">
                  Create and manage user groups to organize users by roles, departments, or projects.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Group
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <UserCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">0</p>
                    <p className="text-sm text-muted-foreground">Total Groups</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                    <Users className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">0</p>
                    <p className="text-sm text-muted-foreground">Active Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                    <UserCheck className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">0</p>
                    <p className="text-sm text-muted-foreground">Roles Assigned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default UserGroupsPage;