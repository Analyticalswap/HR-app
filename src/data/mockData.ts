import { Employee, AttendanceRecord, LeaveRequest, PayrollRecord, PublicHoliday } from '../types/hr';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-1001',
    name: 'Alex Morgan',
    email: 'alex.morgan@aegishr.internal',
    role: 'employee',
    designation: 'Senior Frontend Engineer',
    department: 'Engineering',
    managerId: 'EMP-1002',
    managerName: 'Marcus Vance',
    avatar: '/src/assets/images/avatar_employee_frontend_1790918533621.jpg',
    joinDate: '2023-03-15',
    workLocation: 'Engineering Hub - Austin',
    bankDetails: {
      accountNo: '•••• •••• 8492',
      bankName: 'JPMorgan Chase',
      routingCode: '021000021'
    },
    taxId: 'TX-948201',
    salary: {
      baseMonthly: 7200,
      hraMonthly: 2160,
      specialAllowance: 1200,
      pfContribution: 864,
      healthInsurance: 180,
      professionalTax: 200,
      tdsTaxRate: 12,
      overtimeHourlyRate: 48
    },
    leaveBalances: {
      casual: { allocated: 12, used: 3 },
      sick: { allocated: 10, used: 2 },
      paid: { allocated: 18, used: 5 },
      paternity_maternity: { allocated: 15, used: 0 }
    }
  },
  {
    id: 'EMP-1002',
    name: 'Marcus Vance',
    email: 'marcus.vance@aegishr.internal',
    role: 'manager',
    designation: 'Director of Engineering',
    department: 'Engineering',
    managerId: 'EMP-1003',
    managerName: 'Elena Rostova',
    avatar: '/src/assets/images/avatar_manager_engineering_1790918546753.jpg',
    joinDate: '2021-08-01',
    workLocation: 'Engineering Hub - Austin',
    bankDetails: {
      accountNo: '•••• •••• 3144',
      bankName: 'Silicon Valley Bank',
      routingCode: '121140399'
    },
    taxId: 'TX-382910',
    salary: {
      baseMonthly: 11500,
      hraMonthly: 3450,
      specialAllowance: 1800,
      pfContribution: 1380,
      healthInsurance: 240,
      professionalTax: 250,
      tdsTaxRate: 18,
      overtimeHourlyRate: 75
    },
    leaveBalances: {
      casual: { allocated: 12, used: 2 },
      sick: { allocated: 10, used: 1 },
      paid: { allocated: 20, used: 6 },
      paternity_maternity: { allocated: 15, used: 0 }
    }
  },
  {
    id: 'EMP-1003',
    name: 'Elena Rostova',
    email: 'elena.rostova@aegishr.internal',
    role: 'hr',
    designation: 'VP of People & Culture',
    department: 'People & Culture',
    managerId: null,
    managerName: null,
    avatar: '/src/assets/images/avatar_hr_director_1790918557961.jpg',
    joinDate: '2020-01-10',
    workLocation: 'HQ - New York',
    bankDetails: {
      accountNo: '•••• •••• 9920',
      bankName: 'Goldman Sachs Private',
      routingCode: '026008691'
    },
    taxId: 'NY-771928',
    salary: {
      baseMonthly: 13000,
      hraMonthly: 3900,
      specialAllowance: 2200,
      pfContribution: 1560,
      healthInsurance: 260,
      professionalTax: 250,
      tdsTaxRate: 20,
      overtimeHourlyRate: 85
    },
    leaveBalances: {
      casual: { allocated: 12, used: 1 },
      sick: { allocated: 10, used: 0 },
      paid: { allocated: 22, used: 4 },
      paternity_maternity: { allocated: 15, used: 0 }
    }
  },
  {
    id: 'EMP-1004',
    name: 'Priya Patel',
    email: 'priya.patel@aegishr.internal',
    role: 'employee',
    designation: 'Staff Backend Architect',
    department: 'Engineering',
    managerId: 'EMP-1002',
    managerName: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    joinDate: '2022-04-18',
    workLocation: 'Engineering Hub - Austin',
    bankDetails: {
      accountNo: '•••• •••• 5519',
      bankName: 'Wells Fargo',
      routingCode: '121000247'
    },
    taxId: 'TX-551920',
    salary: {
      baseMonthly: 8400,
      hraMonthly: 2520,
      specialAllowance: 1400,
      pfContribution: 1008,
      healthInsurance: 200,
      professionalTax: 200,
      tdsTaxRate: 14,
      overtimeHourlyRate: 55
    },
    leaveBalances: {
      casual: { allocated: 12, used: 4 },
      sick: { allocated: 10, used: 3 },
      paid: { allocated: 18, used: 7 },
      paternity_maternity: { allocated: 15, used: 0 }
    }
  },
  {
    id: 'EMP-1005',
    name: 'David Kim',
    email: 'david.kim@aegishr.internal',
    role: 'employee',
    designation: 'Lead Product Designer',
    department: 'Design',
    managerId: 'EMP-1003',
    managerName: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinDate: '2023-01-09',
    workLocation: 'HQ - New York',
    bankDetails: {
      accountNo: '•••• •••• 7731',
      bankName: 'Citibank',
      routingCode: '021000089'
    },
    taxId: 'NY-448102',
    salary: {
      baseMonthly: 7800,
      hraMonthly: 2340,
      specialAllowance: 1300,
      pfContribution: 936,
      healthInsurance: 190,
      professionalTax: 200,
      tdsTaxRate: 12,
      overtimeHourlyRate: 50
    },
    leaveBalances: {
      casual: { allocated: 12, used: 2 },
      sick: { allocated: 10, used: 1 },
      paid: { allocated: 18, used: 3 },
      paternity_maternity: { allocated: 15, used: 0 }
    }
  }
];

export const INITIAL_HOLIDAYS: PublicHoliday[] = [
  { id: 'HOL-01', name: 'New Year Day', date: '2026-01-01', dayName: 'Thursday', isOptional: false },
  { id: 'HOL-02', name: 'Martin Luther King Jr. Day', date: '2026-01-19', dayName: 'Monday', isOptional: false },
  { id: 'HOL-03', name: 'Presidents Day', date: '2026-02-16', dayName: 'Monday', isOptional: true },
  { id: 'HOL-04', name: 'Memorial Day', date: '2026-05-25', dayName: 'Monday', isOptional: false },
  { id: 'HOL-05', name: 'Juneteenth National Day', date: '2026-06-19', dayName: 'Friday', isOptional: false },
  { id: 'HOL-06', name: 'Independence Day', date: '2026-07-03', dayName: 'Friday (Observed)', isOptional: false },
  { id: 'HOL-07', name: 'Labor Day', date: '2026-09-07', dayName: 'Monday', isOptional: false },
  { id: 'HOL-08', name: 'Indigenous Peoples Day', date: '2026-10-12', dayName: 'Monday', isOptional: false },
  { id: 'HOL-09', name: 'Veterans Day', date: '2026-11-11', dayName: 'Wednesday', isOptional: true },
  { id: 'HOL-10', name: 'Thanksgiving Day', date: '2026-11-26', dayName: 'Thursday', isOptional: false },
  { id: 'HOL-11', name: 'Christmas Day', date: '2026-12-25', dayName: 'Friday', isOptional: false }
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'LV-2026-001',
    employeeId: 'EMP-1001',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    leaveType: 'casual',
    startDate: '2026-10-15',
    endDate: '2026-10-16',
    totalDays: 2,
    isHalfDay: false,
    reason: 'Attending sibling wedding ceremony in Chicago',
    appliedAt: '2026-10-01T09:30:00Z',
    status: 'pending_manager'
  },
  {
    id: 'LV-2026-002',
    employeeId: 'EMP-1004',
    employeeName: 'Priya Patel',
    department: 'Engineering',
    leaveType: 'paid',
    startDate: '2026-10-22',
    endDate: '2026-10-24',
    totalDays: 3,
    isHalfDay: false,
    reason: 'Family vacation and personal downtime',
    appliedAt: '2026-09-28T14:15:00Z',
    status: 'manager_approved',
    managerReview: {
      reviewerId: 'EMP-1002',
      reviewerName: 'Marcus Vance',
      action: 'approved',
      date: '2026-09-29T10:00:00Z',
      comment: 'Approved. Sprint deliverables covered by Alex and David.'
    }
  },
  {
    id: 'LV-2026-003',
    employeeId: 'EMP-1005',
    employeeName: 'David Kim',
    department: 'Design',
    leaveType: 'sick',
    startDate: '2026-09-18',
    endDate: '2026-09-18',
    totalDays: 1,
    isHalfDay: false,
    reason: 'Dental surgery and post-op rest',
    appliedAt: '2026-09-17T18:00:00Z',
    status: 'hr_approved',
    managerReview: {
      reviewerId: 'EMP-1003',
      reviewerName: 'Elena Rostova',
      action: 'approved',
      date: '2026-09-18T08:30:00Z',
      comment: 'Take rest David.'
    },
    hrReview: {
      reviewerId: 'EMP-1003',
      reviewerName: 'Elena Rostova',
      action: 'approved',
      date: '2026-09-18T08:35:00Z',
      comment: 'Medical certificate on file.'
    }
  },
  {
    id: 'LV-2026-004',
    employeeId: 'EMP-1001',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    leaveType: 'paid',
    startDate: '2026-08-10',
    endDate: '2026-08-14',
    totalDays: 5,
    isHalfDay: false,
    reason: 'Annual summer holiday hiking trip',
    appliedAt: '2026-07-25T11:00:00Z',
    status: 'hr_approved',
    managerReview: {
      reviewerId: 'EMP-1002',
      reviewerName: 'Marcus Vance',
      action: 'approved',
      date: '2026-07-26T09:12:00Z',
      comment: 'Have a great trip Alex!'
    },
    hrReview: {
      reviewerId: 'EMP-1003',
      reviewerName: 'Elena Rostova',
      action: 'approved',
      date: '2026-07-26T14:40:00Z',
      comment: 'Deducted from paid leave balance.'
    }
  }
];

// Helper to generate seed attendance records for past days
export function generatePastAttendanceRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const dates = [
    '2026-09-25',
    '2026-09-28',
    '2026-09-29',
    '2026-09-30'
  ];

  INITIAL_EMPLOYEES.forEach((emp) => {
    dates.forEach((date, idx) => {
      // Alex, Marcus, Priya, David
      const inHour = 8 + (idx % 2); // 8 or 9 AM
      const inMin = 15 + ((idx * 7) % 35);
      const outHour = 17 + (idx % 2); // 17 or 18 (5 or 6 PM)
      const outMin = 30 + ((idx * 5) % 20);

      const signIn = `${date}T0${inHour}:${inMin < 10 ? '0' + inMin : inMin}:00Z`;
      const signOut = `${date}T${outHour}:${outMin < 10 ? '0' + outMin : outMin}:00Z`;
      const workSec = 8.5 * 3600;
      const breakSec = 45 * 60;
      const otSec = idx === 1 ? 1.5 * 3600 : 0;

      records.push({
        id: `ATT-${emp.id}-${date}`,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        date: date,
        signInTime: signIn,
        signOutTime: signOut,
        status: inHour === 9 && inMin > 30 ? 'late' : 'present',
        workDurationSeconds: workSec,
        breakDurationSeconds: breakSec,
        overtimeSeconds: otSec,
        location: {
          type: 'office',
          name: emp.workLocation,
          coordinates: '30.2672° N, 97.7431° W'
        },
        breaks: [
          {
            id: `BRK-${date}-1`,
            start: `${date}T12:30:00Z`,
            end: `${date}T13:15:00Z`,
            type: 'lunch'
          }
        ]
      });
    });
  });

  return records;
}

export const INITIAL_PAYROLL_RECORDS: PayrollRecord[] = [
  {
    id: 'PAY-2026-09-1001',
    monthYear: 'September 2026',
    periodMonth: 9,
    periodYear: 2026,
    employeeId: 'EMP-1001',
    employeeName: 'Alex Morgan',
    designation: 'Senior Frontend Engineer',
    department: 'Engineering',
    payableDays: 30,
    presentDays: 22,
    paidLeaveDays: 0,
    lossOfPayDays: 0,
    overtimeHours: 4.5,
    earnings: {
      basic: 7200,
      hra: 2160,
      specialAllowance: 1200,
      overtimePay: 216, // 4.5 * $48
      bonus: 500,
      grossEarnings: 11276
    },
    deductions: {
      pf: 864,
      healthInsurance: 180,
      professionalTax: 200,
      tdsTax: 1353, // 12%
      lopDeduction: 0,
      totalDeductions: 2597
    },
    netSalary: 8679,
    paymentStatus: 'disbursed',
    disbursedAt: '2026-09-30T17:00:00Z',
    transactionRef: 'NEFT-TXN-902810'
  },
  {
    id: 'PAY-2026-09-1002',
    monthYear: 'September 2026',
    periodMonth: 9,
    periodYear: 2026,
    employeeId: 'EMP-1002',
    employeeName: 'Marcus Vance',
    designation: 'Director of Engineering',
    department: 'Engineering',
    payableDays: 30,
    presentDays: 22,
    paidLeaveDays: 0,
    lossOfPayDays: 0,
    overtimeHours: 0,
    earnings: {
      basic: 11500,
      hra: 3450,
      specialAllowance: 1800,
      overtimePay: 0,
      bonus: 1000,
      grossEarnings: 17750
    },
    deductions: {
      pf: 1380,
      healthInsurance: 240,
      professionalTax: 250,
      tdsTax: 3195, // 18%
      lopDeduction: 0,
      totalDeductions: 5065
    },
    netSalary: 12685,
    paymentStatus: 'disbursed',
    disbursedAt: '2026-09-30T17:00:00Z',
    transactionRef: 'NEFT-TXN-902811'
  },
  {
    id: 'PAY-2026-09-1003',
    monthYear: 'September 2026',
    periodMonth: 9,
    periodYear: 2026,
    employeeId: 'EMP-1003',
    employeeName: 'Elena Rostova',
    designation: 'VP of People & Culture',
    department: 'People & Culture',
    payableDays: 30,
    presentDays: 22,
    paidLeaveDays: 0,
    lossOfPayDays: 0,
    overtimeHours: 0,
    earnings: {
      basic: 13000,
      hra: 3900,
      specialAllowance: 2200,
      overtimePay: 0,
      bonus: 1200,
      grossEarnings: 20300
    },
    deductions: {
      pf: 1560,
      healthInsurance: 260,
      professionalTax: 250,
      tdsTax: 4060, // 20%
      lopDeduction: 0,
      totalDeductions: 6130
    },
    netSalary: 14170,
    paymentStatus: 'disbursed',
    disbursedAt: '2026-09-30T17:00:00Z',
    transactionRef: 'NEFT-TXN-902812'
  }
];
