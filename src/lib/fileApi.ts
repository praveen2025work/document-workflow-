import axios from 'axios';
import { config } from './config';
import { FileUploadData, FileConsolidationData } from '@/types/file';
import { mockUploadFile, mockDownloadFile, mockConsolidateFiles } from './mock/files';

const api = axios.create({
  baseURL: config.api.baseUrl,
});

// Upload a file to the system
export const uploadFile = async (data: FileUploadData): Promise<any> => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('instanceTaskId', data.instanceTaskId);
  formData.append('actionType', data.actionType);
  formData.append('createdBy', data.createdBy);

  if (config.app.isMock) {
    return mockUploadFile(formData);
  }

  const response = await api.post('/api/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Download a file from the system
export const downloadFile = async (fileName: string): Promise<Blob> => {
  if (config.app.isMock) {
    return mockDownloadFile(fileName);
  }
  const response = await api.get(`/api/files/download/${fileName}`, {
    responseType: 'blob',
  });
  return response.data;
};

// Consolidate multiple files
export const consolidateFiles = async (data: FileConsolidationData): Promise<any> => {
  if (config.app.isMock) {
    return mockConsolidateFiles(data);
  }
  const response = await api.post('/api/files/consolidate', null, {
    params: data,
  });
  return response.data;
};