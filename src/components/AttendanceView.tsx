import React, { useState } from 'react';
import { useHR } from '../context/HRContext';
import { AttendanceRecord } from '../types/hr';
import { 
  CalendarDays, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  FileEdit,
  ArrowUpDown,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const AttendanceView: React.FC = () => {
  const { 
    currentUser, 
    attendanceRecords, 
    employees, 
    regularizeAttendance, 
    reviewRegularization 
  } = useHR();

  const [selectedEmpFilter, setSelectedEmpFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Regularize modal state
  const [regularizeRecord, setRegularizeRecord] = useState<AttendanceRecord | null>(null);
  const [regInTime, setRegInTime] = useState<string>('09:00');
  const [regOutTime, setRegOutTime] = useState<string>('18:00');
  const [regReason, setRegReason] = useState<string>('');

  const isElevated = currentUser.role === 'manager' || currentUser.role === 'hr';

  // Filter records based on role & user selection
  const filteredRecords = attendanceRecords.filter((rec) => {
    // If regular employee, only show their own records
    if (currentUser.role === 'employee' && rec.employeeId !== currentUser.id) {
      return false;
    }

    // If manager, show team + own (or all if filtered)
    if (currentUser.role === 'manager' && selectedEmpFilter !== 'all') {
      if (rec.employeeId !== selectedEmpFilter) return false;
    } else if (currentUser.role === 'hr' && selectedEmpFilter !== 'all') {
      if (rec.employeeId !== selectedEmpFilter) return false;
    }

    if (selectedStatusFilter !== 'all' && rec.status !== selectedStatusFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = rec.employeeName.toLowerCase().includes(q);
      const matchDept = rec.department.toLowerCase().includes(q);
      const matchDate = rec.date.includes(q);
      if (!matchName && !matchDept && !matchDate) return false;
    }

    return true;
  });

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatHours = (seconds: number) => {
    const h = (seconds / 3600).toFixed(1);
    return `${h}h`;
  };

  // Stats
  const relevantRecords = currentUser.role === 'employee' 
    ? attendanceRecords.filter((r) => r.employeeId === currentUser.id)
    : attendanceRecords;

  const totalHoursWorked = relevantRecords.reduce((acc, curr) => acc + curr.workDurationSeconds, 0);
  const avgDailyHours = relevantRecords.length > 0 
    ? (totalHoursWorked / relevantRecords.length / 3600).toFixed(1) 
    : '8.0';
  const onTimeCount = relevantRecords.filter((r) => r.status === 'present').length;
  const punctualityRate = relevantRecords.length > 0 
    ? Math.round((onTimeCount / relevantRecords.length) * 100) 
    : 100;
  const totalOvertimeSec = relevantRecords.reduce((acc, curr) => acc + curr.overtimeSeconds, 0);
  const totalOvertimeHours = (totalOvertimeSec / 3600).toFixed(1);

  const handleOpenRegularize = (rec: AttendanceRecord) => {
    setRegularizeRecord(rec);
    setRegInTime('09:00');
    setRegOutTime('18:00');
    setRegReason('');
  };

  const handleSaveRegularize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regularizeRecord) return;
    const date = regularizeRecord.date;
    const newIn = `${date}T${regInTime}:00Z`;
    const newOut = `${date}T${regOutTime}:00Z`;
    regularizeAttendance(regularizeRecord.id, newIn, newOut, regReason);
    setRegularizeRecord(null);
  };

  const exportCSV = () => {
    const headers = 'RecordID,EmployeeID,Name,Department,Date,SignIn,SignOut,WorkHours,OvertimeHours,Status\n';
    const rows = filteredRecords.map((r) => 
      `${r.id},${r.employeeId},"${r.employeeName}",${r.department},${r.date},"${r.signInTime || ''}","${r.signOutTime || ''}",${(r.workDurationSeconds / 3600).toFixed(2)},${(r.overtimeSeconds / 3600).toFixed(2)},${r.status}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    const rows = filteredRecords.map((r) => ({
      'Record ID': r.id,
      'Employee ID': r.employeeId,
      'Name': r.employeeName,
      'Department': r.department,
      'Date': r.date,
      'Sign In': r.signInTime ? new Date(r.signInTime).toLocaleTimeString() : '',
      'Sign Out': r.signOutTime ? new Date(r.signOutTime).toLocaleTimeString() : '',
      'Work Hours': (r.workDurationSeconds / 3600).toFixed(2),
      'Overtime Hours': (r.overtimeSeconds / 3600).toFixed(2),
      'Location': r.location?.name || 'Office',
      'Status': r.status,
      'Regularized': r.isRegularized ? 'Yes' : 'No'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Timesheet');
    XLSX.writeFile(wb, `AegisHR_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top metric overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">
            {currentUser.role === 'employee' ? 'My Average Shift' : 'Organization Shift Avg'}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {avgDailyHours} hrs
            </span>
            <span className="text-xs text-slate-500">/ day</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Target baseline: 8.0 hrs</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Punctuality Score</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {punctualityRate}%
            </span>
            <span className="text-xs text-emerald-700">· On Time</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Based on 09:30 AM grace cutoff</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Total Logged Overtime</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
              +{totalOvertimeHours} hrs
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Payable in payroll cycle</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Active Records Count</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {relevantRecords.length}
            </span>
            <span className="text-xs text-slate-500">shifts logged</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Biometric & Web Verified</p>
        </div>
      </div>

      {/* Table controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Employee Filter (Manager & HR) */}
            {isElevated && (
              <select
                value={selectedEmpFilter}
                onChange={(e) => setSelectedEmpFilter(e.target.value)}
                className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="all">All Employees</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.id})
                  </option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present (On-Time)</option>
              <option value="late">Late Login</option>
              <option value="on_break">On Break</option>
            </select>
          </div>

          {/* Action buttons: Export CSV & Excel */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export to Excel (.xlsx)</span>
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2.5 px-3">Date</th>
                {isElevated && <th className="py-2.5 px-3">Employee</th>}
                <th className="py-2.5 px-3">First In</th>
                <th className="py-2.5 px-3">Last Out</th>
                <th className="py-2.5 px-3 text-right">Work Hours</th>
                <th className="py-2.5 px-3 text-right">Overtime</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Punctuality</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={isElevated ? 9 : 8} className="py-8 text-center text-slate-400">
                    No attendance records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {rec.date}
                      </td>

                      {isElevated && (
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-900">{rec.employeeName}</div>
                          <div className="text-[11px] text-slate-400">
                            {rec.employeeId} · {rec.department}
                          </div>
                        </td>
                      )}

                      <td className="py-3 px-3 font-mono tabular-nums text-slate-700 whitespace-nowrap">
                        {formatTime(rec.signInTime)}
                      </td>

                      <td className="py-3 px-3 font-mono tabular-nums text-slate-700 whitespace-nowrap">
                        {formatTime(rec.signOutTime)}
                      </td>

                      <td className="py-3 px-3 font-mono tabular-nums font-semibold text-slate-900 text-right whitespace-nowrap">
                        {formatHours(rec.workDurationSeconds)}
                      </td>

                      <td className="py-3 px-3 font-mono tabular-nums text-right whitespace-nowrap">
                        {rec.overtimeSeconds > 0 ? (
                          <span className="text-emerald-700 font-semibold">
                            +{formatHours(rec.overtimeSeconds)}
                          </span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-600 truncate max-w-[150px]">
                        {rec.location?.name || 'Office'}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {rec.status === 'late' ? (
                          <span className="text-amber-800 font-medium">Late Arrival</span>
                        ) : (
                          <span className="text-emerald-800 font-medium">On-Time</span>
                        )}
                        {rec.isRegularized && (
                          <span className="ml-1 text-[10px] text-blue-700 font-mono">
                            (Regularized)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenRegularize(rec)}
                          className="px-2.5 py-1 text-[11px] font-medium border border-slate-200 rounded hover:bg-slate-100 text-slate-700 transition-colors"
                        >
                          Regularize
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regularize Modal */}
      {regularizeRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Attendance Regularization Request
              </h3>
              <button
                onClick={() => setRegularizeRecord(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveRegularize} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg text-slate-600">
                <div className="font-semibold text-slate-900">
                  {regularizeRecord.employeeName} ({regularizeRecord.employeeId})
                </div>
                <div>Date: {regularizeRecord.date}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Corrected In Time
                  </label>
                  <input
                    type="time"
                    required
                    value={regInTime}
                    onChange={(e) => setRegInTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Corrected Out Time
                  </label>
                  <input
                    type="time"
                    required
                    value={regOutTime}
                    onChange={(e) => setRegOutTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Reason for Regularization
                </label>
                <textarea
                  required
                  rows={3}
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  placeholder="e.g. Biometric scanner offline, official client meeting visit outside office..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRegularizeRecord(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium"
                >
                  Submit & Update Timesheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
