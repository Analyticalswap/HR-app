export type Role = 'employee' | 'manager' | 'hr';

export type Department = 
  | 'Engineering'
  | 'Product'
  | 'People & Culture'
  | 'Finance'
  | 'Design'
  | 'Marketing';

export type LeaveType = 'casual' | 'sick' | 'paid' | 'paternity_maternity' | 'unpaid';

export type LeaveStatus = 
  | 'pending_manager' 
  | 'manager_approved' 
  | 'hr_approved' 
  | 'rejected' 
  | 'cancelled';

export interface SalaryStructure {
  baseMonthly: number;
  hraMonthly: number;
  specialAllowance: number;
  pfContribution: number;
  healthInsurance: number;
  professionalTax: number;
  tdsTaxRate: number; // percentage e.g. 10 for 10%
  overtimeHourlyRate: number;
}

export interface LeaveBalance {
  allocated: number;
  used: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: Role;
  designation: string;
  department: Department;
  managerId: string | null;
  managerName: string | null;
  avatar: string;
  joinDate: string;
  workLocation: string;
  bankDetails: {
    accountNo: string;
    bankName: string;
    routingCode: string;
  };
  taxId: string;
  salary: SalaryStructure;
  leaveBalances: {
    casual: LeaveBalance;
    sick: LeaveBalance;
    paid: LeaveBalance;
    paternity_maternity: LeaveBalance;
  };
}

export type AttendanceStatus = 'present' | 'on_break' | 'late' | 'half_day' | 'absent' | 'on_leave';

export interface BreakRecord {
  id: string;
  start: string; // ISO string
  end?: string;  // ISO string
  type: 'lunch' | 'tea' | 'personal';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  date: string; // YYYY-MM-DD
  signInTime: string | null; // ISO string
  signOutTime: string | null; // ISO string
  status: AttendanceStatus;
  workDurationSeconds: number;
  breakDurationSeconds: number;
  overtimeSeconds: number;
  location: {
    type: 'office' | 'remote';
    name: string;
    coordinates?: string;
  };
  breaks: BreakRecord[];
  isRegularized?: boolean;
  regularizationReason?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  totalDays: number;
  isHalfDay: boolean;
  halfDayPeriod?: 'first_half' | 'second_half';
  reason: string;
  appliedAt: string; // ISO string
  status: LeaveStatus;
  managerReview?: {
    reviewerId: string;
    reviewerName: string;
    action: 'approved' | 'rejected';
    date: string;
    comment?: string;
  };
  hrReview?: {
    reviewerId: string;
    reviewerName: string;
    action: 'approved' | 'rejected';
    date: string;
    comment?: string;
  };
}

export interface PayrollRecord {
  id: string;
  monthYear: string; // e.g. "October 2026"
  periodMonth: number; // 1-12
  periodYear: number;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: Department;
  payableDays: number;
  presentDays: number;
  paidLeaveDays: number;
  lossOfPayDays: number;
  overtimeHours: number;
  earnings: {
    basic: number;
    hra: number;
    specialAllowance: number;
    overtimePay: number;
    bonus: number;
    grossEarnings: number;
  };
  deductions: {
    pf: number;
    healthInsurance: number;
    professionalTax: number;
    tdsTax: number;
    lopDeduction: number;
    totalDeductions: number;
  };
  netSalary: number;
  paymentStatus: 'draft' | 'processed' | 'disbursed';
  disbursedAt?: string;
  transactionRef?: string;
}

export interface PublicHoliday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  dayName: string;
  isOptional: boolean;
}
