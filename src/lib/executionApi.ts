import { api } from './api';
import { WorkflowInstance } from '@/types/execution';

export const startWorkflowWithCalendar = async (data: {
  workflowId: number;
  startedBy: number;
  calendarId: number;
  triggeredBy: string;
  scheduledStartTime: string;
}): Promise<WorkflowInstance> => {
  const response = await api.post('/execution/workflows/start-with-calendar', data);
  return response.data;
};

export const startWorkflowWithoutCalendar = async (data: {
  workflowId: number;
  startedBy: number;
  triggeredBy: string;
  scheduledStartTime: string | null;
}): Promise<WorkflowInstance> => {
  const response = await api.post('/execution/workflows/start-with-calendar', data);
  return response.data;
};