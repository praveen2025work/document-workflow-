import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Upload, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Plus,
  MessageSquare,
  Clock,
  User,
  Calendar,
  Target,
  History,
  ChevronDown,
  ChevronRight,
  Files
} from 'lucide-react';
import { 
  getTaskDetails, 
  uploadFile, 
  updateFile, 
  consolidateFiles, 
  downloadFile, 
  completeTaskWithOutcome,
  TaskDetails,
  TaskFile 
} from '@/lib/executionApi';
import {
  createQuery,
  addQueryMessage,
  updateQueryStatus,
  getQueryConversation
} from '@/lib/queryApi';
import { Query } from '@/types/query';
import { DashboardTask, AssignableTask } from '@/types/dashboard';
import { TaskFileManager } from './TaskFileManager';

interface TaskDetailsPanelProps {
  task: DashboardTask | AssignableTask | null;
  onClose: () => void;
  onTaskUpdate?: () => void;
}

export const TaskDetailsPanel: React.FC<TaskDetailsPanelProps> = ({
  task,
  onClose,
  onTaskUpdate
}) => {
  const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('files');
  const [expandedFileVersions, setExpandedFileVersions] = useState<Set<number>>(new Set());
  
  // File upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileCommentary, setFileCommentary] = useState('');
  
  // File update states
  const [selectedSourceFiles, setSelectedSourceFiles] = useState<number[]>([]);
  const [updateFiles, setUpdateFiles] = useState<File[]>([]);
  
  // Consolidation states
  const [consolidationFiles, setConsolidationFiles] = useState<number[]>([]);
  const [outputFileName, setOutputFileName] = useState('');
  
  // Decision states
  const [decisionOutcome, setDecisionOutcome] = useState('');
  const [decisionComments, setDecisionComments] = useState('');
  
  // Query states
  const [queryTitle, setQueryTitle] = useState('');
  const [queryDescription, setQueryDescription] = useState('');
  const [queryPriority, setQueryPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [queryAssignedTo, setQueryAssignedTo] = useState<number | null>(null);
  const [queryResponse, setQueryResponse] = useState('');
  const [reassignTo, setReassignTo] = useState<number | null>(null);
  
  // Query conversation states
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (task) {
      fetchTaskDetails();
    }
  }, [task]);

  const fetchTaskDetails = async () => {
    if (!task) return;
    
    setIsLoading(true);
    try {
      const details = await getTaskDetails(task.instanceTaskId);
      setTaskDetails(details);
      
      // Set default output filename for consolidation
      if (details.taskType === 'FILE_CONSOLIDATE') {
        setOutputFileName(`consolidated_${details.taskName.toLowerCase().replace(/\s+/g, '_')}.pdf`);
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      toast.error('Failed to load task details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!task || selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setIsLoading(true);
    try {
      for (const file of selectedFiles) {
        await uploadFile(task.instanceTaskId, file, fileCommentary);
      }
      toast.success('Files uploaded successfully');
      setSelectedFiles([]);
      setFileCommentary('');
      fetchTaskDetails();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpdate = async () => {
    if (!taskDetails || updateFiles.length === 0) {
      toast.error('Please select files to update');
      return;
    }

    setIsLoading(true);
    try {
      for (const file of updateFiles) {
        // Use the first selected source file ID for update
        const sourceFileId = selectedSourceFiles[0] || taskDetails.sourceFile?.instanceFileId;
        if (sourceFileId) {
          await updateFile(sourceFileId, file, fileCommentary);
        }
      }
      toast.success('Files updated successfully');
      setUpdateFiles([]);
      setFileCommentary('');
      fetchTaskDetails();
    } catch (error) {
      console.error('Error updating files:', error);
      toast.error('Failed to update files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsolidation = async () => {
    if (!task || consolidationFiles.length === 0 || !outputFileName) {
      toast.error('Please select files and provide output filename');
      return;
    }

    setIsLoading(true);
    try {
      await consolidateFiles(task.instanceTaskId, consolidationFiles, outputFileName);
      toast.success('Files consolidated successfully');
      setConsolidationFiles([]);
      fetchTaskDetails();
    } catch (error) {
      console.error('Error consolidating files:', error);
      toast.error('Failed to consolidate files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (file: TaskFile) => {
    try {
      const blob = await downloadFile(file.fileName, file.instanceFileId, file.version);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleCompleteTask = async () => {
    if (!task) return;

    setIsLoading(true);
    try {
      await completeTaskWithOutcome(task.instanceTaskId, decisionOutcome, decisionComments);
      toast.success('Task completed successfully');
      onTaskUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuery = async () => {
    if (!task || !queryTitle || !queryDescription || !queryAssignedTo) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await createQuery({
        instanceTaskId: task.instanceTaskId,
        queryTitle,
        queryDescription,
        raisedByUserId: 1, // Current user ID - should come from context
        assignedToUserId: queryAssignedTo,
        priority: queryPriority,
        createdBy: 'alice' // Current user - should come from context
      });
      toast.success('Query created successfully');
      setQueryTitle('');
      setQueryDescription('');
      setQueryAssignedTo(null);
      fetchTaskDetails();
    } catch (error) {
      console.error('Error creating query:', error);
      toast.error('Failed to create query');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock workflow users - in real app, this would come from API
  const workflowUsers = [
    { userId: 1, username: 'alice', role: 'Process Owner' },
    { userId: 2, username: 'bob', role: 'Reviewer' },
    { userId: 3, username: 'charlie', role: 'Approver' },
    { userId: 4, username: 'sarahwilson', role: 'Manager' },
    { userId: 5, username: 'diana', role: 'Analyst' },
  ];

  // Mock workflow task files - in real app, this would come from API based on workflow configuration
  const getWorkflowTaskFiles = () => {
    if (!taskDetails) return [];
    
    // Generate mock workflow task files based on task type
    const mockFiles = [];
    
    if (taskDetails.taskType === 'FILE_UPLOAD') {
      mockFiles.push({
        taskFileId: 1,
        fileName: 'Financial Data',
        fileDescription: 'Monthly financial data in Excel format',
        isRequired: true,
        allowedFileTypes: ['*.xlsx', '*.xls', '*.csv'],
        maxFileSize: '10MB',
        status: taskDetails.instanceTaskFiles && taskDetails.instanceTaskFiles.length > 0 ? 'UPLOADED' : 'PENDING',
        uploadedFiles: taskDetails.instanceTaskFiles || []
      });
      
      mockFiles.push({
        taskFileId: 2,
        fileName: 'Supporting Documents',
        fileDescription: 'Additional supporting documents (optional)',
        isRequired: false,
        allowedFileTypes: ['*.pdf', '*.docx'],
        maxFileSize: '5MB',
        status: 'PENDING',
        uploadedFiles: []
      });
    }
    
    if (taskDetails.taskType === 'FILE_UPDATE') {
      mockFiles.push({
        taskFileId: 3,
        fileName: 'Updated Financial Data',
        fileDescription: 'Updated version of the financial data',
        isRequired: true,
        allowedFileTypes: ['*.xlsx', '*.xls'],
        maxFileSize: '10MB',
        status: taskDetails.updatedFiles && taskDetails.updatedFiles.length > 0 ? 'UPLOADED' : 'PENDING',
        uploadedFiles: taskDetails.updatedFiles || []
      });
    }
    
    if (taskDetails.taskType === 'FILE_CONSOLIDATE') {
      mockFiles.push({
        taskFileId: 4,
        fileName: 'Consolidated Report',
        fileDescription: 'Final consolidated report',
        isRequired: true,
        allowedFileTypes: ['*.pdf'],
        maxFileSize: '25MB',
        status: taskDetails.consolidatedFile ? 'COMPLETED' : 'PENDING',
        uploadedFiles: taskDetails.consolidatedFile ? [taskDetails.consolidatedFile] : []
      });
    }
    
    return mockFiles;
  };

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'FILE_UPLOAD':
        return <Upload className="h-5 w-5 text-blue-500" />;
      case 'FILE_UPDATE':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'FILE_CONSOLIDATE':
        return <Target className="h-5 w-5 text-green-600" />;
      case 'FILE_DOWNLOAD':
        return <Download className="h-5 w-5 text-orange-500" />;
      case 'DECISION':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDueDateInfo = (dueDate?: string) => {
    if (!dueDate) return { 
      colorClass: 'text-gray-500', 
      priorityDot: 'bg-gray-400',
      formattedDate: 'No due date',
      priorityLabel: 'No Priority',
      daysLeft: null
    };
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    const daysLeft = Math.ceil(diffHours / 24);
    
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
      priorityLabel = 'Due Today';
    } else if (diffHours < 72) {
      colorClass = 'text-yellow-500';
      priorityDot = 'bg-yellow-500';
      priorityLabel = 'Due Soon';
    } else {
      colorClass = 'text-green-500';
      priorityDot = 'bg-green-500';
      priorityLabel = 'On Track';
    }

    const formattedDate = due.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return { colorClass, priorityDot, formattedDate, priorityLabel, daysLeft };
  };

  const toggleFileVersions = (fileId: number) => {
    const newExpanded = new Set(expandedFileVersions);
    if (newExpanded.has(fileId)) {
      newExpanded.delete(fileId);
    } else {
      newExpanded.add(fileId);
    }
    setExpandedFileVersions(newExpanded);
  };

  const groupFilesByName = (files: TaskFile[]) => {
    const grouped: { [key: string]: TaskFile[] } = {};
    files.forEach(file => {
      if (!grouped[file.fileName]) {
        grouped[file.fileName] = [];
      }
      grouped[file.fileName].push(file);
    });
    
    // Sort versions in descending order (latest first)
    Object.keys(grouped).forEach(fileName => {
      grouped[fileName].sort((a, b) => b.version - a.version);
    });
    
    return grouped;
  };

  const renderFileWithVersions = (fileName: string, versions: TaskFile[]) => {
    const latestVersion = versions[0];
    const hasMultipleVersions = versions.length > 1;
    const isExpanded = expandedFileVersions.has(latestVersion.instanceFileId);

    return (
      <Card key={fileName} className="mb-3">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              {hasMultipleVersions && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleFileVersions(latestVersion.instanceFileId)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{fileName}</p>
                  {hasMultipleVersions && (
                    <Badge variant="outline" className="text-xs">
                      <History className="h-3 w-3 mr-1" />
                      {versions.length} versions
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(latestVersion.fileSize)} • Version {latestVersion.version}
                  {latestVersion.actionType && ` • ${latestVersion.actionType}`}
                </p>
                {latestVersion.fileCommentary && (
                  <p className="text-xs text-muted-foreground mt-1">{latestVersion.fileCommentary}</p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(latestVersion)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
          
          {isExpanded && hasMultipleVersions && (
            <div className="mt-3 pl-6 border-l-2 border-muted">
              <div className="space-y-2">
                {versions.slice(1).map((version) => (
                  <div key={`${version.instanceFileId}-${version.version}`} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div>
                      <p className="text-sm font-medium">Version {version.version}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(version.fileSize)}
                        {version.actionType && ` • ${version.actionType}`}
                      </p>
                      {version.fileCommentary && (
                        <p className="text-xs text-muted-foreground mt-1">{version.fileCommentary}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(version)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderFileUploadActions = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="file-upload">Select Files</Label>
        <Input
          id="file-upload"
          type="file"
          multiple
          onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
          className="mt-1"
        />
        {taskDetails?.taskConfiguration.allowedFileTypes && (
          <p className="text-sm text-muted-foreground mt-1">
            Allowed types: {taskDetails.taskConfiguration.allowedFileTypes.join(', ')}
          </p>
        )}
        {taskDetails?.taskConfiguration.maxFileSize && (
          <p className="text-sm text-muted-foreground">
            Max size: {taskDetails.taskConfiguration.maxFileSize}
          </p>
        )}
      </div>
      
      <div>
        <Label htmlFor="file-commentary">Commentary (Optional)</Label>
        <Textarea
          id="file-commentary"
          value={fileCommentary}
          onChange={(e) => setFileCommentary(e.target.value)}
          placeholder="Add a comment about the files..."
          className="mt-1"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div>
          <Label>Selected Files:</Label>
          <div className="mt-2 space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={handleFileUpload} disabled={isLoading || selectedFiles.length === 0}>
        <Upload className="h-4 w-4 mr-2" />
        Upload Files
      </Button>
    </div>
  );

  const renderFileUpdateActions = () => (
    <div className="space-y-4">
      {taskDetails?.sourceFile && (
        <div>
          <Label>Source File</Label>
          <Card className="mt-2">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{taskDetails.sourceFile.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(taskDetails.sourceFile.fileSize)} • Version {taskDetails.sourceFile.version}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(taskDetails.sourceFile!)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <Label htmlFor="update-files">Select Updated Files</Label>
        <Input
          id="update-files"
          type="file"
          multiple
          onChange={(e) => setUpdateFiles(Array.from(e.target.files || []))}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="update-commentary">Commentary (Optional)</Label>
        <Textarea
          id="update-commentary"
          value={fileCommentary}
          onChange={(e) => setFileCommentary(e.target.value)}
          placeholder="Describe the changes made..."
          className="mt-1"
        />
      </div>

      <Button onClick={handleFileUpdate} disabled={isLoading || updateFiles.length === 0}>
        <FileText className="h-4 w-4 mr-2" />
        Update Files
      </Button>
    </div>
  );

  const renderConsolidationActions = () => (
    <div className="space-y-4">
      {taskDetails?.sourceFiles && taskDetails.sourceFiles.length > 0 && (
        <div>
          <Label>Available Files for Consolidation</Label>
          <div className="mt-2 space-y-2">
            {taskDetails.sourceFiles.map((file) => (
              <div key={file.instanceFileId} className="flex items-center space-x-2 p-2 border rounded">
                <Checkbox
                  checked={consolidationFiles.includes(file.instanceFileId)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setConsolidationFiles([...consolidationFiles, file.instanceFileId]);
                    } else {
                      setConsolidationFiles(consolidationFiles.filter(id => id !== file.instanceFileId));
                    }
                  }}
                />
                <div className="flex-1">
                  <p className="font-medium">{file.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.fileSize)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(file)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="output-filename">Output Filename</Label>
        <Input
          id="output-filename"
          value={outputFileName}
          onChange={(e) => setOutputFileName(e.target.value)}
          placeholder="consolidated_report.pdf"
          className="mt-1"
        />
      </div>

      <Button 
        onClick={handleConsolidation} 
        disabled={isLoading || consolidationFiles.length === 0 || !outputFileName}
      >
        <Target className="h-4 w-4 mr-2" />
        Consolidate Files
      </Button>
    </div>
  );

  const renderDecisionActions = () => (
    <div className="space-y-4">
      {taskDetails?.reviewFiles && taskDetails.reviewFiles.length > 0 && (
        <div>
          <Label>Files to Review</Label>
          <div className="mt-2 space-y-2">
            {Object.entries(groupFilesByName(taskDetails.reviewFiles)).map(([fileName, versions]) =>
              renderFileWithVersions(fileName, versions)
            )}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="decision-outcome">Decision</Label>
        <Select value={decisionOutcome} onValueChange={setDecisionOutcome}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select decision outcome" />
          </SelectTrigger>
          <SelectContent>
            {taskDetails?.taskConfiguration.decisionOptions?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="decision-comments">Comments</Label>
        <Textarea
          id="decision-comments"
          value={decisionComments}
          onChange={(e) => setDecisionComments(e.target.value)}
          placeholder="Add your decision comments..."
          className="mt-1"
        />
      </div>

      <Button 
        onClick={handleCompleteTask} 
        disabled={isLoading || !decisionOutcome}
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Submit Decision
      </Button>
    </div>
  );

  const handleViewConversation = async (query: any) => {
    setSelectedQuery(query);
    setConversationOpen(true);
    // In real implementation, fetch conversation here
    // const conversation = await getQueryConversation(query.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedQuery) return;
    
    try {
      await addQueryMessage(selectedQuery.id, {
        messageText: newMessage,
        messageType: 'TEXT',
        sentByUserId: 1, // Current user
        sentBy: 'alice' // Current user
      });
      setNewMessage('');
      // Refresh conversation
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleResolveQuery = async (queryId: number) => {
    try {
      await updateQueryStatus(queryId, {
        queryStatus: 'RESOLVED',
        resolutionNotes: queryResponse,
        updatedByUserId: 1,
        updatedBy: 'alice'
      });
      toast.success('Query resolved successfully');
      fetchTaskDetails();
    } catch (error) {
      console.error('Error resolving query:', error);
      toast.error('Failed to resolve query');
    }
  };

  const renderQuerySection = () => {

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Create New Query</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="query-title" className="text-xs">Query Title</Label>
              <Input
                id="query-title"
                value={queryTitle}
                onChange={(e) => setQueryTitle(e.target.value)}
                placeholder="Enter query title..."
                className="mt-1 h-8 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="query-description" className="text-xs">Query Description</Label>
              <Textarea
                id="query-description"
                value={queryDescription}
                onChange={(e) => setQueryDescription(e.target.value)}
                placeholder="Describe your query in detail..."
                className="mt-1 text-sm"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="query-priority" className="text-xs">Priority</Label>
                <Select value={queryPriority} onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') => setQueryPriority(value)}>
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="query-assigned-to" className="text-xs">Assign To</Label>
                <Select value={queryAssignedTo?.toString() || ''} onValueChange={(value) => setQueryAssignedTo(value ? parseInt(value) : null)}>
                  <SelectTrigger className="mt-1 h-8 text-sm">
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

            <Button 
              onClick={handleCreateQuery} 
              disabled={isLoading || !queryTitle || !queryDescription || !queryAssignedTo}
              size="sm"
              className="w-full h-8"
            >
              <MessageSquare className="h-3 w-3 mr-2" />
              Create Query
            </Button>
          </CardContent>
        </Card>

        {taskDetails?.queries && taskDetails.queries.length > 0 && (
          <div>
            <Label className="text-sm">Existing Queries</Label>
            <div className="mt-2 space-y-2">
              {taskDetails.queries.map((query) => (
                <Card key={query.queryId}>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate">{query.queryTitle}</p>
                            <Badge variant={query.queryStatus === 'OPEN' ? 'destructive' : query.queryStatus === 'RESOLVED' ? 'default' : 'secondary'} className="text-xs h-5">
                              {query.queryStatus}
                            </Badge>
                            <Badge variant="outline" className="text-xs h-5">{query.priority}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{query.queryDescription}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {query.raisedByUsername}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(query.createdAt).toLocaleDateString()}
                            </span>
                            {query.messages && query.messages.length > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {query.messages.length} messages
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewConversation(query)}
                          className="h-7 text-xs px-2"
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Chat
                        </Button>
                      </div>
                      
                      {query.resolutionNotes && (
                        <div className="p-2 bg-muted rounded text-xs">
                          <p className="font-medium">Resolution:</p>
                          <p>{query.resolutionNotes}</p>
                        </div>
                      )}

                      {query.queryStatus === 'OPEN' && (
                        <div className="space-y-2 pt-2 border-t border-border">
                          <div>
                            <Label className="text-xs">Quick Response</Label>
                            <Textarea
                              value={queryResponse}
                              onChange={(e) => setQueryResponse(e.target.value)}
                              placeholder="Type your response..."
                              className="mt-1 text-sm"
                              rows={2}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Select value={reassignTo?.toString() || ''} onValueChange={(value) => setReassignTo(value ? parseInt(value) : null)}>
                              <SelectTrigger className="h-7 text-xs flex-1">
                                <SelectValue placeholder="Reassign to..." />
                              </SelectTrigger>
                              <SelectContent>
                                {workflowUsers.map((user) => (
                                  <SelectItem key={user.userId} value={user.userId.toString()}>
                                    {user.username} ({user.role})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button 
                              size="sm" 
                              className="h-7 text-xs px-2"
                              onClick={() => handleResolveQuery(query.queryId)}
                              disabled={!queryResponse.trim()}
                            >
                              Resolve
                            </Button>
                            {reassignTo && (
                              <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                                Reassign
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Query Conversation Dialog */}
        <Dialog open={conversationOpen} onOpenChange={setConversationOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {selectedQuery?.queryTitle} - Conversation
              </DialogTitle>
            </DialogHeader>
            {selectedQuery && (
              <div className="flex flex-col h-[60vh]">
                {/* Query Info */}
                <div className="p-3 bg-muted/30 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={selectedQuery.queryStatus === 'OPEN' ? 'destructive' : selectedQuery.queryStatus === 'RESOLVED' ? 'default' : 'secondary'} className="text-xs">
                      {selectedQuery.queryStatus}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{selectedQuery.priority}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Assigned to: {selectedQuery.assignedToUsername}
                    </span>
                  </div>
                  <p className="text-sm">{selectedQuery.queryDescription}</p>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-3 pr-4">
                    {/* Initial query message */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{selectedQuery.raisedByUsername}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(selectedQuery.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm">{selectedQuery.queryDescription}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mock conversation messages */}
                    {selectedQuery.messages && selectedQuery.messages.map((message: any, index: number) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{message.sentBy}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.sentAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm">{message.messageText}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {selectedQuery.queryStatus === 'RESOLVED' && selectedQuery.resolutionNotes && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">System</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(selectedQuery.updatedAt).toLocaleString()}
                            </span>
                            <Badge variant="default" className="text-xs">Resolved</Badge>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-sm">{selectedQuery.resolutionNotes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                {selectedQuery.queryStatus !== 'RESOLVED' && (
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      rows={2}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="self-end"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  if (!task) return null;

  const dueDateInfo = getDueDateInfo(task.dueDate);

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="p-3 border-b border-border bg-muted/30">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {taskDetails && getTaskTypeIcon(taskDetails.taskType)}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base truncate">{task.taskName}</h3>
                <Badge variant="outline" className="text-xs h-5 shrink-0">
                  {taskDetails?.status || task.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate mb-2">
                {taskDetails?.workflowName || 'Loading...'}
              </p>
              
              {/* Inline Task Information */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span>Type:</span>
                  <span className="font-medium text-foreground">
                    {taskDetails?.taskType.replace('_', ' ') || 'FILE UPLOAD'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Assigned:</span>
                  <span className="font-medium text-foreground">
                    {taskDetails?.assignedToUsername || 'alice'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${dueDateInfo.priorityDot} mr-1`} />
                  <span className={`font-medium ${dueDateInfo.colorClass}`}>
                    {dueDateInfo.formattedDate}
                  </span>
                  {dueDateInfo.priorityLabel === 'Overdue' && (
                    <span className="text-red-500 font-medium ml-1">Overdue</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="shrink-0 ml-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading && !taskDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : taskDetails ? (
            <div className="space-y-4">
              {taskDetails.taskConfiguration.fileDescription && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{taskDetails.taskConfiguration.fileDescription}</p>
                </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="files">Files & Actions</TabsTrigger>
                  <TabsTrigger value="queries">Queries</TabsTrigger>
                </TabsList>

                <TabsContent value="files" className="space-y-4 mt-4">
                  <TaskFileManager
                    workflowTaskFiles={getWorkflowTaskFiles()}
                    taskDetails={taskDetails}
                    onDownload={handleDownload}
                    onFileUpload={handleFileUpload}
                    onFileUpdate={handleFileUpdate}
                    onConsolidation={handleConsolidation}
                    onCompleteTask={handleCompleteTask}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    fileCommentary={fileCommentary}
                    setFileCommentary={setFileCommentary}
                    selectedSourceFiles={selectedSourceFiles}
                    setSelectedSourceFiles={setSelectedSourceFiles}
                    updateFiles={updateFiles}
                    setUpdateFiles={setUpdateFiles}
                    consolidationFiles={consolidationFiles}
                    setConsolidationFiles={setConsolidationFiles}
                    outputFileName={outputFileName}
                    setOutputFileName={setOutputFileName}
                    decisionOutcome={decisionOutcome}
                    setDecisionOutcome={setDecisionOutcome}
                    decisionComments={decisionComments}
                    setDecisionComments={setDecisionComments}
                    isLoading={isLoading}
                    onViewVersions={(taskFileId) => {
                      console.log('View versions for task file:', taskFileId);
                    }}
                  />
                </TabsContent>

                <TabsContent value="queries" className="mt-4">
                  {renderQuerySection()}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Failed to load task details</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};