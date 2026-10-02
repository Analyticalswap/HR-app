import * as XLSX from 'xlsx';
import { Employee, AttendanceRecord, LeaveRequest, PayrollRecord, PublicHoliday } from '../types/hr';

export interface ExcelImportResult {
  success: boolean;
  message: string;
  counts: {
    employees?: number;
    attendance?: number;
    leaves?: number;
    payroll?: number;
  };
  data?: {
    employees?: Employee[];
    attendanceRecords?: AttendanceRecord[];
    leaves?: LeaveRequest[];
    payrollRecords?: PayrollRecord[];
  };
  errors?: string[];
}

/**
 * Export all collections into a comprehensive multi-sheet Excel workbook
 */
export function exportMasterExcelWorkbook(
  employees: Employee[],
  attendance: AttendanceRecord[],
  leaves: LeaveRequest[],
  payroll: PayrollRecord[],
  holidays: PublicHoliday[]
): void {
  const wb = XLSX.utils.book_new();

  // 1. Employees Sheet
  const empRows = employees.map((e) => ({
    'Employee ID': e.id,
    'Full Name': e.name,
    'Work Email': e.email,
    'System Role': e.role,
    'Designation': e.designation,
    'Department': e.department,
    'Manager Name': e.managerName || 'None',
    'Base Monthly ($)': e.salary.baseMonthly,
    'HRA ($)': e.salary.hraMonthly,
    'Special Allowance ($)': e.salary.specialAllowance,
    'PF Contribution ($)': e.salary.pfContribution,
    'Health Insurance ($)': e.salary.healthInsurance,
    'TDS Rate (%)': e.salary.tdsTaxRate,
    'Paid Leave Bal': e.leaveBalances.paid.allocated - e.leaveBalances.paid.used,
    'Sick Leave Bal': e.leaveBalances.sick.allocated - e.leaveBalances.sick.used,
    'Casual Leave Bal': e.leaveBalances.casual.allocated - e.leaveBalances.casual.used,
    'Work Location': e.workLocation
  }));
  const wsEmp = XLSX.utils.json_to_sheet(empRows);
  XLSX.utils.book_append_sheet(wb, wsEmp, 'Employees');

  // 2. Attendance Sheet
  const attRows = attendance.map((a) => ({
    'Record ID': a.id,
    'Employee ID': a.employeeId,
    'Employee Name': a.employeeName,
    'Department': a.department,
    'Date': a.date,
    'Sign In': a.signInTime ? new Date(a.signInTime).toLocaleTimeString() : '',
    'Sign Out': a.signOutTime ? new Date(a.signOutTime).toLocaleTimeString() : '',
    'Work Hours': (a.workDurationSeconds / 3600).toFixed(2),
    'Break Hours': (a.breakDurationSeconds / 3600).toFixed(2),
    'Overtime Hours': (a.overtimeSeconds / 3600).toFixed(2),
    'Status': a.status,
    'Location': a.location?.name || 'Office'
  }));
  const wsAtt = XLSX.utils.json_to_sheet(attRows);
  XLSX.utils.book_append_sheet(wb, wsAtt, 'Attendance_Logs');

  // 3. Leaves Sheet
  const leaveRows = leaves.map((l) => ({
    'Leave ID': l.id,
    'Employee ID': l.employeeId,
    'Employee Name': l.employeeName,
    'Department': l.department,
    'Type': l.leaveType,
    'Start Date': l.startDate,
    'End Date': l.endDate,
    'Total Days': l.totalDays,
    'Status': l.status,
    'Reason': l.reason,
    'Manager Endorsement': l.managerReview?.comment || '',
    'HR Sign-Off': l.hrReview?.comment || ''
  }));
  const wsLeave = XLSX.utils.json_to_sheet(leaveRows);
  XLSX.utils.book_append_sheet(wb, wsLeave, 'Leave_Applications');

  // 4. Payroll Sheet
  const payRows = payroll.map((p) => ({
    'Payroll ID': p.id,
    'Month': p.monthYear,
    'Employee ID': p.employeeId,
    'Employee Name': p.employeeName,
    'Department': p.department,
    'Payable Days': p.payableDays,
    'Days Worked': p.presentDays,
    'Overtime (Hrs)': p.overtimeHours,
    'Basic Salary ($)': p.earnings.basic,
    'HRA ($)': p.earnings.hra,
    'Allowances ($)': p.earnings.specialAllowance,
    'Overtime Pay ($)': p.earnings.overtimePay,
    'Gross Earnings ($)': p.earnings.grossEarnings,
    'PF Deduction ($)': p.deductions.pf,
    'Health Cover ($)': p.deductions.healthInsurance,
    'Tax Withheld ($)': p.deductions.tdsTax,
    'LOP Deductions ($)': p.deductions.lopDeduction,
    'Total Deductions ($)': p.deductions.totalDeductions,
    'Net Salary ($)': p.netSalary,
    'Disbursement Status': p.paymentStatus,
    'Transaction Ref': p.transactionRef || 'Pending'
  }));
  const wsPay = XLSX.utils.json_to_sheet(payRows);
  XLSX.utils.book_append_sheet(wb, wsPay, 'Payroll_Register');

  // 5. Holidays Sheet
  const holRows = holidays.map((h) => ({
    'Holiday ID': h.id,
    'Name': h.name,
    'Date': h.date,
    'Day': h.dayName,
    'Optional/Floating': h.isOptional ? 'Yes' : 'No'
  }));
  const wsHol = XLSX.utils.json_to_sheet(holRows);
  XLSX.utils.book_append_sheet(wb, wsHol, 'Holidays');

  // Trigger download
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `AegisHR_Enterprise_Master_${dateStr}.xlsx`);
}

/**
 * Generate and download an Excel template specifically designed for uploading new employees
 */
export function downloadEmployeeTemplateExcel(): void {
  const sampleEmployees = [
    {
      'Full Name': 'Sarah Connor',
      'Work Email': 'sarah.c@company.internal',
      'System Role (employee/manager/hr)': 'employee',
      'Designation': 'Security Operations Lead',
      'Department': 'Engineering',
      'Manager Name': 'Marcus Vance',
      'Base Monthly ($)': 8200,
      'Work Location': 'Engineering Hub - Austin'
    },
    {
      'Full Name': 'Michael Chang',
      'Work Email': 'm.chang@company.internal',
      'System Role (employee/manager/hr)': 'employee',
      'Designation': 'Product Strategist',
      'Department': 'Product',
      'Manager Name': 'Elena Rostova',
      'Base Monthly ($)': 7500,
      'Work Location': 'HQ - New York'
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleEmployees);
  XLSX.utils.book_append_sheet(wb, ws, 'Import_Employees_Template');
  XLSX.writeFile(wb, 'AegisHR_Employee_Import_Template.xlsx');
}

/**
 * Generate and download an Excel template for Biometric attendance punch logs
 */
export function downloadAttendanceTemplateExcel(): void {
  const sampleAttendance = [
    {
      'Employee ID': 'EMP-1001',
      'Employee Name': 'Alex Morgan',
      'Department': 'Engineering',
      'Date (YYYY-MM-DD)': '2026-10-02',
      'Sign In Time (HH:MM)': '09:05',
      'Sign Out Time (HH:MM)': '18:15',
      'Total Work Hours': 8.5,
      'Location Type (Office/Remote)': 'Office'
    },
    {
      'Employee ID': 'EMP-1004',
      'Employee Name': 'Priya Patel',
      'Department': 'Engineering',
      'Date (YYYY-MM-DD)': '2026-10-02',
      'Sign In Time (HH:MM)': '09:45',
      'Sign Out Time (HH:MM)': '18:00',
      'Total Work Hours': 7.75,
      'Location Type (Office/Remote)': 'Office'
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleAttendance);
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance_Template');
  XLSX.writeFile(wb, 'AegisHR_Attendance_Punch_Template.xlsx');
}

/**
 * Parse an uploaded Excel file (.xlsx, .xls, .csv) and extract data
 */
export async function parseExcelFile(file: File): Promise<ExcelImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const wb = XLSX.read(buffer, { type: 'binary' });

        const errors: string[] = [];
        const resultCounts: ExcelImportResult['counts'] = {};
        const parsedData: ExcelImportResult['data'] = {};

        // Check if there is an Employees sheet or if the default sheet has employee columns
        const sheetNames = wb.SheetNames;
        
        for (const sheetName of sheetNames) {
          const ws = wb.Sheets[sheetName];
          const rawRows: any[] = XLSX.utils.sheet_to_json(ws);

          if (!rawRows || rawRows.length === 0) continue;

          const firstRow = rawRows[0];
          const lowerSheet = sheetName.toLowerCase();

          // 1. Employee sheet match
          if (
            lowerSheet.includes('emp') || 
            firstRow['Full Name'] || 
            firstRow['Employee Name'] || 
            firstRow['Work Email']
          ) {
            const employees: Employee[] = [];
            rawRows.forEach((row, idx) => {
              const name = row['Full Name'] || row['Employee Name'] || row['Name'];
              const email = row['Work Email'] || row['Email'] || `user${idx + 10}@company.internal`;
              if (!name) return;

              const baseMonthly = Number(row['Base Monthly ($)'] || row['Base Salary'] || row['Salary'] || 6500);
              const hra = Math.round(baseMonthly * 0.3);
              const special = Math.round(baseMonthly * 0.15);
              const pf = Math.round(baseMonthly * 0.12);

              employees.push({
                id: row['Employee ID'] || `EMP-${1010 + idx}`,
                name: String(name),
                email: String(email),
                role: (row['System Role'] || row['Role'] || 'employee').toLowerCase().includes('hr') 
                  ? 'hr' 
                  : (row['System Role'] || row['Role'] || 'employee').toLowerCase().includes('manager') 
                  ? 'manager' 
                  : 'employee',
                designation: row['Designation'] || row['Title'] || 'Staff Specialist',
                department: row['Department'] || 'Engineering',
                managerId: 'EMP-1002',
                managerName: row['Manager Name'] || 'Marcus Vance',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                joinDate: row['Join Date'] || new Date().toISOString().split('T')[0],
                workLocation: row['Work Location'] || 'Engineering Hub - Austin',
                bankDetails: {
                  accountNo: '•••• •••• 9102',
                  bankName: 'Silicon Valley Bank',
                  routingCode: '121140399'
                },
                taxId: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
                salary: {
                  baseMonthly,
                  hraMonthly: hra,
                  specialAllowance: special,
                  pfContribution: pf,
                  healthInsurance: 200,
                  professionalTax: 200,
                  tdsTaxRate: 12,
                  overtimeHourlyRate: Math.round(baseMonthly / 160)
                },
                leaveBalances: {
                  paid: { allocated: 18, used: Number(row['Paid Leave Used'] || 0) },
                  sick: { allocated: 10, used: Number(row['Sick Leave Used'] || 0) },
                  casual: { allocated: 12, used: Number(row['Casual Leave Used'] || 0) },
                  paternity_maternity: { allocated: 15, used: 0 }
                }
              });
            });

            if (employees.length > 0) {
              parsedData.employees = employees;
              resultCounts.employees = employees.length;
            }
          }

          // 2. Attendance sheet match
          if (
            lowerSheet.includes('att') || 
            firstRow['Sign In'] || 
            firstRow['Sign In Time (HH:MM)'] ||
            firstRow['Work Hours']
          ) {
            const attendanceList: AttendanceRecord[] = [];
            rawRows.forEach((row, idx) => {
              const empId = row['Employee ID'] || `EMP-${1001 + (idx % 3)}`;
              const date = row['Date'] || row['Date (YYYY-MM-DD)'] || new Date().toISOString().split('T')[0];
              const inTimeStr = row['Sign In'] || row['Sign In Time (HH:MM)'] || '09:00';
              const outTimeStr = row['Sign Out'] || row['Sign Out Time (HH:MM)'] || '18:00';
              const workHrs = Number(row['Work Hours'] || row['Total Work Hours'] || 8.5);

              attendanceList.push({
                id: row['Record ID'] || `ATT-IMP-${empId}-${date}-${idx}`,
                employeeId: String(empId),
                employeeName: row['Employee Name'] || 'Employee',
                department: row['Department'] || 'Engineering',
                date: String(date),
                signInTime: `${date}T${inTimeStr.length === 5 ? inTimeStr : '09:00'}:00Z`,
                signOutTime: `${date}T${outTimeStr.length === 5 ? outTimeStr : '18:00'}:00Z`,
                status: inTimeStr > '09:30' ? 'late' : 'present',
                workDurationSeconds: Math.round(workHrs * 3600),
                breakDurationSeconds: 45 * 60,
                overtimeSeconds: workHrs > 8 ? Math.round((workHrs - 8) * 3600) : 0,
                location: {
                  type: (row['Location'] || row['Location Type'] || 'Office').toLowerCase().includes('remote') ? 'remote' : 'office',
                  name: row['Location'] || 'Office Hub'
                },
                breaks: []
              });
            });

            if (attendanceList.length > 0) {
              parsedData.attendanceRecords = attendanceList;
              resultCounts.attendance = attendanceList.length;
            }
          }
        }

        const totalImported = (resultCounts.employees || 0) + (resultCounts.attendance || 0);

        if (totalImported === 0) {
          resolve({
            success: false,
            message: 'No matching columns found in Excel file. Please use our template format for Employees or Attendance.',
            counts: {},
            errors: ['Unrecognized Excel structure.']
          });
        } else {
          resolve({
            success: true,
            message: `Successfully extracted ${resultCounts.employees || 0} employee(s) and ${resultCounts.attendance || 0} attendance record(s) from Excel file.`,
            counts: resultCounts,
            data: parsedData
          });
        }
      } catch (err: any) {
        resolve({
          success: false,
          message: `Failed to parse Excel file: ${err.message || 'Unknown error'}`,
          counts: {},
          errors: [err.message]
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        message: 'Could not read uploaded Excel file.',
        counts: {}
      });
    };

    reader.readAsBinaryString(file);
  });
}
