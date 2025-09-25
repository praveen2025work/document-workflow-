import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MainLayout from '@/components/MainLayout';
import { getApiWorkflows, createApiWorkflow } from '@/lib/workflowApi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ApiWorkflowApiResponse, NewApiWorkflow, ApiWorkflow } from '@/types/workflow';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';

const WorkflowsPage: NextPage = () => {
  const [workflowsResponse, setWorkflowsResponse] = useState<ApiWorkflowApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState<Omit<NewApiWorkflow, 'createdBy'>>({
    name: '',
    description: '',
    reminderBeforeDueMins: 30,
    minutesAfterDue: 15,
    escalationAfterMins: 60,
    dueInMins: 120,
    isActive: 'Y',
  });
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await getApiWorkflows({ page: 0, size: 10, isActive: 'Y' });
      setWorkflowsResponse(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch workflows.');
      toast.error('Failed to fetch workflows.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setNewWorkflow(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const handleCreate = async () => {
    if (!newWorkflow.name || !user) {
      toast.error('Please provide a name for the workflow.');
      return;
    }
    try {
      const workflowToCreate: NewApiWorkflow = {
        ...newWorkflow,
        isActive: newWorkflow.isActive,
        createdBy: user.email,
      };
      await createApiWorkflow(workflowToCreate);
      toast.success('Workflow created successfully.');
      setAddDialogOpen(false);
      fetchWorkflows();
    } catch (error) {
      toast.error('Failed to create workflow.');
    }
  };

  const filteredWorkflows = workflowsResponse?.workflows?.filter(workflow =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const headerActions = (
    <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Workflow
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Workflow</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="name">Workflow Name</Label>
          <Input id="name" value={newWorkflow.name} onChange={handleInputChange} />
          <Label htmlFor="description">Description</Label>
          <Input id="description" value={newWorkflow.description} onChange={handleInputChange} />
          <Label htmlFor="dueInMins">Due In (minutes)</Label>
          <Input id="dueInMins" type="number" value={newWorkflow.dueInMins} onChange={handleInputChange} />
          <Label htmlFor="reminderBeforeDueMins">Reminder Before Due (minutes)</Label>
          <Input id="reminderBeforeDueMins" type="number" value={newWorkflow.reminderBeforeDueMins} onChange={handleInputChange} />
          <Label htmlFor="minutesAfterDue">Minutes After Due</Label>
          <Input id="minutesAfterDue" type="number" value={newWorkflow.minutesAfterDue} onChange={handleInputChange} />
          <Label htmlFor="escalationAfterMins">Escalation After (minutes)</Label>
          <Input id="escalationAfterMins" type="number" value={newWorkflow.escalationAfterMins} onChange={handleInputChange} />
          <div className="flex items-center space-x-2">
            <Switch id="isActive" checked={newWorkflow.isActive} onCheckedChange={(checked) => setNewWorkflow(prev => ({...prev, isActive: checked}))} />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout
      title="Workflows"
      subtitle="Manage and configure workflows"
      icon={FileText}
      headerActions={headerActions}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Search Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by workflow name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkflows?.map((workflow) => (
                    <TableRow key={workflow.workflowId}>
                      <TableCell>{workflow.name}</TableCell>
                      <TableCell>{workflow.description}</TableCell>
                      <TableCell>
                        <Badge variant={workflow.isActive === 'Y' ? 'default' : 'destructive'}>
                          {workflow.isActive === 'Y' ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{workflow.createdBy}</TableCell>
                      <TableCell>{new Date(workflow.createdOn).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default WorkflowsPage;