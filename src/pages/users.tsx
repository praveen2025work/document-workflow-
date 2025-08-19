import type { NextPage } from 'next';
import { motion } from 'framer-motion';
import { Users, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MainLayout from '@/components/MainLayout';

const UsersPage: NextPage = () => {
  const headerActions = (
    <Button size="sm">
      <Plus className="mr-2 h-4 w-4" />
      Add User
    </Button>
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
                    placeholder="Search by name, email, or role..."
                    className="pl-10 glass border-border"
                  />
                </div>
                <Button variant="outline">Filter</Button>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-foreground">All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">User Management</h3>
                <p className="text-muted-foreground mb-4">
                  This section will allow you to manage system users, their roles, and permissions.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First User
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default UsersPage;