import React, { useState } from 'react';
import { useHR } from '../context/HRContext';
import { PayrollRecord } from '../types/hr';
import { 
  DollarSign, 
  Play, 
  Send, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Building,
  CreditCard,
  Download,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const PayrollView: React.FC = () => {
  const { 
    currentUser, 
    payrollRecords, 
    runMonthlyPayroll, 
    disbursePayrollRecord, 
    disburseAllPayroll,
    employees 
  } = useHR();

  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const months = ['October 2026', 'September 2026', 'August 2026'];

  // Filter records based on role and selected month
  const monthRecords = payrollRecords.filter((p) => p.monthYear === selectedMonth);
  
  const displayRecords = currentUser.role === 'employee'
    ? monthRecords.filter((p) => p.employeeId === currentUser.id)
    : monthRecords;

  // Aggregate stats
  const totalGross = monthRecords.reduce((sum, p) => sum + p.earnings.grossEarnings, 0);
  const totalDeductions = monthRecords.reduce((sum, p) => sum + p.deductions.totalDeductions, 0);
  const totalNet = monthRecords.reduce((sum, p) => sum + p.netSalary, 0);
  const disbursedCount = monthRecords.filter((p) => p.paymentStatus === 'disbursed').length;

  const handleRunPayroll = () => {
    // Extract month and year
    const [monthName, yearStr] = selectedMonth.split(' ');
    const monthMap: Record<string, number> = {
      January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
      July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
    };
    const monthNum = monthMap[monthName] || 10;
    const yearNum = parseInt(yearStr, 10) || 2026;

    runMonthlyPayroll(selectedMonth, monthNum, yearNum);
    setSuccessMessage(`Payroll calculated and processed for ${selectedMonth} across ${employees.length} employees.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDisburseAll = () => {
    disburseAllPayroll(selectedMonth);
    setSuccessMessage(`All ${monthRecords.length} payouts disbursed via Direct Deposit for ${selectedMonth}.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const exportPayrollExcel = () => {
    const rows = monthRecords.map((p) => ({
      'Payroll ID': p.id,
      'Month': p.monthYear,
      'Employee ID': p.employeeId,
      'Name': p.employeeName,
      'Department': p.department,
      'Payable Days': p.payableDays,
      'Days Worked': p.presentDays,
      'Overtime Hours': p.overtimeHours,
      'Basic Salary ($)': p.earnings.basic,
      'HRA ($)': p.earnings.hra,
      'Allowances ($)': p.earnings.specialAllowance,
      'Overtime Pay ($)': p.earnings.overtimePay,
      'Gross Earnings ($)': p.earnings.grossEarnings,
      'PF Deduction ($)': p.deductions.pf,
      'Health Cover ($)': p.deductions.healthInsurance,
      'Professional Tax ($)': p.deductions.professionalTax,
      'TDS Tax ($)': p.deductions.tdsTax,
      'LOP Loss of Pay ($)': p.deductions.lopDeduction,
      'Total Deductions ($)': p.deductions.totalDeductions,
      'Net Take-Home Pay ($)': p.netSalary,
      'Status': p.paymentStatus,
      'Payment Ref': p.transactionRef || 'Pending'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll_Register');
    XLSX.writeFile(wb, `AegisHR_Payroll_${selectedMonth.replace(' ', '_')}.xlsx`);
  };

  const numberToWords = (num: number): string => {
    // Simple helper for payslip display
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero Dollars';
    
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    const hundreds = Math.floor(remainder / 100);
    const lastTwo = remainder % 100;
    
    let words = '';
    if (thousands > 0) {
      if (thousands < 20) words += `${units[thousands]} Thousand `;
      else words += `${tens[Math.floor(thousands / 10)]} ${units[thousands % 10]} Thousand `;
    }
    
    if (hundreds > 0) {
      words += `${units[hundreds]} Hundred `;
    }
    
    if (lastTwo > 0) {
      if (lastTwo < 20) words += units[lastTwo] + ' ';
      else words += `${tens[Math.floor(lastTwo / 10)]} ${units[lastTwo % 10]} `;
    }
    
    return words.trim() + ' Dollars Only';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Run Control (HR Only) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Payroll Engine & Compensation</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs font-mono font-normal text-slate-500">{selectedMonth}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated salary calculations integrated with biometric attendance, overtime, and leave deductions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none"
            >
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {currentUser.role === 'hr' && (
            <>
              <button
                type="button"
                onClick={handleRunPayroll}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                title="Calculate payroll based on attendance and leaves"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Calculate & Run Batch</span>
              </button>

              {monthRecords.some((p) => p.paymentStatus !== 'disbursed') && (
                <button
                  type="button"
                  onClick={handleDisburseAll}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  title="Execute batch bank disbursement"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Disburse All</span>
                </button>
              )}

              <button
                type="button"
                onClick={exportPayrollExcel}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
                title="Download complete payroll register as Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Export Excel</span>
              </button>
            </>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Aggregate Metrics (visible to HR/Manager, or personal to Employee) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">
            {currentUser.role === 'employee' ? 'My Net Payable' : 'Total Net Disbursement'}
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              ${(currentUser.role === 'employee' && displayRecords[0] ? displayRecords[0].netSalary : totalNet).toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Direct Deposit to bank account</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">
            {currentUser.role === 'employee' ? 'My Gross Earnings' : 'Total Gross Payroll'}
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              ${(currentUser.role === 'employee' && displayRecords[0] ? displayRecords[0].earnings.grossEarnings : totalGross).toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Basic + HRA + Allowances + OT</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">
            {currentUser.role === 'employee' ? 'Total Deductions' : 'Statutory & Tax Withholdings'}
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-700">
              -${(currentUser.role === 'employee' && displayRecords[0] ? displayRecords[0].deductions.totalDeductions : totalDeductions).toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">PF + Health + TDS + LOP</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Disbursement Status</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {disbursedCount} / {monthRecords.length}
            </span>
            <span className="text-xs text-emerald-700 font-medium">Disbursed</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Via automated ACH / NEFT</p>
        </div>
      </div>

      {/* Payroll Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            {currentUser.role === 'employee' ? 'My Payslip Record' : `Payroll Roster (${selectedMonth})`}
          </h3>
          <span className="text-xs text-slate-500">
            Showing {displayRecords.length} record(s)
          </span>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Payable Days</th>
                <th className="py-2.5 px-3 text-right">Gross Pay</th>
                <th className="py-2.5 px-3 text-right">Deductions</th>
                <th className="py-2.5 px-3 text-right">Net Take-Home</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Payslip</th>
                {currentUser.role === 'hr' && (
                  <th className="py-2.5 px-3 text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayRecords.length === 0 ? (
                <tr>
                  <td colSpan={currentUser.role === 'hr' ? 8 : 7} className="py-8 text-center text-slate-400">
                    No payroll records generated for {selectedMonth} yet. Click "Calculate & Run Batch" above.
                  </td>
                </tr>
              ) : (
                displayRecords.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{pay.employeeName}</div>
                      <div className="text-[11px] text-slate-400">
                        {pay.employeeId} · {pay.department}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span>{pay.payableDays} days</span>
                      {pay.lossOfPayDays > 0 && (
                        <span className="text-rose-600 block text-[10px]">
                          ({pay.lossOfPayDays}d LOP deducted)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono font-medium text-slate-900 text-right">
                      ${pay.earnings.grossEarnings.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 font-mono font-medium text-rose-700 text-right">
                      -${pay.deductions.totalDeductions.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-800 text-right text-sm">
                      ${pay.netSalary.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {pay.paymentStatus === 'disbursed' ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Disbursed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Processed (Pending Transfer)</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPayslip(pay)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-medium ml-auto"
                      >
                        <FileText className="w-3 h-3 text-slate-500" />
                        <span>View Payslip</span>
                      </button>
                    </td>

                    {currentUser.role === 'hr' && (
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {pay.paymentStatus !== 'disbursed' ? (
                          <button
                            onClick={() => disbursePayrollRecord(pay.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold"
                          >
                            Disburse
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {pay.transactionRef}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-2xl my-8 overflow-hidden print-exact">
            {/* Modal action bar (hidden during print) */}
            <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-semibold">
                Official Compensation Statement · {selectedPayslip.monthYear}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="text-slate-400 hover:text-white text-lg leading-none ml-2"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="p-8 space-y-6 text-slate-900">
              {/* Organization Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                      A
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">
                      AegisHR Technologies Inc.
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    550 Corporate Boulevard, Suite 1400, New York, NY 10001
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Registration No: US-NY-2021-99482 · payroll@aegishr.internal
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Payslip for the Month
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                    {selectedPayslip.monthYear}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    Doc ID: {selectedPayslip.id}
                  </div>
                </div>
              </div>

              {/* Employee Summary Block */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Employee Name:</span>
                    <span className="font-semibold text-slate-900">{selectedPayslip.employeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Employee ID:</span>
                    <span className="font-mono text-slate-800">{selectedPayslip.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Designation:</span>
                    <span className="text-slate-800">{selectedPayslip.designation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="text-slate-800">{selectedPayslip.department}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payable Days:</span>
                    <span className="font-mono font-medium text-slate-800">{selectedPayslip.payableDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Days Worked:</span>
                    <span className="font-mono font-medium text-slate-800">{selectedPayslip.presentDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Overtime Hours:</span>
                    <span className="font-mono font-medium text-slate-800">+{selectedPayslip.overtimeHours} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="text-slate-800">Direct Deposit (ACH)</span>
                  </div>
                </div>
              </div>

              {/* 2-Column Earnings vs Deductions Table */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                {/* Earnings */}
                <div>
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2 uppercase tracking-wider text-[11px]">
                    Earnings
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Basic Salary</span>
                      <span className="font-mono tabular-nums font-medium text-slate-900">
                        ${selectedPayslip.earnings.basic.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">House Rent Allowance (HRA)</span>
                      <span className="font-mono tabular-nums font-medium text-slate-900">
                        ${selectedPayslip.earnings.hra.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Special Allowance</span>
                      <span className="font-mono tabular-nums font-medium text-slate-900">
                        ${selectedPayslip.earnings.specialAllowance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Overtime Pay</span>
                      <span className="font-mono tabular-nums font-medium text-slate-900">
                        ${selectedPayslip.earnings.overtimePay.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Performance Bonus</span>
                      <span className="font-mono tabular-nums font-medium text-slate-900">
                        ${selectedPayslip.earnings.bonus.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2 uppercase tracking-wider text-[11px]">
                    Deductions & Taxes
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Provident Fund (PF)</span>
                      <span className="font-mono tabular-nums font-medium text-slate-900">
                        ${selectedPayslip.deductions.pf.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Health Insurance (ESI)</span>
                      <span className="font-mono tabular-nums font-medium text-slate-900">
                        ${selectedPayslip.deductions.healthInsurance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Professional Tax</span>
                      <span className="font-mono tabular-nums font-medium text-slate-900">
                        ${selectedPayslip.deductions.professionalTax.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Income Tax (TDS)</span>
                      <span className="font-mono tabular-nums font-medium text-slate-900">
                        ${selectedPayslip.deductions.tdsTax.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Loss of Pay (Unpaid Leave)</span>
                      <span className="font-mono tabular-nums font-medium text-rose-700">
                        ${selectedPayslip.deductions.lopDeduction.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Totals Banner */}
              <div className="grid grid-cols-2 gap-6 pt-3 border-t-2 border-slate-900 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Gross Earnings</span>
                  <span className="font-mono text-sm">${selectedPayslip.earnings.grossEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-rose-700">
                  <span>Total Deductions</span>
                  <span className="font-mono text-sm">-${selectedPayslip.deductions.totalDeductions.toLocaleString()}</span>
                </div>
              </div>

              {/* Net Pay Callout */}
              <div className="bg-slate-900 text-white p-5 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Net Take-Home Salary
                  </div>
                  <div className="text-xs text-slate-300 italic mt-0.5">
                    {numberToWords(selectedPayslip.netSalary)}
                  </div>
                </div>
                <div className="text-3xl font-bold font-mono text-emerald-400">
                  ${selectedPayslip.netSalary.toLocaleString()}
                </div>
              </div>

              {/* Disburse status details */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <div>
                  <span>Status: </span>
                  <strong className="text-slate-700 uppercase">{selectedPayslip.paymentStatus}</strong>
                  {selectedPayslip.disbursedAt && (
                    <span> · Settled on {new Date(selectedPayslip.disbursedAt).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="font-mono">
                  Ref: {selectedPayslip.transactionRef || 'PENDING-DISBURSE'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
