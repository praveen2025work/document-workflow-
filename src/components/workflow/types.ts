export type NodeType = 'start' | 'end' | 'decision' | 'action' | 'api' | 'database';

export interface NodeData {
  // Common
  description?: string;
  
  // Decision
  condition?: string;
  operator?: string;
  leftValue?: string;
  rightValue?: string;

  // Action
  actionType?: string;
  recipient?: string;
  template?: string;

  // API
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint?: string;
  body?: string;

  // Database
  operation?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  table?: string;
  query?: string;
}

