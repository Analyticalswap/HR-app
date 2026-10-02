import React, { useState } from 'react';
import { useHR } from '../context/HRContext';
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  FileJson, 
  FileSpreadsheet,
  Table,
  ShieldCheck,
  HardDrive,
  FileDown,
  ArrowRight
} from 'lucide-react';
import { 
  exportMasterExcelWorkbook, 
  downloadEmployeeTemplateExcel, 
  downloadAttendanceTemplateExcel, 
  parseExcelFile,
  ExcelImportResult
} from '../utils/excelService';

export const DataSourceView: React.FC = () => {
  const { 
    employees, 
    attendanceRecords, 
    leaves, 
    payrollRecords, 
    holidays,
    exportAllData, 
    importAllData, 
    importExcelData,
    resetToDefaultData 
  } = useHR();

  const [activeTab, setActiveTab] = useState<'excel' | 'json_backup' | 'schema_inspector'>('excel');
  const [activeCollection, setActiveCollection] = useState<'employees' | 'attendance' | 'leaves' | 'payroll' | 'holidays'>('employees');
  const [importJsonText, setImportJsonText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [excelImportPreview, setExcelImportPreview] = useState<ExcelImportResult | null>(null);
  const [isParsingExcel, setIsParsingExcel] = useState(false);

  const collections = [
    { id: 'employees', label: 'Employees Master', count: employees.length, size: `${(JSON.stringify(employees).length / 1024).toFixed(1)} KB` },
    { id: 'attendance', label: 'Attendance Records', count: attendanceRecords.length, size: `${(JSON.stringify(attendanceRecords).length / 1024).toFixed(1)} KB` },
    { id: 'leaves', label: 'Leave Requests', count: leaves.length, size: `${(JSON.stringify(leaves).length / 1024).toFixed(1)} KB` },
    { id: 'payroll', label: 'Payroll Ledger', count: payrollRecords.length, size: `${(JSON.stringify(payrollRecords).length / 1024).toFixed(1)} KB` },
    { id: 'holidays', label: 'Public Holidays', count: holidays.length, size: `${(JSON.stringify(holidays).length / 1024).toFixed(1)} KB` }
  ];

  // 1. Export Master Excel Workbook
  const handleExportExcel = () => {
    try {
      exportMasterExcelWorkbook(employees, attendanceRecords, leaves, payrollRecords, holidays);
      setStatusMessage({ 
        type: 'success', 
        text: 'Multi-sheet Excel workbook (AegisHR_Enterprise_Master.xlsx) generated and downloaded.' 
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Failed to generate Excel file: ${err.message}` });
    }
  };

  // 2. Export JSON backup
  const handleExportJSON = () => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegishr_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setStatusMessage({ type: 'success', text: 'Full database JSON snapshot exported successfully.' });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // 3. Handle Excel File Upload & Parse
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingExcel(true);
    setExcelImportPreview(null);
    try {
      const result = await parseExcelFile(file);
      setIsParsingExcel(false);
      if (result.success) {
        setExcelImportPreview(result);
        setStatusMessage({ type: 'success', text: result.message });
      } else {
        setStatusMessage({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      setIsParsingExcel(false);
      setStatusMessage({ type: 'error', text: err.message || 'Error processing Excel file.' });
    }
  };

  // Confirm Excel Data Application
  const handleApplyExcelData = () => {
    if (!excelImportPreview?.data) return;

    importExcelData(excelImportPreview.data);
    setStatusMessage({
      type: 'success',
      text: `Database successfully updated! Synchronized ${(excelImportPreview.counts.employees || 0)} employee(s) and ${(excelImportPreview.counts.attendance || 0)} attendance record(s).`
    });
    setExcelImportPreview(null);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // JSON File upload
  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importAllData(content);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Data source successfully restored from uploaded JSON file.' });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to parse JSON file.' });
      }
      setTimeout(() => setStatusMessage(null), 5000);
    };
    reader.readAsText(file);
  };

  const handleManualJsonImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;

    const res = importAllData(importJsonText);
    if (res.success) {
      setStatusMessage({ type: 'success', text: 'Database successfully updated from pasted JSON.' });
      setImportJsonText('');
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Invalid JSON format.' });
    }
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data back to original factory defaults? Any new clock-ins, leave applications or payroll runs will be replaced with initial demo seed.')) {
      resetToDefaultData();
      setExcelImportPreview(null);
      setStatusMessage({ type: 'success', text: 'Database reset to default seed records.' });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const getActiveCollectionData = () => {
    switch (activeCollection) {
      case 'employees': return employees;
      case 'attendance': return attendanceRecords;
      case 'leaves': return leaves;
      case 'payroll': return payrollRecords;
      case 'holidays': return holidays;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-slate-800" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Data Source & Excel Integration Hub
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Seamlessly connect your HR system with Microsoft Excel, Google Sheets, or CSV exports. Export complete multi-sheet workbooks, download ready-made templates, or import bulk rosters and punch logs.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            title="Download multi-sheet workbook (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Seed</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-lg border text-xs flex items-center gap-2.5 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('excel')}
          className={`pb-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'excel'
              ? 'border-emerald-600 text-emerald-800 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Excel Sync & Templates (.xlsx)</span>
        </button>

        <button
          onClick={() => setActiveTab('json_backup')}
          className={`pb-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'json_backup'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4 text-slate-700" />
          <span>JSON Database Backup</span>
        </button>

        <button
          onClick={() => setActiveTab('schema_inspector')}
          className={`pb-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'schema_inspector'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileJson className="w-4 h-4 text-slate-700" />
          <span>Live Schema Inspector</span>
        </button>
      </div>

      {/* TAB 1: EXCEL INTEGRATION & TEMPLATES */}
      {activeTab === 'excel' && (
        <div className="space-y-6">
          {/* 3 Step Flow Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Box 1: Download Templates */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                  <FileDown className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  1. Download Excel Templates
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Pre-structured templates with valid column headers and formulas for bulk imports.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={downloadEmployeeTemplateExcel}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 transition-colors text-left"
                >
                  <span className="truncate">Employee Roster Template</span>
                  <Download className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-2" />
                </button>

                <button
                  onClick={downloadAttendanceTemplateExcel}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 transition-colors text-left"
                >
                  <span className="truncate">Biometric Punch Template</span>
                  <Download className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-2" />
                </button>
              </div>
            </div>

            {/* Box 2: Upload Excel File */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  2. Upload Excel (.xlsx, .xls, .csv)
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Drop an Excel sheet exported from your biometric attendance machine or payroll spreadsheet.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-lg p-4 text-center transition-colors">
                    <Table className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                    <span className="text-xs font-medium text-slate-700 block">
                      {isParsingExcel ? 'Parsing workbook...' : 'Choose Excel File'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Supports .xlsx, .xls, .csv
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    disabled={isParsingExcel}
                    onChange={handleExcelUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Box 3: Export Complete Master */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  3. Export Master Excel Workbook
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Generates an integrated 5-sheet workbook containing Employees, Timesheets, Leaves, and Payroll.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleExportExcel}
                  className="w-full flex items-center justify-center gap-2 p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Master Workbook</span>
                </button>
              </div>
            </div>
          </div>

          {/* Excel Import Preview Modal / Confirmation Panel */}
          {excelImportPreview && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-6 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950">
                      Excel Workbook Validated & Ready to Sync
                    </h3>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      {excelImportPreview.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExcelImportPreview(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-white rounded-lg border border-slate-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyExcelData}
                    className="px-4 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <span>Confirm & Update System</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Preview Rows Table */}
              {excelImportPreview.data?.employees && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-emerald-950">
                    Previewing {excelImportPreview.data.employees.length} Employee(s):
                  </div>
                  <div className="overflow-x-auto bg-white rounded-lg border border-emerald-200 text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                        <tr>
                          <th className="p-2">ID</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Department</th>
                          <th className="p-2">Designation</th>
                          <th className="p-2 text-right">Base Salary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {excelImportPreview.data.employees.slice(0, 5).map((e) => (
                          <tr key={e.id}>
                            <td className="p-2 font-mono">{e.id}</td>
                            <td className="p-2 font-semibold text-slate-900">{e.name}</td>
                            <td className="p-2 text-slate-600">{e.email}</td>
                            <td className="p-2 text-slate-600">{e.department}</td>
                            <td className="p-2 text-slate-600">{e.designation}</td>
                            <td className="p-2 font-mono text-right">${e.salary.baseMonthly.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: JSON BACKUP & RESTORE */}
      {activeTab === 'json_backup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Export */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Complete JSON Snapshot Export
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export all 5 core application collections in a single JSON file. This snapshot can be safely archived, transferred to other environments, or used for cold backups.
            </p>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Right: Import / Restore */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Restore from JSON File or Paste
            </h3>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Upload Backup File:
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleJsonFileUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
              />
            </div>

            <form onSubmit={handleManualJsonImport} className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-medium text-slate-700">
                Or Paste Raw JSON:
              </label>
              <textarea
                rows={4}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{ "collections": { "employees": [...], "attendanceRecords": [...] } }'
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] resize-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Validate & Restore JSON
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: SCHEMA & RAW DATA INSPECTOR */}
      {activeTab === 'schema_inspector' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileJson className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Live Data Inspector
              </h3>
            </div>

            <div className="flex flex-wrap gap-1">
              {collections.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCollection(c.id as any)}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                    activeCollection === c.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {c.label} ({c.count})
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto max-h-96">
            <pre>{JSON.stringify(getActiveCollectionData(), null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
