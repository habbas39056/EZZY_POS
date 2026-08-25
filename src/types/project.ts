export interface Project {
  id: string;
  projectName: string;
  status: 'In Progress' | 'Completed' | 'On Hold' | 'Planning';
  estimatedCost: number;
  income: number;
  cost: number;
  profit: number;
  startDate: string;
  endDate: string;
  dueDate: string;
  isActive: boolean;
  createdAt: string;
}

export const INITIAL_PROJECTS: Project[] = [];
