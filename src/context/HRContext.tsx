import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Employee, 
  AttendanceRecord, 
  LeaveRequest, 
  PayrollRecord, 
  PublicHoliday,
  SalaryStructure,
  LeaveType,
  BreakRecord
} from '../types/hr';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_LEAVES, 
  INITIAL_HOLIDAYS, 
  generatePastAttendanceRecords, 
  INITIAL_PAYROLL_RECORDS 
} from '../data/mockData';

interface HRContextType {
  currentUser: Employee;
  switchUser: (empId: string) => void;
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (empId: string, updates: Partial<Employee>) => void;
  updateSalaryStructure: (empId: string, salary: SalaryStructure) => void;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  todayRecord: AttendanceRecord | undefined;
  punchIn: (locationType: 'office' | 'remote', locationName: string) => void;
  punchOut: () => void;
  startBreak: (type: 'lunch' | 'tea' | 'personal') => void;
  endBreak: () => void;
  regularizeAttendance: (recordId: string, newIn: string, newOut: string, reason: string) => void;
  reviewRegularization: (recordId: string, action: 'approved' | 'rejected') => void;

  // Leave Management
  leaves: LeaveRequest[];
  applyLeave: (leave: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    totalDays: number;
    isHalfDay: boolean;
    halfDayPeriod?: 'first_half' | 'second_half';
    reason: string;
  }) => { success: boolean; error?: string };
  managerReviewLeave: (requestId: string, action: 'approved' | 'rejected', comment?: string) => void;
  hrReviewLeave: (requestId: string, action: 'approved' | 'rejected', comment?: string) => void;
  cancelLeave: (requestId: string) => void;

  // Payroll
  payrollRecords: PayrollRecord[];
  runMonthlyPayroll: (monthYear: string, periodMonth: number, periodYear: number) => void;
  disbursePayrollRecord: (recordId: string) => void;
  disburseAllPayroll: (monthYear: string) => void;

  // Holidays
  holidays: PublicHoliday[];
  addHoliday: (holiday: Omit<PublicHoliday, 'id'>) => void;

  // Data Source Management (Export, Import, Reset, Excel)
  exportAllData: () => string;
  importAllData: (jsonString: string) => { success: boolean; error?: string };
  importExcelData: (data: { employees?: Employee[]; attendanceRecords?: AttendanceRecord[] }) => void;
  resetToDefaultData: () => void;

  // Stats helper
  todayDateStr: string;
}

const HRContext = createContext<HRContextType | undefined>(undefined);

export const HRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Employees
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('aegis_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  // Current logged in user (default Alex Morgan - EMP-1001)
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('aegis_current_user_id') || 'EMP-1001';
  });

  // Attendance
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('aegis_attendance');
    return saved ? JSON.parse(saved) : generatePastAttendanceRecords();
  });

  // Leaves
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('aegis_leaves');
    return saved ? JSON.parse(saved) : INITIAL_LEAVES;
  });

  // Payroll
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem('aegis_payroll');
    return saved ? JSON.parse(saved) : INITIAL_PAYROLL_RECORDS;
  });

  // Holidays
  const [holidays, setHolidays] = useState<PublicHoliday[]>(() => {
    const saved = localStorage.getItem('aegis_holidays');
    return saved ? JSON.parse(saved) : INITIAL_HOLIDAYS;
  });

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('aegis_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('aegis_current_user_id', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('aegis_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('aegis_leaves', JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem('aegis_payroll', JSON.stringify(payrollRecords));
  }, [payrollRecords]);

  useEffect(() => {
    localStorage.setItem('aegis_holidays', JSON.stringify(holidays));
  }, [holidays]);

  // Derived current user
  const currentUser = employees.find((e) => e.id === currentUserId) || employees[0];

  // Derived today's attendance record for current user
  const todayRecord = attendanceRecords.find(
    (r) => r.employeeId === currentUser.id && r.date === todayDateStr
  );

  const switchUser = (empId: string) => {
    if (employees.some((e) => e.id === empId)) {
      setCurrentUserId(empId);
    }
  };

  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newId = `EMP-${1000 + employees.length + 1}`;
    const newEmp: Employee = {
      ...empData,
      id: newId
    };
    setEmployees((prev) => [...prev, newEmp]);
  };

  const updateEmployee = (empId: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === empId ? { ...emp, ...updates } : emp))
    );
  };

  const updateSalaryStructure = (empId: string, salary: SalaryStructure) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === empId ? { ...emp, salary } : emp))
    );
  };

  // --- Attendance actions ---
  const punchIn = (locationType: 'office' | 'remote', locationName: string) => {
    const now = new Date();
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
    const newRecord: AttendanceRecord = {
      id: `ATT-${currentUser.id}-${todayDateStr}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department,
      date: todayDateStr,
      signInTime: now.toISOString(),
      signOutTime: null,
      status: isLate ? 'late' : 'present',
      workDurationSeconds: 0,
      breakDurationSeconds: 0,
      overtimeSeconds: 0,
      location: {
        type: locationType,
        name: locationName,
        coordinates: locationType === 'office' ? '30.2672° N, 97.7431° W' : '37.7749° N, 122.4194° W'
      },
      breaks: []
    };

    setAttendanceRecords((prev) => {
      const filtered = prev.filter(
        (r) => !(r.employeeId === currentUser.id && r.date === todayDateStr)
      );
      return [newRecord, ...filtered];
    });
  };

  const punchOut = () => {
    if (!todayRecord || !todayRecord.signInTime) return;

    const now = new Date();
    const inTime = new Date(todayRecord.signInTime).getTime();
    const totalElapsedSec = Math.floor((now.getTime() - inTime) / 1000);
    const netWorkSec = Math.max(0, totalElapsedSec - todayRecord.breakDurationSeconds);
    const standardSec = 8 * 3600;
    const overtimeSec = netWorkSec > standardSec ? netWorkSec - standardSec : 0;

    // Check if on active break, close it
    let updatedBreaks = [...todayRecord.breaks];
    if (todayRecord.status === 'on_break') {
      updatedBreaks = updatedBreaks.map((b) => {
        if (!b.end) return { ...b, end: now.toISOString() };
        return b;
      });
    }

    const updated: AttendanceRecord = {
      ...todayRecord,
      signOutTime: now.toISOString(),
      status: todayRecord.status === 'late' ? 'late' : 'present',
      workDurationSeconds: netWorkSec,
      overtimeSeconds: overtimeSec,
      breaks: updatedBreaks
    };

    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === todayRecord.id ? updated : r))
    );
  };

  const startBreak = (type: 'lunch' | 'tea' | 'personal') => {
    if (!todayRecord || todayRecord.signOutTime) return;
    const now = new Date().toISOString();
    const newBreak: BreakRecord = {
      id: `BRK-${Date.now()}`,
      start: now,
      type
    };

    const updated: AttendanceRecord = {
      ...todayRecord,
      status: 'on_break',
      breaks: [...todayRecord.breaks, newBreak]
    };

    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === todayRecord.id ? updated : r))
    );
  };

  const endBreak = () => {
    if (!todayRecord || todayRecord.status !== 'on_break') return;
    const now = new Date();
    let additionalBreakSec = 0;

    const updatedBreaks = todayRecord.breaks.map((b) => {
      if (!b.end) {
        const breakStart = new Date(b.start).getTime();
        const duration = Math.floor((now.getTime() - breakStart) / 1000);
        additionalBreakSec += duration;
        return { ...b, end: now.toISOString() };
      }
      return b;
    });

    const isLate = todayRecord.signInTime && new Date(todayRecord.signInTime).getHours() >= 10;
    const updated: AttendanceRecord = {
      ...todayRecord,
      status: isLate ? 'late' : 'present',
      breakDurationSeconds: todayRecord.breakDurationSeconds + additionalBreakSec,
      breaks: updatedBreaks
    };

    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === todayRecord.id ? updated : r))
    );
  };

  const regularizeAttendance = (
    recordId: string,
    newIn: string,
    newOut: string,
    reason: string
  ) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => {
        if (r.id === recordId) {
          const inDate = new Date(newIn);
          const outDate = new Date(newOut);
          const totalSec = Math.floor((outDate.getTime() - inDate.getTime()) / 1000);
          const netWork = Math.max(0, totalSec - (r.breakDurationSeconds || 0));
          return {
            ...r,
            signInTime: inDate.toISOString(),
            signOutTime: outDate.toISOString(),
            workDurationSeconds: netWork,
            isRegularized: true,
            regularizationReason: reason
          };
        }
        return r;
      })
    );
  };

  const reviewRegularization = (recordId: string, action: 'approved' | 'rejected') => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, isRegularized: action === 'approved' } : r))
    );
  };

  // --- Leave Actions ---
  const applyLeave = (leaveData: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    totalDays: number;
    isHalfDay: boolean;
    halfDayPeriod?: 'first_half' | 'second_half';
    reason: string;
  }) => {
    // Check balance
    if (leaveData.leaveType !== 'unpaid') {
      const balance = currentUser.leaveBalances[leaveData.leaveType];
      const available = balance ? balance.allocated - balance.used : 0;
      if (available < leaveData.totalDays) {
        return {
          success: false,
          error: `Insufficient leave balance. You have ${available} ${leaveData.leaveType} days remaining, but requested ${leaveData.totalDays}.`
        };
      }
    }

    const newRequest: LeaveRequest = {
      id: `LV-${new Date().getFullYear()}-${String(leaves.length + 1).padStart(3, '0')}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department,
      leaveType: leaveData.leaveType,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      totalDays: leaveData.totalDays,
      isHalfDay: leaveData.isHalfDay,
      halfDayPeriod: leaveData.halfDayPeriod,
      reason: leaveData.reason,
      appliedAt: new Date().toISOString(),
      status: 'pending_manager'
    };

    setLeaves((prev) => [newRequest, ...prev]);
    return { success: true };
  };

  const managerReviewLeave = (requestId: string, action: 'approved' | 'rejected', comment?: string) => {
    setLeaves((prev) =>
      prev.map((lv) => {
        if (lv.id === requestId) {
          return {
            ...lv,
            status: action === 'approved' ? 'manager_approved' : 'rejected',
            managerReview: {
              reviewerId: currentUser.id,
              reviewerName: currentUser.name,
              action,
              date: new Date().toISOString(),
              comment
            }
          };
        }
        return lv;
      })
    );
  };

  const hrReviewLeave = (requestId: string, action: 'approved' | 'rejected', comment?: string) => {
    const targetLeave = leaves.find((l) => l.id === requestId);
    if (!targetLeave) return;

    // If HR approves, deduct from employee's leave balance
    if (action === 'approved' && targetLeave.leaveType !== 'unpaid') {
      const leaveKey = targetLeave.leaveType as keyof Employee['leaveBalances'];
      setEmployees((prev) =>
        prev.map((emp) => {
          if (emp.id === targetLeave.employeeId) {
            const currentBal = emp.leaveBalances[leaveKey];
            if (currentBal) {
              return {
                ...emp,
                leaveBalances: {
                  ...emp.leaveBalances,
                  [leaveKey]: {
                    ...currentBal,
                    used: currentBal.used + targetLeave.totalDays
                  }
                }
              };
            }
          }
          return emp;
        })
      );
    }

    setLeaves((prev) =>
      prev.map((lv) => {
        if (lv.id === requestId) {
          return {
            ...lv,
            status: action === 'approved' ? 'hr_approved' : 'rejected',
            hrReview: {
              reviewerId: currentUser.id,
              reviewerName: currentUser.name,
              action,
              date: new Date().toISOString(),
              comment
            }
          };
        }
        return lv;
      })
    );
  };

  const cancelLeave = (requestId: string) => {
    setLeaves((prev) =>
      prev.map((lv) => (lv.id === requestId ? { ...lv, status: 'cancelled' } : lv))
    );
  };

  // --- Payroll Actions ---
  const runMonthlyPayroll = (monthYear: string, periodMonth: number, periodYear: number) => {
    // Generate payroll for every employee based on their actual attendance & leaves for that period
    const newRecords: PayrollRecord[] = employees.map((emp) => {
      // Find employee attendance in that month
      const empAttendance = attendanceRecords.filter((att) => {
        const attDate = new Date(att.date);
        return (
          att.employeeId === emp.id &&
          attDate.getMonth() + 1 === periodMonth &&
          attDate.getFullYear() === periodYear
        );
      });

      const totalOvertimeSec = empAttendance.reduce((acc, curr) => acc + curr.overtimeSeconds, 0);
      const overtimeHours = Number((totalOvertimeSec / 3600).toFixed(1));

      // Approved leaves
      const empLeaves = leaves.filter((lv) => {
        const lvStart = new Date(lv.startDate);
        return (
          lv.employeeId === emp.id &&
          lv.status === 'hr_approved' &&
          lvStart.getMonth() + 1 === periodMonth &&
          lvStart.getFullYear() === periodYear
        );
      });

      const paidLeaveDays = empLeaves
        .filter((l) => l.leaveType !== 'unpaid')
        .reduce((sum, l) => sum + l.totalDays, 0);
      const unpaidLeaveDays = empLeaves
        .filter((l) => l.leaveType === 'unpaid')
        .reduce((sum, l) => sum + l.totalDays, 0);

      const payableDays = 30;
      const presentDays = Math.min(payableDays - paidLeaveDays - unpaidLeaveDays, empAttendance.length || 20);
      const lossOfPayDays = unpaidLeaveDays;

      // Salary math
      const basic = emp.salary.baseMonthly;
      const hra = emp.salary.hraMonthly;
      const special = emp.salary.specialAllowance;
      const overtimePay = Math.round(overtimeHours * emp.salary.overtimeHourlyRate);
      const bonus = 0;
      const grossEarnings = basic + hra + special + overtimePay + bonus;

      // Per-day rate for LOP
      const perDayRate = (basic + hra + special) / 30;
      const lopDeduction = Math.round(lossOfPayDays * perDayRate);

      const pf = emp.salary.pfContribution;
      const health = emp.salary.healthInsurance;
      const profTax = emp.salary.professionalTax;
      const tdsTax = Math.round((grossEarnings * emp.salary.tdsTaxRate) / 100);
      const totalDeductions = pf + health + profTax + tdsTax + lopDeduction;

      const netSalary = Math.max(0, grossEarnings - totalDeductions);

      return {
        id: `PAY-${periodYear}-${String(periodMonth).padStart(2, '0')}-${emp.id}`,
        monthYear,
        periodMonth,
        periodYear,
        employeeId: emp.id,
        employeeName: emp.name,
        designation: emp.designation,
        department: emp.department,
        payableDays,
        presentDays,
        paidLeaveDays,
        lossOfPayDays,
        overtimeHours,
        earnings: {
          basic,
          hra,
          specialAllowance: special,
          overtimePay,
          bonus,
          grossEarnings
        },
        deductions: {
          pf,
          healthInsurance: health,
          professionalTax: profTax,
          tdsTax,
          lopDeduction,
          totalDeductions
        },
        netSalary,
        paymentStatus: 'processed'
      };
    });

    setPayrollRecords((prev) => {
      // Remove any existing records for this month/year before adding new batch
      const filtered = prev.filter(
        (p) => !(p.periodMonth === periodMonth && p.periodYear === periodYear)
      );
      return [...newRecords, ...filtered];
    });
  };

  const disbursePayrollRecord = (recordId: string) => {
    const txn = `NEFT-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    setPayrollRecords((prev) =>
      prev.map((p) =>
        p.id === recordId
          ? {
              ...p,
              paymentStatus: 'disbursed',
              disbursedAt: now,
              transactionRef: txn
            }
          : p
      )
    );
  };

  const disburseAllPayroll = (monthYear: string) => {
    const now = new Date().toISOString();
    setPayrollRecords((prev) =>
      prev.map((p) => {
        if (p.monthYear === monthYear && p.paymentStatus !== 'disbursed') {
          return {
            ...p,
            paymentStatus: 'disbursed',
            disbursedAt: now,
            transactionRef: `BATCH-ACH-${Math.floor(100000 + Math.random() * 900000)}`
          };
        }
        return p;
      })
    );
  };

  const addHoliday = (holidayData: Omit<PublicHoliday, 'id'>) => {
    const newHol: PublicHoliday = {
      ...holidayData,
      id: `HOL-${String(holidays.length + 1).padStart(2, '0')}`
    };
    setHolidays((prev) => [...prev, newHol]);
  };

  // Data Source Management
  const exportAllData = () => {
    const dump = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      source: 'AegisHR Enterprise Core',
      collections: {
        employees,
        attendanceRecords,
        leaves,
        payrollRecords,
        holidays
      }
    };
    return JSON.stringify(dump, null, 2);
  };

  const importAllData = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      const data = parsed.collections || parsed;

      if (!data.employees || !Array.isArray(data.employees)) {
        return { success: false, error: 'Invalid data format: missing employees collection.' };
      }

      if (data.employees) setEmployees(data.employees);
      if (data.attendanceRecords) setAttendanceRecords(data.attendanceRecords);
      if (data.leaves) setLeaves(data.leaves);
      if (data.payrollRecords) setPayrollRecords(data.payrollRecords);
      if (data.holidays) setHolidays(data.holidays);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'JSON parsing failed.' };
    }
  };

  const resetToDefaultData = () => {
    localStorage.removeItem('aegis_employees');
    localStorage.removeItem('aegis_attendance');
    localStorage.removeItem('aegis_leaves');
    localStorage.removeItem('aegis_payroll');
    localStorage.removeItem('aegis_holidays');
    localStorage.removeItem('aegis_current_user_id');

    setEmployees(INITIAL_EMPLOYEES);
    setAttendanceRecords(generatePastAttendanceRecords());
    setLeaves(INITIAL_LEAVES);
    setPayrollRecords(INITIAL_PAYROLL_RECORDS);
    setHolidays(INITIAL_HOLIDAYS);
    setCurrentUserId('EMP-1001');
  };

  const importExcelData = (data: {
    employees?: Employee[];
    attendanceRecords?: AttendanceRecord[];
  }) => {
    if (data.employees && data.employees.length > 0) {
      setEmployees((prev) => {
        const existingMap = new Map(prev.map((e) => [e.id, e]));
        data.employees!.forEach((e) => existingMap.set(e.id, e));
        return Array.from(existingMap.values());
      });
    }

    if (data.attendanceRecords && data.attendanceRecords.length > 0) {
      setAttendanceRecords((prev) => {
        const existingMap = new Map(prev.map((a) => [a.id, a]));
        data.attendanceRecords!.forEach((a) => existingMap.set(a.id, a));
        return Array.from(existingMap.values());
      });
    }
  };

  return (
    <HRContext.Provider
      value={{
        currentUser,
        switchUser,
        employees,
        addEmployee,
        updateEmployee,
        updateSalaryStructure,
        attendanceRecords,
        todayRecord,
        punchIn,
        punchOut,
        startBreak,
        endBreak,
        regularizeAttendance,
        reviewRegularization,
        leaves,
        applyLeave,
        managerReviewLeave,
        hrReviewLeave,
        cancelLeave,
        payrollRecords,
        runMonthlyPayroll,
        disbursePayrollRecord,
        disburseAllPayroll,
        holidays,
        addHoliday,
        exportAllData,
        importAllData,
        importExcelData,
        resetToDefaultData,
        todayDateStr
      }}
    >
      {children}
    </HRContext.Provider>
  );
};

export const useHR = () => {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error('useHR must be used within an HRProvider');
  }
  return context;
};
