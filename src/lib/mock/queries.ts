import { Query, QueryStatistics, QueryConversation } from '../../types/query';

export const mockQueries: Query[] = [
  {
    id: 1,
    instanceTaskId: 1,
    queryTitle: "Data format clarification needed",
    queryDescription: "The uploaded file doesn't match the expected format. Can you please clarify the required structure and provide a template?",
    queryStatus: "OPEN",
    priority: "HIGH",
    raisedByUserId: 1,
    raisedBy: "alice",
    assignedToUserId: 2,
    assignedTo: "bob",
    createdAt: "2025-01-04T10:30:00Z",
    updatedAt: "2025-01-04T10:30:00Z",
    messages: [
      {
        id: 1,
        messageText: "The uploaded file doesn't match the expected format. Can you please clarify the required structure and provide a template?",
        messageType: "TEXT",
        sentAt: "2025-01-04T10:30:00Z",
        sentByUserId: 1,
        sentBy: "alice",
        attachments: [
          {
            id: 1,
            fileName: "current_data_sample.xlsx",
            filePath: "/uploads/queries/current_data_sample.xlsx",
            fileSize: 128000,
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            uploadedAt: "2025-01-04T10:30:00Z",
            uploadedByUserId: 1,
            uploadedBy: "alice",
            description: "Current data format sample"
          }
        ]
      }
    ]
  },
  {
    id: 2,
    instanceTaskId: 2,
    queryTitle: "Approval workflow clarification",
    queryDescription: "Need clarification on the approval process for financial documents over $10,000.",
    queryStatus: "IN_PROGRESS",
    priority: "MEDIUM",
    raisedByUserId: 3,
    raisedBy: "charlie",
    assignedToUserId: 4,
    assignedTo: "diana",
    createdAt: "2025-01-03T14:15:00Z",
    updatedAt: "2025-01-04T09:20:00Z",
    messages: [
      {
        id: 2,
        messageText: "Need clarification on the approval process for financial documents over $10,000.",
        messageType: "TEXT",
        sentAt: "2025-01-03T14:15:00Z",
        sentByUserId: 3,
        sentBy: "charlie",
        attachments: []
      },
      {
        id: 3,
        messageText: "For amounts over $10,000, you need approval from both the department head and finance manager. I've attached the approval workflow document.",
        messageType: "TEXT",
        sentAt: "2025-01-04T09:20:00Z",
        sentByUserId: 4,
        sentBy: "diana",
        attachments: [
          {
            id: 2,
            fileName: "approval_workflow.pdf",
            filePath: "/uploads/queries/approval_workflow.pdf",
            fileSize: 256000,
            mimeType: "application/pdf",
            uploadedAt: "2025-01-04T09:20:00Z",
            uploadedByUserId: 4,
            uploadedBy: "diana",
            description: "Approval workflow documentation"
          }
        ]
      }
    ]
  },
  {
    id: 3,
    instanceTaskId: 3,
    queryTitle: "File consolidation requirements",
    queryDescription: "What are the naming conventions for consolidated files?",
    queryStatus: "RESOLVED",
    priority: "LOW",
    raisedByUserId: 1,
    raisedBy: "alice",
    assignedToUserId: 2,
    assignedTo: "bob",
    createdAt: "2025-01-02T11:00:00Z",
    updatedAt: "2025-01-02T16:45:00Z",
    resolutionNotes: "Naming convention clarified and documented. User can proceed with consolidation.",
    messages: [
      {
        id: 4,
        messageText: "What are the naming conventions for consolidated files?",
        messageType: "TEXT",
        sentAt: "2025-01-02T11:00:00Z",
        sentByUserId: 1,
        sentBy: "alice",
        attachments: []
      },
      {
        id: 5,
        messageText: "Use the format: CONSOLIDATED_[YYYY-MM-DD]_[SEQUENCE].pdf. For example: CONSOLIDATED_2025-01-02_001.pdf",
        messageType: "TEXT",
        sentAt: "2025-01-02T16:45:00Z",
        sentByUserId: 2,
        sentBy: "bob",
        attachments: []
      }
    ]
  },
  {
    id: 4,
    instanceTaskId: 4,
    queryTitle: "System access issue",
    queryDescription: "Unable to access the external validation system. Getting timeout errors.",
    queryStatus: "OPEN",
    priority: "CRITICAL",
    raisedByUserId: 5,
    raisedBy: "eve",
    assignedToUserId: 6,
    assignedTo: "frank",
    createdAt: "2025-01-04T16:20:00Z",
    updatedAt: "2025-01-04T16:20:00Z",
    messages: [
      {
        id: 6,
        messageText: "Unable to access the external validation system. Getting timeout errors consistently for the past 2 hours.",
        messageType: "TEXT",
        sentAt: "2025-01-04T16:20:00Z",
        sentByUserId: 5,
        sentBy: "eve",
        attachments: [
          {
            id: 3,
            fileName: "error_screenshot.png",
            filePath: "/uploads/queries/error_screenshot.png",
            fileSize: 45000,
            mimeType: "image/png",
            uploadedAt: "2025-01-04T16:20:00Z",
            uploadedByUserId: 5,
            uploadedBy: "eve",
            description: "Screenshot of timeout error"
          }
        ]
      }
    ]
  },
  {
    id: 5,
    instanceTaskId: 1,
    queryTitle: "Document template request",
    queryDescription: "Need the latest version of the quarterly report template.",
    queryStatus: "RESOLVED",
    priority: "MEDIUM",
    raisedByUserId: 3,
    raisedBy: "charlie",
    assignedToUserId: 2,
    assignedTo: "bob",
    createdAt: "2025-01-01T09:30:00Z",
    updatedAt: "2025-01-01T14:15:00Z",
    resolutionNotes: "Latest template provided. User confirmed it meets requirements.",
    messages: [
      {
        id: 7,
        messageText: "Need the latest version of the quarterly report template.",
        messageType: "TEXT",
        sentAt: "2025-01-01T09:30:00Z",
        sentByUserId: 3,
        sentBy: "charlie",
        attachments: []
      },
      {
        id: 8,
        messageText: "Here's the latest Q4 2024 template. It includes the new compliance sections.",
        messageType: "TEXT",
        sentAt: "2025-01-01T14:15:00Z",
        sentByUserId: 2,
        sentBy: "bob",
        attachments: [
          {
            id: 4,
            fileName: "quarterly_report_template_v2.4.docx",
            filePath: "/uploads/queries/quarterly_report_template_v2.4.docx",
            fileSize: 512000,
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            uploadedAt: "2025-01-01T14:15:00Z",
            uploadedByUserId: 2,
            uploadedBy: "bob",
            description: "Latest quarterly report template"
          }
        ]
      }
    ]
  }
];

export const mockQueryStatistics: QueryStatistics = {
  userId: 1,
  openQueries: 2,
  resolvedQueries: 8,
  closedQueries: 1,
  totalQueries: 11,
  averageResolutionTime: "4.2 hours",
  queriesByPriority: {
    HIGH: 3,
    MEDIUM: 5,
    LOW: 2,
    CRITICAL: 1
  },
  queriesByStatus: {
    OPEN: 2,
    IN_PROGRESS: 1,
    RESOLVED: 8,
    CLOSED: 1
  }
};

export const mockQueryConversations: { [queryId: number]: QueryConversation } = {
  1: {
    queryId: 1,
    messages: mockQueries[0].messages,
    totalMessages: 1,
    page: 0,
    size: 20
  },
  2: {
    queryId: 2,
    messages: mockQueries[1].messages,
    totalMessages: 2,
    page: 0,
    size: 20
  },
  3: {
    queryId: 3,
    messages: mockQueries[2].messages,
    totalMessages: 2,
    page: 0,
    size: 20
  },
  4: {
    queryId: 4,
    messages: mockQueries[3].messages,
    totalMessages: 1,
    page: 0,
    size: 20
  },
  5: {
    queryId: 5,
    messages: mockQueries[4].messages,
    totalMessages: 2,
    page: 0,
    size: 20
  }
};

// Helper functions for mock data
export const getMockQueriesAssignedToUser = (userId: number): Query[] => {
  return mockQueries.filter(query => query.assignedToUserId === userId);
};

export const getMockQueriesRaisedByUser = (userId: number): Query[] => {
  return mockQueries.filter(query => query.raisedByUserId === userId);
};

export const getMockOpenQueries = (userId: number): Query[] => {
  return mockQueries.filter(query => 
    (query.assignedToUserId === userId || query.raisedByUserId === userId) && 
    query.queryStatus === 'OPEN'
  );
};

export const getMockResolvedQueries = (userId: number): Query[] => {
  return mockQueries.filter(query => 
    (query.assignedToUserId === userId || query.raisedByUserId === userId) && 
    query.queryStatus === 'RESOLVED'
  );
};

export const getMockQueryDashboard = (userId: number) => {
  return {
    assignedToMe: getMockQueriesAssignedToUser(userId),
    raisedByMe: getMockQueriesRaisedByUser(userId),
    openQueries: getMockOpenQueries(userId),
    resolvedQueries: getMockResolvedQueries(userId)
  };
};