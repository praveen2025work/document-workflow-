import { apiRequest } from './api';
import {
  Query,
  QueryConversation,
  QueryStatistics,
  CreateQueryRequest,
  CreateQueryMessageRequest,
  UpdateQueryStatusRequest,
  EscalateQueryRequest,
  ReassignQueryRequest,
  BulkQueryUpdateRequest,
} from '../types/query';

// Query CRUD Operations
export const createQuery = async (queryData: CreateQueryRequest): Promise<Query> => {
  return apiRequest<Query>('/api/queries', {
    method: 'POST',
    body: JSON.stringify(queryData),
  });
};

export const getQuery = async (queryId: number): Promise<Query> => {
  return apiRequest<Query>(`/api/queries/${queryId}`);
};

export const updateQueryStatus = async (
  queryId: number,
  statusData: UpdateQueryStatusRequest
): Promise<Query> => {
  return apiRequest<Query>(`/api/queries/${queryId}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData),
  });
};

export const deleteQuery = async (queryId: number): Promise<void> => {
  return apiRequest<void>(`/api/queries/${queryId}`, {
    method: 'DELETE',
  });
};

// Query Lists and Filtering
export const getQueriesAssignedToUser = async (userId: number): Promise<Query[]> => {
  return apiRequest<Query[]>(`/api/queries/assigned-to/${userId}`);
};

export const getQueriesRaisedByUser = async (userId: number): Promise<Query[]> => {
  return apiRequest<Query[]>(`/api/queries/raised-by/${userId}`);
};

export const getOpenQueries = async (userId: number): Promise<Query[]> => {
  return apiRequest<Query[]>(`/api/queries/open/${userId}`);
};

export const getHighPriorityQueries = async (): Promise<Query[]> => {
  return apiRequest<Query[]>('/api/queries/high-priority');
};

export const getWorkflowQueries = async (instanceId: number): Promise<Query[]> => {
  return apiRequest<Query[]>(`/api/queries/workflow/${instanceId}`);
};

// Query Dashboard
export const getQueryDashboard = async (userId: number): Promise<{
  assignedToMe: Query[];
  raisedByMe: Query[];
  openQueries: Query[];
  resolvedQueries: Query[];
}> => {
  return apiRequest<{
    assignedToMe: Query[];
    raisedByMe: Query[];
    openQueries: Query[];
    resolvedQueries: Query[];
  }>(`/api/queries/dashboard/${userId}`);
};

// Query Conversation Management
export const getQueryConversation = async (
  queryId: number,
  page: number = 0,
  size: number = 20,
  sortBy: string = 'sentAt',
  sortDir: string = 'asc'
): Promise<QueryConversation> => {
  return apiRequest<QueryConversation>(
    `/api/queries/${queryId}/conversation?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
  );
};

export const addQueryMessage = async (
  queryId: number,
  messageData: CreateQueryMessageRequest
): Promise<QueryConversation> => {
  return apiRequest<QueryConversation>(`/api/queries/${queryId}/messages`, {
    method: 'POST',
    body: JSON.stringify(messageData),
  });
};

// File Attachments
export const uploadQueryAttachment = async (
  queryId: number,
  file: File,
  messageId: number,
  uploadedByUserId: number,
  uploadedBy: string,
  description?: string
): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('messageId', messageId.toString());
  formData.append('uploadedByUserId', uploadedByUserId.toString());
  formData.append('uploadedBy', uploadedBy);
  if (description) {
    formData.append('description', description);
  }

  return apiRequest<void>(`/api/queries/${queryId}/attachments`, {
    method: 'POST',
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  });
};

export const downloadQueryAttachment = async (attachmentId: number): Promise<Blob> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/queries/attachments/${attachmentId}/download`);
  if (!response.ok) {
    throw new Error('Failed to download attachment');
  }
  return response.blob();
};

// Query Management Operations
export const escalateQuery = async (
  queryId: number,
  escalationData: EscalateQueryRequest
): Promise<Query> => {
  return apiRequest<Query>(`/api/queries/${queryId}/escalate`, {
    method: 'POST',
    body: JSON.stringify(escalationData),
  });
};

export const reassignQuery = async (
  queryId: number,
  reassignmentData: ReassignQueryRequest
): Promise<Query> => {
  return apiRequest<Query>(`/api/queries/${queryId}/reassign`, {
    method: 'POST',
    body: JSON.stringify(reassignmentData),
  });
};

export const bulkUpdateQueries = async (
  bulkUpdateData: BulkQueryUpdateRequest
): Promise<Query[]> => {
  return apiRequest<Query[]>('/api/queries/bulk-update', {
    method: 'POST',
    body: JSON.stringify(bulkUpdateData),
  });
};

// Query Statistics and Analytics
export const getQueryStatistics = async (userId: number): Promise<QueryStatistics> => {
  return apiRequest<QueryStatistics>(`/api/queries/statistics/${userId}`);
};

// Query Search
export const searchQueries = async (
  searchParams: {
    q?: string;
    status?: string;
    priority?: string;
    assignedTo?: number;
    dateRange?: string;
    page?: number;
    size?: number;
  }
): Promise<{
  queries: Query[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}> => {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });

  return apiRequest<{
    queries: Query[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }>(`/api/queries/search?${params.toString()}`);
};