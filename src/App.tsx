/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HRProvider } from './context/HRContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AttendanceView } from './components/AttendanceView';
import { LeaveManagementView } from './components/LeaveManagementView';
import { PayrollView } from './components/PayrollView';
import { EmployeeDirectoryView } from './components/EmployeeDirectoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { DataSourceView } from './components/DataSourceView';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView setCurrentTab={setCurrentTab} />;
      case 'attendance':
        return <AttendanceView />;
      case 'leaves':
        return <LeaveManagementView />;
      case 'payroll':
        return <PayrollView />;
      case 'employees':
        return <EmployeeDirectoryView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'datasource':
        return <DataSourceView />;
      default:
        return <DashboardView setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header currentTab={currentTab} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HRProvider>
      <AppContent />
    </HRProvider>
  );
}
