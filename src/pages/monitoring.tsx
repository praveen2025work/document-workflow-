import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getWorkflowInstance, getWorkflows } from '@/lib/api';
import { BarChart3, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from '@/components/MainLayout';

interface TaskInstance {
  id: number;
  task_name: string;
  status: string;
  delayed: boolean;
}

interface WorkflowInstance {
  id: number;
  workflow_id: number;
  trigger_datetime: string;
  status: string;
  task_instances: TaskInstance[];
}

interface Workflow {
  id: number;
  name: string;
}

const MonitoringPage: NextPage = () => {
  const [workflowInstance, setWorkflowInstance] = useState<WorkflowInstance | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [instanceId, setInstanceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(true);

  const fetchWorkflows = async () => {
    setIsLoadingWorkflows(true);
    try {
      const response = await getWorkflows();
      setWorkflows(response.data);
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setIsLoadingWorkflows(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleFetchInstance = async () => {
    if (!instanceId) return;
    setIsLoading(true);
    try {
      const response = await getWorkflowInstance(Number(instanceId));
      setWorkflowInstance(response.data);
    } catch (error) {
      // Error handled by interceptor
      setWorkflowInstance(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Header actions for monitoring
  const headerActions = (
    <Button 
      onClick={fetchWorkflows} 
      variant="outline" 
      size="sm"
      disabled={isLoadingWorkflows}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingWorkflows ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  );

  return (
    <MainLayout
      title="Process Owner Dashboard"
      subtitle="Monitor workflow execution and performance"
      icon={BarChart3}
      headerActions={headerActions}
    >
      <div className="flex-1 p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-foreground">Select Workflow Instance</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="workflow-select" className="text-foreground">Workflow</Label>
                <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
                  <SelectTrigger id="workflow-select" className="glass border-border">
                    <SelectValue placeholder="Select a workflow" />
                  </SelectTrigger>
                  <SelectContent className="glass border-border">
                    {workflows.map(wf => (
                      <SelectItem key={wf.id} value={String(wf.id)}>{wf.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="instance-id" className="text-foreground">Instance ID</Label>
                <Input
                  id="instance-id"
                  value={instanceId}
                  onChange={(e) => setInstanceId(e.target.value)}
                  placeholder="Enter instance ID"
                  className="glass border-border"
                />
              </div>
              <Button onClick={handleFetchInstance} disabled={isLoading || !instanceId}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'View Progress'
                )}
              </Button>
            </CardContent>
          </Card>

          {workflowInstance && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-foreground">Instance Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <p className="text-foreground"><strong>Instance ID:</strong> {workflowInstance.id}</p>
                  <p className="text-foreground"><strong>Workflow ID:</strong> {workflowInstance.workflow_id}</p>
                  <p className="text-foreground"><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      workflowInstance.status === 'COMPLETED' ? 'bg-success/20 text-success' :
                      workflowInstance.status === 'IN_PROGRESS' ? 'bg-warning/20 text-warning' :
                      workflowInstance.status === 'FAILED' ? 'bg-destructive/20 text-destructive' :
                      'bg-muted/20 text-muted-foreground'
                    }`}>
                      {workflowInstance.status}
                    </span>
                  </p>
                  <p className="text-foreground"><strong>Triggered At:</strong> {new Date(workflowInstance.trigger_datetime).toLocaleString()}</p>
                </div>
                
                <div className="pt-4">
                  <h4 className="font-semibold text-foreground mb-4">Task Progress</h4>
                  <div className="space-y-3">
                    {workflowInstance.task_instances.map(task => (
                      <div key={task.id} className={`p-4 border rounded-lg glass ${
                        task.delayed ? 'border-destructive/50' : 'border-border'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{task.task_name}</p>
                            <p className="text-sm text-muted-foreground">Task ID: {task.id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              task.status === 'COMPLETED' ? 'bg-success/20 text-success' :
                              task.status === 'IN_PROGRESS' ? 'bg-warning/20 text-warning' :
                              task.status === 'PENDING' ? 'bg-muted/20 text-muted-foreground' :
                              'bg-destructive/20 text-destructive'
                            }`}>
                              {task.status}
                            </span>
                            {task.delayed && (
                              <span className="px-2 py-1 rounded text-xs bg-destructive/20 text-destructive">
                                Delayed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default MonitoringPage;