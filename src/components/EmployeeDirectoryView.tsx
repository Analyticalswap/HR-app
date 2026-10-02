import React, { useState } from 'react';
import { useHR } from '../context/HRContext';
import { Employee, Department, Role, SalaryStructure } from '../types/hr';
import { 
  Users, 
  Search, 
  UserPlus, 
  Mail, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  CalendarCheck,
  Edit2,
  CheckCircle2,
  Building
} from 'lucide-react';

export const EmployeeDirectoryView: React.FC = () => {
  const { currentUser, employees, addEmployee, updateSalaryStructure } = useHR();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // New employee modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('employee');
  const [newDesignation, setNewDesignation] = useState('');
  const [newDepartment, setNewDepartment] = useState<Department>('Engineering');
  const [newBaseSalary, setNewBaseSalary] = useState<number>(6500);

  // Edit salary modal
  const [editingSalaryEmp, setEditingSalaryEmp] = useState<Employee | null>(null);
  const [editBasic, setEditBasic] = useState<number>(0);
  const [editHRA, setEditHRA] = useState<number>(0);
  const [editSpecial, setEditSpecial] = useState<number>(0);
  const [editTds, setEditTds] = useState<number>(10);

  const departments: Department[] = [
    'Engineering',
    'Product',
    'People & Culture',
    'Finance',
    'Design',
    'Marketing'
  ];

  const filteredEmployees = employees.filter((emp) => {
    if (selectedDept !== 'all' && emp.department !== selectedDept) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchEmail = emp.email.toLowerCase().includes(q);
      const matchTitle = emp.designation.toLowerCase().includes(q);
      const matchId = emp.id.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchTitle && !matchId) return false;
    }
    return true;
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const hra = Math.round(newBaseSalary * 0.3);
    const special = Math.round(newBaseSalary * 0.15);
    const pf = Math.round(newBaseSalary * 0.12);

    addEmployee({
      name: newName,
      email: newEmail,
      role: newRole,
      designation: newDesignation,
      department: newDepartment,
      managerId: 'EMP-1002',
      managerName: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinDate: new Date().toISOString().split('T')[0],
      workLocation: 'Engineering Hub - Austin',
      bankDetails: {
        accountNo: '•••• •••• 9901',
        bankName: 'Silicon Valley Bank',
        routingCode: '121140399'
      },
      taxId: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
      salary: {
        baseMonthly: newBaseSalary,
        hraMonthly: hra,
        specialAllowance: special,
        pfContribution: pf,
        healthInsurance: 200,
        professionalTax: 200,
        tdsTaxRate: 12,
        overtimeHourlyRate: Math.round(newBaseSalary / 160)
      },
      leaveBalances: {
        casual: { allocated: 12, used: 0 },
        sick: { allocated: 10, used: 0 },
        paid: { allocated: 18, used: 0 },
        paternity_maternity: { allocated: 15, used: 0 }
      }
    });

    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    setNewDesignation('');
  };

  const handleOpenEditSalary = (emp: Employee) => {
    setEditingSalaryEmp(emp);
    setEditBasic(emp.salary.baseMonthly);
    setEditHRA(emp.salary.hraMonthly);
    setEditSpecial(emp.salary.specialAllowance);
    setEditTds(emp.salary.tdsTaxRate);
  };

  const handleSaveSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSalaryEmp) return;

    const updatedSalary: SalaryStructure = {
      ...editingSalaryEmp.salary,
      baseMonthly: editBasic,
      hraMonthly: editHRA,
      specialAllowance: editSpecial,
      pfContribution: Math.round(editBasic * 0.12),
      tdsTaxRate: editTds,
      overtimeHourlyRate: Math.round(editBasic / 160)
    };

    updateSalaryStructure(editingSalaryEmp.id, updatedSalary);
    setEditingSalaryEmp(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Employee Directory & Compensation Profiles
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage organization hierarchy, department assignments, and statutory salary configurations.
          </p>
        </div>

        {currentUser.role === 'hr' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard New Employee</span>
          </button>
        )}
      </div>

      {/* Search & Dept Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, title, department, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
        >
          <option value="all">All Departments ({employees.length})</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          return (
            <div
              key={emp.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-2xs"
            >
              <div>
                <div className="flex items-start gap-3">
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {emp.name}
                      </h3>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        {emp.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-0.5">
                      {emp.designation}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {emp.id} · {emp.department}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.workLocation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Manager: {emp.managerName || 'Direct to Board'}</span>
                  </div>
                </div>

                {/* Salary & Leave Quick Summary */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Salary:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      ${emp.salary.baseMonthly.toLocaleString()} / mo
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Leave Balance:</span>
                    <span className="font-mono text-slate-700">
                      {emp.leaveBalances.paid.allocated - emp.leaveBalances.paid.used} PL · {emp.leaveBalances.sick.allocated - emp.leaveBalances.sick.used} SL
                    </span>
                  </div>
                </div>
              </div>

              {currentUser.role === 'hr' && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => handleOpenEditSalary(emp)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    <Edit2 className="w-3 h-3 text-slate-500" />
                    <span>Configure Salary</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Onboard New Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Onboard New Employee
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Smith"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="jordan.smith@aegishr.internal"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value as Department)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">System Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="hr">HR Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Job Designation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. QA Automation Specialist"
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Base Monthly Salary ($ USD)
                </label>
                <input
                  type="number"
                  required
                  min={2000}
                  value={newBaseSalary}
                  onChange={(e) => setNewBaseSalary(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  HRA (30%), PF (12%), Special Allowance (15%) auto-derived.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
                >
                  Create & Issue Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Salary Modal */}
      {editingSalaryEmp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Configure Salary · {editingSalaryEmp.name}
              </h3>
              <button
                onClick={() => setEditingSalaryEmp(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveSalary} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Base Basic Salary ($)</label>
                <input
                  type="number"
                  required
                  value={editBasic}
                  onChange={(e) => setEditBasic(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">House Rent Allowance (HRA $)</label>
                <input
                  type="number"
                  required
                  value={editHRA}
                  onChange={(e) => setEditHRA(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Special Allowance ($)</label>
                <input
                  type="number"
                  required
                  value={editSpecial}
                  onChange={(e) => setEditSpecial(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">TDS Income Tax Rate (%)</label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  required
                  value={editTds}
                  onChange={(e) => setEditTds(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>New Gross Base:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ${(editBasic + editHRA + editSpecial).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>PF Deduction (12%):</span>
                  <span className="font-mono">
                    -${Math.round(editBasic * 0.12).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSalaryEmp(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
                >
                  Save Salary Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
