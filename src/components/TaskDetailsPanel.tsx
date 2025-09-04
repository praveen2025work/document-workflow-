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
  ChevronRight
} from 'lucide-react';
import { 
  getTaskDetails, 
  uploadFile, 
  updateFile, 
  consolidateFiles, 
  downloadFile, 
  completeTaskWithOutcome, 
  createQuery,
  TaskDetails,
  TaskFile 
} from '@/lib/executionApi';
import { DashboardTask, AssignableTask } from '@/types/dashboard';

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
  const [activeTab, setActiveTab] = useState('actions');
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
    if (!task || !queryTitle || !queryDescription) {
      toast.error('Please fill in query title and description');
      return;
    }

    setIsLoading(true);
    try {
      await createQuery(task.instanceTaskId, queryTitle, queryDescription, 2, queryPriority);
      toast.success('Query created successfully');
      setQueryTitle('');
      setQueryDescription('');
      fetchTaskDetails();
    } catch (error) {
      console.error('Error creating query:', error);
      toast.error('Failed to create query');
    } finally {
      setIsLoading(false);
    }
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

  const renderQuerySection = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="query-title">Query Title</Label>
        <Input
          id="query-title"
          value={queryTitle}
          onChange={(e) => setQueryTitle(e.target.value)}
          placeholder="Enter query title..."
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="query-description">Query Description</Label>
        <Textarea
          id="query-description"
          value={queryDescription}
          onChange={(e) => setQueryDescription(e.target.value)}
          placeholder="Describe your query in detail..."
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="query-priority">Priority</Label>
        <Select value={queryPriority} onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') => setQueryPriority(value)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleCreateQuery} disabled={isLoading || !queryTitle || !queryDescription}>
        <MessageSquare className="h-4 w-4 mr-2" />
        Create Query
      </Button>

      {taskDetails?.queries && taskDetails.queries.length > 0 && (
        <div className="mt-6">
          <Label>Existing Queries</Label>
          <div className="mt-2 space-y-2">
            {taskDetails.queries.map((query) => (
              <Card key={query.queryId}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{query.queryTitle}</p>
                        <Badge variant={query.queryStatus === 'OPEN' ? 'destructive' : 'default'}>
                          {query.queryStatus}
                        </Badge>
                        <Badge variant="outline">{query.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{query.queryDescription}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {query.raisedByUsername}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(query.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {query.resolutionNotes && (
                        <div className="mt-2 p-2 bg-muted rounded">
                          <p className="text-sm font-medium">Resolution:</p>
                          <p className="text-sm">{query.resolutionNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (!task) return null;

  const dueDateInfo = getDueDateInfo(task.dueDate);

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          {taskDetails && getTaskTypeIcon(taskDetails.taskType)}
          <div>
            <h3 className="font-semibold text-lg">{task.taskName}</h3>
            <p className="text-sm text-muted-foreground">
              {taskDetails?.workflowName || 'Loading...'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Task Info */}
      <div className="p-4 border-b border-border bg-muted/10">
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant="outline">{taskDetails?.status || task.status}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Assigned To:</span>
            <span className="font-medium">{taskDetails?.assignedToUsername || 'Loading...'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Task Type:</span>
            <span className="font-medium">{taskDetails?.taskType.replace('_', ' ') || 'Loading...'}</span>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${dueDateInfo.priorityDot}`} />
              <span className="text-muted-foreground">Due Date:</span>
            </div>
            <div className="pl-4">
              <div className={`font-medium ${dueDateInfo.colorClass}`}>
                {dueDateInfo.formattedDate}
              </div>
              <div className="text-xs text-muted-foreground">
                {dueDateInfo.priorityLabel}
                {dueDateInfo.daysLeft !== null && dueDateInfo.daysLeft > 0 && (
                  <span> • {dueDateInfo.daysLeft} days left</span>
                )}
              </div>
            </div>
          </div>
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
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                  <TabsTrigger value="queries">Queries</TabsTrigger>
                </TabsList>

                <TabsContent value="actions" className="space-y-4 mt-4">
                  {taskDetails.taskType === 'FILE_UPLOAD' && renderFileUploadActions()}
                  {taskDetails.taskType === 'FILE_UPDATE' && renderFileUpdateActions()}
                  {taskDetails.taskType === 'FILE_CONSOLIDATE' && renderConsolidationActions()}
                  {taskDetails.taskType === 'DECISION' && renderDecisionActions()}
                  
                  {taskDetails.taskType === 'FILE_DOWNLOAD' && taskDetails.availableFiles && (
                    <div className="space-y-4">
                      <Label>Available Downloads</Label>
                      <div className="space-y-2">
                        {Object.entries(groupFilesByName(taskDetails.availableFiles)).map(([fileName, versions]) =>
                          renderFileWithVersions(fileName, versions)
                        )}
                      </div>
                    </div>
                  )}

                  {/* Show existing files for completed tasks */}
                  {taskDetails.instanceTaskFiles && taskDetails.instanceTaskFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Task Files</Label>
                      {Object.entries(groupFilesByName(taskDetails.instanceTaskFiles)).map(([fileName, versions]) =>
                        renderFileWithVersions(fileName, versions)
                      )}
                    </div>
                  )}

                  {/* Complete Task Button */}
                  {taskDetails.status === 'IN_PROGRESS' && taskDetails.taskType !== 'DECISION' && (
                    <div className="pt-4 border-t border-border">
                      <Button 
                        onClick={handleCompleteTask} 
                        disabled={isLoading}
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </Button>
                    </div>
                  )}
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