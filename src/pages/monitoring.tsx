import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart3, RefreshCw, AlertTriangle, CheckCircle2, Clock, Users, TrendingUp, TrendingDown, UserCheck, UserX } from 'lucide-react';
import { getProcessOwnerDashboard, getProcessOwnerWorkload, reassignTask, escalateWorkflow } from '@/lib/processOwnerApi';
import { ProcessOwnerDashboardData, ProcessOwnerWorkload, WorkflowHealth, Task } from '@/types/processOwner';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import MainLayout from '@/components/MainLayout';

const MonitoringPage: NextPage = () => {
  const [dashboardData, setDashboardData] = useState<ProcessOwnerDashboardData | null>(null);
  const [workload, setWorkload] = useState<ProcessOwnerWorkload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [dashboard, workloadData] = await Promise.all([
        getProcessOwnerDashboard(user.userId),
        getProcessOwnerWorkload(user.userId),
      ]);
      setDashboardData(dashboard);
      setWorkload(workloadData);
      toast.success('Dashboard data refreshed successfully!');
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
      toast.error('Failed to load monitoring data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleReassign = async (taskId: number, newUserId: number) => {
    try {
      await reassignTask(taskId, newUserId, 'Reassigned from dashboard');
      toast.success(`Task ${taskId} reassigned successfully.`);
      fetchData(); // Refresh data after action
    } catch (error) {
      toast.error(`Failed to reassign task ${taskId}.`);
    }
  };

  const handleEscalate = async (workflowId: number, escalatedToUserId: number) => {
    try {
      await escalateWorkflow(workflowId, escalatedToUserId, 'Escalated from dashboard');
      toast.success(`Workflow ${workflowId} escalated successfully.`);
      fetchData(); // Refresh data after action
    } catch (error) {
      toast.error(`Failed to escalate workflow ${workflowId}.`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-500';
      case 'AT_RISK': return 'text-yellow-500';
      case 'UNHEALTHY': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const renderStatistics = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData?.statistics.activeWorkflows}</div>
          <p className="text-xs text-muted-foreground">Currently running processes</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Workflows</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData?.statistics.completedToday}</div>
          <p className="text-xs text-muted-foreground">Completed in the last 24 hours</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Delayed Tasks</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData?.statistics.delayedTasks}</div>
          <p className="text-xs text-muted-foreground">Tasks currently behind schedule</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData?.statistics.avgCompletionTime}</div>
          <p className="text-xs text-muted-foreground">Average time from start to finish</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderWorkflowHealth = () => (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Health</CardTitle>
        <CardDescription>Overview of all managed workflows and their current status.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Active Instances</TableHead>
              <TableHead>Delayed Tasks</TableHead>
              <TableHead>Avg. Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dashboardData?.workflowHealth.map((wf: WorkflowHealth) => (
              <TableRow key={wf.workflowId}>
                <TableCell className="font-medium">{wf.workflowName}</TableCell>
                <TableCell>
                  <Badge variant={wf.status === 'HEALTHY' ? 'default' : wf.status === 'AT_RISK' ? 'secondary' : 'destructive'} className={getStatusColor(wf.status)}>
                    {wf.status}
                  </Badge>
                </TableCell>
                <TableCell>{wf.activeInstances}</TableCell>
                <TableCell>{wf.delayedTasks}</TableCell>
                <TableCell>{wf.avgCompletionTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderUserWorkload = () => (
    <Card>
      <CardHeader>
        <CardTitle>User Workload</CardTitle>
        <CardDescription>Breakdown of task assignments across users.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Assigned Tasks</TableHead>
              <TableHead>Completed Tasks</TableHead>
              <TableHead>Avg. Task Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workload?.userWorkloads.map(userLoad => (
              <TableRow key={userLoad.userId}>
                <TableCell className="font-medium">{userLoad.userName}</TableCell>
                <TableCell>{userLoad.assignedTasks}</TableCell>
                <TableCell>{userLoad.completedTasks}</TableCell>
                <TableCell>{userLoad.avgTaskCompletionTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderActionableTasks = () => (
    <Card>
      <CardHeader>
        <CardTitle>Actionable Insights</CardTitle>
        <CardDescription>Tasks requiring immediate attention, such as bottlenecks or escalations.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Name</TableHead>
              <TableHead>Workflow</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dashboardData?.actionableInsights.map((task: Task) => (
              <TableRow key={task.taskId}>
                <TableCell className="font-medium">{task.taskName}</TableCell>
                <TableCell>{task.workflowName}</TableCell>
                <TableCell>{task.assignedTo}</TableCell>
                <TableCell>
                  <Badge variant={task.status === 'DELAYED' ? 'destructive' : 'secondary'}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleReassign(task.taskId, 2)}>Reassign</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleEscalate(task.workflowId, 3)}>Escalate</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const headerActions = (
    <Button 
      onClick={fetchData} 
      variant="outline" 
      size="sm"
      disabled={isLoading}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  );

  return (
    <MainLayout
      title="Process Owner Dashboard"
      subtitle="Monitor workflow execution and performance"
      icon={BarChart3}
      headerActions={headerActions}
    >
      <div className="flex-1 p-6 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {dashboardData && renderStatistics()}
            {dashboardData && renderWorkflowHealth()}
            {workload && renderUserWorkload()}
            {dashboardData && dashboardData.actionableInsights.length > 0 && renderActionableTasks()}
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default MonitoringPage;