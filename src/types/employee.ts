export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  employeeName: string;
  email: string;
  phoneNumber?: string;
  commissionOnSales?: number;
  isActive: boolean;
  createdOn: string;
}

export const INITIAL_EMPLOYEES: Employee[] = [];
