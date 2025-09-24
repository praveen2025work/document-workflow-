import api from './api';
import { InstanceFile } from '@/types/file';

export const uploadFile = async (formData: FormData): Promise<InstanceFile> => {
  const response = await api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const downloadFile = async (fileName: string): Promise<Blob> => {
  const response = await api.get(`/files/download/${fileName}`, {
    responseType: 'blob',
  });
  return response.data;
};

export const consolidateFiles = async (params: {
  instanceTaskId: string;
  fileIds: string;
  createdBy: string;
}): Promise<void> => {
  await api.post('/files/consolidate', null, { params });
};

export const getFileVersions = async (instanceFileId: number): Promise<InstanceFile[]> => {
  const response = await api.get(`/files/versions/${instanceFileId}`);
  return response.data;
};

export const getLatestFileVersion = async (instanceFileId: number): Promise<InstanceFile> => {
  const response = await api.get(`/files/versions/${instanceFileId}/latest`);
  return response.data;
};

export const getSpecificFileVersion = async (instanceFileId: number, version: number): Promise<InstanceFile> => {
  const response = await api.get(`/files/versions/${instanceFileId}/${version}`);
  return response.data;
};

export const createNewFileVersion = async (instanceFileId: number, formData: FormData): Promise<InstanceFile> => {
  const response = await api.post(`/files/versions/${instanceFileId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteFileVersion = async (instanceFileId: number, version: number): Promise<void> => {
  await api.delete(`/files/versions/${instanceFileId}/${version}`);
};

export const getLatestFilesForTask = async (instanceTaskId: number): Promise<InstanceFile[]> => {
  const response = await api.get(`/files/task/${instanceTaskId}/latest`);
  return response.data;
};