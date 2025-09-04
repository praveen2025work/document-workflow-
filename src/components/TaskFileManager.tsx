import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Eye
} from 'lucide-react';
import { TaskFile } from '@/lib/executionApi';

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
  onDownload: (file: TaskFile) => void;
  onViewVersions: (taskFileId: number) => void;
}

export const TaskFileManager: React.FC<TaskFileManagerProps> = ({
  workflowTaskFiles,
  onDownload,
  onViewVersions
}) => {
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set());
  const [selectedTaskFile, setSelectedTaskFile] = useState<WorkflowTaskFile | null>(null);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Task Files</h3>
        <Badge variant="outline" className="text-xs">
          {workflowTaskFiles.length} files configured
        </Badge>
      </div>

      <div className="space-y-3">
        {workflowTaskFiles.map((taskFile) => {
          const isExpanded = expandedFiles.has(taskFile.taskFileId);
          const latestFile = taskFile.uploadedFiles[0]; // Assuming sorted by latest first
          const hasMultipleVersions = taskFile.uploadedFiles.length > 1;

          return (
            <Card key={taskFile.taskFileId} className="border border-border">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* File Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(taskFile.status)}
                        <h4 className="font-medium truncate">{taskFile.fileName}</h4>
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
                      <p className="text-sm text-muted-foreground mb-2">
                        {taskFile.fileDescription}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>Types: {taskFile.allowedFileTypes.join(', ')}</span>
                        <span>Max: {taskFile.maxFileSize}</span>
                        {taskFile.uploadedFiles.length > 0 && (
                          <span>
                            {taskFile.uploadedFiles.length} version{taskFile.uploadedFiles.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {taskFile.uploadedFiles.length > 0 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTaskFile(taskFile)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Files
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
                      
                      {hasMultipleVersions && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleFileExpansion(taskFile.taskFileId)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Latest File Info */}
                  {latestFile && (
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium">Latest: {latestFile.fileName}</p>
                            <Badge variant="outline" className="text-xs">
                              v{latestFile.version}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatFileSize(latestFile.fileSize)}</span>
                            <span>By {latestFile.createdBy}</span>
                            <span>{formatDate(latestFile.createdAt)}</span>
                          </div>
                          {latestFile.fileCommentary && (
                            <p className="text-xs text-muted-foreground mt-1">
                              "{latestFile.fileCommentary}"
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownload(latestFile)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Expanded Versions */}
                  {isExpanded && hasMultipleVersions && (
                    <div className="space-y-2 pl-4 border-l-2 border-muted">
                      <p className="text-sm font-medium text-muted-foreground">Previous Versions</p>
                      {taskFile.uploadedFiles.slice(1).map((file) => (
                        <div 
                          key={`${file.instanceFileId}-${file.version}`}
                          className="flex items-center justify-between p-2 bg-muted/20 rounded"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">Version {file.version}</p>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getStatusColor(file.fileStatus)}`}
                              >
                                {file.fileStatus}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{formatFileSize(file.fileSize)}</span>
                              <span>By {file.createdBy}</span>
                              <span>{formatDate(file.createdAt)}</span>
                            </div>
                            {file.fileCommentary && (
                              <p className="text-xs text-muted-foreground mt-1">
                                "{file.fileCommentary}"
                              </p>
                            )}
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
                  )}

                  {/* No Files Uploaded */}
                  {taskFile.uploadedFiles.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No files uploaded yet</p>
                      {taskFile.isRequired && (
                        <p className="text-xs text-red-500 mt-1">This file is required</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};