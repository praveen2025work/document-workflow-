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
import { LayoutDashboard, RefreshCw, Clock, CheckCircle, AlertCircle, X, Check, Play, Pause, UserCheck, Timer, Target, FileText, User, Settings, Eye } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import { TaskDetailsPanel } from '@/components/TaskDetailsPanel';

const DashboardPage: NextPage = () => {
  const [dashboardData, setDashboardData] = useState<UserDashboard | null>(null);
  const [assignableTasks, setAssignableTasks] = useState<AssignableTask[]>([]);
  const [rejectedTasks, setRejectedTasks] = useState<Set<number>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [isAssignableTasksLoading, setIsAssignableTasksLoading] = useState(false);
  
  // Task details panel states
  const [selectedTask, setSelectedTask] = useState<DashboardTask | AssignableTask | null>(null);
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  
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

  const handleOpenTaskDetails = (task: DashboardTask | AssignableTask) => {
    setSelectedTask(task);
    setIsTaskPanelOpen(true);
  };

  const handleCloseTaskPanel = () => {
    setSelectedTask(null);
    setIsTaskPanelOpen(false);
  };

  const handleTaskUpdate = () => {
    // Refresh data after task update
    fetchDashboardData();
    fetchAssignableTasks();
  };

  const getDueDateWithPriority = (dueDate?: string) => {
    if (!dueDate) return { 
      colorClass: 'text-gray-500', 
      priorityDot: 'bg-gray-400',
      formattedDate: 'No due date',
      priorityLabel: 'No Priority'
    };
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    let colorClass = '';
    let priorityDot = '';
    let priorityLabel = '';
    
    if (diffHours < 0) {
      colorClass = 'text-red-500';
      priorityDot = 'bg-red-500';
      priorityLabel = 'Overdue';
    } else if (diffHours < 24) {
      colorClass = 'text-orange-500';
      priorityDot = 'bg-orange-500';
      priorityLabel = 'High Priority';
    } else if (diffHours < 72) {
      colorClass = 'text-yellow-500';
      priorityDot = 'bg-yellow-500';
      priorityLabel = 'Medium Priority';
    } else {
      colorClass = 'text-green-500';
      priorityDot = 'bg-green-500';
      priorityLabel = 'Low Priority';
    }

    const formattedDate = due.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return { colorClass, priorityDot, formattedDate, priorityLabel };
  };

  const getStatusIcon = (status: string, isAssigned?: boolean) => {
    if (status === 'IN_PROGRESS') {
      return isAssigned ? 
        <Play className="h-4 w-4 text-blue-500" /> : 
        <Clock className="h-4 w-4 text-yellow-500" />;
    }
    switch (status) {
      case 'NOT_STARTED':
        return <Pause className="h-4 w-4 text-gray-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string, isAssigned?: boolean): "default" | "secondary" | "destructive" | "outline" => {
    if (status === 'IN_PROGRESS') {
      return isAssigned ? 'default' : 'secondary';
    }
    switch (status) {
      case 'NOT_STARTED':
        return 'outline';
      case 'COMPLETED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string, isAssigned?: boolean) => {
    if (status === 'IN_PROGRESS') {
      return isAssigned ? 'ASSIGNED' : 'AVAILABLE';
    }
    switch (status) {
      case 'NOT_STARTED':
        return 'NOT STARTED';
      case 'COMPLETED':
        return 'COMPLETED';
      default:
        return status;
    }
  };

  const getTaskTypeIcon = (taskType?: string) => {
    switch (taskType) {
      case 'FILE_UPLOAD':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'FILE_UPDATE':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'CONSOLIDATE_FILES':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'DECISION':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderActiveTasksTable = () => {
    if (isLoading || isAssignableTasksLoading) {
      return <p className="text-muted-foreground p-4">Loading active tasks...</p>;
    }

    // Get assigned tasks (IN_PROGRESS with assignedTo = current user)
    const myActiveTasks = dashboardData?.myTasks.filter(t => 
      t.status === 'IN_PROGRESS' && t.assignedTo === user?.userId
    ) || [];
    
    // Get unassigned tasks (IN_PROGRESS with assignedTo = null)
    const availableForAssignment = assignableTasks.filter(t => 
      !rejectedTasks.has(t.instanceTaskId) && 
      t.status === 'IN_PROGRESS' && 
      t.assignedTo === null
    ) || [];

    const allActiveTasks = [
      ...myActiveTasks.map(task => ({ ...task, isAssigned: true })),
      ...availableForAssignment.map(task => ({ ...task, isAssigned: false }))
    ];

    if (allActiveTasks.length === 0) {
      return <p className="text-muted-foreground p-4">No active tasks available.</p>;
    }

    // Compact view when panel is open
    if (isTaskPanelOpen) {
      return (
        <div className="space-y-2">
          {allActiveTasks.map((task) => (
            <Card 
              key={`active-compact-${task.instanceTaskId}`}
              className={`p-2 cursor-pointer hover:bg-muted/50 transition-colors ${
                task.isAssigned ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
              } ${selectedTask?.instanceTaskId === task.instanceTaskId ? 'ring-2 ring-primary' : ''}`}
              onClick={() => task.isAssigned && handleOpenTaskDetails(task)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`w-1 h-6 rounded-full ${task.isAssigned ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-xs truncate">{task.taskName}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {task.workflowName || 'Unknown Workflow'}
                    </div>
                  </div>
                </div>
                {task.isAssigned && (
                  <Eye className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50">
              <TableHead className="w-[200px]">Workflow</TableHead>
              <TableHead className="w-[250px]">Task Details</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[200px]">Due Date & Priority</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allActiveTasks.map((task) => {
              return (
                <TableRow 
                  key={`active-${task.instanceTaskId}`}
                  className={`hover:bg-muted/50 transition-colors ${
                    task.isAssigned ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className={`w-1 h-8 rounded-full ${task.isAssigned ? 'bg-blue-500' : 'bg-gray-300'}`} />
                      <div>
                        <div className="font-semibold text-sm">
                          {task.workflowName || 'Unknown Workflow'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {task.instanceId || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTaskTypeIcon((task as any).taskType)}
                      <div>
                        <div className="font-medium text-sm">{task.taskName}</div>
                        <div className="text-xs text-muted-foreground">
                          {(task as any).taskType || 'General Task'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status, task.isAssigned)}
                      <Badge 
                        variant={getStatusBadgeVariant(task.status, task.isAssigned)}
                        className={`text-xs ${task.isAssigned ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}`}
                      >
                        {getStatusText(task.status, task.isAssigned)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getDueDateWithPriority(task.dueDate).priorityDot}`} />
                        <div className="text-sm">
                          <div className={getDueDateWithPriority(task.dueDate).colorClass}>
                            {getDueDateWithPriority(task.dueDate).formattedDate}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getDueDateWithPriority(task.dueDate).priorityLabel}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {!task.isAssigned && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAssignTask(task)}
                            className="h-7 px-2 text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Assign
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectTask(task.instanceTaskId)}
                            className="h-7 px-2 text-xs"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      {task.isAssigned && task.status === 'IN_PROGRESS' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenTaskDetails(task)}
                            className="h-7 px-2 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
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

    // Compact view when panel is open
    if (isTaskPanelOpen) {
      return (
        <div className="space-y-2">
          {completedTasks.map((task) => (
            <Card 
              key={`completed-compact-${task.instanceTaskId}`}
              className={`p-2 cursor-pointer hover:bg-muted/50 transition-colors bg-green-50/30 dark:bg-green-950/10 ${
                selectedTask?.instanceTaskId === task.instanceTaskId ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleOpenTaskDetails(task)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-1 h-6 rounded-full bg-green-500" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-xs truncate">{task.taskName}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {task.workflowName || 'Unknown Workflow'}
                    </div>
                  </div>
                </div>
                <Eye className="h-3 w-3 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50">
              <TableHead className="w-[200px]">Workflow</TableHead>
              <TableHead className="w-[250px]">Task Details</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[200px]">Due Date & Priority</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {completedTasks.map((task) => {
              return (
                <TableRow 
                  key={`completed-${task.instanceTaskId}`}
                  className="hover:bg-muted/50 transition-colors bg-green-50/30 dark:bg-green-950/10"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-8 rounded-full bg-green-500" />
                      <div>
                        <div className="font-semibold text-sm">
                          {task.workflowName || 'Unknown Workflow'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {task.instanceId || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTaskTypeIcon((task as any).taskType)}
                      <div>
                        <div className="font-medium text-sm">{task.taskName}</div>
                        <div className="text-xs text-muted-foreground">
                          {(task as any).taskType || 'General Task'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        COMPLETED
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getDueDateWithPriority(task.dueDate).priorityDot}`} />
                        <div className="text-sm">
                          <div className={getDueDateWithPriority(task.dueDate).colorClass}>
                            {getDueDateWithPriority(task.dueDate).formattedDate}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getDueDateWithPriority(task.dueDate).priorityLabel}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenTaskDetails(task)}
                      className="h-7 px-2 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
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

    // Compact view when panel is open
    if (isTaskPanelOpen) {
      return (
        <div className="space-y-2">
          {upcomingTasks.map((task) => (
            <Card 
              key={`upcoming-compact-${task.instanceTaskId}`}
              className={`p-2 cursor-pointer hover:bg-muted/50 transition-colors bg-gray-50/30 dark:bg-gray-950/10 ${
                selectedTask?.instanceTaskId === task.instanceTaskId ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleOpenTaskDetails(task)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-1 h-6 rounded-full bg-gray-400" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-xs truncate">{task.taskName}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {task.workflowName || 'Unknown Workflow'}
                    </div>
                  </div>
                </div>
                <Eye className="h-3 w-3 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50">
              <TableHead className="w-[200px]">Workflow</TableHead>
              <TableHead className="w-[250px]">Task Details</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[200px]">Due Date & Priority</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {upcomingTasks.map((task) => {
              return (
                <TableRow 
                  key={`upcoming-${task.instanceTaskId}`}
                  className="hover:bg-muted/50 transition-colors bg-gray-50/30 dark:bg-gray-950/10"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-8 rounded-full bg-gray-400" />
                      <div>
                        <div className="font-semibold text-sm">
                          {task.workflowName || 'Unknown Workflow'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {task.instanceId || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTaskTypeIcon((task as any).taskType)}
                      <div>
                        <div className="font-medium text-sm">{task.taskName}</div>
                        <div className="text-xs text-muted-foreground">
                          {(task as any).taskType || 'General Task'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                        <Pause className="h-3 w-3 mr-1" />
                        NOT STARTED
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getDueDateWithPriority(task.dueDate).priorityDot}`} />
                        <div className="text-sm">
                          <div className={getDueDateWithPriority(task.dueDate).colorClass}>
                            {getDueDateWithPriority(task.dueDate).formattedDate}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getDueDateWithPriority(task.dueDate).priorityLabel}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenTaskDetails(task)}
                      className="h-7 px-2 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
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

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (!dashboardData) return { active: 0, completed: 0, upcoming: 0, assignable: 0 };
    
    // Active tasks are IN_PROGRESS tasks assigned to current user
    const active = dashboardData.myTasks.filter(t => 
      t.status === 'IN_PROGRESS' && t.assignedTo === user?.userId
    ).length;
    
    const completed = dashboardData.myTasks.filter(t => t.status === 'COMPLETED').length;
    const upcoming = dashboardData.myTasks.filter(t => t.status === 'NOT_STARTED').length;
    
    // Assignable tasks are IN_PROGRESS tasks with no assignment that haven't been rejected
    const assignable = assignableTasks.filter(t => 
      !rejectedTasks.has(t.instanceTaskId) && 
      t.status === 'IN_PROGRESS' && 
      t.assignedTo === null
    ).length;
    
    return { active, completed, upcoming, assignable };
  };

  const stats = getSummaryStats();

  return (
    <MainLayout
      title="User Dashboard"
      subtitle="Manage your tasks and workflow activities"
      icon={LayoutDashboard}
      headerActions={headerActions}
    >
      <div className="flex h-full min-h-0">
        {/* Main Content */}
        <div className={`transition-all duration-300 ${isTaskPanelOpen ? 'w-[25%]' : 'w-full'} min-h-0`}>
          <div className="p-6 h-full overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              {/* Summary Cards - Show only when panel is closed or in compact mode when open */}
              {!isTaskPanelOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="glass">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.active}</p>
                        </div>
                        <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="glass">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Completed</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                        </div>
                        <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="glass">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.upcoming}</p>
                        </div>
                        <div className="h-8 w-8 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center">
                          <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="glass">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Available to Assign</p>
                          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.assignable}</p>
                        </div>
                        <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Compact view when panel is open */}
              {isTaskPanelOpen && selectedTask && (
                <div className="mb-4">
                  <Card className="glass">
                    <CardContent className="p-3">
                      <div className="text-center">
                        <h3 className="font-semibold text-sm truncate">{selectedTask.taskName}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {selectedTask.workflowName || 'Unknown Workflow'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Tabs defaultValue="active" className="w-full flex flex-col min-h-0">
                <TabsList className={`grid w-full grid-cols-3 glass ${isTaskPanelOpen ? 'mb-2' : ''}`}>
                  <TabsTrigger value="active" className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    {isTaskPanelOpen ? `${stats.active}` : `Active (${stats.active})`}
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {isTaskPanelOpen ? `${stats.completed}` : `Completed (${stats.completed})`}
                  </TabsTrigger>
                  <TabsTrigger value="upcoming" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {isTaskPanelOpen ? `${stats.upcoming}` : `Upcoming (${stats.upcoming})`}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="active" className="flex-1 min-h-0">
                  <Card className="glass h-full flex flex-col">
                    {!isTaskPanelOpen && (
                      <CardHeader className="flex-shrink-0">
                        <CardTitle className="text-foreground flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          Active Tasks
                        </CardTitle>
                      </CardHeader>
                    )}
                    <CardContent className={`flex-1 min-h-0 overflow-auto ${isTaskPanelOpen ? 'p-2' : ''}`}>
                      {renderActiveTasksTable()}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="completed" className="flex-1 min-h-0">
                  <Card className="glass h-full flex flex-col">
                    {!isTaskPanelOpen && (
                      <CardHeader className="flex-shrink-0">
                        <CardTitle className="text-foreground flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Completed Tasks
                        </CardTitle>
                      </CardHeader>
                    )}
                    <CardContent className={`flex-1 min-h-0 overflow-auto ${isTaskPanelOpen ? 'p-2' : ''}`}>
                      {renderCompletedTasksTable()}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="upcoming" className="flex-1 min-h-0">
                  <Card className="glass h-full flex flex-col">
                    {!isTaskPanelOpen && (
                      <CardHeader className="flex-shrink-0">
                        <CardTitle className="text-foreground flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Upcoming Tasks
                        </CardTitle>
                      </CardHeader>
                    )}
                    <CardContent className={`flex-1 min-h-0 overflow-auto ${isTaskPanelOpen ? 'p-2' : ''}`}>
                      {renderUpcomingTasksTable()}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>

        {/* Task Details Panel */}
        {isTaskPanelOpen && (
          <div className="w-[75%] h-full">
            <TaskDetailsPanel
              task={selectedTask}
              onClose={handleCloseTaskPanel}
              onTaskUpdate={handleTaskUpdate}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DashboardPage;