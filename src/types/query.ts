export interface QueryAttachment {
  id: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedByUserId: number;
  uploadedBy: string;
  description?: string;
}

export interface QueryMessage {
  id: number;
  messageText: string;
  messageType: 'TEXT' | 'FILE' | 'SYSTEM';
  sentAt: string;
  sentByUserId: number;
  sentBy: string;
  attachments: QueryAttachment[];
}

export interface Query {
  id: number;
  instanceTaskId: number;
  queryTitle: string;
  queryDescription: string;
  queryStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  raisedByUserId: number;
  raisedBy: string;
  assignedToUserId: number;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
  escalatedToUserId?: number;
  escalatedBy?: string;
  escalationReason?: string;
  messages: QueryMessage[];
}

export interface QueryConversation {
  queryId: number;
  messages: QueryMessage[];
  totalMessages: number;
  page: number;
  size: number;
}

export interface QueryStatistics {
  userId: number;
  openQueries: number;
  resolvedQueries: number;
  closedQueries: number;
  totalQueries: number;
  averageResolutionTime: string;
  queriesByPriority: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
    CRITICAL: number;
  };
  queriesByStatus: {
    OPEN: number;
    IN_PROGRESS: number;
    RESOLVED: number;
    CLOSED: number;
  };
}

export interface CreateQueryRequest {
  instanceTaskId: number;
  queryTitle: string;
  queryDescription: string;
  raisedByUserId: number;
  assignedToUserId: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdBy: string;
}

export interface CreateQueryMessageRequest {
  messageText: string;
  messageType: 'TEXT' | 'FILE' | 'SYSTEM';
  sentByUserId: number;
  sentBy: string;
  attachments?: {
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
  }[];
}

export interface UpdateQueryStatusRequest {
  queryStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  resolutionNotes?: string;
  updatedByUserId: number;
  updatedBy: string;
}

export interface EscalateQueryRequest {
  escalatedToUserId: number;
  escalatedByUserId: number;
  escalationReason: string;
  escalatedBy: string;
}

export interface ReassignQueryRequest {
  newAssignedUserId: number;
  reassignedByUserId: number;
  reassignmentReason: string;
  reassignedBy: string;
}

export interface BulkQueryUpdateRequest {
  queryIds: number[];
  action: 'UPDATE_STATUS' | 'REASSIGN' | 'DELETE';
  newStatus?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  newAssignedUserId?: number;
  updatedByUserId: number;
  updatedBy: string;
}