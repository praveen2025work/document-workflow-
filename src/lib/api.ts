import axios from 'axios';
import { toast } from 'sonner';
import { config, getEnvironmentConfig, debugLog } from './config';

const envConfig = getEnvironmentConfig();

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: envConfig.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    debugLog('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data,
    });
    return config;
  },
  (error) => {
    debugLog('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => {
    debugLog('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    debugLog('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });

    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        toast.error('Unauthorized. Please log in again.');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else if (status === 403) {
        toast.error('Access forbidden. You do not have permission to perform this action.');
      } else if (status === 404) {
        toast.error('Resource not found.');
      } else if (status === 429) {
        toast.error('Too many requests. Please try again later.');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        const message = data.detail || data.message || 'An error occurred.';
        toast.error(`Error: ${message}`);
      }
    } else if (error.request) {
      toast.error('No response from server. Please check your connection.');
    } else {
      toast.error(`Request error: ${error.message}`);
    }
    
    return Promise.reject(error);
  }
);

// Generic API request function
export const apiRequest = async <T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: string | FormData;
    headers?: Record<string, string>;
  } = {}
): Promise<T> => {
  const { method = 'GET', body, headers = {} } = options;
  
  // Use mock data in preview/development mode
  if (config.app.isMock) {
    return handleMockRequest<T>(endpoint, method, body);
  }

  const response = await api.request({
    url: endpoint,
    method,
    data: body,
    headers: {
      ...api.defaults.headers,
      ...headers,
    },
  });

  return response.data;
};

// Mock request handler
const handleMockRequest = async <T>(
  endpoint: string,
  method: string,
  body?: string | FormData
): Promise<T> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

  // Handle query endpoints
  if (endpoint.startsWith('/api/queries')) {
    return handleMockQueryRequest<T>(endpoint, method, body);
  }

  // Handle other endpoints (existing mock handlers)
  throw new Error(`Mock handler not implemented for endpoint: ${endpoint}`);
};

// Mock query request handler
const handleMockQueryRequest = async <T>(
  endpoint: string,
  method: string,
  body?: string | FormData
): Promise<T> => {
  const { 
    mockQueries, 
    mockQueryStatistics, 
    mockQueryConversations,
    getMockQueryDashboard,
    getMockQueriesAssignedToUser,
    getMockQueriesRaisedByUser,
    getMockOpenQueries,
    getMockResolvedQueries
  } = await import('./mock/queries');

  // Extract user ID from endpoint or use default
  const userIdMatch = endpoint.match(/\/(\d+)$/);
  const userId = userIdMatch ? parseInt(userIdMatch[1]) : 1;

  // Extract query ID from endpoint
  const queryIdMatch = endpoint.match(/\/queries\/(\d+)/);
  const queryId = queryIdMatch ? parseInt(queryIdMatch[1]) : null;

  if (endpoint === '/api/queries' && method === 'POST') {
    // Create new query
    const newQuery = {
      id: mockQueries.length + 1,
      ...JSON.parse(body as string),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    return newQuery as T;
  }

  if (endpoint.match(/^\/api\/queries\/\d+$/) && method === 'GET') {
    // Get single query
    const query = mockQueries.find(q => q.id === queryId);
    if (!query) throw new Error('Query not found');
    return query as T;
  }

  if (endpoint.match(/^\/api\/queries\/assigned-to\/\d+$/)) {
    return getMockQueriesAssignedToUser(userId) as T;
  }

  if (endpoint.match(/^\/api\/queries\/raised-by\/\d+$/)) {
    return getMockQueriesRaisedByUser(userId) as T;
  }

  if (endpoint.match(/^\/api\/queries\/open\/\d+$/)) {
    return getMockOpenQueries(userId) as T;
  }

  if (endpoint.match(/^\/api\/queries\/dashboard\/\d+$/)) {
    return getMockQueryDashboard(userId) as T;
  }

  if (endpoint.match(/^\/api\/queries\/statistics\/\d+$/)) {
    return mockQueryStatistics as T;
  }

  if (endpoint.match(/^\/api\/queries\/\d+\/conversation/)) {
    const conversation = mockQueryConversations[queryId!];
    if (!conversation) throw new Error('Conversation not found');
    return conversation as T;
  }

  if (endpoint.match(/^\/api\/queries\/\d+\/messages$/) && method === 'POST') {
    // Add message to query
    const conversation = mockQueryConversations[queryId!];
    if (!conversation) throw new Error('Conversation not found');
    
    const newMessage = {
      id: conversation.messages.length + 1,
      ...JSON.parse(body as string),
      sentAt: new Date().toISOString(),
      attachments: []
    };
    
    conversation.messages.push(newMessage);
    conversation.totalMessages++;
    
    return conversation as T;
  }

  if (endpoint.match(/^\/api\/queries\/\d+\/status$/) && method === 'PUT') {
    // Update query status
    const query = mockQueries.find(q => q.id === queryId);
    if (!query) throw new Error('Query not found');
    
    const statusUpdate = JSON.parse(body as string);
    query.queryStatus = statusUpdate.queryStatus;
    query.resolutionNotes = statusUpdate.resolutionNotes;
    query.updatedAt = new Date().toISOString();
    
    return query as T;
  }

  if (endpoint === '/api/queries/high-priority') {
    return mockQueries.filter(q => q.priority === 'HIGH' || q.priority === 'CRITICAL') as T;
  }

  throw new Error(`Mock handler not implemented for query endpoint: ${endpoint}`);
};

export default api;