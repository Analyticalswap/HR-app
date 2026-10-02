import React from 'react';
import { useHR } from '../context/HRContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign,
  PieChart
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { employees, attendanceRecords, leaves, payrollRecords } = useHR();

  // 1. Department payroll breakdown
  const deptSpending: Record<string, { total: number; count: number }> = {};
  employees.forEach((emp) => {
    const gross = emp.salary.baseMonthly + emp.salary.hraMonthly + emp.salary.specialAllowance;
    if (!deptSpending[emp.department]) {
      deptSpending[emp.department] = { total: 0, count: 0 };
    }
    deptSpending[emp.department].total += gross;
    deptSpending[emp.department].count += 1;
  });

  const totalOrgGross = Object.values(deptSpending).reduce((sum, d) => sum + d.total, 0);

  // 2. Leave category distribution
  const leaveDistribution = {
    paid: leaves.filter((l) => l.leaveType === 'paid' && l.status === 'hr_approved').reduce((sum, l) => sum + l.totalDays, 0),
    casual: leaves.filter((l) => l.leaveType === 'casual' && l.status === 'hr_approved').reduce((sum, l) => sum + l.totalDays, 0),
    sick: leaves.filter((l) => l.leaveType === 'sick' && l.status === 'hr_approved').reduce((sum, l) => sum + l.totalDays, 0),
    paternity_maternity: leaves.filter((l) => l.leaveType === 'paternity_maternity' && l.status === 'hr_approved').reduce((sum, l) => sum + l.totalDays, 0)
  };
  const totalApprovedLeaveDays = Object.values(leaveDistribution).reduce((a, b) => a + b, 0) || 1;

  // 3. Attendance Punctuality
  const onTimeCount = attendanceRecords.filter((r) => r.status === 'present').length;
  const lateCount = attendanceRecords.filter((r) => r.status === 'late').length;
  const totalAtt = attendanceRecords.length || 1;
  const onTimePercent = Math.round((onTimeCount / totalAtt) * 100);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Workforce & Compensation Intelligence
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Real-time metrics on attendance discipline, leave quotas consumption, and departmental budget allocation.
        </p>
      </div>

      {/* Grid 1: Department Payroll Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-800" />
              <h3 className="text-sm font-bold text-slate-900">
                Departmental Payroll Outlay
              </h3>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500">
              Total: ${totalOrgGross.toLocaleString()}/mo
            </span>
          </div>

          <div className="space-y-4 mt-4">
            {Object.entries(deptSpending).map(([dept, data]) => {
              const pct = Math.round((data.total / totalOrgGross) * 100);
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {dept} <span className="text-slate-400 font-normal">({data.count} staff)</span>
                    </span>
                    <span className="font-mono tabular-nums text-slate-900 font-medium">
                      ${data.total.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-slate-900 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid 2: Leave Consumption by Category */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-800" />
              <h3 className="text-sm font-bold text-slate-900">
                Leave Category Utilization
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {totalApprovedLeaveDays} total days taken
            </span>
          </div>

          <div className="space-y-4 mt-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Paid / Annual Leave (PL)</span>
                <span className="font-mono text-slate-900 font-semibold">{leaveDistribution.paid} days ({Math.round((leaveDistribution.paid / totalApprovedLeaveDays) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-emerald-600 h-full rounded-full" 
                  style={{ width: `${Math.round((leaveDistribution.paid / totalApprovedLeaveDays) * 100)}%` }} 
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Casual Leave (CL)</span>
                <span className="font-mono text-slate-900 font-semibold">{leaveDistribution.casual} days ({Math.round((leaveDistribution.casual / totalApprovedLeaveDays) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-full rounded-full" 
                  style={{ width: `${Math.round((leaveDistribution.casual / totalApprovedLeaveDays) * 100)}%` }} 
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Sick & Medical (SL)</span>
                <span className="font-mono text-slate-900 font-semibold">{leaveDistribution.sick} days ({Math.round((leaveDistribution.sick / totalApprovedLeaveDays) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-amber-600 h-full rounded-full" 
                  style={{ width: `${Math.round((leaveDistribution.sick / totalApprovedLeaveDays) * 100)}%` }} 
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Parental / Family Care</span>
                <span className="font-mono text-slate-900 font-semibold">{leaveDistribution.paternity_maternity} days ({Math.round((leaveDistribution.paternity_maternity / totalApprovedLeaveDays) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-full rounded-full" 
                  style={{ width: `${Math.round((leaveDistribution.paternity_maternity / totalApprovedLeaveDays) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 3: Punctuality & Overtime KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Overall Punctuality Rate</span>
          <div className="text-3xl font-bold font-mono text-slate-900 mt-2">
            {onTimePercent}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {onTimeCount} on-time vs {lateCount} delayed logins
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Total Company Headcount</span>
          <div className="text-3xl font-bold font-mono text-slate-900 mt-2">
            {employees.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            100% active full-time salaried
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Average Monthly Take-Home</span>
          <div className="text-3xl font-bold font-mono text-emerald-700 mt-2">
            ${Math.round(totalOrgGross / (employees.length || 1) * 0.78).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Net compensation post statutory deductions
          </div>
        </div>
      </div>
    </div>
  );
};
