import React, { useState } from 'react';
import { useHR } from '../context/HRContext';
import { LeaveType, LeaveRequest } from '../types/hr';
import { 
  CalendarCheck, 
  CalendarPlus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Users, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  Calendar,
  CalendarDays
} from 'lucide-react';

export const LeaveManagementView: React.FC = () => {
  const { 
    currentUser, 
    leaves, 
    employees, 
    applyLeave, 
    managerReviewLeave, 
    hrReviewLeave, 
    cancelLeave,
    holidays 
  } = useHR();

  const [activeTab, setActiveTab] = useState<'my_leaves' | 'manager_queue' | 'hr_queue' | 'holidays'>('my_leaves');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [reviewModalData, setReviewModalData] = useState<{
    request: LeaveRequest;
    role: 'manager' | 'hr';
  } | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  // Apply form state
  const [leaveType, setLeaveType] = useState<LeaveType>('paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState<'first_half' | 'second_half'>('first_half');
  const [reason, setReason] = useState('');
  const [applyError, setApplyError] = useState<string | null>(null);

  // Compute calculated days
  const computeDays = () => {
    if (!startDate || !endDate) return 1;
    if (isHalfDay) return 0.5;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError(null);
    const days = computeDays();

    const res = applyLeave({
      leaveType,
      startDate,
      endDate: isHalfDay ? startDate : endDate,
      totalDays: days,
      isHalfDay,
      halfDayPeriod: isHalfDay ? halfDayPeriod : undefined,
      reason
    });

    if (!res.success) {
      setApplyError(res.error || 'Failed to submit leave request');
      return;
    }

    setShowApplyModal(false);
    // Reset form
    setReason('');
    setStartDate('');
    setEndDate('');
    setIsHalfDay(false);
  };

  // Queues
  const myLeaves = leaves.filter((l) => l.employeeId === currentUser.id);

  // Manager queue: requests from employees under this manager, or all engineering if Marcus
  const managerQueue = leaves.filter((l) => {
    if (currentUser.role === 'manager') {
      const applicant = employees.find((e) => e.id === l.employeeId);
      return (
        l.status === 'pending_manager' &&
        (applicant?.managerId === currentUser.id || applicant?.department === currentUser.department)
      );
    }
    return l.status === 'pending_manager';
  });

  // HR queue: leaves approved by managers awaiting final HR authorization
  const hrQueue = leaves.filter((l) => l.status === 'manager_approved');

  const handleReviewAction = (action: 'approved' | 'rejected') => {
    if (!reviewModalData) return;
    if (reviewModalData.role === 'manager') {
      managerReviewLeave(reviewModalData.request.id, action, reviewComment);
    } else {
      hrReviewLeave(reviewModalData.request.id, action, reviewComment);
    }
    setReviewModalData(null);
    setReviewComment('');
  };

  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'hr_approved':
        return (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved & Active</span>
          </div>
        );
      case 'manager_approved':
        return (
          <div className="flex items-center gap-1.5 text-xs text-blue-700 font-medium">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Manager Approved (Awaiting HR)</span>
          </div>
        );
      case 'pending_manager':
        return (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Manager Review</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1.5 text-xs text-rose-700 font-medium">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Rejected</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Cancelled</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Leave Balances Cards (Zero-pill typography) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Leave Quotas & Balances ({currentUser.name})
          </h2>
          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Apply for Leave</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Paid / Annual Leave */}
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-slate-500">Paid / Earned Leave (PL)</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {currentUser.leaveBalances.paid.allocated - currentUser.leaveBalances.paid.used}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {currentUser.leaveBalances.paid.allocated} total
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-2">
              <span>{currentUser.leaveBalances.paid.used} used</span>
              <span>·</span>
              <span>Accrues 1.5 days/mo</span>
            </div>
          </div>

          {/* Casual Leave */}
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-slate-500">Casual Leave (CL)</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {currentUser.leaveBalances.casual.allocated - currentUser.leaveBalances.casual.used}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {currentUser.leaveBalances.casual.allocated} total
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-2">
              <span>{currentUser.leaveBalances.casual.used} used</span>
              <span>·</span>
              <span>Personal downtime</span>
            </div>
          </div>

          {/* Sick Leave */}
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-slate-500">Sick & Medical Leave (SL)</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {currentUser.leaveBalances.sick.allocated - currentUser.leaveBalances.sick.used}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {currentUser.leaveBalances.sick.allocated} total
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-2">
              <span>{currentUser.leaveBalances.sick.used} used</span>
              <span>·</span>
              <span>Doctor note &gt; 2 days</span>
            </div>
          </div>

          {/* Parental Leave */}
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-slate-500">Parental / Family Care</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {currentUser.leaveBalances.paternity_maternity.allocated - currentUser.leaveBalances.paternity_maternity.used}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {currentUser.leaveBalances.paternity_maternity.allocated} total
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-2">
              <span>Fully paid</span>
              <span>·</span>
              <span>Family bonding</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Views */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 px-4 pt-3 gap-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('my_leaves')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'my_leaves'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            My Applications ({myLeaves.length})
          </button>

          {(currentUser.role === 'manager' || currentUser.role === 'hr') && (
            <button
              onClick={() => setActiveTab('manager_queue')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'manager_queue'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Manager Approvals</span>
              {managerQueue.length > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded text-[10px] font-mono">
                  {managerQueue.length}
                </span>
              )}
            </button>
          )}

          {currentUser.role === 'hr' && (
            <button
              onClick={() => setActiveTab('hr_queue')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'hr_queue'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>HR Final Sign-Off</span>
              {hrQueue.length > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[10px] font-mono">
                  {hrQueue.length}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('holidays')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'holidays'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Company Holidays ({holidays.length})
          </button>
        </div>

        {/* Tab 1: My Applications */}
        {activeTab === 'my_leaves' && (
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="py-2.5 px-3">Application ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3 text-right">Days</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Approval Workflow</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No leave applications found. Click "Apply for Leave" above.
                      </td>
                    </tr>
                  ) : (
                    myLeaves.map((lv) => (
                      <tr key={lv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-medium text-slate-900">
                          {lv.id}
                        </td>
                        <td className="py-3 px-3 uppercase font-medium text-slate-700">
                          {lv.leaveType}
                        </td>
                        <td className="py-3 px-3 text-slate-800">
                          <div>
                            {lv.startDate} {lv.startDate !== lv.endDate && `→ ${lv.endDate}`}
                          </div>
                          {lv.isHalfDay && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              Half-day ({lv.halfDayPeriod === 'first_half' ? 'Morning' : 'Afternoon'})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-900 text-right">
                          {lv.totalDays}d
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate">
                          {lv.reason}
                        </td>
                        <td className="py-3 px-3">
                          {getStatusBadge(lv.status)}
                          {/* Notes if any */}
                          {lv.managerReview?.comment && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Manager: "{lv.managerReview.comment}"
                            </div>
                          )}
                          {lv.hrReview?.comment && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              HR: "{lv.hrReview.comment}"
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {lv.status === 'pending_manager' && (
                            <button
                              onClick={() => cancelLeave(lv.id)}
                              className="px-2.5 py-1 text-[11px] border border-slate-200 rounded text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Manager Approval Queue */}
        {activeTab === 'manager_queue' && (
          <div className="p-4">
            <div className="mb-4 p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
              <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Manager Level 1 Authority:</strong> As department lead, review leave dates, team sprint dependencies, and overlap conflicts before endorsing requests to HR.
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="py-2.5 px-3">Applicant</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Dates</th>
                    <th className="py-2.5 px-3 text-right">Duration</th>
                    <th className="py-2.5 px-3">Applicant Reason</th>
                    <th className="py-2.5 px-3">Overlap Check</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {managerQueue.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No pending team leave applications requiring manager review.
                      </td>
                    </tr>
                  ) : (
                    managerQueue.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{req.employeeName}</div>
                          <div className="text-[11px] text-slate-400">
                            {req.employeeId} · {req.department}
                          </div>
                        </td>
                        <td className="py-3 px-3 uppercase font-medium text-slate-700">
                          {req.leaveType}
                        </td>
                        <td className="py-3 px-3 text-slate-800">
                          {req.startDate} → {req.endDate}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-900 text-right">
                          {req.totalDays}d
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-[200px]">
                          {req.reason}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-emerald-700 font-medium">
                            No team sprint clash
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setReviewModalData({ request: req, role: 'manager' })}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium"
                          >
                            Review & Decide
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: HR Final Sign-off Queue */}
        {activeTab === 'hr_queue' && (
          <div className="p-4">
            <div className="mb-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong>HR Level 2 Final Authorization:</strong> Approving leaves here automatically deducts quota balances and synchronizes with the monthly payroll calculation engine.
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="py-2.5 px-3">Applicant</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Dates</th>
                    <th className="py-2.5 px-3 text-right">Duration</th>
                    <th className="py-2.5 px-3">Manager Endorsement</th>
                    <th className="py-2.5 px-3 text-right">Final HR Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hrQueue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No manager-approved leaves currently pending final HR authorization.
                      </td>
                    </tr>
                  ) : (
                    hrQueue.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{req.employeeName}</div>
                          <div className="text-[11px] text-slate-400">
                            {req.employeeId} · {req.department}
                          </div>
                        </td>
                        <td className="py-3 px-3 uppercase font-medium text-slate-700">
                          {req.leaveType}
                        </td>
                        <td className="py-3 px-3 text-slate-800">
                          {req.startDate} → {req.endDate}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-900 text-right">
                          {req.totalDays}d
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-800 font-medium">
                            {req.managerReview?.reviewerName}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            "{req.managerReview?.comment || 'Endorsed'}"
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setReviewModalData({ request: req, role: 'hr' })}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                          >
                            Grant Final Approval
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Holidays */}
        {activeTab === 'holidays' && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {holidays.map((hol) => (
                <div key={hol.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-xs">{hol.name}</span>
                    <span className="font-mono text-[11px] text-slate-500">{hol.date}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{hol.dayName}</span>
                    <span>{hol.isOptional ? 'Floating Holiday' : 'Official Paid Holiday'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarPlus className="w-4 h-4 text-slate-800" />
                <h3 className="text-sm font-bold text-slate-900">
                  Apply for Leave
                </h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {applyError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Leave Category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value="paid">Paid / Privilege Leave (PL)</option>
                  <option value="casual">Casual Leave (CL)</option>
                  <option value="sick">Sick / Medical Leave (SL)</option>
                  <option value="paternity_maternity">Parental Leave</option>
                  <option value="unpaid">Loss of Pay / Unpaid (LOP)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required={!isHalfDay}
                    disabled={isHalfDay}
                    value={isHalfDay ? startDate : endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHalfDay}
                    onChange={(e) => setIsHalfDay(e.target.checked)}
                    className="rounded text-slate-900 focus:ring-0"
                  />
                  <span className="text-slate-700 font-medium">Half-Day Leave</span>
                </label>

                {isHalfDay && (
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="radio"
                        name="halfPeriod"
                        checked={halfDayPeriod === 'first_half'}
                        onChange={() => setHalfDayPeriod('first_half')}
                      />
                      <span>First Half (Morning)</span>
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="radio"
                        name="halfPeriod"
                        checked={halfDayPeriod === 'second_half'}
                        onChange={() => setHalfDayPeriod('second_half')}
                      />
                      <span>Second Half (Afternoon)</span>
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Reason for Leave
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Detail the purpose of leave and delegate any urgent tasks..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg resize-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs text-slate-600">
                <span>Calculated Requested Days:</span>
                <span className="font-mono font-bold text-slate-900">
                  {computeDays()} day(s)
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review & Decision Modal for Manager and HR */}
      {reviewModalData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {reviewModalData.role === 'manager'
                  ? 'Manager Endorsement & Review'
                  : 'HR Final Authorization Decision'}
              </h3>
              <button
                onClick={() => setReviewModalData(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg text-slate-700">
                <div className="font-bold text-slate-900 text-sm">
                  {reviewModalData.request.employeeName}
                </div>
                <div className="text-slate-500">
                  {reviewModalData.request.department} · {reviewModalData.request.employeeId}
                </div>
                <div className="mt-2 text-slate-800">
                  <strong>Dates:</strong> {reviewModalData.request.startDate} to {reviewModalData.request.endDate} ({reviewModalData.request.totalDays} day/s)
                </div>
                <div className="mt-1 text-slate-800">
                  <strong>Type:</strong> <span className="uppercase">{reviewModalData.request.leaveType}</span>
                </div>
                <div className="mt-1 text-slate-600 italic">
                  "{reviewModalData.request.reason}"
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Reviewer Notes / Feedback (Optional)
                </label>
                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="e.g. Approved, deliverables covered by sprint team..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => handleReviewAction('rejected')}
                  className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg font-medium"
                >
                  Reject Request
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewAction('approved')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                >
                  {reviewModalData.role === 'manager' ? 'Endorse & Pass to HR' : 'Grant Final Approval'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
