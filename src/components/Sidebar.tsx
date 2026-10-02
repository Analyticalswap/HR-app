import React from 'react';
import { useHR } from '../context/HRContext';
import { 
  Clock, 
  CalendarDays, 
  DollarSign, 
  Users, 
  BarChart3, 
  LayoutDashboard,
  CheckCircle2,
  CalendarCheck,
  Database
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, leaves, payrollRecords } = useHR();

  // Calculate pending counts based on role
  const pendingManagerLeaves = leaves.filter(
    (l) => l.status === 'pending_manager'
  ).length;

  const pendingHrLeaves = leaves.filter(
    (l) => l.status === 'manager_approved'
  ).length;

  const pendingPayrollDisbursements = payrollRecords.filter(
    (p) => p.paymentStatus === 'processed'
  ).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Sign-In & Today',
      icon: Clock,
      badge: null
    },
    {
      id: 'attendance',
      label: 'Timesheet & Logs',
      icon: CalendarDays,
      badge: null
    },
    {
      id: 'leaves',
      label: 'Leaves & Approvals',
      icon: CalendarCheck,
      badge: 
        currentUser.role === 'manager' && pendingManagerLeaves > 0
          ? `${pendingManagerLeaves} action`
          : currentUser.role === 'hr' && pendingHrLeaves > 0
          ? `${pendingHrLeaves} final`
          : null
    },
    {
      id: 'payroll',
      label: 'Payroll & Payslips',
      icon: DollarSign,
      badge:
        currentUser.role === 'hr' && pendingPayrollDisbursements > 0
          ? `${pendingPayrollDisbursements} to disburse`
          : null
    },
    {
      id: 'employees',
      label: 'Directory & Profiles',
      icon: Users,
      badge: null
    },
    {
      id: 'analytics',
      label: 'HR Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'datasource',
      label: 'Data Source & Backup',
      icon: Database,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 min-h-screen">
      {/* Brand Zone */}
      <div className="h-16 px-6 flex items-center border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-base shadow-sm">
            A
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            AegisHR
          </span>
        </div>
      </div>

      {/* Role Context Bar */}
      <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Current Scope</span>
          <span className="text-slate-300 font-mono text-[11px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-800">
            {currentUser.role}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 truncate">
          {currentUser.role === 'hr'
            ? 'Full Organization Administration'
            : currentUser.role === 'manager'
            ? 'Team Oversight & Level 1 Approvals'
            : 'Personal Attendance & Self-Service'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Organization quick status */}
      <div className="p-4 m-3 rounded-lg bg-slate-800/60 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium mb-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active Shift Cycle</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Standard hours: 09:00 - 18:00 EST. Core overlap: 10:00 - 16:00.
        </p>
      </div>

      {/* User profile footer */}
      <div className="p-4 border-t border-slate-800 flex items-center gap-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-9 h-9 rounded-md object-cover border border-slate-700"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {currentUser.name}
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            {currentUser.id} · {currentUser.department}
          </p>
        </div>
      </div>
    </aside>
  );
};
