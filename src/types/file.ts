export type ActionType = 'FILE_UPLOAD' | 'FILE_DOWNLOAD' | 'FILE_UPDATE' | 'CONSOLIDATE_FILES';

export interface FileUploadData {
  file: File;
  instanceTaskId: string;
  actionType: ActionType;
  createdBy: string;
}

export interface FileConsolidationData {
  instanceTaskId: string;
  fileIds: string;
  createdBy: string;
}