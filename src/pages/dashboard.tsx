import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUserDashboard, getAssignableTasks, assignTask } from '@/lib/dashboardApi';
import { UserDashboard, DashboardTask, AssignableTask } from '@/types/dashboard';
import { useUser } from '@/context/UserContext';
import { LayoutDashboard, RefreshCw, Clock, CheckCircle, AlertCircle, X, Check } from 'lucide-react';
import MainLayout from '@/components/MainLayout';

const DashboardPage: NextPage = () => {
  const [dashboardData, setDashboardData] = useState<UserDashboard | null>(null);
  const [assignableTasks, setAssignableTasks] = useState<AssignableTask[]>([]);
  const [rejectedTasks, setRejectedTasks] = useState<Set<number>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [isAssignableTasksLoading, setIsAssignableTasksLoading] = useState(false);
  const { user } = useUser();

  const fetchDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await getUserDashboard(user.userId);
      setDashboardData(response);
      console.log('Dashboard data loaded successfully:', response);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data.');
      // Fallback to mock data if API fails
      const { mockUserDashboard } = await import('@/lib/mock/dashboard');
      setDashboardData(mockUserDashboard);
      console.log('Using fallback mock data:', mockUserDashboard);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignableTasks = async () => {
    if (!user) return;
    setIsAssignableTasksLoading(true);
    try {
      const response = await getAssignableTasks(user.userId);
      setAssignableTasks(response);
    } catch (error) {
      toast.error('Failed to fetch assignable tasks.');
      // Fallback to mock data if API fails
      const { mockAssignableTasks } = await import('@/lib/mock/dashboard');
      setAssignableTasks(mockAssignableTasks);
    } finally {
      setIsAssignableTasksLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchAssignableTasks();
    }
  }, [user]);

  const handleAssignTask = async (task: AssignableTask | DashboardTask) => {
    if (!user) {
      toast.error('User information not available.');
      return;
    }
    
    try {
      await assignTask(task.instanceTaskId, user.userId);
      toast.success('Task assigned to you successfully!');
      fetchAssignableTasks();
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to assign task.');
    }
  };

  const handleRejectTask = (taskId: number) => {
    setRejectedTasks(prev => new Set([...prev, taskId]));
    toast.success('Task rejected and removed from your queue.');
  };

  const getDueDateIndicator = (dueDate?: string) => {
    if (!dueDate) return 'text-gray-500';
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return 'text-red-500'; // Overdue
    if (diffHours < 24) return 'text-yellow-500'; // Due within 24 hours
    return 'text-green-500'; // Due later
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return 'No due date';
    return new Date(dueDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'NOT_STARTED':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'IN_PROGRESS':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'PENDING':
      case 'NOT_STARTED':
        return 'secondary';
      case 'IN_PROGRESS':
        return 'default';
      case 'COMPLETED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const renderActiveTasksTable = () => {
    if (isLoading || isAssignableTasksLoading) {
      return <p className="text-muted-foreground p-4">Loading active tasks...</p>;
    }

    // Combine assigned tasks (PENDING/IN_PROGRESS) and assignable tasks
    const myActiveTasks = dashboardData?.myTasks.filter(t => 
      t.status === 'PENDING' || t.status === 'IN_PROGRESS'
    ) || [];
    
    const availableForAssignment = assignableTasks.filter(t => 
      !rejectedTasks.has(t.instanceTaskId) && 
      (t.status === 'PENDING' || t.status === 'IN_PROGRESS')
    ) || [];

    const allActiveTasks = [
      ...myActiveTasks.map(task => ({ ...task, isAssigned: true })),
      ...availableForAssignment.map(task => ({ ...task, isAssigned: false }))
    ];

    if (allActiveTasks.length === 0) {
      return <p className="text-muted-foreground p-4">No active tasks available.</p>;
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Workflow Name</TableHead>
            <TableHead>Task Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due By</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allActiveTasks.map((task) => (
            <TableRow key={`active-${task.instanceTaskId}`}>
              <TableCell className="font-medium">
                {task.workflowName || 'Unknown Workflow'}
              </TableCell>
              <TableCell>{task.taskName}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <Badge variant={getStatusBadgeVariant(task.status)}>
                    {task.status}
                  </Badge>
                  {task.isAssigned && (
                    <Badge variant="secondary" className="text-xs">
                      MINE
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className={getDueDateIndicator(task.dueDate)}>
                  {formatDueDate(task.dueDate)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {!task.isAssigned && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleAssignTask(task)}
                        className="h-8"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Assign
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectTask(task.instanceTaskId)}
                        className="h-8"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {task.isAssigned && task.status === 'IN_PROGRESS' && (
                    <Button size="sm" variant="secondary" className="h-8">
                      In Progress
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderCompletedTasksTable = () => {
    if (isLoading) {
      return <p className="text-muted-foreground p-4">Loading completed tasks...</p>;
    }

    const completedTasks = dashboardData?.myTasks.filter(t => t.status === 'COMPLETED') || [];

    if (completedTasks.length === 0) {
      return <p className="text-muted-foreground p-4">No completed tasks.</p>;
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Workflow Name</TableHead>
            <TableHead>Task Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due By</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {completedTasks.map((task) => (
            <TableRow key={`completed-${task.instanceTaskId}`}>
              <TableCell className="font-medium">
                {task.workflowName || 'Unknown Workflow'}
              </TableCell>
              <TableCell>{task.taskName}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <Badge variant={getStatusBadgeVariant(task.status)}>
                    {task.status}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <span className={getDueDateIndicator(task.dueDate)}>
                  {formatDueDate(task.dueDate)}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  COMPLETED
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderUpcomingTasksTable = () => {
    if (isLoading) {
      return <p className="text-muted-foreground p-4">Loading upcoming tasks...</p>;
    }

    const upcomingTasks = dashboardData?.myTasks.filter(t => t.status === 'NOT_STARTED') || [];

    if (upcomingTasks.length === 0) {
      return <p className="text-muted-foreground p-4">No upcoming tasks.</p>;
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Workflow Name</TableHead>
            <TableHead>Task Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due By</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {upcomingTasks.map((task) => (
            <TableRow key={`upcoming-${task.instanceTaskId}`}>
              <TableCell className="font-medium">
                {task.workflowName || 'Unknown Workflow'}
              </TableCell>
              <TableCell>{task.taskName}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <Badge variant={getStatusBadgeVariant(task.status)}>
                    NOT STARTED
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <span className={getDueDateIndicator(task.dueDate)}>
                  {formatDueDate(task.dueDate)}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  UPCOMING
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const handleRefreshAll = async () => {
    await Promise.all([
      fetchDashboardData(),
      fetchAssignableTasks()
    ]);
  };

  // Header actions for dashboard
  const headerActions = (
    <Button 
      onClick={handleRefreshAll} 
      variant="outline" 
      size="sm"
      disabled={isLoading || isAssignableTasksLoading}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${(isLoading || isAssignableTasksLoading) ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  );

  return (
    <MainLayout
      title="User Dashboard"
      subtitle="Manage your tasks and workflow activities"
      icon={LayoutDashboard}
      headerActions={headerActions}
    >
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Active Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderActiveTasksTable()}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="completed">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Completed Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderCompletedTasksTable()}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="upcoming">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Upcoming Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderUpcomingTasksTable()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;