import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getWorkflowInstance, getWorkflows } from '@/lib/api';
import { useRouter } from 'next/router';
import { GitBranch, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const router = useRouter();

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await getWorkflows();
        setWorkflows(response.data);
      } catch (error) {
        // Error handled by interceptor
      }
    };
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

  const handleNavigateToDesigner = () => {
    router.push('/');
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gray-900 text-white">
      <header className="flex h-16 items-center justify-between border-b border-gray-700 bg-gray-800 px-6">
        <div className="flex items-center gap-4">
          <Eye className="h-7 w-7 text-blue-400" />
          <h1 className="text-xl font-semibold">Workflow Monitoring</h1>
        </div>
        <Button onClick={handleNavigateToDesigner} variant="outline">
          Workflow Designer
        </Button>
      </header>
      <main className="flex-1 p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle>Select Workflow Instance</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="workflow-select">Workflow</Label>
                <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
                  <SelectTrigger id="workflow-select">
                    <SelectValue placeholder="Select a workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    {workflows.map(wf => (
                      <SelectItem key={wf.id} value={String(wf.id)}>{wf.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="instance-id">Instance ID</Label>
                <Input
                  id="instance-id"
                  value={instanceId}
                  onChange={(e) => setInstanceId(e.target.value)}
                  placeholder="Enter instance ID"
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <Button onClick={handleFetchInstance} disabled={isLoading || !instanceId}>
                {isLoading ? 'Loading...' : 'View Progress'}
              </Button>
            </CardContent>
          </Card>

          {workflowInstance && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle>Instance Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p><strong>Instance ID:</strong> {workflowInstance.id}</p>
                <p><strong>Workflow ID:</strong> {workflowInstance.workflow_id}</p>
                <p><strong>Status:</strong> {workflowInstance.status}</p>
                <p><strong>Triggered At:</strong> {new Date(workflowInstance.trigger_datetime).toLocaleString()}</p>
                
                <h4 className="font-semibold pt-4">Tasks</h4>
                <div className="space-y-2">
                  {workflowInstance.task_instances.map(task => (
                    <div key={task.id} className={`p-2 border rounded ${task.delayed ? 'border-red-500' : 'border-gray-600'}`}>
                      <p><strong>{task.task_name}</strong></p>
                      <p>Status: {task.status}</p>
                      {task.delayed && <p className="text-red-400">Delayed</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default MonitoringPage;