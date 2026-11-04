import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { AttendanceRecord, DepartmentMember, ChurchLocationConfig, ServiceType } from '../../types/models';
import { formatDate } from '../../utils/dateUtils';
import { exportToCSV } from '../../utils/exportUtils';
import { PrintModal } from '../common/PrintModal';
import { ShareModal } from '../common/ShareModal';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Search,
  Printer,
  Share2,
  Download,
  Calendar,
  ShieldCheck,
  Compass,
  Sparkles,
  RefreshCw,
  UserCheck,
  UserX,
  Radio,
  SlidersHorizontal,
  Info,
  Lock,
  Unlock,
  FileText,
  Phone,
  Briefcase,
  Cake,
  Check,
  LogOut,
  Navigation,
  Crosshair,
  Building,
  BookOpen,
  ArrowRight,
  Settings,
} from 'lucide-react';

// Haversine formula to calculate distance in meters between two lat/lng coordinates
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const AttendanceModule: React.FC = () => {
  const { currentUser, canManageMembers, canManageAttendance, isHOD, isOperations, isSecretary } =
    useAuth();
  const {
    members,
    attendance,
    addAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    clockOutAttendanceRecord,
    churchLocationConfig,
    updateChurchLocationConfig,
  } = useData();

  const isAuthorizedManager =
    canManageAttendance || canManageMembers || isHOD || isOperations || isSecretary;

  // -------------------------------------------------------------
  // SUNDAY SERVICE DATE SELECTION
  // -------------------------------------------------------------
  const availableServiceDates = useMemo(() => {
    const dates = Array.from(new Set(attendance.map((a) => a.serviceDate)));
    const todayStr = new Date().toISOString().split('T')[0];
    if (!dates.includes(todayStr)) {
      dates.push(todayStr);
    }
    return dates.sort().reverse();
  }, [attendance]);

  const [selectedDate, setSelectedDate] = useState<string>(
    availableServiceDates[0] || new Date().toISOString().split('T')[0]
  );

  // Service Day Filter (Sunday vs Tuesday)
  const [serviceDayFilter, setServiceDayFilter] = useState<'all' | 'Sunday' | 'Tuesday'>('all');

  const filteredServiceDates = useMemo(() => {
    return availableServiceDates.filter((dateStr) => {
      if (serviceDayFilter === 'all') return true;
      const d = new Date(dateStr);
      const day = d.getDay();
      if (serviceDayFilter === 'Sunday') {
        return day === 0 || attendance.some((a) => a.serviceDate === dateStr && a.serviceType?.startsWith('Sunday'));
      }
      if (serviceDayFilter === 'Tuesday') {
        return day === 2 || attendance.some((a) => a.serviceDate === dateStr && a.serviceType?.startsWith('Tuesday'));
      }
      return true;
    });
  }, [availableServiceDates, serviceDayFilter, attendance]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [stationFilter, setStationFilter] = useState<'all' | 'Desk A' | 'Desk B' | 'Bookstand' | 'Present' | 'Absent'>('all');

  // Modals state
  const [selectedMemberForClockIn, setSelectedMemberForClockIn] = useState<DepartmentMember | null>(null);
  const [clockInStation, setClockInStation] = useState<'Desk A' | 'Desk B' | 'Bookstand'>('Desk A');
  const [clockInServiceDay, setClockInServiceDay] = useState<'Sunday' | 'Tuesday'>('Sunday');
  const [clockInServiceType, setClockInServiceType] = useState<ServiceType>('Sunday 1st Service');
  const [clockInDate, setClockInDate] = useState<string>(selectedDate);
  const [isClockInModalOpen, setIsClockInModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Geolocation state for Clock-In modal
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDistance, setLocationDistance] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'checking' | 'allowed' | 'denied' | 'error'>('idle');
  const [locationErrorMessage, setLocationErrorMessage] = useState<string>('');
  const [isAdminOverrideChecked, setIsAdminOverrideChecked] = useState(false);
  const [adminOverrideReason, setAdminOverrideReason] = useState('');

  // Admin Geofence Settings Modal
  const [isGeofenceModalOpen, setIsGeofenceModalOpen] = useState(false);
  const [configName, setConfigName] = useState(churchLocationConfig.name);
  const [configAddress, setConfigAddress] = useState(churchLocationConfig.address);
  const [configLatitude, setConfigLatitude] = useState(String(churchLocationConfig.latitude));
  const [configLongitude, setConfigLongitude] = useState(String(churchLocationConfig.longitude));
  const [configRadius, setConfigRadius] = useState(String(churchLocationConfig.allowedRadiusMeters));

  // Print sheet state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // -------------------------------------------------------------
  // ATTENDANCE RECORDS FOR SELECTED SUNDAY
  // -------------------------------------------------------------
  const dateAttendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendance
      .filter((a) => a.serviceDate === selectedDate)
      .forEach((a) => {
        if (a.memberId) {
          map.set(a.memberId, a);
        } else {
          // Fallback matching by member name
          const matched = members.find(
            (m) => m.fullName.toLowerCase() === a.memberName.toLowerCase()
          );
          if (matched) map.set(matched.id, a);
        }
      });
    return map;
  }, [attendance, selectedDate, members]);

  // Statistics
  const totalDepartmentMembers = members.length;
  const presentRecords = useMemo(() => {
    return Array.from(dateAttendanceMap.values()).filter(
      (a) => a.status === 'Present' || a.status === 'Clocked Out'
    );
  }, [dateAttendanceMap]);

  const presentCount = presentRecords.length;
  const absentCount = Math.max(0, totalDepartmentMembers - presentCount);
  const attendanceRate =
    totalDepartmentMembers > 0 ? Math.round((presentCount / totalDepartmentMembers) * 100) : 0;

  const deskACount = useMemo(() => {
    return presentRecords.filter((a) => a.servingStation === 'Desk A').length;
  }, [presentRecords]);

  const deskBCount = useMemo(() => {
    return presentRecords.filter((a) => a.servingStation === 'Desk B').length;
  }, [presentRecords]);

  // Supports multiple bookstand attendants
  const bookstandCount = useMemo(() => {
    return presentRecords.filter((a) => a.servingStation === 'Bookstand').length;
  }, [presentRecords]);

  // Filtered members list for the grid
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const attRecord = dateAttendanceMap.get(member.id);
      const isPresent = attRecord && (attRecord.status === 'Present' || attRecord.status === 'Clocked Out');
      const station = attRecord?.servingStation;

      // Filter by station/status
      let matchesFilter = true;
      if (stationFilter === 'Present') matchesFilter = !!isPresent;
      else if (stationFilter === 'Absent') matchesFilter = !isPresent;
      else if (stationFilter === 'Desk A') matchesFilter = station === 'Desk A';
      else if (stationFilter === 'Desk B') matchesFilter = station === 'Desk B';
      else if (stationFilter === 'Bookstand') matchesFilter = station === 'Bookstand';

      // Search query
      const matchesSearch =
        !searchQuery ||
        member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.departmentRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone.includes(searchQuery) ||
        member.residentialArea.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [members, dateAttendanceMap, stationFilter, searchQuery]);

  // -------------------------------------------------------------
  // CLOCK-IN WORKFLOW & LOCATION CHECK
  // -------------------------------------------------------------
  const handleOpenClockIn = (member: DepartmentMember) => {
    setSelectedMemberForClockIn(member);
    // Pre-select station: if member is Bookstand Manager, default to Bookstand, else Desk A
    if (member.departmentRole.toLowerCase().includes('bookstand')) {
      setClockInStation('Bookstand');
    } else {
      setClockInStation('Desk A');
    }

    // Determine default service day: check if selectedDate is a Tuesday
    const selDay = new Date(selectedDate).getDay();
    const isTuesday = selDay === 2 || new Date().getDay() === 2;
    setClockInServiceDay(isTuesday ? 'Tuesday' : 'Sunday');
    setClockInServiceType(isTuesday ? 'Tuesday Word & Communion' : 'Sunday 1st Service');
    setClockInDate(selectedDate);

    setIsAdminOverrideChecked(false);
    setAdminOverrideReason('');
    setUserLocation(null);
    setLocationDistance(null);
    setLocationErrorMessage('');
    setIsClockInModalOpen(true);

    // Request GPS location immediately
    checkDeviceLocation();
  };

  const checkDeviceLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('checking');
    setLocationErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const dist = calculateDistanceMeters(
          latitude,
          longitude,
          churchLocationConfig.latitude,
          churchLocationConfig.longitude
        );
        setLocationDistance(dist);

        if (dist <= churchLocationConfig.allowedRadiusMeters) {
          setLocationStatus('allowed');
        } else {
          setLocationStatus('denied');
        }
      },
      (error) => {
        setLocationStatus('error');
        if (error.code === error.PERMISSION_DENIED) {
          setLocationErrorMessage(
            'Location permission denied. Please allow location access in your browser settings or contact an authorized administrator for exception approval.'
          );
        } else {
          setLocationErrorMessage(
            'GPS signal could not be acquired accurately. Please ensure device location is enabled.'
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleConfirmClockIn = () => {
    if (!selectedMemberForClockIn) return;

    // Check duplicate: prevent double clock-in for this Sunday
    const existing = dateAttendanceMap.get(selectedMemberForClockIn.id);
    if (existing && existing.status === 'Present') {
      alert(`${selectedMemberForClockIn.fullName} is already clocked in for this service!`);
      return;
    }

    const isInsideRadius = locationStatus === 'allowed';
    const isOverride = isAdminOverrideChecked && isAuthorizedManager;

    if (!isInsideRadius && !isOverride) {
      alert(
        `Cannot clock in outside the church perimeter. You are ${locationDistance}m away from Dominion City Headquarters (allowed radius: ${churchLocationConfig.allowedRadiusMeters}m).`
      );
      return;
    }

    const clockInTimeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const newRecordPayload: Omit<AttendanceRecord, 'id' | 'createdAt'> = {
      memberId: selectedMemberForClockIn.id,
      memberName: selectedMemberForClockIn.fullName,
      memberPhone: selectedMemberForClockIn.phone,
      departmentRole: selectedMemberForClockIn.departmentRole,
      photoUrl: selectedMemberForClockIn.photoUrl,
      serviceDate: clockInDate,
      clockInTime: clockInTimeStr,
      serviceType: clockInServiceType,
      status: 'Present',
      servingStation: clockInStation,
      verifiedLocation: isInsideRadius,
      distanceFromChurchMeters: locationDistance || (isOverride ? 0 : 50),
      latitude: userLocation?.lat || churchLocationConfig.latitude,
      longitude: userLocation?.lng || churchLocationConfig.longitude,
      deviceInfo: isOverride ? 'Admin Authorized Override' : 'GPS Mobile Verified',
      isManualOverride: isOverride,
      notes: isOverride
        ? `Admin Override by ${currentUser.name}: ${adminOverrideReason || 'On-site exception authorized'}`
        : `Verified attendance at ${clockInStation} for ${clockInServiceType}`,
      markedBy: isOverride
        ? `Admin Exception (${currentUser.name})`
        : `Self Clock-In (${currentUser.name})`,
    };

    if (existing) {
      updateAttendanceRecord(existing.id, newRecordPayload);
    } else {
      addAttendanceRecord(newRecordPayload);
    }

    setIsClockInModalOpen(false);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#2563EB', '#10B981', '#3B82F6'],
    });
  };

  // Clock Out
  const handleClockOut = (recordId: string, memberName: string) => {
    if (confirm(`Clock out ${memberName} and record departure time?`)) {
      clockOutAttendanceRecord(recordId);
    }
  };

  // Save Geofence Settings
  const handleSaveGeofence = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(configLatitude);
    const lng = parseFloat(configLongitude);
    const rad = parseInt(configRadius, 10);

    if (isNaN(lat) || isNaN(lng) || isNaN(rad) || rad <= 0) {
      alert('Please enter valid coordinates and radius in meters.');
      return;
    }

    updateChurchLocationConfig({
      name: configName.trim() || 'Dominion City Headquarters, Asaba',
      address: configAddress.trim(),
      latitude: lat,
      longitude: lng,
      allowedRadiusMeters: rad,
      lastUpdatedBy: currentUser.name,
    });

    setIsGeofenceModalOpen(false);
    alert('Church headquarters geofence coordinates updated successfully!');
  };

  // Calibrate Geofence to Current GPS Position
  const handleCalibrateToCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setConfigLatitude(pos.coords.latitude.toFixed(6));
        setConfigLongitude(pos.coords.longitude.toFixed(6));
        alert(
          `Current coordinates captured: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}. Click "Save Geofence Settings" to apply.`
        );
      },
      (err) => {
        alert(`Error getting current position: ${err.message}`);
      },
      { enableHighAccuracy: true }
    );
  };

  // Export Attendance CSV
  const handleExportCSV = () => {
    exportToCSV(
      members.map((m) => {
        const att = dateAttendanceMap.get(m.id);
        const isPresent = att && (att.status === 'Present' || att.status === 'Clocked Out');
        return {
          ServiceDate: selectedDate,
          FullName: m.fullName,
          DepartmentRole: m.departmentRole,
          Phone: m.phone,
          Status: isPresent ? (att.status === 'Clocked Out' ? 'CLOCKED OUT' : 'PRESENT') : 'NOT YET CLOCKED IN',
          ServingStation: att?.servingStation || 'Not Assigned',
          ClockInTime: att?.clockInTime || '—',
          ClockOutTime: att?.clockOutTime || '—',
          GPSVerified: att?.verifiedLocation ? 'Yes' : 'No',
          DistanceMeters: att?.distanceFromChurchMeters ?? '—',
        };
      }),
      `DominionCity_Asaba_Attendance_${selectedDate}`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* ----------------------------------------------------------- */}
      {/* 1. TOP HEADER BANNER: BLUE IDENTITY & ATTENDANCE KPI STRIP */}
      {/* ----------------------------------------------------------- */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0B1E48] via-[#103070] to-[#1E489E] text-white shadow-xl border border-blue-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-400/20 text-blue-200 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
              Dominion City Asaba • Information Desk Department
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <UserCheck className="w-6 h-6 text-blue-300" />
              {new Date(selectedDate).getDay() === 2 ? 'Tuesday Service Attendance' : 'Sunday Service Attendance'}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
              Member directory clock-in terminal with church GPS location verification and live serving station management.
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isAuthorizedManager && (
              <button
                onClick={() => {
                  setConfigName(churchLocationConfig.name);
                  setConfigAddress(churchLocationConfig.address);
                  setConfigLatitude(String(churchLocationConfig.latitude));
                  setConfigLongitude(String(churchLocationConfig.longitude));
                  setConfigRadius(String(churchLocationConfig.allowedRadiusMeters));
                  setIsGeofenceModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer border border-white/20"
                title="Configure Church GPS Geofence"
              >
                <Settings className="w-4 h-4 text-blue-300" />
                <span>Geofence Settings</span>
              </button>
            )}

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer border border-emerald-400/40 shadow-sm"
              title="Share service attendance sheet via WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Attendance</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer border border-white/20"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Roster</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer border border-white/20"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* SERVICE DAY & SERVICE DATE SELECTOR (Sunday & Tuesday)     */}
        {/* ----------------------------------------------------------- */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {/* Service Day Filter Pills */}
            <div className="flex items-center gap-1 shrink-0 bg-blue-950/60 p-1 rounded-xl border border-blue-800/60">
              {(['all', 'Sunday', 'Tuesday'] as const).map((dayOpt) => (
                <button
                  key={dayOpt}
                  onClick={() => setServiceDayFilter(dayOpt)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    serviceDayFilter === dayOpt
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-blue-200 hover:text-white'
                  }`}
                >
                  {dayOpt === 'all' ? 'All Services' : dayOpt === 'Sunday' ? '☀️ Sunday' : '🔥 Tuesday'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs font-bold text-blue-200 shrink-0 flex items-center gap-1 mr-1">
                <Calendar className="w-3.5 h-3.5 text-blue-300" />
                Date:
              </span>

              {filteredServiceDates.map((dateStr) => {
                const isSelected = dateStr === selectedDate;
                const d = new Date(dateStr);
                const isTue = d.getDay() === 2;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-white text-blue-900 shadow-md ring-2 ring-blue-300'
                        : 'bg-white/10 hover:bg-white/20 text-blue-100 border border-white/10'
                    }`}
                  >
                    <span>{isTue ? '🔥 Tue' : '☀️ Sun'} {formatDate(dateStr)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-blue-200 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Attendance Session: {new Date(selectedDate).getDay() === 2 ? 'Tuesday Word & Communion' : 'Sunday Service'} ({formatDate(selectedDate)})</span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 2. KPI METRIC SUMMARY CARDS                                 */}
      {/* ----------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Members
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalDepartmentMembers}
          </p>
          <span className="text-[10px] text-slate-400">Department Roster</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
            Clocked In (Present)
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {presentCount}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            {attendanceRate}% of department
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 shadow-xs">
          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
            🏢 Desk A Attendants
          </span>
          <p className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
            {deskACount}
          </p>
          <span className="text-[10px] text-blue-600 dark:text-blue-400">Left Wing Station</span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 shadow-xs">
          <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
            🏢 Desk B Attendants
          </span>
          <p className="text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-1">
            {deskBCount}
          </p>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Right Wing Station</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 shadow-xs">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
            📚 Bookstand Attendants
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
            {bookstandCount}
          </p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
            Multi-attendant support
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Not Yet Clocked In
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
            {absentCount}
          </p>
          <span className="text-[10px] text-slate-400">Pending arrivals</span>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 3. SEARCH & STATION FILTER BAR (MATCHING MEMBER DIRECTORY) */}
      {/* ----------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#0E172B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search member name, role, residential area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: `All (${members.length})` },
            { id: 'Present', label: `Present (${presentCount})` },
            { id: 'Absent', label: `Not Clocked In (${absentCount})` },
            { id: 'Desk A', label: `Desk A (${deskACount})` },
            { id: 'Desk B', label: `Desk B (${deskBCount})` },
            { id: 'Bookstand', label: `Bookstand (${bookstandCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStationFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                stationFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 4. RESPONSIVE GRID OF MEMBER PROFILE CARDS                  */}
      {/* ----------------------------------------------------------- */}
      {filteredMembers.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-[#0E172B] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No matching members found
          </h4>
          <p className="text-xs text-slate-500">
            Try adjusting your search query or station filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredMembers.map((member) => {
            const att = dateAttendanceMap.get(member.id);
            const isPresent = att && att.status === 'Present';
            const isClockedOut = att && att.status === 'Clocked Out';
            const isNotClockedIn = !att || att.status === 'Late';

            // Station styling
            const station = att?.servingStation;

            return (
              <div
                key={member.id}
                className={`bg-white dark:bg-[#0E172B] rounded-3xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  isPresent
                    ? 'border-emerald-300 dark:border-emerald-800/80 ring-2 ring-emerald-500/10'
                    : isClockedOut
                    ? 'border-purple-300 dark:border-purple-800/80'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Photo & Attendance Status Pill */}
                  <div className="flex items-start justify-between">
                    <img
                      src={member.photoUrl}
                      alt={member.fullName}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-100 dark:ring-blue-900 shadow-xs"
                    />

                    {isPresent ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        PRESENT
                      </span>
                    ) : isClockedOut ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                        CLOCKED OUT
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        NOT YET CLOCKED IN
                      </span>
                    )}
                  </div>

                  {/* Name & Role */}
                  <div className="mt-3.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {member.fullName}
                    </h3>
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mt-0.5 truncate">
                      {member.departmentRole}
                    </p>
                  </div>

                  {/* Station & Clock-In Information */}
                  <div className="mt-4 space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {/* Serving Station */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Serving Station:</span>
                      {station ? (
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            station === 'Desk A'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                              : station === 'Desk B'
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                          }`}
                        >
                          {station === 'Bookstand' ? '📚 Bookstand' : `🏢 ${station}`}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Not Assigned</span>
                      )}
                    </div>

                    {/* Service Type */}
                    {att?.serviceType && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Service:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400 text-[11px]">
                          {att.serviceType}
                        </span>
                      </div>
                    )}

                    {/* Clock-In Timestamp & Location Verification */}
                    {att && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Clock-in:
                          </span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {att.clockInTime}
                          </span>
                        </div>

                        {att.clockOutTime && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 flex items-center gap-1">
                              <LogOut className="w-3 h-3 text-purple-400" />
                              Clock-out:
                            </span>
                            <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                              {att.clockOutTime}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">GPS Proximity:</span>
                          <span
                            className={`font-semibold flex items-center gap-1 ${
                              att.verifiedLocation ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            {att.distanceFromChurchMeters
                              ? `${att.distanceFromChurchMeters}m from HQ`
                              : 'Location Verified'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  {isNotClockedIn ? (
                    <button
                      onClick={() => handleOpenClockIn(member)}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>CLOCK IN</span>
                    </button>
                  ) : isPresent ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleClockOut(att.id, member.fullName)}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 dark:bg-slate-800 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>CLOCK OUT</span>
                      </button>

                      {isAuthorizedManager && (
                        <button
                          onClick={() => handleOpenClockIn(member)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-blue-950 text-slate-500 text-xs transition-colors cursor-pointer"
                          title="Change Station or Edit Clock-in"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-1">
                      <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 block">
                        Shift Finished
                      </span>
                      {isAuthorizedManager && (
                        <button
                          onClick={() => handleOpenClockIn(member)}
                          className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer mt-0.5"
                        >
                          Re-open Shift
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* 5. MODAL: ONE-CLICK CLOCK-IN WITH GPS RADIUS VERIFICATION  */}
      {/* ----------------------------------------------------------- */}
      {isClockInModalOpen && selectedMemberForClockIn && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E172B] rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 max-h-[96vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            {/* Native Mobile Pull Indicator */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold shadow-xs">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Service Attendance Clock-In
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Proximity verified at Dominion City Asaba HQ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsClockInModalOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors text-base font-bold"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1 overscroll-contain">
              {/* Member Card Profile */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <img
                  src={selectedMemberForClockIn.photoUrl}
                  alt={selectedMemberForClockIn.fullName}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-200 dark:ring-blue-900"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {selectedMemberForClockIn.fullName}
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-400 font-medium truncate">
                    {selectedMemberForClockIn.departmentRole}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Service Date: <strong className="text-slate-600 dark:text-slate-300">{formatDate(clockInDate)}</strong>
                  </p>
                </div>
              </div>

              {/* Service Day Selection: Sunday vs Tuesday Services */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Service Schedule *
                </label>
                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setClockInServiceDay('Sunday');
                      setClockInServiceType('Sunday 1st Service');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      clockInServiceDay === 'Sunday'
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        ☀️ Sunday Service
                      </span>
                      {clockInServiceDay === 'Sunday' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Regular Sunday Officiating</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setClockInServiceDay('Tuesday');
                      setClockInServiceType('Tuesday Word & Communion');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      clockInServiceDay === 'Tuesday'
                        ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/40 ring-2 ring-teal-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        🔥 Tuesday Service
                      </span>
                      {clockInServiceDay === 'Tuesday' && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                    </div>
                    <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold mt-1 block">Word & Communion</span>
                  </button>
                </div>

                {clockInServiceDay === 'Sunday' && (
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setClockInServiceType('Sunday 1st Service')}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        clockInServiceType === 'Sunday 1st Service'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Sunday 1st Service
                    </button>
                    <button
                      type="button"
                      onClick={() => setClockInServiceType('Sunday 2nd Service')}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        clockInServiceType === 'Sunday 2nd Service'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Sunday 2nd Service
                    </button>
                  </div>
                )}
              </div>

              {/* Serving Station Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Serving Station *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Desk A */}
                  <button
                    type="button"
                    onClick={() => setClockInStation('Desk A')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      clockInStation === 'Desk A'
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        🏢 Desk A
                      </span>
                      {clockInStation === 'Desk A' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Left Wing Station</span>
                  </button>

                  {/* Desk B */}
                  <button
                    type="button"
                    onClick={() => setClockInStation('Desk B')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      clockInStation === 'Desk B'
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        🏢 Desk B
                      </span>
                      {clockInStation === 'Desk B' && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Right Wing Station</span>
                  </button>

                  {/* Bookstand */}
                  <button
                    type="button"
                    onClick={() => setClockInStation('Bookstand')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      clockInStation === 'Bookstand'
                        ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        📚 Bookstand
                      </span>
                      {clockInStation === 'Bookstand' && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1 block">
                      Multi-attendant
                    </span>
                  </button>
                </div>
              </div>

              {/* Location Verification Status Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    Physical Church Proximity Verification
                  </span>
                  <button
                    type="button"
                    onClick={checkDeviceLocation}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Re-check GPS
                  </button>
                </div>

                {locationStatus === 'checking' && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                    <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Acquiring GPS coordinates and checking distance to church premises...
                  </div>
                )}

                {locationStatus === 'allowed' && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Within Church Headquarters Perimeter
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Calculated distance: <strong>~{locationDistance} meters</strong> from Dominion City HQ (NTA Road, Asaba). Approved radius: {churchLocationConfig.allowedRadiusMeters}m.
                    </p>
                  </div>
                )}

                {locationStatus === 'denied' && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      Outside Approved Church Radius
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      You are currently <strong>~{locationDistance?.toLocaleString()} meters</strong> away. Normal Sunday clock-in requires being within <strong>{churchLocationConfig.allowedRadiusMeters} meters</strong> of the church building along NTA Road, Asaba.
                    </p>
                  </div>
                )}

                {locationStatus === 'error' && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      GPS Acquisition Error
                    </p>
                    <p className="text-[11px]">{locationErrorMessage}</p>
                  </div>
                )}
              </div>

              {/* Admin-Controlled Exception Override for Location Issues */}
              {(locationStatus === 'denied' || locationStatus === 'error') && isAuthorizedManager && (
                <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs space-y-2">
                  <label className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAdminOverrideChecked}
                      onChange={(e) => setIsAdminOverrideChecked(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <span>Authorize Administrator Exception Clock-In</span>
                  </label>
                  <p className="text-[11px] text-purple-700 dark:text-purple-400">
                    As an authorized department officer ({currentUser.name}), you may approve attendance for members with GPS device issues or signal drift.
                  </p>
                  {isAdminOverrideChecked && (
                    <input
                      type="text"
                      placeholder="Reason for exception (e.g. Phone GPS hardware fault, on-site verified)..."
                      value={adminOverrideReason}
                      onChange={(e) => setAdminOverrideReason(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-[#131F38] text-slate-900 dark:text-white"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white/95 dark:bg-[#0E172B]/95 backdrop-blur-md px-5 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsClockInModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClockIn}
                disabled={locationStatus === 'checking' || (locationStatus !== 'allowed' && !isAdminOverrideChecked)}
                className="px-5 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md cursor-pointer transition-transform hover:scale-102 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm &amp; Clock In</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* 6. MODAL: GEOFENCE SETTINGS (CONFIGURABLE COORDINATES)       */}
      {/* ----------------------------------------------------------- */}
      {isGeofenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E172B] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Church Headquarters Geofence Settings
                </h3>
              </div>
              <button
                onClick={() => setIsGeofenceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGeofence} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Location Title
                </label>
                <input
                  type="text"
                  required
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  required
                  value={configAddress}
                  onChange={(e) => setConfigAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Latitude (°N) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={configLatitude}
                    onChange={(e) => setConfigLatitude(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Longitude (°E) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={configLongitude}
                    onChange={(e) => setConfigLongitude(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Approved Attendance Radius (Meters) *
                </label>
                <input
                  type="number"
                  min="50"
                  max="1500"
                  required
                  value={configRadius}
                  onChange={(e) => setConfigRadius(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Recommended: 350 meters around the church building footprint
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCalibrateToCurrentLocation}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                  <span>Set to My Current GPS Position</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGeofenceModalOpen(false)}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md cursor-pointer"
                  >
                    Save Geofence
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT SHEET INTEGRATION */}
      {isPrintModalOpen && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={`Dominion City Asaba — Service Attendance Sheet (${formatDate(selectedDate)})`}
          subtitle={`Information Desk Department • Present: ${presentCount} / ${totalDepartmentMembers} (${attendanceRate}%)`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold block">Desk A:</span>
                <span>{deskACount} Members</span>
              </div>
              <div>
                <span className="font-bold block">Desk B:</span>
                <span>{deskBCount} Members</span>
              </div>
              <div>
                <span className="font-bold block">Bookstand:</span>
                <span>{bookstandCount} Members</span>
              </div>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 font-bold text-slate-700">
                  <th className="py-2">Member Name</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Station</th>
                  <th className="py-2 text-right">Time In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {members.map((m) => {
                  const att = dateAttendanceMap.get(m.id);
                  const isPres = att && (att.status === 'Present' || att.status === 'Clocked Out');
                  return (
                    <tr key={m.id} className="py-1.5">
                      <td className="py-2 font-bold">{m.fullName}</td>
                      <td className="py-2 text-slate-600">{m.departmentRole}</td>
                      <td className="py-2">
                        {isPres ? (
                          <span className="text-emerald-700 font-bold">PRESENT</span>
                        ) : (
                          <span className="text-slate-400">ABSENT</span>
                        )}
                      </td>
                      <td className="py-2">{att?.servingStation || '—'}</td>
                      <td className="py-2 text-right font-mono">{att?.clockInTime || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PrintModal>
      )}

      {/* GLOBAL SHARE VIA WHATSAPP & PDF */}
      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          documentTitle={`Service Attendance Record (${formatDate(selectedDate)})`}
          documentType="Attendance Register"
          subtitle={`Dominion City Asaba • Information Desk • ${new Date(selectedDate).getDay() === 2 ? 'Tuesday Service' : 'Sunday Service'}`}
          documentRef={`ATT-${selectedDate.replace(/-/g, '')}`}
          isConfidential={false}
          contentLines={[
            `Service Date: ${formatDate(selectedDate)}`,
            `Service Day: ${new Date(selectedDate).getDay() === 2 ? 'Tuesday Word & Communion' : 'Sunday Service'}`,
            `Total Roster: ${totalDepartmentMembers} Members`,
            `Present Count: ${presentCount} (${attendanceRate}%)`,
            `Absent / Pending: ${absentCount}`,
            `Desk A Allocation: ${deskACount} Attendants`,
            `Desk B Allocation: ${deskBCount} Attendants`,
            `Bookstand Allocation: ${bookstandCount} Attendants`,
          ]}
          tableHeaders={['Member Name', 'Role', 'Status', 'Service Type', 'Station', 'Time In', 'Time Out']}
          tableRows={members.map((m) => {
            const att = dateAttendanceMap.get(m.id);
            const isPres = att && (att.status === 'Present' || att.status === 'Clocked Out');
            return [
              m.fullName,
              m.departmentRole,
              isPres ? (att.status === 'Clocked Out' ? 'CLOCKED OUT' : 'PRESENT') : 'ABSENT',
              att?.serviceType || (new Date(selectedDate).getDay() === 2 ? 'Tuesday Word & Communion' : 'Sunday Service'),
              att?.servingStation || '—',
              att?.clockInTime || '—',
              att?.clockOutTime || '—',
            ];
          })}
          summaryNotes={`Generated by ${currentUser.name} (${currentUser.role}) on ${new Date().toLocaleDateString('en-GB')}. Official Dominion City Asaba Information Desk Attendance Document.`}
        />
      )}
    </div>
  );
};
