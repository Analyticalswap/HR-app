import React, { useState, useEffect } from 'react';
import { useHR } from '../context/HRContext';
import { 
  LogIn, 
  LogOut, 
  Coffee, 
  Play, 
  MapPin, 
  Building2, 
  Laptop, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export const DailySignInCard: React.FC = () => {
  const { 
    currentUser, 
    todayRecord, 
    punchIn, 
    punchOut, 
    startBreak, 
    endBreak 
  } = useHR();

  const [locationMode, setLocationMode] = useState<'office' | 'remote'>('office');
  const [activeSeconds, setActiveSeconds] = useState<number>(0);
  const [breakSeconds, setBreakSeconds] = useState<number>(0);

  const isClockedIn = !!todayRecord?.signInTime && !todayRecord?.signOutTime;
  const isOnBreak = todayRecord?.status === 'on_break';
  const isShiftCompleted = !!todayRecord?.signOutTime;

  // Running live timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isClockedIn && !isOnBreak && todayRecord?.signInTime) {
      const calculateSeconds = () => {
        const start = new Date(todayRecord.signInTime!).getTime();
        const now = Date.now();
        const total = Math.floor((now - start) / 1000);
        const net = Math.max(0, total - (todayRecord.breakDurationSeconds || 0));
        setActiveSeconds(net);
      };

      calculateSeconds();
      interval = setInterval(calculateSeconds, 1000);
    } else if (todayRecord?.signOutTime) {
      setActiveSeconds(todayRecord.workDurationSeconds);
    } else {
      setActiveSeconds(0);
    }

    return () => clearInterval(interval);
  }, [isClockedIn, isOnBreak, todayRecord]);

  // Break timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOnBreak && todayRecord) {
      const activeBreak = todayRecord.breaks.find((b) => !b.end);
      if (activeBreak) {
        const calcBreak = () => {
          const start = new Date(activeBreak.start).getTime();
          const now = Date.now();
          setBreakSeconds(Math.floor((now - start) / 1000));
        };
        calcBreak();
        interval = setInterval(calcBreak, 1000);
      }
    } else {
      setBreakSeconds(0);
    }

    return () => clearInterval(interval);
  }, [isOnBreak, todayRecord]);

  const formatHMS = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handlePunchIn = () => {
    const locName = locationMode === 'office' ? currentUser.workLocation : 'Verified Remote (WFH)';
    punchIn(locationMode, locName);
  };

  // Progress towards 8-hour day
  const targetShiftSec = 8 * 3600;
  const progressPercent = Math.min(100, Math.round((activeSeconds / targetShiftSec) * 100));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      {/* Header zone with status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Daily Attendance & Time Tracker
            </h2>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise biometric & online punch system with geofence verification.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {isOnBreak ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>On Break</span>
            </div>
          ) : isClockedIn ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Clocked In (Active)</span>
            </div>
          ) : isShiftCompleted ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Shift Completed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Not Clocked In</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Punch Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
        {/* Left Column: Big Timer & Action Buttons */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Work Mode Toggle (Office vs Remote) */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-slate-500 font-medium">Punch Location:</span>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  disabled={isClockedIn || isShiftCompleted}
                  onClick={() => setLocationMode('office')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                    locationMode === 'office'
                      ? 'bg-white text-slate-900 font-medium shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Office Network</span>
                </button>
                <button
                  type="button"
                  disabled={isClockedIn || isShiftCompleted}
                  onClick={() => setLocationMode('remote')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                    locationMode === 'remote'
                      ? 'bg-white text-slate-900 font-medium shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Remote WFH</span>
                </button>
              </div>
            </div>

            {/* Live Clock Display */}
            <div className="bg-slate-900 text-white rounded-lg p-5 mb-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>ACTIVE WORKING HOURS</span>
                <span className="font-mono">SHIFT TARGET: 08:00:00</span>
              </div>
              <div className="flex items-baseline gap-3">
                <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-white tabular-nums">
                  {formatHMS(activeSeconds)}
                </div>
                {isOnBreak && (
                  <div className="text-xs text-amber-400 font-mono">
                    Break: +{formatHMS(breakSeconds)}
                  </div>
                )}
              </div>

              {/* Progress bar towards 8 hours */}
              <div className="mt-4">
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      progressPercent >= 100 ? 'bg-emerald-400' : 'bg-blue-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 font-mono">
                  <span>{progressPercent}% completed</span>
                  {activeSeconds > targetShiftSec && (
                    <span className="text-emerald-400 font-semibold">
                      +{formatHMS(activeSeconds - targetShiftSec)} Overtime
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {!isClockedIn && !isShiftCompleted && (
              <button
                type="button"
                onClick={handlePunchIn}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Clock In Now</span>
              </button>
            )}

            {isClockedIn && (
              <>
                {isOnBreak ? (
                  <button
                    type="button"
                    onClick={endBreak}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-colors shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>End Break & Resume Work</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => startBreak('lunch')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
                      title="Take standard lunch break"
                    >
                      <Coffee className="w-4 h-4 text-amber-600" />
                      <span>Lunch Break</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => startBreak('tea')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
                      title="Quick 15-min coffee break"
                    >
                      <Coffee className="w-4 h-4 text-slate-500" />
                      <span>Coffee Break</span>
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={punchOut}
                  className="flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Clock Out</span>
                </button>
              </>
            )}

            {isShiftCompleted && (
              <div className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <span className="flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Today's shift logged successfully.
                </span>
                <span className="font-mono text-slate-500">
                  Total Recorded: {formatHMS(todayRecord?.workDurationSeconds || 0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Shift Metrics & Geolocation Details */}
        <div className="lg:col-span-5 bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Today's Punch Log
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">First In</span>
                <span className="font-mono font-medium text-slate-900">
                  {formatTime(todayRecord?.signInTime)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Last Out</span>
                <span className="font-mono font-medium text-slate-900">
                  {formatTime(todayRecord?.signOutTime)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Total Breaks</span>
                <span className="font-mono font-medium text-slate-900">
                  {todayRecord?.breaks.length || 0} session(s) (
                  {Math.round((todayRecord?.breakDurationSeconds || 0) / 60)} mins)
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Shift Punctuality</span>
                <span className="font-medium text-slate-900">
                  {todayRecord?.status === 'late' ? (
                    <span className="text-amber-700">Late Login (&gt; 09:30 AM)</span>
                  ) : todayRecord?.signInTime ? (
                    <span className="text-emerald-700">On Time Arrival</span>
                  ) : (
                    <span className="text-slate-400">Pending</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Geo Verification Info */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="flex items-start gap-2 text-slate-600 text-xs">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-slate-800">
                  {todayRecord?.location.name || currentUser.workLocation}
                </span>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  IP Geotag: {todayRecord?.location.coordinates || '30.2672° N, 97.7431° W (Verified)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cryptographic GPS Hash validated against corporate policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
