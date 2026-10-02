import React from 'react';
import { useHR } from '../context/HRContext';
import { DailySignInCard } from './DailySignInCard';
import { 
  Users, 
  CalendarCheck, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Calendar
} from 'lucide-react';

interface DashboardViewProps {
  setCurrentTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setCurrentTab }) => {
  const { 
    currentUser, 
    leaves, 
    attendanceRecords, 
    holidays, 
    employees, 
    todayDateStr,
    payrollRecords
  } = useHR();

  // Pending actions
  const pendingManagerLeaves = leaves.filter((l) => l.status === 'pending_manager');
  const pendingHrLeaves = leaves.filter((l) => l.status === 'manager_approved');

  // Today's roster across all employees
  const todayAttendance = employees.map((emp) => {
    const record = attendanceRecords.find(
      (r) => r.employeeId === emp.id && r.date === todayDateStr
    );
    return {
      employee: emp,
      record
    };
  });

  // Next holiday
  const upcomingHoliday = holidays.find(
    (h) => new Date(h.date) >= new Date(todayDateStr)
  ) || holidays[0];

  // Latest payslip for current user
  const userPayslips = payrollRecords.filter((p) => p.employeeId === currentUser.id);
  const latestPayslip = userPayslips[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-400">
              Welcome back
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Active Shift Day
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Good morning, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {currentUser.designation} in {currentUser.department} department. {currentUser.role === 'hr' ? 'You have administrative control over organization leaves, payroll disbursements, and employee master files.' : currentUser.role === 'manager' ? 'You have managerial approval authority for your team members leave requests and attendance logs.' : 'Track your daily shift hours, submit leave requests, and inspect your monthly payslips.'}
          </p>
        </div>

        {/* Quick action buttons based on role */}
        <div className="flex flex-wrap items-center gap-2">
          {currentUser.role === 'manager' && pendingManagerLeaves.length > 0 && (
            <button
              onClick={() => setCurrentTab('leaves')}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <span>{pendingManagerLeaves.length} Team Leave Approvals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {currentUser.role === 'hr' && pendingHrLeaves.length > 0 && (
            <button
              onClick={() => setCurrentTab('leaves')}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <span>{pendingHrLeaves.length} HR Final Approvals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setCurrentTab('leaves')}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700"
          >
            <span>Leave Balances</span>
          </button>
        </div>
      </div>

      {/* Main Punch Clock Console */}
      <DailySignInCard />

      {/* 2-Column Section: Today's Team Presence & Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Organization Live Presence Board */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Today's Workforce Presence Board
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Live attendance status across company departments for {todayDateStr}.
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('attendance')}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
            >
              <span>Full Timesheet</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {todayAttendance.map(({ employee, record }) => {
              const isEmpClockedIn = !!record?.signInTime && !record?.signOutTime;
              const isEmpOnBreak = record?.status === 'on_break';
              const isEmpCompleted = !!record?.signOutTime;

              return (
                <div key={employee.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={employee.avatar}
                      alt={employee.name}
                      className="w-8 h-8 rounded-md object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        {employee.name}
                        {employee.id === currentUser.id && (
                          <span className="ml-1 text-[10px] text-slate-400 font-normal">
                            (You)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {employee.designation} · {employee.department}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right hidden sm:block">
                      <div className="font-mono text-slate-700">
                        {record?.signInTime
                          ? new Date(record.signInTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Not clocked in'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {record?.location.name || employee.workLocation}
                      </div>
                    </div>

                    <div className="w-28 text-right">
                      {isEmpOnBreak ? (
                        <span className="text-[11px] font-medium text-amber-700">
                          On Break
                        </span>
                      ) : isEmpClockedIn ? (
                        <span className="text-[11px] font-medium text-emerald-700 flex items-center justify-end gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Clocked In
                        </span>
                      ) : isEmpCompleted ? (
                        <span className="text-[11px] text-slate-500 font-medium">
                          Completed
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Pending In
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Highlights (Next Holiday & Compensation) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Upcoming Holiday */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Next Public Holiday
              </span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-3">
              <div className="text-base font-bold text-slate-900">
                {upcomingHoliday.name}
              </div>
              <div className="text-xs font-mono text-slate-500 mt-1">
                {upcomingHoliday.date} · {upcomingHoliday.dayName}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Mandatory paid leave across all US & remote office hubs.
              </p>
            </div>
          </div>

          {/* Latest Compensation Snippet */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Recent Compensation
              </span>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-3">
              <div className="text-xs text-slate-500">
                {latestPayslip?.monthYear || 'September 2026'} Payout
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                ${(latestPayslip?.netSalary || currentUser.salary.baseMonthly).toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1">
                <CheckCircle className="w-3 h-3" />
                <span>Direct Deposit Disbursed</span>
              </div>
              <button
                onClick={() => setCurrentTab('payroll')}
                className="mt-3 w-full py-1.5 text-xs text-center border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
              >
                View Detailed Payslips
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
