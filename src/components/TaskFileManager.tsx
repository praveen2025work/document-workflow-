import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { 
  FileText, 
  Download, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X,
  History,
  ChevronDown,
  ChevronRight,
  Eye,
  Target,
  Plus,
  RefreshCw
} from 'lucide-react';
import { TaskFile, TaskDetails } from '@/lib/executionApi';

interface WorkflowTaskFile {
  taskFileId: number;
  fileName: string;
  fileDescription: string;
  isRequired: boolean;
  allowedFileTypes: string[];
  maxFileSize: string;
  status: 'PENDING' | 'UPLOADED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  uploadedFiles: TaskFile[];
  lastUploadedAt?: string;
  uploadedBy?: string;
}

interface TaskFileManagerProps {
  workflowTaskFiles: WorkflowTaskFile[];
  taskDetails: TaskDetails;
  onDownload: (file: TaskFile) => void;
  onFileUpload: () => void;
  onFileUpdate: () => void;
  onConsolidation: () => void;
  onCompleteTask: () => void;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  fileCommentary: string;
  setFileCommentary: (commentary: string) => void;
  selectedSourceFiles: number[];
  setSelectedSourceFiles: (files: number[]) => void;
  updateFiles: File[];
  setUpdateFiles: (files: File[]) => void;
  consolidationFiles: number[];
  setConsolidationFiles: (files: number[]) => void;
  outputFileName: string;
  setOutputFileName: (name: string) => void;
  decisionOutcome: string;
  setDecisionOutcome: (outcome: string) => void;
  decisionComments: string;
  setDecisionComments: (comments: string) => void;
  isLoading: boolean;
  onViewVersions: (taskFileId: number) => void;
}

export const TaskFileManager: React.FC<TaskFileManagerProps> = ({
  workflowTaskFiles,
  taskDetails,
  onDownload,
  onFileUpload,
  onFileUpdate,
  onConsolidation,
  onCompleteTask,
  selectedFiles,
  setSelectedFiles,
  fileCommentary,
  setFileCommentary,
  selectedSourceFiles,
  setSelectedSourceFiles,
  updateFiles,
  setUpdateFiles,
  consolidationFiles,
  setConsolidationFiles,
  outputFileName,
  setOutputFileName,
  decisionOutcome,
  setDecisionOutcome,
  decisionComments,
  setDecisionComments,
  isLoading,
  onViewVersions
}) => {
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set());
  const [selectedTaskFile, setSelectedTaskFile] = useState<WorkflowTaskFile | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [currentUploadFile, setCurrentUploadFile] = useState<WorkflowTaskFile | null>(null);
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);
  const [taskCommentary, setTaskCommentary] = useState('');

  const toggleFileExpansion = (taskFileId: number) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(taskFileId)) {
      newExpanded.delete(taskFileId);
    } else {
      newExpanded.add(taskFileId);
    }
    setExpandedFiles(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'UPLOADED':
        return <Upload className="h-4 w-4 text-blue-500" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING':
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'UPLOADED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFileNameClick = (taskFile: WorkflowTaskFile) => {
    if (taskDetails.status === 'COMPLETED' && !isTaskCompleted) return;
    
    setCurrentUploadFile(taskFile);
    setUploadDialogOpen(true);
  };

  const handleMarkAsComplete = () => {
    setIsTaskCompleted(!isTaskCompleted);
    if (!isTaskCompleted) {
      onCompleteTask();
    }
  };

  const canReuploadFile = (taskFile: WorkflowTaskFile) => {
    return taskFile.status === 'PENDING' || 
           taskDetails.status === 'IN_PROGRESS' || 
           (taskFile.status === 'FAILED') ||
           isTaskCompleted;
  };

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
    setCurrentUploadFile(null);
    setSelectedFiles([]);
    setFileCommentary('');
  };

  const handleFileUploadSubmit = () => {
    onFileUpload();
    handleUploadDialogClose();
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
    const isExpanded = expandedFiles.has(latestVersion.instanceFileId);

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
                  onClick={() => toggleFileExpansion(latestVersion.instanceFileId)}
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(latestVersion)}
              >
                <Download className="h-4 w-4" />
              </Button>
              {hasMultipleVersions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFileExpansion(latestVersion.instanceFileId)}
                >
                  <History className="h-4 w-4" />
                </Button>
              )}
            </div>
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
                      onClick={() => onDownload(version)}
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

  const renderTaskSpecificActions = () => {
    if (taskDetails.status === 'COMPLETED') return null;

    switch (taskDetails.taskType) {
      case 'FILE_UPDATE':
        return (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">File Update Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {taskDetails.sourceFile && (
                <div>
                  <Label className="text-xs">Source File</Label>
                  <Card className="mt-2">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{taskDetails.sourceFile.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(taskDetails.sourceFile.fileSize)} • Version {taskDetails.sourceFile.version}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownload(taskDetails.sourceFile!)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div>
                <Label htmlFor="update-files" className="text-xs">Select Updated Files</Label>
                <Input
                  id="update-files"
                  type="file"
                  multiple
                  onChange={(e) => setUpdateFiles(Array.from(e.target.files || []))}
                  className="mt-1 h-8"
                />
              </div>

              <div>
                <Label htmlFor="update-commentary" className="text-xs">Commentary (Optional)</Label>
                <Textarea
                  id="update-commentary"
                  value={fileCommentary}
                  onChange={(e) => setFileCommentary(e.target.value)}
                  placeholder="Describe the changes made..."
                  className="mt-1 text-sm"
                  rows={2}
                />
              </div>

              <Button 
                onClick={onFileUpdate} 
                disabled={isLoading || updateFiles.length === 0}
                size="sm"
                className="w-full h-8"
              >
                <FileText className="h-3 w-3 mr-2" />
                Update Files
              </Button>
            </CardContent>
          </Card>
        );

      case 'FILE_CONSOLIDATE':
        return (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">File Consolidation Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {taskDetails.sourceFiles && taskDetails.sourceFiles.length > 0 && (
                <div>
                  <Label className="text-xs">Available Files for Consolidation</Label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
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
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{file.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.fileSize)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownload(file)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="output-filename" className="text-xs">Output Filename</Label>
                <Input
                  id="output-filename"
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  placeholder="consolidated_report.pdf"
                  className="mt-1 h-8 text-sm"
                />
              </div>

              <Button 
                onClick={onConsolidation} 
                disabled={isLoading || consolidationFiles.length === 0 || !outputFileName}
                size="sm"
                className="w-full h-8"
              >
                <Target className="h-3 w-3 mr-2" />
                Consolidate Files
              </Button>
            </CardContent>
          </Card>
        );

      case 'DECISION':
        return (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Decision Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {taskDetails.reviewFiles && taskDetails.reviewFiles.length > 0 && (
                <div>
                  <Label className="text-xs">Files to Review</Label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {Object.entries(groupFilesByName(taskDetails.reviewFiles)).map(([fileName, versions]) =>
                      renderFileWithVersions(fileName, versions)
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="decision-outcome" className="text-xs">Decision</Label>
                <Select value={decisionOutcome} onValueChange={setDecisionOutcome}>
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue placeholder="Select decision outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskDetails.taskConfiguration.decisionOptions?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="decision-comments" className="text-xs">Comments</Label>
                <Textarea
                  id="decision-comments"
                  value={decisionComments}
                  onChange={(e) => setDecisionComments(e.target.value)}
                  placeholder="Add your decision comments..."
                  className="mt-1 text-sm"
                  rows={2}
                />
              </div>

              <Button 
                onClick={onCompleteTask} 
                disabled={isLoading || !decisionOutcome}
                size="sm"
                className="w-full h-8"
              >
                <CheckCircle className="h-3 w-3 mr-2" />
                Submit Decision
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Task Files</h3>
        <Badge variant="outline" className="text-xs">
          {workflowTaskFiles.length} files configured
        </Badge>
      </div>

      <div className="space-y-2">
        {workflowTaskFiles.map((taskFile) => {
          const latestFile = taskFile.uploadedFiles[0]; // Assuming sorted by latest first
          const hasMultipleVersions = taskFile.uploadedFiles.length > 1;

          return (
            <div key={taskFile.taskFileId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getStatusIcon(taskFile.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFileNameClick(taskFile)}
                      className={`font-medium truncate text-left hover:underline ${
                        !canReuploadFile(taskFile) ? 'cursor-default' : 'cursor-pointer text-blue-600 hover:text-blue-800'
                      }`}
                      disabled={!canReuploadFile(taskFile)}
                    >
                      {taskFile.fileName}
                    </button>
                    <Badge 
                      variant="outline" 
                      className={`text-xs h-5 ${getStatusColor(taskFile.status)}`}
                    >
                      {taskFile.status}
                    </Badge>
                    {taskFile.isRequired && (
                      <Badge variant="destructive" className="text-xs h-5">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Upload button for files without uploads or reupload */}
                {(taskFile.uploadedFiles.length === 0 || canReuploadFile(taskFile)) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileNameClick(taskFile)}
                    className="h-8 px-3"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    {taskFile.uploadedFiles.length === 0 ? 'Upload' : 'Reupload'}
                  </Button>
                )}
                
                {/* Versions button */}
                {hasMultipleVersions && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTaskFile(taskFile)}
                        className="h-8 px-3"
                      >
                        <History className="h-3 w-3 mr-1" />
                        {taskFile.uploadedFiles.length}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {taskFile.fileName} - File Versions
                        </DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh]">
                        <div className="space-y-3 pr-4">
                          {taskFile.uploadedFiles.map((file, index) => (
                            <Card key={`${file.instanceFileId}-${file.version}`}>
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium">
                                        Version {file.version}
                                        {index === 0 && (
                                          <Badge variant="default" className="ml-2 text-xs">
                                            Latest
                                          </Badge>
                                        )}
                                      </p>
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${getStatusColor(file.fileStatus)}`}
                                      >
                                        {file.fileStatus}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {formatFileSize(file.fileSize)} • {file.actionType}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      By {file.createdBy} • {formatDate(file.createdAt)}
                                    </p>
                                    {file.fileCommentary && (
                                      <p className="text-xs text-muted-foreground mt-1 italic">
                                        "{file.fileCommentary}"
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDownload(file)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                )}
                
                {/* Single version download */}
                {taskFile.uploadedFiles.length === 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(latestFile)}
                    className="h-8 px-3"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    v{latestFile.version}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task-specific Actions */}
      {renderTaskSpecificActions()}

      {/* Commentary Section for Tasks in Progress */}
      {taskDetails.status === 'IN_PROGRESS' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Task Commentary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="task-commentary" className="text-xs">Add Commentary (Optional)</Label>
              <Textarea
                id="task-commentary"
                value={taskCommentary}
                onChange={(e) => setTaskCommentary(e.target.value)}
                placeholder="Add notes about your progress, issues encountered, or any relevant information..."
                className="mt-1 text-sm"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This commentary will be saved with the task for future reference
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mark as Complete Toggle for all task types */}
      {taskDetails.status === 'IN_PROGRESS' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="task-complete-toggle" className="text-sm font-medium">
                  Mark Task as Complete
                </Label>
                <p className="text-xs text-muted-foreground">
                  Toggle to complete this step and move to the next task
                </p>
              </div>
              <Switch
                id="task-complete-toggle"
                checked={isTaskCompleted}
                onCheckedChange={handleMarkAsComplete}
                disabled={isLoading}
              />
            </div>
            {taskCommentary.trim() && (
              <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                <Label className="text-xs font-medium">Task Commentary:</Label>
                <p className="text-xs text-muted-foreground mt-1">{taskCommentary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* File Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload {currentUploadFile?.fileName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentUploadFile && (
              <>
                <div className="text-sm text-muted-foreground">
                  <p>{currentUploadFile.fileDescription}</p>
                  <p className="mt-1">
                    Allowed types: {currentUploadFile.allowedFileTypes.join(', ')}
                  </p>
                  <p>Max size: {currentUploadFile.maxFileSize}</p>
                </div>
                
                <div>
                  <Label htmlFor="upload-files" className="text-sm">Select Files</Label>
                  <Input
                    id="upload-files"
                    type="file"
                    multiple
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="upload-commentary" className="text-sm">Commentary (Optional)</Label>
                  <Textarea
                    id="upload-commentary"
                    value={fileCommentary}
                    onChange={(e) => setFileCommentary(e.target.value)}
                    placeholder="Add a comment about the files..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div>
                    <Label className="text-sm">Selected Files:</Label>
                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleUploadDialogClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleFileUploadSubmit} 
                    disabled={isLoading || selectedFiles.length === 0}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};