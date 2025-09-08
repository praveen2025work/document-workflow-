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
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  ChevronsUpDown,
  Files,
  Paperclip,
  Send,
  ArrowLeft,
  Info
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
  const [selectedMessageFiles, setSelectedMessageFiles] = useState<File[]>([]);
  const [showQueryChat, setShowQueryChat] = useState(false);

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
        return <Upload className="h-5 w-5" />;
      case 'FILE_UPDATE':
        return <FileText className="h-5 w-5" />;
      case 'FILE_CONSOLIDATE':
        return <Target className="h-5 w-5" />;
      case 'FILE_DOWNLOAD':
        return <Download className="h-5 w-5" />;
      case 'DECISION':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
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
    setShowQueryChat(true);
    // In real implementation, fetch conversation here
    // const conversation = await getQueryConversation(query.id);
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && selectedMessageFiles.length === 0) || !selectedQuery) return;
    
    try {
      const messageData: any = {
        messageText: newMessage,
        messageType: selectedMessageFiles.length > 0 ? 'FILE' : 'TEXT',
        sentByUserId: 1, // Current user
        sentBy: 'alice' // Current user
      };

      if (selectedMessageFiles.length > 0) {
        messageData.attachments = selectedMessageFiles.map(file => ({
          fileName: file.name,
          filePath: `/uploads/queries/${file.name}`,
          fileSize: file.size,
          mimeType: file.type
        }));
      }

      await addQueryMessage(selectedQuery.id, messageData);
      setNewMessage('');
      setSelectedMessageFiles([]);
      toast.success('Message sent successfully');
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
      setQueryResponse('');
      fetchTaskDetails();
    } catch (error) {
      console.error('Error resolving query:', error);
      toast.error('Failed to resolve query');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedMessageFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedMessageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBackToQueryList = () => {
    setSelectedQuery(null);
    setShowQueryChat(false);
    setNewMessage('');
    setSelectedMessageFiles([]);
  };

  const canUserComment = (query: any) => {
    // User can comment if query is assigned to them and is in OPEN status
    return query.queryStatus === 'OPEN' && query.assignedToUserId === 1; // Current user ID
  };

  const renderQueryListSection = () => (
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
              <Card key={query.queryId} className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedQuery?.queryId === query.queryId ? 'ring-2 ring-primary' : ''
              }`}>
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

                    {query.queryStatus === 'OPEN' && canUserComment(query) && (
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
    </div>
  );

  const renderQueryChatSection = () => {
    if (!selectedQuery) return null;

    return (
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="p-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToQueryList}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{selectedQuery.queryTitle}</h3>
                <Badge variant={selectedQuery.queryStatus === 'OPEN' ? 'destructive' : selectedQuery.queryStatus === 'RESOLVED' ? 'default' : 'secondary'} className="text-xs h-5">
                  {selectedQuery.queryStatus}
                </Badge>
                <Badge variant="outline" className="text-xs h-5">{selectedQuery.priority}</Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Assigned to: {selectedQuery.assignedToUsername}
              </p>
            </div>
          </div>
        </div>

        {/* Query Description */}
        <div className="p-3 bg-muted/20 border-b border-border">
          <p className="text-sm">{selectedQuery.queryDescription}</p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-4">
            {/* Initial query message */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{selectedQuery.raisedByUsername}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(selectedQuery.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-lg">
                  <p className="text-sm">{selectedQuery.queryDescription}</p>
                </div>
              </div>
            </div>

            {/* Conversation messages */}
            {selectedQuery.messages && selectedQuery.messages.map((message: any, index: number) => (
              <div key={index} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.sentBy}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.sentAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm">{message.messageText}</p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment: any, attachIndex: number) => (
                          <div key={attachIndex} className="flex items-center gap-2 p-2 bg-background rounded border">
                            <Paperclip className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium">{attachment.fileName}</span>
                            <span className="text-xs text-muted-foreground">
                              ({formatFileSize(attachment.fileSize)})
                            </span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {selectedQuery.queryStatus === 'RESOLVED' && selectedQuery.resolutionNotes && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">System</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(selectedQuery.updatedAt).toLocaleString()}
                    </span>
                    <Badge variant="default" className="text-xs">Resolved</Badge>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/50 p-3 rounded-lg">
                    <p className="text-sm">{selectedQuery.resolutionNotes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        {selectedQuery.queryStatus !== 'RESOLVED' && canUserComment(selectedQuery) && (
          <div className="p-3 border-t border-border bg-muted/20">
            {/* File attachments preview */}
            {selectedMessageFiles.length > 0 && (
              <div className="mb-3 space-y-2">
                <Label className="text-xs">Attachments:</Label>
                {selectedMessageFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-background rounded border">
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium flex-1">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(file.size)})
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <div className="flex-1">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="resize-none"
                  rows={2}
                />
              </div>
              <div className="flex flex-col gap-1">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="message-file-input"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('message-file-input')?.click()}
                  className="h-8 w-8 p-0"
                >
                  <Paperclip className="h-3 w-3" />
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && selectedMessageFiles.length === 0}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderQuerySection = () => {
    if (showQueryChat && selectedQuery) {
      return renderQueryChatSection();
    }
    return renderQueryListSection();
  };

  if (!task) return null;

  const dueDateInfo = getDueDateInfo(task.dueDate);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'NOT_STARTED':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20';
      case 'COMPLETED':
        return 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20';
      case 'NOT_STARTED':
        return 'border-l-gray-500 bg-gray-50/50 dark:bg-gray-950/20';
      default:
        return 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20';
    }
  };

  return (
    <div className="h-full flex bg-muted/20 border-l border-border">
      {/* Main Content Panel */}
      <div className={`flex flex-col h-full transition-all duration-300 ${
        showQueryChat && selectedQuery ? 'w-2/5' : 'w-full'
      }`}>
        {/* Ribbon-style Header */}
        <div className="border-b border-border bg-background">
          {/* Title Bar */}
          <div className="flex items-center justify-between p-4 pb-2">
            <h3 className="font-semibold text-base">Task Details</h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Ribbon with Task Information */}
          <div className={`mx-4 mb-4 p-4 rounded-lg border-l-4 ${getStatusColor(taskDetails?.status || task.status)}`}>
            <div className="flex items-center justify-between gap-4">
              {/* Status Section */}
              <div className="flex items-center gap-2">
                {getStatusIcon(taskDetails?.status || task.status)}
                <div>
                  <p className="font-semibold text-sm">
                    {(taskDetails?.status || task.status).replace('_', ' ')}
                  </p>
                  <p className="text-xs text-muted-foreground">Status</p>
                </div>
              </div>

              {/* Assigned User Section */}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-sm">
                    {taskDetails?.assignedToUsername || task.assignedToUsername || 'alice'}
                  </p>
                  <p className="text-xs text-muted-foreground">Assigned to</p>
                </div>
              </div>

              {/* Due Date Section */}
              <div className="flex items-center gap-2">
                <Calendar className={`h-4 w-4 ${dueDateInfo.colorClass.replace('text-', 'text-')}`} />
                <div>
                  <p className={`font-semibold text-sm ${dueDateInfo.colorClass}`}>
                    {dueDateInfo.formattedDate}
                  </p>
                  <p className="text-xs text-muted-foreground">Due by</p>
                </div>
              </div>

              {/* Mark as Complete Section */}
              {(taskDetails?.status === 'IN_PROGRESS' || task.status === 'IN_PROGRESS') && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="mark-as-complete-switch"
                    checked={false}
                    onCheckedChange={handleCompleteTask}
                    disabled={isLoading}
                  />
                  <div>
                    <Label htmlFor="mark-as-complete-switch" className="font-semibold text-sm cursor-pointer">
                      Complete
                    </Label>
                    <p className="text-xs text-muted-foreground">Mark as done</p>
                  </div>
                </div>
              )}

              {/* Priority Badge for Overdue */}
              {dueDateInfo.priorityLabel === 'Overdue' && (
                <Badge variant="destructive" className="text-xs">
                  {dueDateInfo.priorityLabel}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              {isLoading && !taskDetails ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : taskDetails ? (
                <div>
                  {taskDetails.taskConfiguration.fileDescription && !showQueryChat && (
                    <div className="pb-4">
                      <Label>Description</Label>
                      <p className="text-sm text-muted-foreground mt-1">{taskDetails.taskConfiguration.fileDescription}</p>
                    </div>
                  )}

                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className={`grid w-full grid-cols-2 ${showQueryChat ? 'h-8' : 'h-10'}`}>
                      <TabsTrigger value="files" className={`${showQueryChat ? 'text-xs px-2' : ''}`}>
                        {showQueryChat ? 'Files' : 'Files & Actions'}
                      </TabsTrigger>
                      <TabsTrigger value="queries" className={`${showQueryChat ? 'text-xs px-2' : ''}`}>
                        Queries
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="files" className="mt-4">
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
      </div>

      {/* Query Chat Panel */}
      {showQueryChat && selectedQuery && (
        <div className="w-3/5 border-l border-border">
          {renderQueryChatSection()}
        </div>
      )}
    </div>
  );
};