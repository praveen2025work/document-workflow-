import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  RefreshCw, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Plus,
  Search,
  Filter,
  Download,
  Send,
  UserPlus,
  Eye,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react';
import {
  getQueryDashboard,
  getQueryStatistics,
  createQuery,
  addQueryMessage,
  updateQueryStatus,
  reassignQuery,
  getQueryConversation,
  downloadQueryAttachment
} from '@/lib/queryApi';
import { Query, QueryStatistics, CreateQueryRequest } from '@/types/query';
import { useUser } from '@/context/UserContext';
import MainLayout from '@/components/MainLayout';

const QueriesPage: NextPage = () => {
  const [dashboardData, setDashboardData] = useState<{
    assignedToMe: Query[];
    raisedByMe: Query[];
    openQueries: Query[];
    resolvedQueries: Query[];
  } | null>(null);
  const [statistics, setStatistics] = useState<QueryStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
  // New query form states
  const [isCreateQueryOpen, setIsCreateQueryOpen] = useState(false);
  const [newQueryTitle, setNewQueryTitle] = useState('');
  const [newQueryDescription, setNewQueryDescription] = useState('');
  const [newQueryPriority, setNewQueryPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [newQueryAssignedTo, setNewQueryAssignedTo] = useState<number | null>(null);
  const [selectedInstanceTaskId, setSelectedInstanceTaskId] = useState<number | null>(null);
  
  // Response states
  const [responseText, setResponseText] = useState('');
  const [reassignTo, setReassignTo] = useState<number | null>(null);

  const { user } = useUser();

  // Mock workflow users
  const workflowUsers = [
    { userId: 1, username: 'alice', role: 'Process Owner' },
    { userId: 2, username: 'bob', role: 'Reviewer' },
    { userId: 3, username: 'charlie', role: 'Approver' },
    { userId: 4, username: 'sarahwilson', role: 'Manager' },
    { userId: 5, username: 'diana', role: 'Analyst' },
    { userId: 6, username: 'frank', role: 'IT Support' },
  ];

  // Mock instance tasks for query creation
  const mockInstanceTasks = [
    { instanceTaskId: 1, taskName: 'Financial Data Upload', workflowName: 'Monthly Report Process' },
    { instanceTaskId: 2, taskName: 'Document Review', workflowName: 'Approval Workflow' },
    { instanceTaskId: 3, taskName: 'Data Consolidation', workflowName: 'Quarterly Analysis' },
    { instanceTaskId: 4, taskName: 'Final Approval', workflowName: 'Budget Planning' },
    { instanceTaskId: 5, taskName: 'File Processing', workflowName: 'Document Management' },
  ];

  const fetchDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [dashboard, stats] = await Promise.all([
        getQueryDashboard(user.userId),
        getQueryStatistics(user.userId)
      ]);
      setDashboardData(dashboard);
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching query dashboard data:', error);
      toast.error('Failed to fetch query data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleCreateQuery = async () => {
    if (!user || !newQueryTitle || !newQueryDescription || !newQueryAssignedTo || !selectedInstanceTaskId) {
      toast.error('Please fill in all required fields including task selection');
      return;
    }

    try {
      await createQuery({
        instanceTaskId: selectedInstanceTaskId,
        queryTitle: newQueryTitle,
        queryDescription: newQueryDescription,
        raisedByUserId: user.userId,
        assignedToUserId: newQueryAssignedTo,
        priority: newQueryPriority,
        createdBy: user.username
      });
      
      toast.success('Query created successfully');
      setNewQueryTitle('');
      setNewQueryDescription('');
      setNewQueryAssignedTo(null);
      setSelectedInstanceTaskId(null);
      setIsCreateQueryOpen(false);
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating query:', error);
      toast.error('Failed to create query');
    }
  };

  const handleSendResponse = async (queryId: number) => {
    if (!user || !responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      await addQueryMessage(queryId, {
        messageText: responseText,
        messageType: 'TEXT',
        sentByUserId: user.userId,
        sentBy: user.username
      });
      
      toast.success('Response sent successfully');
      setResponseText('');
      // Refresh the selected query to show the new message
      if (selectedQuery) {
        // In a real app, you'd fetch the updated query here
        setSelectedQuery({
          ...selectedQuery,
          messages: [
            ...selectedQuery.messages,
            {
              id: Date.now(),
              messageText: responseText,
              messageType: 'TEXT',
              sentByUserId: user.userId,
              sentBy: user.username,
              sentAt: new Date().toISOString(),
              attachments: []
            }
          ]
        });
      }
      fetchDashboardData();
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    }
  };

  const handleReassignQuery = async (queryId: number) => {
    if (!user || !reassignTo) {
      toast.error('Please select a user to reassign to');
      return;
    }

    try {
      await reassignQuery(queryId, {
        newAssignedUserId: reassignTo,
        reassignedByUserId: user.userId,
        reassignmentReason: 'Reassigned from query dashboard',
        reassignedBy: user.username
      });
      
      toast.success('Query reassigned successfully');
      setReassignTo(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error reassigning query:', error);
      toast.error('Failed to reassign query');
    }
  };

  const handleResolveQuery = async (queryId: number) => {
    if (!user) return;

    try {
      await updateQueryStatus(queryId, {
        queryStatus: 'RESOLVED',
        resolutionNotes: 'Query resolved from dashboard',
        updatedByUserId: user.userId,
        updatedBy: user.username
      });
      
      toast.success('Query marked as resolved');
      fetchDashboardData();
    } catch (error) {
      console.error('Error resolving query:', error);
      toast.error('Failed to resolve query');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500 text-white';
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MEDIUM':
        return 'bg-yellow-500 text-black';
      case 'LOW':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filterQueries = (queries: Query[]) => {
    return queries.filter(query => {
      const matchesSearch = query.queryTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           query.queryDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || query.queryStatus === filterStatus;
      const matchesPriority = filterPriority === 'all' || query.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  const renderQueryCard = (query: Query, showActions: boolean = true) => {
    // Check if the current user is relevant to this query (either raised by them or assigned to them)
    const isRelevantToUser = user && (query.raisedByUserId === user.userId || query.assignedToUserId === user.userId);
    
    return (
      <Card key={query.id} className="mb-4 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-sm truncate">{query.queryTitle}</h3>
                <Badge className={`text-xs ${getPriorityColor(query.priority)}`}>
                  {query.priority}
                </Badge>
                <Badge className={`text-xs ${getStatusColor(query.queryStatus)}`}>
                  {query.queryStatus}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {query.queryDescription}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Raised by: {query.raisedBy}
                </span>
                <span className="flex items-center gap-1">
                  <UserPlus className="h-3 w-3" />
                  Assigned to: {query.assignedTo}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(query.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {query.resolutionNotes && (
            <div className="p-2 bg-muted rounded text-xs mb-3">
              <p className="font-medium">Resolution:</p>
              <p>{query.resolutionNotes}</p>
            </div>
          )}

          {(showActions || isRelevantToUser) && (
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              {/* Show Chat button for queries relevant to the user */}
              {isRelevantToUser && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedQuery(query);
                    setIsConversationOpen(true);
                  }}
                  className="h-7 text-xs"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Chat
                </Button>
              )}
              
              {/* Show action buttons only for queries assigned to the current user and are open */}
              {showActions && query.queryStatus === 'OPEN' && query.assignedToUserId === user?.userId && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleResolveQuery(query.id)}
                    className="h-7 text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Resolve
                  </Button>
                  <Select value={reassignTo?.toString() || ''} onValueChange={(value) => setReassignTo(value ? parseInt(value) : null)}>
                    <SelectTrigger className="h-7 text-xs w-32">
                      <SelectValue placeholder="Reassign..." />
                    </SelectTrigger>
                    <SelectContent>
                      {workflowUsers.filter(u => u.userId !== query.assignedToUserId).map((user) => (
                        <SelectItem key={user.userId} value={user.userId.toString()}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {reassignTo && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReassignQuery(query.id)}
                      className="h-7 text-xs"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Reassign
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderStatisticsCards = () => {
    if (!statistics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Queries</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{statistics.openQueries}</p>
              </div>
              <div className="h-8 w-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statistics.resolvedQueries}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total Queries</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statistics.totalQueries}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Resolution</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{statistics.averageResolutionTime}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      <Dialog open={isCreateQueryOpen} onOpenChange={setIsCreateQueryOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Query
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Query</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="instance-task">Related Task *</Label>
              <Select value={selectedInstanceTaskId?.toString() || ''} onValueChange={(value) => setSelectedInstanceTaskId(value ? parseInt(value) : null)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a task for this query" />
                </SelectTrigger>
                <SelectContent>
                  {mockInstanceTasks.map((task) => (
                    <SelectItem key={task.instanceTaskId} value={task.instanceTaskId.toString()}>
                      {task.taskName} - {task.workflowName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="query-title">Query Title</Label>
              <Input
                id="query-title"
                value={newQueryTitle}
                onChange={(e) => setNewQueryTitle(e.target.value)}
                placeholder="Enter query title..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="query-description">Query Description</Label>
              <Textarea
                id="query-description"
                value={newQueryDescription}
                onChange={(e) => setNewQueryDescription(e.target.value)}
                placeholder="Describe your query in detail..."
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="query-priority">Priority</Label>
                <Select value={newQueryPriority} onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => setNewQueryPriority(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="query-assigned-to">Assign To</Label>
                <Select value={newQueryAssignedTo?.toString() || ''} onValueChange={(value) => setNewQueryAssignedTo(value ? parseInt(value) : null)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {workflowUsers.map((user) => (
                      <SelectItem key={user.userId} value={user.userId.toString()}>
                        {user.username} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateQueryOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateQuery}
                disabled={!newQueryTitle || !newQueryDescription || !newQueryAssignedTo || !selectedInstanceTaskId}
              >
                Create Query
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Button 
        onClick={fetchDashboardData} 
        variant="outline" 
        size="sm"
        disabled={isLoading}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );

  return (
    <MainLayout
      title="Query Management"
      subtitle="Manage and track all your queries"
      icon={MessageSquare}
      headerActions={headerActions}
    >
      <div className="p-6 h-full overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-full"
        >
          {/* Statistics Cards */}
          {renderStatisticsCards()}

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search queries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs defaultValue="assigned" className="w-full">
              <TabsList className="grid w-full grid-cols-4 glass">
                <TabsTrigger value="assigned" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Assigned to Me ({dashboardData?.assignedToMe.length || 0})
                </TabsTrigger>
                <TabsTrigger value="raised" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Raised by Me ({dashboardData?.raisedByMe.length || 0})
                </TabsTrigger>
                <TabsTrigger value="open" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Open ({dashboardData?.openQueries.length || 0})
                </TabsTrigger>
                <TabsTrigger value="resolved" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Resolved ({dashboardData?.resolvedQueries.length || 0})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="assigned" className="mt-6">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Queries Assigned to Me
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px]">
                      {dashboardData?.assignedToMe && dashboardData.assignedToMe.length > 0 ? (
                        filterQueries(dashboardData.assignedToMe).map(query => renderQueryCard(query))
                      ) : (
                        <p className="text-muted-foreground text-center py-8">No queries assigned to you.</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="raised" className="mt-6">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Queries Raised by Me
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px]">
                      {dashboardData?.raisedByMe && dashboardData.raisedByMe.length > 0 ? (
                        filterQueries(dashboardData.raisedByMe).map(query => renderQueryCard(query, false))
                      ) : (
                        <p className="text-muted-foreground text-center py-8">You haven't raised any queries yet.</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="open" className="mt-6">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Open Queries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px]">
                      {dashboardData?.openQueries && dashboardData.openQueries.length > 0 ? (
                        filterQueries(dashboardData.openQueries).map(query => renderQueryCard(query))
                      ) : (
                        <p className="text-muted-foreground text-center py-8">No open queries.</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="resolved" className="mt-6">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Resolved Queries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px]">
                      {dashboardData?.resolvedQueries && dashboardData.resolvedQueries.length > 0 ? (
                        filterQueries(dashboardData.resolvedQueries).map(query => renderQueryCard(query, false))
                      ) : (
                        <p className="text-muted-foreground text-center py-8">No resolved queries.</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>

      {/* Query Conversation Dialog */}
      <Dialog open={isConversationOpen} onOpenChange={setIsConversationOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedQuery?.queryTitle} - Chat History
            </DialogTitle>
          </DialogHeader>
          {selectedQuery && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${getPriorityColor(selectedQuery.priority)}`}>
                  {selectedQuery.priority}
                </Badge>
                <Badge className={`text-xs ${getStatusColor(selectedQuery.queryStatus)}`}>
                  {selectedQuery.queryStatus}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Task: {mockInstanceTasks.find(t => t.instanceTaskId === selectedQuery.instanceTaskId)?.taskName || 'Unknown Task'}
                </span>
              </div>
              
              <div className="p-3 bg-muted rounded">
                <p className="text-sm font-medium mb-1">Original Query:</p>
                <p className="text-sm">{selectedQuery.queryDescription}</p>
              </div>

              <ScrollArea className="h-[300px] border rounded p-3">
                <div className="space-y-3">
                  {/* Initial query message */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{selectedQuery.raisedBy}</span>
                      <Clock className="h-3 w-3" />
                      <span>{new Date(selectedQuery.createdAt).toLocaleString()}</span>
                      <Badge variant="outline" className="text-xs">Query Created</Badge>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
                      <p className="text-sm">{selectedQuery.queryDescription}</p>
                    </div>
                  </div>

                  {/* Conversation messages */}
                  {selectedQuery.messages.map((message) => (
                    <div key={message.id} className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{message.sentBy}</span>
                        <Clock className="h-3 w-3" />
                        <span>{new Date(message.sentAt).toLocaleString()}</span>
                      </div>
                      <div className="p-2 bg-background border rounded">
                        <p className="text-sm">{message.messageText}</p>
                        {message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center gap-2 text-xs">
                                <Download className="h-3 w-3" />
                                <span>{attachment.fileName}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {selectedQuery.queryStatus === 'RESOLVED' && selectedQuery.resolutionNotes && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>System</span>
                        <Clock className="h-3 w-3" />
                        <span>{new Date(selectedQuery.updatedAt || selectedQuery.createdAt).toLocaleString()}</span>
                        <Badge variant="default" className="text-xs bg-green-600">Resolved</Badge>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
                        <p className="text-sm font-medium mb-1">Resolution:</p>
                        <p className="text-sm">{selectedQuery.resolutionNotes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {selectedQuery.queryStatus === 'OPEN' && selectedQuery.assignedToUserId === user?.userId && (
                <div className="space-y-3 border-t pt-4">
                  <div>
                    <Label htmlFor="response">Add Comment</Label>
                    <Textarea
                      id="response"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Type your response..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleResolveQuery(selectedQuery.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </Button>
                    <Button
                      onClick={() => handleSendResponse(selectedQuery.id)}
                      disabled={!responseText.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Response
                    </Button>
                  </div>
                </div>
              )}

              {selectedQuery.queryStatus !== 'OPEN' && (
                <div className="text-center py-4 text-muted-foreground border-t">
                  <p className="text-sm">This query has been {selectedQuery.queryStatus.toLowerCase()}.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default QueriesPage;