import React, { useState, useEffect } from 'react';
import { useHR } from '../context/HRContext';
import { UserCheck, ShieldCheck, Briefcase, ChevronDown, Check } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
}

export const Header: React.FC<HeaderProps> = ({ currentTab }) => {
  const { currentUser, switchUser, employees } = useHR();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'hr':
        return { label: 'HR Administrator', icon: ShieldCheck, color: 'text-amber-700 bg-amber-50' };
      case 'manager':
        return { label: 'People Manager', icon: Briefcase, color: 'text-blue-700 bg-blue-50' };
      default:
        return { label: 'Employee', icon: UserCheck, color: 'text-emerald-700 bg-emerald-50' };
    }
  };

  const roleMeta = getRoleBadge(currentUser.role);
  const RoleIcon = roleMeta.icon;

  const tabLabels: Record<string, string> = {
    dashboard: 'Daily Overview & Clock-In',
    attendance: 'Attendance & Timesheets',
    leaves: 'Leave Management & Approvals',
    payroll: 'Payroll & Compensation',
    employees: 'Employee Directory',
    analytics: 'Workforce Analytics',
    datasource: 'Data Source & Storage Management'
  };

  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30">
      {/* Zone 1 & 2: Breadcrumbs & Page Title */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-400">Workspace</span>
        <span className="text-slate-300">/</span>
        <h1 className="text-base font-semibold text-slate-900 tracking-tight">
          {tabLabels[currentTab] || 'Dashboard'}
        </h1>
      </div>

      {/* Zone 3: Live Clock & Interactive Role Switcher */}
      <div className="flex items-center gap-4">
        {/* Live system clock with tabular numerals */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 font-mono tabular-nums">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{currentTime || '09:00:00 AM'}</span>
          <span className="text-slate-400">EST</span>
        </div>

        {/* Role Switcher Popover */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
            title="Switch User View (Employee / Manager / HR)"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-md object-cover bg-slate-100 border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <RoleIcon className="w-3 h-3 text-slate-400" />
                <span className="capitalize">{currentUser.role} View</span>
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showRoleMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowRoleMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Switch Test Persona & Role
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Test employee punch-in, manager approvals, or HR payroll.
                  </p>
                </div>

                <div className="py-1">
                  {employees.map((emp) => {
                    const isSelected = emp.id === currentUser.id;
                    return (
                      <button
                        key={emp.id}
                        onClick={() => {
                          switchUser(emp.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center gap-3 transition-colors ${
                          isSelected ? 'bg-slate-50 font-medium' : 'hover:bg-slate-50'
                        }`}
                      >
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-7 h-7 rounded object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {emp.name}
                            </span>
                            <span className="text-[10px] uppercase font-semibold text-slate-500 px-1 py-0.5 bg-slate-100 rounded">
                              {emp.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {emp.designation} · {emp.department}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="px-3 py-2 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500">
                  <span>Current: <strong>{currentUser.name}</strong> ({currentUser.id})</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
