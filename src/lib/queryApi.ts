import { apiRequest } from './api';
import { config } from './config';
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
import {
  mockQueries,
  mockQueryStatistics,
  mockQueryConversations,
  getMockQueryDashboard as getMockQueryDashboardData,
} from './mock/queries';

// Query CRUD Operations
export const createQuery = async (queryData: CreateQueryRequest): Promise<Query> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Using mock data for createQuery');
    const newId = Math.max(...mockQueries.map(q => q.id)) + 1;
    const newQuery: Query = {
      id: newId,
      instanceTaskId: queryData.instanceTaskId,
      queryTitle: queryData.queryTitle,
      queryDescription: queryData.queryDescription,
      queryStatus: 'OPEN',
      priority: queryData.priority,
      raisedByUserId: queryData.raisedByUserId,
      raisedBy: queryData.createdBy || 'mock-user',
      assignedToUserId: queryData.assignedToUserId,
      assignedTo: 'mock-assigned', // In a real mock, you'd look this up
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: Date.now(),
          messageText: queryData.queryDescription,
          messageType: 'TEXT',
          sentAt: new Date().toISOString(),
          sentByUserId: queryData.raisedByUserId,
          sentBy: queryData.createdBy || 'mock-user',
          attachments: [],
        },
      ],
    };
    mockQueries.push(newQuery);
    return Promise.resolve(newQuery);
  }
  return apiRequest<Query>('/api/queries', {
    method: 'POST',
    body: JSON.stringify(queryData),
  });
};

export const getQuery = async (queryId: number): Promise<Query> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    const query = mockQueries.find(q => q.id === queryId);
    if (query) {
      return Promise.resolve(query);
    }
    return Promise.reject(new Error('Query not found'));
  }
  return apiRequest<Query>(`/api/queries/${queryId}`);
};

export const updateQueryStatus = async (
  queryId: number,
  statusData: UpdateQueryStatusRequest
): Promise<Query> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Using mock data for updateQueryStatus');
    const query = mockQueries.find(q => q.id === queryId);
    if (query) {
      query.queryStatus = statusData.queryStatus;
      query.resolutionNotes = statusData.resolutionNotes;
      query.updatedAt = new Date().toISOString();
      if (statusData.updatedBy) {
        query.updatedBy = statusData.updatedBy;
      }
      return Promise.resolve(query);
    }
    return Promise.reject(new Error('Query not found'));
  }
  return apiRequest<Query>(`/api/queries/${queryId}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData),
  });
};

export const deleteQuery = async (queryId: number): Promise<void> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    const index = mockQueries.findIndex(q => q.id === queryId);
    if (index > -1) {
      mockQueries.splice(index, 1);
      return Promise.resolve();
    }
    return Promise.reject(new Error('Query not found'));
  }
  return apiRequest<void>(`/api/queries/${queryId}`, {
    method: 'DELETE',
  });
};

// Query Lists and Filtering
export const getQueriesAssignedToUser = async (userId: number): Promise<Query[]> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    return Promise.resolve(mockQueries.filter(q => q.assignedToUserId === userId));
  }
  return apiRequest<Query[]>(`/api/queries/assigned-to/${userId}`);
};

export const getQueriesRaisedByUser = async (userId: number): Promise<Query[]> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    return Promise.resolve(mockQueries.filter(q => q.raisedByUserId === userId));
  }
  return apiRequest<Query[]>(`/api/queries/raised-by/${userId}`);
};

export const getOpenQueries = async (userId: number): Promise<Query[]> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    return Promise.resolve(mockQueries.filter(q => (q.assignedToUserId === userId || q.raisedByUserId === userId) && q.queryStatus === 'OPEN'));
  }
  return apiRequest<Query[]>(`/api/queries/open/${userId}`);
};

export const getHighPriorityQueries = async (): Promise<Query[]> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    return Promise.resolve(mockQueries.filter(q => q.priority === 'HIGH' || q.priority === 'CRITICAL'));
  }
  return apiRequest<Query[]>('/api/queries/high-priority');
};

export const getWorkflowQueries = async (instanceId: number): Promise<Query[]> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    return Promise.resolve(mockQueries.filter(q => q.instanceTaskId === instanceId));
  }
  return apiRequest<Query[]>(`/api/queries/workflow/${instanceId}`);
};

// Query Dashboard
export const getQueryDashboard = async (userId: number): Promise<{
  assignedToMe: Query[];
  raisedByMe: Query[];
  openQueries: Query[];
  resolvedQueries: Query[];
}> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Using mock data for getQueryDashboard');
    return Promise.resolve(getMockQueryDashboardData(userId));
  }
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
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Using mock data for getQueryConversation');
    if (mockQueryConversations[queryId]) {
      return Promise.resolve(mockQueryConversations[queryId]);
    }
    const query = mockQueries.find(q => q.id === queryId);
    if (query) {
      return Promise.resolve({
        queryId: query.id,
        messages: query.messages,
        totalMessages: query.messages.length,
        page: 0,
        size: 20,
      });
    }
    return Promise.reject(new Error('Query not found'));
  }
  return apiRequest<QueryConversation>(
    `/api/queries/${queryId}/conversation?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
  );
};

export const addQueryMessage = async (
  queryId: number,
  messageData: CreateQueryMessageRequest
): Promise<QueryConversation> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Using mock data for addQueryMessage');
    const query = mockQueries.find(q => q.id === queryId);
    if (query) {
      const newMessage = {
        id: Date.now(),
        messageText: messageData.messageText,
        messageType: messageData.messageType,
        sentAt: new Date().toISOString(),
        sentByUserId: messageData.sentByUserId,
        sentBy: messageData.sentBy,
        attachments: messageData.attachments || [],
      };
      query.messages.push(newMessage);
      if (mockQueryConversations[queryId]) {
        mockQueryConversations[queryId].messages.push(newMessage);
        mockQueryConversations[queryId].totalMessages++;
      } else {
        mockQueryConversations[queryId] = {
          queryId,
          messages: query.messages,
          totalMessages: query.messages.length,
          page: 0,
          size: 20,
        };
      }
      return Promise.resolve(mockQueryConversations[queryId]);
    }
    return Promise.reject(new Error('Query not found'));
  }
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
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Mocking file upload for query', queryId);
    return Promise.resolve();
  }
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
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Mocking file download for attachment', attachmentId);
    const blob = new Blob(["mock file content"], { type: "text/plain" });
    return Promise.resolve(blob);
  }
  const response = await fetch(`${config.api.baseUrl}/api/queries/attachments/${attachmentId}/download`);
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
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    const query = mockQueries.find(q => q.id === queryId);
    if (query) {
      query.priority = 'CRITICAL'; // Simple mock escalation
      query.assignedToUserId = escalationData.escalatedToUserId;
      query.updatedAt = new Date().toISOString();
      return Promise.resolve(query);
    }
    return Promise.reject(new Error('Query not found'));
  }
  return apiRequest<Query>(`/api/queries/${queryId}/escalate`, {
    method: 'POST',
    body: JSON.stringify(escalationData),
  });
};

export const reassignQuery = async (
  queryId: number,
  reassignmentData: ReassignQueryRequest
): Promise<Query> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Using mock data for reassignQuery');
    const query = mockQueries.find(q => q.id === queryId);
    if (query) {
      query.assignedToUserId = reassignmentData.newAssignedUserId;
      // In a real mock, you'd look up the username
      query.assignedTo = `user_${reassignmentData.newAssignedUserId}`;
      query.updatedAt = new Date().toISOString();
      if (reassignmentData.reassignedBy) {
        query.updatedBy = reassignmentData.reassignedBy;
      }
      return Promise.resolve(query);
    }
    return Promise.reject(new Error('Query not found'));
  }
  return apiRequest<Query>(`/api/queries/${queryId}/reassign`, {
    method: 'POST',
    body: JSON.stringify(reassignmentData),
  });
};

export const bulkUpdateQueries = async (
  bulkUpdateData: BulkQueryUpdateRequest
): Promise<Query[]> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    const updatedQueries: Query[] = [];
    bulkUpdateData.queryIds.forEach(id => {
      const query = mockQueries.find(q => q.id === id);
      if (query) {
        if (bulkUpdateData.status) query.queryStatus = bulkUpdateData.status;
        if (bulkUpdateData.priority) query.priority = bulkUpdateData.priority;
        if (bulkUpdateData.assignedToUserId) query.assignedToUserId = bulkUpdateData.assignedToUserId;
        updatedQueries.push(query);
      }
    });
    return Promise.resolve(updatedQueries);
  }
  return apiRequest<Query[]>('/api/queries/bulk-update', {
    method: 'POST',
    body: JSON.stringify(bulkUpdateData),
  });
};

// Query Statistics and Analytics
export const getQueryStatistics = async (userId: number): Promise<QueryStatistics> => {
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    console.log('Using mock data for getQueryStatistics');
    return Promise.resolve({ ...mockQueryStatistics, userId });
  }
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
  const shouldUseMock = config.app.isMock || config.app.env === 'mock';
  
  if (shouldUseMock) {
    let results = [...mockQueries];
    if (searchParams.q) {
      results = results.filter(q => q.queryTitle.includes(searchParams.q!) || q.queryDescription.includes(searchParams.q!));
    }
    if (searchParams.status) {
      results = results.filter(q => q.queryStatus === searchParams.status);
    }
    if (searchParams.priority) {
      results = results.filter(q => q.priority === searchParams.priority);
    }
    if (searchParams.assignedTo) {
      results = results.filter(q => q.assignedToUserId === searchParams.assignedTo);
    }
    const page = searchParams.page || 0;
    const size = searchParams.size || 10;
    const paginatedResults = results.slice(page * size, (page + 1) * size);

    return Promise.resolve({
      queries: paginatedResults,
      totalElements: results.length,
      totalPages: Math.ceil(results.length / size),
      currentPage: page,
    });
  }
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